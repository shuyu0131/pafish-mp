<template>
  <view class="det">
    <!-- 加载失败 / 文章不存在 -->
    <view v-if="notFound" class="nf">
      <view class="pad-empty">
        <t-empty description="文章不存在或已下架" icon="error-circle" />
        <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="goHome">
          <t-icon name="home" size="28rpx" color="#0052d9" />
          <text class="retry-txt">回首页</text>
        </view>
      </view>
    </view>

    <template v-else-if="post">
      <view class="art">
        <view class="art-kicker">
          <text v-if="post.category && post.category.name" class="art-cat">{{ post.category.name }}</text>
          <text v-if="post.category && post.category.name" class="art-dot">·</text>
          <text>{{ fmtDate(post.publishedAt) }}</text>
        </view>
        <text class="art-h1">{{ post.title }}</text>

        <view class="art-auth">
          <zz-avatar :name="post.author" :url="post.authorAvatar" :size="60" />
          <text class="art-anm">{{ post.author || '纸鱼' }}</text>
          <text class="art-sep" />
          <t-icon name="browse" size="26rpx" color="rgba(0,0,0,0.4)" />
          <text class="art-meta">{{ fmtNum(post.viewCount) }}</text>
          <text v-if="post.updatedAt && isEdited" class="art-meta">· 修改于 {{ fmtShort(post.updatedAt) }}</text>
        </view>

        <image v-if="coverImg" class="art-cover" :src="coverImg" mode="widthFix" />
        <view v-if="post.locked" class="art-lock">
          <t-icon name="info-circle" size="30rpx" color="rgba(0,0,0,0.4)" />
          <text class="art-lock-txt">该文章已设置访问密码，请移步网页版阅读</text>
        </view>
        <mp-html v-else class="art-rt" :content="nodes" @linktap="onLinkTap" />

        <view v-if="post.tags && post.tags.length" class="art-tags">
          <t-tag v-for="t in post.tags" :key="t.slug" size="small" variant="light">
            # {{ t.name }}
          </t-tag>
        </view>
        <view v-if="!post.locked" class="art-fin">· 完 ·</view>

        <!-- 行内操作区：不做固定底栏，动作跟在正文之后 -->
        <view v-if="showLike || showFav || !audit" class="art-acts">
          <view v-if="showLike" class="act" :class="{ on: post.liked }" hover-class="zz-press-op" :hover-stay-time="60" @tap="doLike">
            <t-icon :name="post.liked ? 'thumb-up-filled' : 'thumb-up'" size="36rpx"
              :color="post.liked ? '#0052d9' : 'rgba(0,0,0,0.6)'" />
            <text class="act-txt">{{ post.likeCount ? fmtNum(post.likeCount) : '点赞' }}</text>
          </view>
          <view v-if="showFav" class="act" :class="{ on: post.favorited }" hover-class="zz-press-op" :hover-stay-time="60" @tap="doFav">
            <t-icon :name="post.favorited ? 'star-filled' : 'star'" size="36rpx"
              :color="post.favorited ? '#0052d9' : 'rgba(0,0,0,0.6)'" />
            <text class="act-txt">{{ post.favorited ? '已收藏' : '收藏' }}</text>
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <button v-if="!audit" class="act share-act" open-type="share" hover-class="zz-press-op" :hover-stay-time="60">
            <t-icon name="share-1" size="36rpx" color="rgba(0,0,0,0.6)" />
            <text class="act-txt">分享</text>
          </button>
          <!-- #endif -->
        </view>
      </view>

      <!-- 评论区 -->
      <view class="cmt-sec">
        <block v-if="showComment">
          <zz-section-head :title="'评论' + (cTotal ? ' ' + cTotal : '')" />

          <!-- 输入框：常态一行入口，点击展开（非固定悬浮） -->
          <view v-if="!composeOpen" class="fake" hover-class="zz-press" :hover-stay-time="60" @tap="startCompose">
            <t-icon name="edit" size="28rpx" color="rgba(0,0,0,0.4)" />
            <text class="fake-txt">说点什么…</text>
          </view>
          <view v-else class="compose">
            <textarea
              v-model="draft" class="ipt" :focus="true" maxlength="500"
              :placeholder="replyTo ? '回复 @' + replyTo.name : '说点什么…'"
              placeholder-class="ph" auto-height
            />
            <view class="compose-row">
              <view class="cbtn" hover-class="zz-press-op" :hover-stay-time="60" @tap="cancelCompose">取消</view>
              <view class="pbtn" :class="{ dis: submitting }" hover-class="zz-press-op" :hover-stay-time="60" @tap="doComment">发表</view>
            </view>
          </view>

          <view class="cmt-list">
            <view v-for="c in parents" :key="c.id" class="cmt-block">
              <zz-comment-item :comment="c" :reply-on="canReplyTo" :is-author="isPostAuthor(c)" @reply="onReply" />
              <view v-for="r in repliesOf(c)" :key="r.id" class="cmt-reply">
                <zz-comment-item :comment="r" :reply-on="canReplyTo" :is-author="isPostAuthor(r)" @reply="onReply" />
              </view>
            </view>
          </view>
          <view v-if="cPage < cTotalPages" class="more-cmt" hover-class="zz-press-op" :hover-stay-time="60" @tap="loadMoreComments">加载更多评论</view>
          <view v-else-if="parents.length" class="all-cmt">· 已显示全部评论 ·</view>
          <view v-else-if="!cLoading" class="all-cmt">还没有评论，来抢占第一条</view>
        </block>
        <text v-else class="cmt-off">评论已关闭</text>
      </view>
    </template>

    <view v-else class="loading-page">
      <view class="sk"><t-skeleton :row-col="skRows" :loading="true" /></view>
    </view>

    <zz-login-sheet @done="onLoggedIn" />
  </view>
