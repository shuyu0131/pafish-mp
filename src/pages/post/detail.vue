<template>
  <view class="det zz-page">
    <view v-if="notFound" class="nf">
      <zz-navbar title="文章" back />
      <view class="pad">
        <zz-empty type="notfound" desc="文章可能已下架或被移动" action-text="回首页" @action="goHome" />
      </view>
    </view>

    <template v-else-if="post">
      <view class="cover" :style="{ height: coverHeight }">
        <image class="cover-img" :src="coverImg" mode="aspectFill" />
        <view class="cover-shade" :style="{ height: statusBarHeight + 'px' }" />
        <view class="cover-top" :style="{ paddingTop: statusBarHeight + 'px', paddingRight: capsuleSpace + 'px' }">
          <view class="top-btn" hover-class="zz-press-op" :hover-stay-time="60" @tap="goBack">
            <t-icon name="chevron-left" size="40rpx" color="#ffffff" />
          </view>
          <view class="top-spacer" />
          <button class="top-btn" open-type="share" hover-class="zz-press-op" :hover-stay-time="60">
            <t-icon name="share-1" size="36rpx" color="#ffffff" />
          </button>
        </view>
      </view>

      <view class="sheet">
        <view class="kicker">
          <text class="cat" :style="{ background: cat.soft, color: cat.fg }">{{ catName }}</text>
          <text class="read">{{ readMin }} 分钟</text>
        </view>
        <text class="title">{{ post.title }}</text>
        <view class="meta">
          <text>{{ fmtDate(post.publishedAt) }}</text>
          <text class="dot" />
          <text>{{ fmtNum(post.viewCount) }} 阅读</text>
          <text v-if="isEdited" class="dot" />
          <text v-if="isEdited">修改于 {{ fmtShort(post.updatedAt) }}</text>
        </view>

        <view class="author">
          <zz-avatar :url="post.authorAvatar" :name="post.author" :size="58" />
          <view class="author-text">
            <text class="author-name">{{ post.author || '纸鱼' }}</text>
            <text class="author-sub">记录与分享</text>
          </view>
        </view>

        <view class="tip">
          <t-icon name="info-circle" size="26rpx" color="#b26a00" />
          <text>阅读提示：本文约 {{ readMin }} 分钟，适合在安静的时候读。</text>
        </view>

        <view v-if="post.locked" class="lock">
          <t-icon name="lock-on" size="32rpx" color="#9aa3ad" />
          <text class="lock-txt">该文章已设置访问密码，请移步网页版阅读。</text>
        </view>
        <mp-html v-else class="article" :content="nodes" @linktap="onLinkTap" />

        <view v-if="post.tags && post.tags.length" class="tags">
          <text v-for="t in post.tags" :key="t.slug" class="tag"># {{ t.name }}</text>
        </view>
        <view v-if="!post.locked" class="end">— 完 —</view>
      </view>

      <view class="comments" id="zz-comments">
        <block v-if="showComment">
          <view class="comments-head">
            <text class="comments-title">评论</text>
            <text class="comments-count">{{ cTotal }}</text>
          </view>

          <view v-if="!composeOpen" class="comment-fake" hover-class="zz-press-op" :hover-stay-time="60" @tap="startCompose">
            <zz-avatar :name="dispName" :size="48" />
            <text class="comment-ph">说点什么…</text>
          </view>

          <view v-else class="compose">
            <textarea
              v-model="draft"
              class="compose-input"
              :focus="commentFocus"
              maxlength="500"
              :placeholder="replyTo ? '回复 @' + replyTo.name : '说点什么…'"
              placeholder-class="compose-ph"
              auto-height
            />
            <view class="compose-row">
              <text class="compose-cancel" @tap="cancelCompose">取消</text>
              <view class="compose-send" :class="{ dis: submitting }" hover-class="zz-press-op" :hover-stay-time="60" @tap="doComment">发表</view>
            </view>
          </view>

          <view v-if="parents.length" class="comment-list">
            <view v-for="c in parents" :key="c.id" class="comment-block">
              <zz-comment-item :comment="c" :reply-on="canReplyTo" :is-author="isPostAuthor(c)" @reply="onReply" />
              <view v-for="r in repliesOf(c)" :key="r.id" class="comment-reply">
                <zz-comment-item :comment="r" :reply-on="canReplyTo" :is-author="isPostAuthor(r)" @reply="onReply" />
              </view>
            </view>
            <view v-if="cPage < cTotalPages" class="comments-more" hover-class="zz-press-op" :hover-stay-time="60" @tap="loadMoreComments">加载更多评论</view>
            <view v-else class="comments-end">— 已显示全部评论 —</view>
          </view>

          <zz-empty
            v-else-if="!cLoading"
            type="comments"
            desc="来坐第一排"
            action-text="写第一条"
            @action="startCompose"
          />
        </block>
        <view v-else class="comments-off">评论已关闭</view>
      </view>

      <zz-action-bar
        v-if="showLike || showFav || showComment || !audit"
        :liked="!!post.liked"
        :favorited="!!post.favorited"
        :like-count="post.likeCount || 0"
        :comment-count="cTotal"
        :show-like="showLike"
        :show-fav="showFav"
        :show-comment="showComment"
        :show-share="!audit"
        @like="doLike"
        @fav="doFav"
        @comment="focusComment"
      />

      <view v-if="showTop" class="to-top" hover-class="zz-press-op" :hover-stay-time="60" @tap="toTop" aria-label="返回顶部">
        <t-icon name="arrow-up" size="38rpx" color="#2fa8e8" />
      </view>
    </template>

    <view v-else class="loading">
      <zz-navbar title="文章" back />
      <view class="pad">
        <zz-skeleton type="detail" />
      </view>
    </view>

    <zz-login-sheet @done="onLoggedIn" />
  </view>
