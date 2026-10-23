<template>
  <view class="cat-page zz-page">
    <zz-navbar title="分类" center />

    <view class="cat-wrap">
      <view v-if="loading && !cats.length" class="cat-loading">
        <view v-for="i in 4" :key="i" class="cat-sk" />
      </view>

      <view v-else-if="cats.length" class="cat-grid">
        <view
          v-for="c in cats"
          :key="c.id || c.slug"
          class="cat-card"
          hover-class="zz-press-op"
          :hover-stay-time="60"
          @tap="openCat(c)"
        >
          <image v-if="coverOf(c)" class="cat-cover" :src="coverOf(c)" mode="aspectFill" />
          <view v-else class="cat-fallback" :style="{ background: styleOf(c).bg }">
            <image class="cat-art" :src="styleOf(c).art" mode="aspectFit" />
          </view>
          <view class="cat-shade">
            <text class="cat-name">{{ c.name }}</text>
            <text class="cat-count">共 {{ c.postCount || 0 }} 篇</text>
          </view>
        </view>
      </view>
      <view v-if="cats.length" class="cat-end">— 没有更多分类了 —</view>

      <zz-empty
        v-else-if="err"
        type="offline"
        :desc="err"
        action-text="重新加载"
        @action="load"
      />
      <zz-empty
        v-else
        type="posts"
        title="还没有分类"
        desc="等第一篇内容归档后，这里会热闹起来"
        action-text="回首页"
        @action="goHome"
      />
    </view>

    <zz-tabbar active="category" />
  </view>
</template>

<script setup>
// 分类页：两列大卡片，优先使用后台分类封面，没有封面则用品牌分类插画。
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { categories } from '@/common/request.js'
import { categoryCover, categoryStyle } from '@/common/theme.js'

const cats = ref([])
const loading = ref(false)
const err = ref('')
let loaded = false

function coverOf(c) { return categoryCover(c) }
function styleOf(c) { return categoryStyle(c) }

async function load() {
  if (loading.value) return
  loading.value = true
  err.value = ''
  try {
    const r = await categories()
    cats.value = r.categories || []
    loaded = true
  } catch (e) {
    err.value = (e && e.message) || '分类加载失败'
  } finally {
    loading.value = false
  }
}

function openCat(c) {
  if (!c || !c.slug) return
  uni.reLaunch({ url: '/pages/index/index?cat=' + encodeURIComponent(c.slug) })
}
function goHome() { uni.reLaunch({ url: '/pages/index/index' }) }

onShow(() => {
  if (!loaded) load()
})
</script>

<style scoped>
.cat-page {
  padding-bottom: 16rpx;
}

.cat-wrap {
  padding: 20rpx 24rpx 24rpx;
}

.cat-grid,
.cat-loading {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
}

.cat-card {
  position: relative;
  height: 320rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: var(--zz-card);
  box-shadow: var(--zz-shadow);
}

.cat-cover,
.cat-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cat-cover {
  display: block;
}

.cat-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-art {
  width: 72%;
  height: 72%;
}

.cat-shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 22rpx 22rpx 20rpx;
  background: rgba(16, 28, 40, .56);
}

.cat-name {
  display: block;
  font-size: 30rpx;
  line-height: 1.3;
  font-weight: 600;
  color: #ffffff;
}

.cat-count {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: rgba(255, 255, 255, .72);
}

.cat-end {
  padding: 34rpx 0 22rpx;
  text-align: center;
  font-size: 20rpx;
  color: #b4bdc6;
  letter-spacing: .08em;
}

.cat-sk {
  height: 320rpx;
  border-radius: 24rpx;
  background: #eef2f6;
  animation: cat-pulse 1.4s ease-in-out infinite;
}

@keyframes cat-pulse {
  0%, 100% { opacity: .55; }
  50% { opacity: .95; }
}
</style>
