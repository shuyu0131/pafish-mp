<template>
  <view class="cpage">
    <view v-if="closed" class="pad">
      <t-empty description="评论功能已关闭" icon="info-circle" />
    </view>
    <view v-else-if="!logged" class="pad">
      <t-empty description="登录后查看我的评论" icon="user" />
      <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="askLogin">
        <t-icon name="user" size="28rpx" color="#0052d9" />
        <text class="retry-txt">去登录</text>
      </view>
    </view>
    <template v-else>
      <view v-if="list.length" class="cl">
        <zz-card v-for="c in list" :key="c.id" pad="26rpx 28rpx" press class="myc">
          <text class="p">{{ c.content }}</text>
          <view v-if="c.postSlug" class="src" hover-class="zz-press" :hover-stay-time="60" @tap="openPost(c)">
            <t-icon name="file-1" size="28rpx" color="rgba(0,0,0,0.4)" />
            <text class="spt">{{ c.postTitle || c.postSlug }}</text>
          </view>
          <view class="mt">
            <text class="tm">{{ fmtRel(c.createdAt) }}</text>
            <text v-if="c.status === 'PENDING'" class="pend">待审核</text>
            <text v-if="c.postSlug" class="go" @tap="openPost(c)">查看原文 ›</text>
          </view>
        </zz-card>
      </view>
      <view v-else-if="!loading" class="pad">
        <t-empty description="还没有发表过评论" icon="chat" />
        <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="goHome">
          <t-icon name="book" size="28rpx" color="#0052d9" />
          <text class="retry-txt">去逛逛</text>
        </view>
      </view>
      <view v-if="list.length" class="more">
        <text v-if="loading">正在加载…</text>
        <text v-else-if="noMore">· 到底啦 ·</text>
      </view>
    </template>

    <zz-login-sheet />
  </view>
</template>

<script setup>
// 我的评论：本地登录态下的个人 UGC 记录，待审核条目挂橙色徽章。
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { feat, auditMode, isLoggedIn, openLoginSheet } from '@/common/store.js'
import { myComments, toast } from '@/common/request.js'
import { fmtRel } from '@/common/format.js'

const list = ref([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)

const logged = computed(() => isLoggedIn())
const closed = computed(() => !feat('comment') || auditMode())
const noMore = computed(() => page.value >= totalPages.value)

async function run(reset) {
  if (loading.value || closed.value || !logged.value) return
  loading.value = true
  if (reset) { page.value = 1; totalPages.value = 1 }
  try {
    const r = await myComments(page.value)
    const items = r.comments || []
    list.value = reset ? items : list.value.concat(items)
    totalPages.value = r.totalPages || (items.length < 10 ? page.value : page.value + 1)
  } catch (e) {
    toast(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openPost(c) {
  uni.navigateTo({ url: '/pages/post/detail?slug=' + encodeURIComponent(c.postSlug) })
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
.cl { padding: 24rpx 32rpx 0; }
.myc { margin-bottom: 20rpx; }
.p { display: block; font-size: 28rpx; line-height: 1.75; color: var(--zz-ink); word-break: break-all; }
.src {
  display: flex; align-items: center; gap: 14rpx; margin-top: 18rpx;
  background: var(--zz-block); border-radius: 12rpx; padding: 16rpx 20rpx;
}
.spt {
  flex: 1; min-width: 0; font-size: 24rpx; color: var(--zz-ink-2);
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
.mt { display: flex; align-items: center; gap: 16rpx; margin-top: 18rpx; }
.tm { font-size: 22rpx; color: var(--zz-ink-3); }
.pend {
  font-size: 20rpx; font-weight: 600; color: #be5a00; background: #fff1e9;
  border-radius: 8rpx; padding: 4rpx 12rpx; line-height: 1.2;
}
.go { margin-left: auto; font-size: 24rpx; color: var(--zz-brand); font-weight: 600; }

.more { text-align: center; padding: 24rpx 0 8rpx; }
.more text { font-size: 24rpx; color: var(--zz-ink-3); }
.pad { padding: 48rpx 32rpx 0; }
.retry {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
  margin-top: 24rpx; padding: 14rpx 0; line-height: 1;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
</style>