</template>

<script setup>
// 文章详情：全幅封面 + 白色 article sheet + 黄色阅读提示 + 评论 + 固定操作栏。
// 正文用 mp-html 渲染，链接点击复制；点赞/收藏/评论/分享继续走功能开关。
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onPageScroll, onShareAppMessage } from '@dcloudio/uni-app'
import MpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue'
import { state, feat, auditMode, displayName } from '@/common/store.js'
import {
  postDetail, comments as fetchComments,
  toggleLike, toggleFavorite, submitComment, ensureLogin, toast,
} from '@/common/request.js'
import { fmtDate, fmtShort, fmtNum } from '@/common/format.js'
import { styleHtml } from '@/common/mdcss.js'
import { categoryStyle, postCover } from '@/common/theme.js'
import { pushView } from '@/common/history.js'
import { BASE_URL } from '@/common/config.js'
import { STATUS_BAR_HEIGHT, CAPSULE_SPACE } from '@/common/ui.js'

const post = ref(null)
const notFound = ref(false)
const all = ref([])
const cPage = ref(1)
const cTotalPages = ref(1)
const cTotal = ref(0)
const cLoading = ref(false)
const composeOpen = ref(false)
const commentFocus = ref(false)
const replyTo = ref(null)
const draft = ref('')
const submitting = ref(false)
const showTop = ref(false)

const statusBarHeight = STATUS_BAR_HEIGHT
const capsuleSpace = CAPSULE_SPACE
const coverHeight = `calc(420rpx + ${statusBarHeight}px)`

function setNav(front, bg) {
  try { uni.setNavigationBarColor({ frontColor: front, backgroundColor: bg }) } catch (e) { /* H5 忽略 */ }
}

