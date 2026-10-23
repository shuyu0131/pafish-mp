<template>
  <view class="zz-skeleton">
    <block v-if="type === 'detail'">
      <view class="zz-sk-block zz-sk-cover" />
      <view class="zz-sk-block zz-sk-title" />
      <view class="zz-sk-block zz-sk-line w90" />
      <view class="zz-sk-block zz-sk-line w85" />
      <view class="zz-sk-block zz-sk-line w70" />
      <view class="zz-sk-block zz-sk-line w88" />
    </block>

    <block v-else-if="type === 'comment'">
      <view v-for="i in rows" :key="i" class="zz-sk-comment">
        <view class="zz-sk-block zz-sk-avatar" />
        <view class="zz-sk-comment-main">
          <view class="zz-sk-block zz-sk-line w40" />
          <view class="zz-sk-block zz-sk-line w90" />
          <view class="zz-sk-block zz-sk-line w65" />
        </view>
      </view>
    </block>

    <block v-else>
      <view v-for="i in rows" :key="i" class="zz-sk-post">
        <view class="zz-sk-post-head">
          <view class="zz-sk-post-main">
            <view class="zz-sk-block zz-sk-title" />
            <view class="zz-sk-block zz-sk-line w90" />
            <view class="zz-sk-block zz-sk-line w70" />
          </view>
          <view class="zz-sk-block zz-sk-thumb" />
        </view>
        <view class="zz-sk-foot">
          <view class="zz-sk-block zz-sk-pill" />
          <view class="zz-sk-block zz-sk-pill zz-sk-pill--right" />
        </view>
      </view>
    </block>
  </view>
</template>

<script>
// 骨架：布局和真实卡片一致，避免内容出现时跳动。
export default {
  name: 'ZzSkeleton',
  props: {
    type: { type: String, default: 'post' }, // post | detail | comment
    rows: { type: Number, default: 3 },
  },
}
</script>

<style scoped>
.zz-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.zz-sk-block {
  background: #eef2f6;
  border-radius: 12rpx;
  animation: zz-pulse 1.4s ease-in-out infinite;
}

.zz-sk-post {
  display: flex;
  flex-direction: column;
  padding: 28rpx;
  background: var(--zz-card);
  border-radius: 20rpx;
  box-shadow: var(--zz-shadow);
}

.zz-sk-post-head {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.zz-sk-thumb {
  width: 260rpx;
  height: 180rpx;
  flex: none;
  border-radius: 16rpx;
}

.zz-sk-post-main,
.zz-sk-comment-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  justify-content: flex-start;
}

.zz-sk-foot {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
}

.zz-sk-pill {
  width: 88rpx;
  height: 32rpx;
  border-radius: 8rpx;
}

.zz-sk-pill--right {
  margin-left: auto;
  width: 120rpx;
}

.zz-sk-line {
  height: 24rpx;
}

.zz-sk-title {
  height: 44rpx;
  width: 78%;
}

.zz-sk-cover {
  width: 100%;
  height: 400rpx;
  border-radius: var(--zz-radius-lg);
}

.zz-sk-comment {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0;
}

.zz-sk-avatar {
  width: 64rpx;
  height: 64rpx;
  flex: none;
  border-radius: 50%;
}

.w40 { width: 40%; }
.w45 { width: 45%; }
.w65 { width: 65%; }
.w70 { width: 70%; }
.w85 { width: 85%; }
.w88 { width: 88%; }
.w90 { width: 90%; }

@keyframes zz-pulse {
  0%, 100% { opacity: .55; }
  50% { opacity: .95; }
}
</style>
