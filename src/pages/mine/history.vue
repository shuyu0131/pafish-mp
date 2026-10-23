<template>
  <view class="hpage zz-page">
    <view v-if="hasAny" class="clr-row">
      <text class="clr" hover-class="zz-press-op" :hover-stay-time="60" @tap="clearAll">全部清空</text>
    </view>

    <block v-if="hasAny">
      <view v-for="g in groups" :key="g.name" class="sec">
        <text class="grp">{{ g.name }}</text>
        <zz-card pad="0" class="hs">
          <view
            v-for="(it, i) in g.items"
            :key="it.slug"
            class="hr"
            :class="{ last: i === g.items.length - 1 }"
            hover-class="zz-press-op"
            :hover-stay-time="60"
            @tap="openPost(it)"
          >
            <view class="cv" :style="{ background: cat(it).bg }">
              <image v-if="cover(it)" class="cv-img" :src="cover(it)" mode="aspectFill" />
              <image v-else class="cv-art" :src="cat(it).art" mode="aspectFit" />
            </view>
            <text class="ht">{{ it.title || it.slug }}</text>
            <text class="tm">{{ g.name === '今天' ? fmtClock(it.ts) : fmtShort(it.ts) }}</text>
            <view class="x" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="removeOne(it)">
              <t-icon name="close" size="26rpx" color="#9aa3ad" />
            </view>
          </view>
        </zz-card>
      </view>
    </block>

    <view v-else class="pad">
      <zz-empty type="history" desc="去纸鱼逛逛" action-text="回首页" @action="goHome" />
    </view>
  </view>
</template>

<script setup>
// 浏览历史：仅设备本地存储（隐私友好）。按天分组，可逐条删除或清空。
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { views, removeView, clearViews } from '@/common/history.js'
import { fmtClock, fmtShort } from '@/common/format.js'
import { categoryStyle, usableCover } from '@/common/theme.js'

const groups = ref([])
const hasAny = computed(() => groups.value.some((g) => g.items.length))

function cat(it) { return categoryStyle({ category: { name: it.category || '' } }) }
function cover(it) { return usableCover(it.cover) }
function reload() { groups.value = views() }

function removeOne(it) {
  removeView(it.slug)
  reload()
}
function clearAll() {
  uni.showModal({
    title: '清空浏览历史',
    content: '将删除本机记录的全部浏览历史，无法恢复。',
    confirmText: '清空',
    confirmColor: '#d54941',
    success: (r) => {
      if (r.confirm) {
        clearViews()
        reload()
      }
    },
  })
}

function openPost(it) {
  uni.navigateTo({ url: '/pages/post/detail?slug=' + encodeURIComponent(it.slug) })
}
function goHome() { uni.reLaunch({ url: '/pages/index/index' }) }

onShow(reload)
</script>

<style scoped>
.clr-row {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 24rpx 0;
}

.clr {
  padding: 6rpx 0;
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.sec {
  padding: 18rpx 24rpx 0;
}

.grp {
  display: block;
  margin: 0 4rpx 12rpx;
  font-size: 19rpx;
  font-weight: 500;
  color: var(--zz-ink-3);
  letter-spacing: .06em;
}

.hs {
  overflow: hidden;
}

.hr {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 18rpx 20rpx;
  border-bottom: 1rpx solid var(--zz-line);
}

.hr.last { border-bottom: none; }

.cv {
  width: 80rpx;
  height: 80rpx;
  flex: none;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cv-img {
  width: 100%;
  height: 100%;
}

.cv-art {
  width: 80%;
  height: 80%;
}

.ht {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: var(--zz-ink);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tm {
  flex: none;
  font-size: 18rpx;
  color: var(--zz-ink-3);
}

.x {
  flex: none;
  padding: 8rpx 10rpx;
  line-height: 0;
}

.pad {
  padding: 20rpx 24rpx;
}
</style>
