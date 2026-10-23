<template>
  <!-- 通用白卡：V2 圆角 24rpx + 极轻阴影。 -->
  <view class="zz-card" :hover-class="press ? 'zz-card--press' : 'none'" :hover-stay-time="60" :style="boxStyle" @tap="$emit('select')">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'ZzCard',
  props: {
    pad: { type: String, default: '28rpx' },
    r: { type: [Number, String], default: 18 },
    press: { type: Boolean, default: false },
  },
  emits: ['select'],
  computed: {
    boxStyle() {
      return `padding:${this.pad};border-radius:${this.r}rpx;`
    },
  },
}
</script>

<style scoped>
.zz-card {
  background: var(--zz-card);
  box-shadow: var(--zz-shadow);
}

.zz-card--press {
  background-color: #fafdff;
}
</style>