</template>

<script setup>
// 文章详情：正文（mp-html 渲染，链接可复制、图片可预览——rich-text 在小程序里
// 完全不可交互）、评论区（服务端置顶优先、客户端组楼中楼）、点赞/收藏/分享。
// 评论、点赞、收藏均可被服务端开关关闭；审核模式下分享隐藏。
// 无固定底栏，操作区行内跟在正文后。
import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import MpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue'
import { state, feat, auditMode } from '@/common/store.js'
import {
  postDetail, comments as fetchComments,
  toggleLike, toggleFavorite, submitComment, ensureLogin, toast,
} from '@/common/request.js'
import { fmtDate, fmtShort, fmtNum } from '@/common/format.js'
import { styleHtml } from '@/common/mdcss.js'
import { pushView } from '@/common/history.js'
import { BASE_URL } from '@/common/config.js'
import { usableCover } from '@/common/theme.js'

const post = ref(null)
const notFound = ref(false)
const all = ref([])          // 评论原始列表（含 parentId）
const cPage = ref(1)
const cTotalPages = ref(1)
const cTotal = ref(0)
const cLoading = ref(false)
const composeOpen = ref(false)
const replyTo = ref(null)    // {id, name}
const draft = ref('')
const submitting = ref(false)

const audit = computed(() => auditMode())
const showComment = computed(() => feat('comment') && !audit.value)
const showLike = computed(() => feat('like') && !audit.value)
const showFav = computed(() => feat('favorite') && !audit.value)
const canReplyTo = computed(() => showComment.value)
const nodes = computed(() => styleHtml((post.value && post.value.contentHtml) || ''))
// 头图：svg 小程序渲染不了，视同无封面（分享图同理）
const coverImg = computed(() => usableCover(post.value && post.value.coverUrl))
const isEdited = computed(() => {
  const p = post.value || {}
  if (!p.updatedAt || !p.publishedAt) return false
  return new Date(String(p.updatedAt).replace(/-/g, '/'))
    - new Date(String(p.publishedAt).replace(/-/g, '/')) > 60000
})
const parents = computed(() => all.value.filter((c) => !c.parentId))
const skRows = [{ type: 'text', width: '40%' }, { type: 'text', width: '90%' }, { type: 'text', width: '85%' }, { type: 'rect', height: '320rpx', width: '100%' }, { type: 'text', width: '88%' }, { type: 'text', width: '60%' }]

function repliesOf(c) {
  return all.value.filter((r) => r.parentId === c.id)
}
function isPostAuthor(c) {
  return !!post.value && c.authorName === post.value.author
}