const audit = computed(() => auditMode())
const showComment = computed(() => feat('comment') && !audit.value)
const showLike = computed(() => feat('like') && !audit.value)
const showFav = computed(() => feat('favorite') && !audit.value)
const canReplyTo = computed(() => showComment.value)
const nodes = computed(() => styleHtml((post.value && post.value.contentHtml) || ''))
const coverImg = computed(() => postCover(post.value) || '/static/img/banner-1.jpg')
const cat = computed(() => categoryStyle(post.value || {}))
const catName = computed(() => (post.value && post.value.category && post.value.category.name) || cat.value.label || '文章')
const dispName = computed(() => displayName())
const isEdited = computed(() => {
  const p = post.value || {}
  if (!p.updatedAt || !p.publishedAt) return false
  return new Date(String(p.updatedAt).replace(/-/g, '/')) - new Date(String(p.publishedAt).replace(/-/g, '/')) > 60000
})
const readMin = computed(() => {
  const text = String((post.value && post.value.contentHtml) || '').replace(/<[^>]+>/g, '')
  return Math.max(1, Math.round(text.length / 400))
})
const parents = computed(() => all.value.filter((c) => !c.parentId))

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
    setNav('#ffffff', '#1b2836')
    uni.setNavigationBarTitle({ title: r.title || '文章' })
    cTotal.value = r.commentCount || 0
    pushView({ slug: r.slug, title: r.title, category: (r.category && r.category.name) || '', cover: postCover(r) || '' })
    if (showComment.value) loadComments(1)
  } catch (e) {
    notFound.value = true
    setNav('#000000', '#f5f7fa')
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
  commentFocus.value = true
}
function onReply(c) {
  if (!ensureLogin()) return
  replyTo.value = { id: c.id, name: c.authorName || '鱼友' }
  composeOpen.value = true
  commentFocus.value = true
}
function cancelCompose() {
  composeOpen.value = false
  commentFocus.value = false
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
function focusComment() {
  if (!ensureLogin()) return
  uni.pageScrollTo({ scrollTop: 99999, duration: 250 })
  setTimeout(() => {
    composeOpen.value = true
    commentFocus.value = true
  }, 260)
}
function onLoggedIn() { /* 登录后让用户再点一次来源动作 */ }

function onLinkTap(e) {
  let href = e && e.href ? String(e.href) : ''
  if (!href || href[0] === '#') return
  if (!href.includes('://')) {
    const base = String(state.site.url || BASE_URL).replace(/\/+$/, '')
    href = base + (href[0] === '/' ? href : '/' + href)
  }
  uni.setClipboardData({ data: href, success: () => toast('链接已复制，请在浏览器打开') })
}

function toTop() {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}
function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) uni.navigateBack()
  else uni.reLaunch({ url: '/pages/index/index' })
}
function goHome() { uni.reLaunch({ url: '/pages/index/index' }) }

let slug = ''
onLoad((q) => {
  slug = String((q && q.slug) || '')
  if (!slug) { notFound.value = true; setNav('#000000', '#f5f7fa'); return }
  setNav('#000000', '#f5f7fa')
  load(slug)
})

function updateTop(top) {
  const next = Number(top || 0) > 600
  if (next !== showTop.value) showTop.value = next
}

onPageScroll((e) => updateTop(e && e.scrollTop))

// H5 的页面滚动不一定触发 onPageScroll（窗口/滚动容器实现差异），
// 监听捕获阶段的 scroll 作为兜底；小程序仍走 onPageScroll。
// #ifdef H5
let onWindowScroll = null
onMounted(() => {
  onWindowScroll = (e) => {
    const target = e && e.target
    const top = Math.max(
      Number(window.scrollY) || 0,
      Number(document.documentElement.scrollTop) || 0,
      Number(target && target.scrollTop) || 0,
    )
    updateTop(top)
  }
  document.addEventListener('scroll', onWindowScroll, true)
  updateTop(window.scrollY || document.documentElement.scrollTop || 0)
})
onUnmounted(() => {
  if (onWindowScroll) document.removeEventListener('scroll', onWindowScroll, true)
  onWindowScroll = null
})
// #endif

onShareAppMessage(() => {
  if (audit.value) return { title: state.site.name || '纸鱼博客', path: '/pages/index/index' }
  const p = post.value || {}
  const msg = { title: p.title || state.site.name || '纸鱼博客', path: '/pages/post/detail?slug=' + encodeURIComponent(slug) }
  msg.imageUrl = coverImg.value || '/static/illus/share-brand.png'
  return msg
})
</script>

<style scoped>
.det {
  padding-bottom: 0;
}

/* 封面：状态栏和顶部按钮下方压一层纯色遮罩，保证白字可读 */
.cover {
  position: relative;
  overflow: hidden;
  background: #1b2836;
}

.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cover-shade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(12, 24, 38, .46);
  z-index: 1;
  pointer-events: none;
}

.cover-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12rpx;
  height: auto;
  padding-left: 24rpx;
  padding-bottom: 14rpx;
}

.top-spacer { flex: 1; }

.top-btn {
  width: 64rpx;
  height: 64rpx;
  margin: 0;
  padding: 0;
  flex: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, .24);
  border: 1rpx solid rgba(255, 255, 255, .18);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.top-btn::after { border: none; }

/* 白色 article sheet */
.sheet {
  position: relative;
  z-index: 2;
  margin-top: -24rpx;
  padding: 26rpx 32rpx 0;
  border-radius: 24rpx 24rpx 0 0;
  background: var(--zz-card);
}

