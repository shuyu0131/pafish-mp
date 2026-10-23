<template>
  <view class="cpage zz-page">
    <view v-if="closed" class="pad">
      <zz-empty type="closed" title="评论功能已关闭" desc="该功能暂未开放" />
    </view>

    <view v-else-if="!logged" class="pad">
      <zz-empty
        type="comments"
        title="登录后查看我的评论"
        desc="你在纸鱼留下的每一句话"
        action-text="去登录"
        @action="askLogin"
      />
    </view>

    <template v-else>
      <view v-if="list.length" class="cl">
        <zz-card v-for="c in list" :key="c.id" pad="24rpx 26rpx" class="myc">
          <text class="p">{{ c.content }}</text>
          <view v-if="c.postSlug" class="src" hover-class="zz-press-op" :hover-stay-time="60" @tap="openPost(c)">
            <t-icon name="file-1" size="26rpx" color="#9aa3ad" />
            <text class="spt">{{ c.postTitle || c.postSlug }}</text>
          </view>
          <view class="mt">
            <text class="tm">{{ fmtRel(c.createdAt) }}</text>
            <text v-if="c.status === 'PENDING'" class="pend">待审核</text>
            <text v-if="c.postSlug" class="go" @tap="openPost(c)">查看原文</text>
          </view>
        </zz-card>
      </view>

      <view v-else-if="!loading" class="pad">
        <zz-empty
          type="comments"
          title="还没有发表过评论"
          desc="去文章底下说点什么吧"
          action-text="去逛逛"
          @action="goHome"
        />
      </view>

      <view v-if="list.length" class="more">
        <text v-if="loading">正在加载…</text>
        <text v-else-if="noMore">— 到底啦 —</text>
      </view>
    </template>

    <zz-login-sheet />
  </view>
</template>

<script setup>
// 我的评论：本地登录态下的个人 UGC 记录，待审核条目挂琥珀色徽章。
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
.cl {
  padding: 20rpx 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.myc {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.p {
  display: block;
  font-size: 25rpx;
  line-height: 1.7;
  color: var(--zz-ink);
  word-break: break-all;
}

.src {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  background: var(--zz-paper);
}

.spt {
  flex: 1;
  min-width: 0;
  font-size: 20rpx;
  color: var(--zz-ink-2);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mt {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tm {
  font-size: 18rpx;
  color: var(--zz-ink-3);
}

.pend {
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  background: #fff1e9;
  color: #be5a00;
  font-size: 17rpx;
  font-weight: 600;
}

.go {
  margin-left: auto;
  font-size: 20rpx;
  font-weight: 500;
  color: var(--zz-brand-deep);
}

.more {
  padding: 20rpx 0 8rpx;
  text-align: center;
}

.more text {
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.pad {
  padding: 20rpx 24rpx;
}
</style>
