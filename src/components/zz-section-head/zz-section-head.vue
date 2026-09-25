<template>
  <view class="zz-section-head">
    <text class="zz-section-title">{{ title }}</text>
    <text v-if="sub" class="zz-section-sub">{{ sub }}</text>
    <view v-if="$slots.extra || more" class="zz-section-extra" hover-class="zz-press-op" :hover-stay-time="60" @tap="$emit('more')">
      <slot name="extra">
        <text class="zz-section-more">{{ more }}</text>
      </slot>
      <t-icon name="chevron-right" size="26rpx" color="rgba(0,0,0,0.4)" />
    </view>
  </view>
</template>

<script>
// 分区标题：原生风格 28rpx 加粗黑字，无字距装饰。
export default {
  name: 'ZzSectionHead',
  props: {
    title: { type: String, required: true },
    sub: { type: String, default: '' },
    more: { type: String, default: '' },
  },
  emits: ['more'],
}
</script>

<style scoped>
.zz-section-head {
  display: flex;
  align-items: baseline;
  padding: 8rpx 0 20rpx;
}
.zz-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--zz-ink);
}
.zz-section-sub {
  margin-left: 16rpx;
  font-size: 22rpx;
  color: var(--zz-ink-3);
}
.zz-section-extra {
  display: flex;
  align-items: center;
  margin-left: auto;
}
.zz-section-more {
  font-size: 24rpx;
  color: var(--zz-ink-3);
}
/* 小程序自定义组件样式隔离，按压类需组件内自带 */
.zz-press-op { opacity: 0.55; }
</style>
