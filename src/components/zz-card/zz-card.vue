<template>
  <!-- 事件名用 select 而不是 tap：tap 与原生事件同名，页面 @tap 会编译成 bindtap，
       原生冒泡与组件 $emit 各触发一次，点击会执行两次。 -->
  <view class="zz-card" :hover-class="press ? 'zz-card--press' : 'none'" :hover-stay-time="60" :style="radiusStyle" @tap="$emit('select')">
    <slot />
  </view>
</template>

<script>
// 通用白卡：灰底页面上无边框白卡，与 TDesign card/cell-group 观感一致。
// press 为 true 时整卡有按压变灰反馈（可点卡片才开）。
export default {
  name: 'ZzCard',
  props: {
    pad: { type: String, default: '28rpx' },   // 内边距
    r: { type: [Number, String], default: 18 }, // 圆角 rpx（对齐 TDesign 卡片 9px）
    press: { type: Boolean, default: false },   // 按压反馈
  },
  emits: ['select'],
  computed: {
    radiusStyle() {
      return `padding:${this.pad};border-radius:${this.r}rpx;`
    },
  },
}
</script>

<style scoped>
.zz-card {
  background: var(--zz-card);
}
/* 小程序自定义组件样式隔离，按压类需组件内自带 */
.zz-card--press {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
