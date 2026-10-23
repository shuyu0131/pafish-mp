<template>
  <view class="fpage zz-page">
    <view v-if="closed" class="pad">
      <zz-empty type="closed" title="收藏功能已关闭" desc="该功能暂未开放" />
    </view>

    <view v-else-if="!logged" class="pad">
      <zz-empty
        type="favorites"
        title="登录后查看我的收藏"
        desc="把喜欢的文章收进自己的鱼塘"
        action-text="去登录"
        @action="askLogin"
      />
    </view>

    <template v-else>
      <view v-if="firstLoading" class="pad">
        <zz-skeleton type="post" :rows="4" />
      </view>

      <view v-else-if="list.length" class="flist">
        <zz-card
          v-for="p in list"
          :key="p.id"
          pad="20rpx 24rpx"
          press
          class="fv"
          @select="openPost(p)"
        >
          <view class="fv-cover" :style="{ background: cat(p).bg }">
            <image v-if="cover(p)" class="fv-img" :src="cover(p)" mode="aspectFill" />
            <image v-else class="fv-art" :src="cat(p).art" mode="aspectFit" />
          </view>
          <view class="fv-main">
            <text class="fv-title">{{ p.title }}</text>
            <text class="fv-meta">{{ p.author || '纸鱼' }} · {{ fmtShort(p.favoritedAt) }} 收藏</text>
          </view>
          <view class="fv-un" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="unfav(p)">
            <t-icon name="star-filled" size="30rpx" color="#e8b96a" />
            <text>取消</text>
          </view>
        </zz-card>
        <view class="more">
          <text v-if="loading">正在加载…</text>
          <text v-else-if="noMore">— 共 {{ total }} 篇 —</text>
        </view>
      </view>

      <view v-else-if="!loading" class="pad">
        <zz-empty
          type="favorites"
          desc="遇到喜欢的文章就收进来"
          action-text="去逛逛"
          @action="goHome"
        />
      </view>
    </template>

    <zz-login-sheet />
  </view>
</template>

<script setup>
// 我的收藏：服务端按收藏时间倒序，取消即时移除行。
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { feat, auditMode, isLoggedIn, openLoginSheet } from '@/common/store.js'
import { myFavorites, toggleFavorite, toast } from '@/common/request.js'
import { fmtShort } from '@/common/format.js'
import { categoryStyle, postCover } from '@/common/theme.js'

const list = ref([])
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const loading = ref(false)

const logged = computed(() => isLoggedIn())
const closed = computed(() => !feat('favorite') || auditMode())
const firstLoading = computed(() => loading.value && !list.value.length && !closed.value && logged.value)
const noMore = computed(() => page.value >= totalPages.value)

function cat(p) { return categoryStyle(p) }
function cover(p) { return postCover(p) }

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
.flist {
  padding: 20rpx 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.fv {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.fv-cover {
  width: 132rpx;
  height: 132rpx;
  flex: none;
  border-radius: 14rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fv-img {
  width: 100%;
  height: 100%;
}

.fv-art {
  width: 80%;
  height: 80%;
}

.fv-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.fv-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 26rpx;
  line-height: 1.45;
  font-weight: 500;
  color: var(--zz-ink);
}

.fv-meta {
  font-size: 18rpx;
  color: var(--zz-ink-3);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.fv-un {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 4rpx;
  font-size: 16rpx;
  color: var(--zz-ink-3);
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
