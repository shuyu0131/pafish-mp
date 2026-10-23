<template>
  <view
    class="zz-navbar"
    :class="[`is-${variant}`, { 'is-brand': brand, 'is-center': center }]"
    :style="{ paddingTop: statusBarHeight + 'px' }"
  >
    <view class="zz-navbar-row" :style="{ paddingRight: capsuleSpace + 'px' }">
      <view v-if="back" class="zz-nav-btn" hover-class="zz-press-op" :hover-stay-time="60" @tap="goBack">
        <t-icon name="chevron-left" size="40rpx" color="currentColor" />
      </view>

      <view v-if="brand" class="zz-brand">
        <image class="zz-brand-mark" src="/static/illus/tab-mine-on.png" mode="aspectFit" />
        <view class="zz-brand-text">
          <text class="zz-brand-name">纸鱼</text>
          <text class="zz-brand-sub">记录与分享</text>
        </view>
      </view>
      <text v-else class="zz-nav-title">{{ title }}</text>

      <view class="zz-nav-spacer" />
      <slot name="right" />
    </view>
  </view>
</template>

<script>
// 自定义导航：状态栏 + 48px 导航行，右侧自动给微信胶囊留位。
// sky 变体透明叠在天空图上；paper 变体浅灰底，用于微语/分类/搜索。
import { STATUS_BAR_HEIGHT, CAPSULE_SPACE } from '@/common/ui.js'

export default {
  name: 'ZzNavbar',
  props: {
    title: { type: String, default: '' },
    back: { type: Boolean, default: false },
    brand: { type: Boolean, default: false },
    center: { type: Boolean, default: false },
    variant: { type: String, default: 'paper' }, // sky | paper
  },
  data() {
    return {
      statusBarHeight: STATUS_BAR_HEIGHT,
      capsuleSpace: CAPSULE_SPACE,
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) uni.navigateBack()
      else uni.reLaunch({ url: '/pages/index/index' })
    },
  },
}
</script>

<style scoped>
.zz-navbar {
  position: relative;
  z-index: 30;
}

.zz-navbar.is-paper {
  position: sticky;
  top: 0;
  background: var(--zz-paper);
  border-bottom: 1rpx solid var(--zz-line);
}

.zz-navbar.is-sky {
  background: transparent;
}

.zz-navbar-row {
  height: 88rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-left: 24rpx;
}

.zz-nav-btn {
  width: 64rpx;
  height: 64rpx;
  flex: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--zz-ink);
}

.zz-nav-spacer {
  flex: 1;
  min-width: 8rpx;
}

.zz-brand {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-width: 0;
}

.zz-brand-mark {
  width: 48rpx;
  height: 48rpx;
  flex: none;
}

.zz-brand-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.zz-brand-name {
  font-size: 32rpx;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: .1em;
  color: var(--zz-ink);
}

.zz-brand-sub {
  font-size: 15rpx;
  line-height: 1.3;
  color: var(--zz-ink-2);
  letter-spacing: .12em;
  white-space: nowrap;
}

.zz-navbar.is-center .zz-nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.zz-nav-title {
  font-size: 32rpx;
  line-height: 1.3;
  font-weight: 600;
  color: var(--zz-ink);
  white-space: nowrap;
}

.zz-press-op {
  opacity: .55;
}
</style>