.kicker {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.cat {
  padding: 3rpx 10rpx;
  border-radius: 999rpx;
  font-size: 17rpx;
  font-weight: 500;
  line-height: 1.3;
}

.read {
  font-size: 19rpx;
  color: var(--zz-ink-3);
}

.title {
  display: block;
  margin-top: 12rpx;
  font-size: 42rpx;
  line-height: 1.4;
  font-weight: 700;
  color: var(--zz-ink);
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
  font-size: 19rpx;
  color: var(--zz-ink-3);
}

.dot {
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: #c2cad2;
}

.author {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 22rpx;
}

.author-text {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.author-name {
  font-size: 22rpx;
  font-weight: 500;
  color: var(--zz-ink);
}

.author-sub {
  font-size: 18rpx;
  color: var(--zz-ink-3);
}

.tip {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin-top: 22rpx;
  padding: 18rpx 20rpx;
  border: 1rpx solid #ffe7a3;
  border-radius: 16rpx;
  background: #fff8e1;
  color: #b26a00;
  font-size: 20rpx;
  line-height: 1.6;
}

.lock {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: var(--zz-paper);
}

.lock-txt {
  font-size: 23rpx;
  line-height: 1.6;
  color: var(--zz-ink-2);
}

.article {
  margin-top: 22rpx;
  font-size: 28rpx;
  line-height: 1.9;
  color: var(--zz-ink);
  word-break: break-all;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 26rpx;
}

.tag {
  padding: 4rpx 11rpx;
  border-radius: 999rpx;
  background: var(--zz-brand-soft);
  color: var(--zz-brand-deep);
  font-size: 18rpx;
  line-height: 1.3;
}

.end {
  padding: 30rpx 0 22rpx;
  text-align: center;
  color: #b4bdc6;
  font-size: 19rpx;
  letter-spacing: .1em;
}

/* 评论 */
.comments {
  margin-top: 14rpx;
  padding: 0 32rpx 20rpx;
  background: var(--zz-card);
}

.comments-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 24rpx 0 16rpx;
  border-top: 1rpx solid var(--zz-line);
}

.comments-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--zz-ink);
}

.comments-count {
  font-size: 19rpx;
  color: var(--zz-ink-3);
}

.comment-fake {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 14rpx 18rpx;
  border-radius: 16rpx;
  background: var(--zz-paper);
  border: 1rpx solid var(--zz-line);
}

.comment-ph {
  font-size: 23rpx;
  color: var(--zz-ink-3);
}

.compose {
  padding: 18rpx;
  border: 1rpx solid var(--zz-brand);
  border-radius: 16rpx;
  background: var(--zz-card);
}

.compose-input {
  width: 100%;
  min-height: 120rpx;
  max-height: 320rpx;
  font-size: 25rpx;
  line-height: 1.65;
  color: var(--zz-ink);
}

.compose-ph { color: var(--zz-ink-3); }

.compose-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 26rpx;
  margin-top: 12rpx;
}

.compose-cancel {
  font-size: 22rpx;
  color: var(--zz-ink-3);
}

.compose-send {
  padding: 10rpx 26rpx;
  border-radius: 10rpx;
  background: var(--zz-brand-deep);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.2;
}

.compose-send.dis { opacity: .55; }

.comment-list {
  margin-top: 10rpx;
}

.comment-block {
  border-bottom: 1rpx solid var(--zz-line);
}

.comment-block:last-child { border-bottom: none; }

.comment-reply {
  margin-left: 72rpx;
  padding-left: 18rpx;
  border-left: 2rpx solid var(--zz-line);
}

.comments-more {
  padding: 20rpx 0 8rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 500;
  color: var(--zz-brand-deep);
}

.comments-end {
  padding: 24rpx 0 8rpx;
  text-align: center;
  font-size: 19rpx;
  color: var(--zz-ink-3);
}

.comments-off {
  display: block;
  padding: 40rpx 0;
  text-align: center;
  font-size: 21rpx;
  color: var(--zz-ink-3);
}

.to-top {
  position: fixed;
  right: 24rpx;
  bottom: calc(156rpx + env(safe-area-inset-bottom));
  z-index: 55;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, .96);
  border: 1rpx solid var(--zz-line);
  box-shadow: 0 8rpx 24rpx rgba(31, 58, 87, .12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pad {
  padding: 20rpx 24rpx;
}

.nf, .loading {
  min-height: 100vh;
  background: var(--zz-paper);
}
</style>
