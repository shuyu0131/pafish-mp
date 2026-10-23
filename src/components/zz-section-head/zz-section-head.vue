<template>
  <view class="zz-section-head">
    <view v-if="icon" class="zz-section-icon">
      <t-icon :name="icon" size="32rpx" color="#2fa8e8" />
    </view>
    <text class="zz-section-title">{{ title }}</text>
    <text v-if="sub" class="zz-section-sub">{{ sub }}</text>
    <view v-if="$slots.extra || more" class="zz-section-extra" hover-class="zz-press-op" :hover-stay-time="60" @tap="$emit('more')">
      <slot name="extra">
        <text class="zz-section-more">{{ more }}</text>
      </slot>
      <t-icon v-if="more" name="chevron-right" size="22rpx" color="#9aa3ad" />
    </view>
  </view>
</template>

<script>
// 分区标题：小图标 + 16px 半粗标题 + 右侧更多。
export default {
  name: 'ZzSectionHead',
  props: {
    title: { type: String, required: true },
    sub: { type: String, default: '' },
    more: { type: String, default: '' },
    icon: { type: String, default: '' },
  },
  emits: ['more'],
}
</script>

<style scoped>
.zz-section-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 0 14rpx;
}

.zz-section-icon {
  flex: none;
  display: flex;
  align-items: center;
}

.zz-section-title {
  font-size: 32rpx;
  line-height: 1.3;
  font-weight: 600;
  color: var(--zz-ink);
}

.zz-section-sub {
  margin-left: 4rpx;
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.zz-section-extra {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-left: auto;
  padding: 6rpx 0;
}

.zz-section-more {
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.zz-press-op {
  opacity: .55;
}
</style>
