<template>
  <view class="fpage">
    <view v-if="closed" class="pad">
      <t-empty description="收藏功能已关闭" icon="info-circle" />
    </view>
    <view v-else-if="!logged" class="pad">
      <t-empty description="登录后查看我的收藏" icon="user" />
      <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="askLogin">
        <t-icon name="user" size="28rpx" color="#0052d9" />
        <text class="retry-txt">去登录</text>
      </view>
    </view>
    <template v-else>
      <view v-if="firstLoading" class="pad">
        <t-skeleton :row-col="skRows" animation="gradient" />
      </view>
      <view v-else-if="list.length" class="flist">
        <zz-card v-for="p in list" :key="p.id" pad="22rpx 32rpx" press r="0" class="fv" @tap="openPost(p)">
          <view class="cv" :style="coverBg(p)">
            <image v-if="p.coverUrl" class="cv-img" :src="p.coverUrl" mode="aspectFill" />
            <t-icon v-else :name="coverStyle(p).icon" size="52rpx" :color="coverStyle(p).fg" />
          </view>
          <view class="fc">
            <text class="h4">{{ p.title }}</text>
            <text class="mt">{{ p.author || '纸鱼' }} · {{ fmtShort(p.favoritedAt) }} 收藏</text>
          </view>
          <view class="un" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="unfav(p)">
            <t-icon name="star-filled" size="34rpx" color="rgba(0,0,0,0.4)" />
            <text class="un-txt">取消</text>
          </view>
        </zz-card>
      </view>
      <view v-else-if="!loading" class="pad">
        <t-empty description="收藏夹还空着，看到好文就收进来" icon="star" />
        <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="goHome">
          <t-icon name="book" size="28rpx" color="#0052d9" />
          <text class="retry-txt">去逛逛</text>
        </view>
      </view>
      <view v-if="list.length" class="more">
        <text v-if="loading">正在加载…</text>
        <text v-else-if="noMore">· 共 {{ total }} 篇 ·</text>
      </view>
    </template>

    <zz-login-sheet />
  </view>
</template>

<script setup>
// 我的收藏：服务端按收藏时间倒序，取消即时移除行。功能/登录开关兜底空态。
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { feat, auditMode, isLoggedIn, openLoginSheet } from '@/common/store.js'
import { myFavorites, toggleFavorite, toast } from '@/common/request.js'
import { fmtShort } from '@/common/format.js'
import { coverStyle } from '@/common/theme.js'

const skRows = [{ type: 'rect', width: '100%', height: '120rpx', size: '120rpx' }, { type: 'text' }]

const list = ref([])
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const loading = ref(false)

const logged = computed(() => isLoggedIn())
const closed = computed(() => !feat('favorite') || auditMode())
const firstLoading = computed(() => loading.value && !list.value.length && !closed.value && logged.value)
const noMore = computed(() => page.value >= totalPages.value)

function coverBg(p) {
  return p.coverUrl ? {} : { background: coverStyle(p).bg }
}

async function run(reset) {
  if (loading.value || closed.value || !logged.value) return
  loading.value = true
  if (reset) { page.value = 1; totalPages.value = 1 }
  try {
    const r = await myFavorites(page.value)
    const items = r.posts || []
    list.value = reset ? items : list.value.concat(items)
    totalPages.value = r.totalPages || 1
    total.value = r.total || 0
  } catch (e) {
    toast(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function unfav(p) {
  try {
    const r = await toggleFavorite(String(p.id))
    if (!r.active) {
      list.value = list.value.filter((x) => String(x.id) !== String(p.id))
      total.value = Math.max(0, total.value - 1)
      toast('已取消收藏')
    } else {
      toast('仍在收藏夹中')
    }
  } catch (e) { toast(e.message || '操作失败') }
}

function openPost(p) {
  uni.navigateTo({ url: '/pages/post/detail?slug=' + encodeURIComponent(p.slug) })
}
function askLogin() { openLoginSheet() }
function goHome() { uni.reLaunch({ url: '/pages/index/index' }) }

onLoad(() => { run(true) })
onReachBottom(() => {
  if (noMore.value) return
  page.value += 1
  run(false)
})
</script>

<style scoped>
.flist { padding: 0; }
.fv { display: flex; align-items: center; gap: 22rpx; border-bottom: 1rpx solid var(--zz-line); }
.fv:last-child { border-bottom: none; }
.cv {
  width: 148rpx; height: 148rpx; border-radius: 12rpx; overflow: hidden; flex: none;
  display: flex; align-items: center; justify-content: center; background: var(--zz-block);
}
.cv-img { width: 100%; height: 100%; }
.fc { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12rpx; }
.h4 {
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
  font-size: 26rpx; font-weight: 600; color: var(--zz-ink); line-height: 1.5;
}
.mt { font-size: 22rpx; color: var(--zz-ink-3); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.un {
  display: flex; flex-direction: column; align-items: center; gap: 8rpx; flex: none;
  line-height: 1; padding: 12rpx 8rpx;
}
.un-txt { font-size: 20rpx; color: var(--zz-ink-3); }

.more { text-align: center; padding: 24rpx 0 8rpx; }
.more text { font-size: 24rpx; color: var(--zz-ink-3); }
.pad { padding: 48rpx 32rpx 0; }
.retry {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
  margin-top: 24rpx; padding: 14rpx 0; line-height: 1;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
</style>
