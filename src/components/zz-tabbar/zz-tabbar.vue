<template>
  <view class="zz-tabbar-wrap">
    <t-tab-bar :value="active" theme="tag" :split="false" @change="onChange">
      <t-tab-bar-item v-for="t in tabs" :key="t.key" :value="t.key" :icon="t.icon">
        {{ t.label }}
      </t-tab-bar-item>
    </t-tab-bar>
    <view class="zz-tabbar-holder" />
  </view>
</template>

<script>
// 底部导航：TDesign t-tab-bar（tag 主题）。无原生 tabBar，页面间用 reLaunch
// 切换（与旧版一致），当前页由调用方传入。
export default {
  name: 'ZzTabbar',
  props: {
    active: { type: String, default: 'home' }, // home | micro | mine
  },
  data() {
    return {
      tabs: [
        { key: 'home', label: '文章', path: '/pages/index/index', icon: 'home' },
        { key: 'micro', label: '微语', path: '/pages/micro/index', icon: 'chat' },
        { key: 'mine', label: '我的', path: '/pages/mine/index', icon: 'user' },
      ],
    }
  },
  methods: {
    onChange(e) {
      const v = e && (e.value != null ? e.value : e.detail && e.detail.value)
      const t = this.tabs.find((x) => x.key === v)
      if (!t || t.key === this.active) return
      uni.reLaunch({ url: t.path })
    },
  },
}
</script>

<style scoped>
/* t-tab-bar 默认 fixed 定位，此处仅放一个占位 view 顶开页面底部 */
.zz-tabbar-holder { height: calc(110rpx + env(safe-area-inset-bottom)); }
</style>