async function load(slug) {
  try {
    const r = await postDetail(slug)
    post.value = r
    uni.setNavigationBarTitle({ title: r.title || '文章' })
    cTotal.value = r.commentCount || 0
    pushView({ slug: r.slug, title: r.title })
    if (showComment.value) loadComments(1)
  } catch (e) {
    notFound.value = true
    toast((e && e.message) || '文章不存在')
  }
}

async function loadComments(page) {
  if (!post.value || cLoading.value) return
  cLoading.value = true
  try {
    const r = await fetchComments(String(post.value.id), page)
    if (page === 1) all.value = r.comments || []
    else all.value = all.value.concat(r.comments || [])
    cPage.value = r.page || page
    cTotalPages.value = r.totalPages || 1
    cTotal.value = r.total || cTotal.value
  } catch (e) {
    toast((e && e.message) || '评论加载失败')
  } finally {
    cLoading.value = false
  }
}

function loadMoreComments() { loadComments(cPage.value + 1) }

function startCompose() {
  replyTo.value = null
  if (!ensureLogin()) return
  composeOpen.value = true
}
function onReply(c) {
  if (!ensureLogin()) return
  replyTo.value = { id: c.id, name: c.authorName || '鱼友' }
  composeOpen.value = true
}
function cancelCompose() {
  composeOpen.value = false
  replyTo.value = null
  draft.value = ''
}
async function doComment() {
  const text = draft.value.trim()
  if (!text) { toast('先写点什么吧'); return }
  if (submitting.value) return
  submitting.value = true
  try {
    const r = await submitComment(String(post.value.id), text, replyTo.value ? replyTo.value.id : undefined)
    cancelCompose()
    toast(r.pending ? '已提交，博主审核后可见' : '评论发表成功')
    if (!r.pending) loadComments(1)
  } catch (e) {
    toast((e && e.message) || '评论失败')
  } finally {
    submitting.value = false
  }
}

async function doLike() {
  if (!ensureLogin()) return
  try {
    const r = await toggleLike(String(post.value.id))
    post.value.liked = r.active
    post.value.likeCount = r.count
  } catch (e) { toast((e && e.message) || '操作失败') }
}
async function doFav() {
  if (!ensureLogin()) return
  try {
    const r = await toggleFavorite(String(post.value.id))
    post.value.favorited = r.active
    toast(r.active ? '已加入收藏夹' : '已取消收藏')
  } catch (e) { toast((e && e.message) || '操作失败') }
}
// 刚登录完就点了来源动作的话，重放一次不友好；这里只收起面板，让用户再点一下。
function onLoggedIn() { /* no-op */ }

// 正文链接点击：小程序不能直接跳外部网页，复制链接由用户去浏览器打开。
// 站内相对路径（如 /post/xxx）补全为完整地址再复制。
function onLinkTap(e) {
  let href = e && e.href ? String(e.href) : ''
  if (!href || href[0] === '#') return
  if (!href.includes('://')) {
    const base = String(state.site.url || BASE_URL).replace(/\/+$/, '')
    href = base + (href[0] === '/' ? href : '/' + href)
  }
  uni.setClipboardData({ data: href, success: () => toast('链接已复制，请在浏览器打开') })
}

function goHome() { uni.reLaunch({ url: '/pages/index/index' }) }

let slug = ''
onLoad((q) => {
  slug = String((q && q.slug) || '')
  if (!slug) { notFound.value = true; return }
  load(slug)
})

onShareAppMessage(() => {
  // 审核模式：任何分享都退回中性首页卡片
  if (audit.value) return { title: state.site.name || '纸鱼博客', path: '/pages/index/index' }
  const p = post.value || {}
  const msg = { title: p.title || state.site.name || '纸鱼博客', path: '/pages/post/detail?slug=' + encodeURIComponent(slug) }
  if (coverImg.value) msg.imageUrl = coverImg.value
  else msg.imageUrl = '/static/img/share-fallback.png'
  return msg
})
</script>

<style scoped>
.art {
  background: var(--zz-card);
  padding: 28rpx 32rpx;
}
.art-kicker { display: flex; align-items: center; gap: 10rpx; font-size: 22rpx; color: var(--zz-ink-3); }
.art-cat { color: var(--zz-brand); font-weight: 600; }
.art-dot { color: var(--zz-line); }
.art-h1 {
  display: block;
  font-size: 40rpx; font-weight: 600; line-height: 1.5;
  color: var(--zz-ink);
  margin-top: 16rpx;
}
.art-auth { display: flex; align-items: center; gap: 14rpx; margin: 24rpx 0 28rpx; }
.art-anm { font-size: 24rpx; font-weight: 600; color: var(--zz-ink-2); }
.art-sep { flex: 1; }
.art-meta { font-size: 22rpx; color: var(--zz-ink-3); }
.art-cover { width: 100%; border-radius: 12rpx; margin-bottom: 24rpx; }
.art-lock {
  display: flex; align-items: center; gap: 14rpx;
  background: var(--zz-block); border-radius: 12rpx; padding: 26rpx 28rpx;
}
.art-lock-txt { font-size: 24rpx; color: var(--zz-ink-2); }
.art-rt { font-size: 30rpx; line-height: 1.85; color: var(--zz-ink); word-break: break-all; }

.art-tags { display: flex; flex-wrap: wrap; gap: 14rpx; margin-top: 36rpx; }
.art-fin { text-align: center; font-size: 24rpx; color: var(--zz-ink-3); margin: 48rpx 0 8rpx; }

.art-acts {
  display: flex; justify-content: center; gap: 100rpx;
  border-top: 1rpx solid var(--zz-line);
  margin-top: 36rpx; padding-top: 28rpx;
}
.act { display: flex; align-items: center; gap: 10rpx; padding: 8rpx 16rpx; }
.act-txt { font-size: 26rpx; color: var(--zz-ink-2); }
.act.on .act-txt { font-weight: 600; }
.share-act {
  background: transparent; border: none; margin: 0; line-height: 1;
}
.share-act::after { border: none; }

.cmt-sec { margin: 24rpx 32rpx calc(48rpx + env(safe-area-inset-bottom)); }
.fake {
  display: flex; align-items: center; gap: 12rpx;
  background: var(--zz-card);
  border-radius: 12rpx;
  padding: 20rpx 28rpx; margin-top: 24rpx;
}
.fake-txt { font-size: 26rpx; color: var(--zz-ink-3); }
.compose {
  background: var(--zz-card);
  border: 1rpx solid var(--zz-brand);
  border-radius: 12rpx;
  padding: 20rpx 24rpx 16rpx; margin-top: 24rpx;
}
.ipt {
  width: 100%; min-height: 120rpx; max-height: 320rpx;
  font-size: 28rpx; color: var(--zz-ink); line-height: 1.6;
}
.ph { color: var(--zz-ink-3); }
.compose-row { display: flex; justify-content: flex-end; align-items: center; gap: 32rpx; margin-top: 12rpx; }
.cbtn { font-size: 26rpx; color: var(--zz-ink-2); padding: 10rpx 8rpx; }
.pbtn {
  font-size: 26rpx; font-weight: 600; color: #FFFFFF; background: var(--zz-brand);
  border-radius: 12rpx; padding: 12rpx 32rpx; line-height: 1.2;
}
.pbtn.dis { background: var(--zz-ink-3); }

.cmt-list { margin-top: 8rpx; background: var(--zz-card); border-radius: 18rpx; padding: 0 24rpx; }
.cmt-block { border-bottom: 1rpx solid var(--zz-line); }
.cmt-block:last-child { border-bottom: none; }
.cmt-reply { margin-left: 80rpx; }
.more-cmt { text-align: center; font-size: 24rpx; font-weight: 600; color: var(--zz-brand); padding: 28rpx 0 8rpx; }
.all-cmt { text-align: center; font-size: 24rpx; color: var(--zz-ink-3); padding: 28rpx 0 8rpx; }
.cmt-off { display: block; text-align: center; font-size: 24rpx; color: var(--zz-ink-3); padding: 48rpx 0 8rpx; }

.nf, .loading-page { min-height: 100vh; }
.pad-empty { padding: 160rpx 32rpx 0; display: flex; flex-direction: column; align-items: center; }
.retry {
  margin-top: 8rpx;
  display: flex; align-items: center; gap: 8rpx;
  padding: 12rpx 32rpx;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
.sk { padding: 32rpx 32rpx; }
</style>
