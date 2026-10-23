<template>
  <view class="zz-tabbar-wrap">
    <view class="zz-tabbar">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="zz-tab"
        :class="{ on: active === t.key }"
        hover-class="zz-tab--press"
        :hover-stay-time="60"
        @tap="go(t)"
      >
        <image class="zz-tab-icon" :src="active === t.key ? t.on : t.off" mode="aspectFit" />
        <text class="zz-tab-label">{{ t.label }}</text>
      </view>
    </view>
    <view class="zz-tabbar-holder" />
  </view>
</template>

<script>
// 自定义底栏：文章 / 微语 / 分类 / 我的 4 个 Tab，PNG 图标，reLaunch 切换。
// 不用原生 tabBar，因为要完全控制选中图标、字号和安全区。
export default {
  name: 'ZzTabbar',
  props: {
    active: { type: String, default: 'posts' }, // posts | micro | category | mine
  },
  data() {
    return {
      tabs: [
        {
          key: 'posts',
          label: '文章',
          path: '/pages/index/index',
          off: '/static/illus/tab-posts.png',
          on: '/static/illus/tab-posts-on.png',
        },
        {
          key: 'micro',
          label: '微语',
          path: '/pages/micro/index',
          off: '/static/illus/tab-micro.png',
          on: '/static/illus/tab-micro-on.png',
        },
        {
          key: 'category',
          label: '分类',
          path: '/pages/category/index',
          off: '/static/illus/tab-category.png',
          on: '/static/illus/tab-category-on.png',
        },
        {
          key: 'mine',
          label: '我的',
          path: '/pages/mine/index',
          off: '/static/illus/tab-mine.png',
          on: '/static/illus/tab-mine-on.png',
        },
      ],
    }
  },
  methods: {
    go(t) {
      if (!t || t.key === this.active) return
      uni.reLaunch({ url: t.path })
    },
  },
}
</script>

<style scoped>
.zz-tabbar-wrap {
  position: relative;
  z-index: 50;
}

.zz-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  height: calc(116rpx + env(safe-area-inset-bottom));
  padding: 6rpx 16rpx calc(6rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--zz-card);
  border-top: 1rpx solid var(--zz-line);
}

.zz-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  padding: 3rpx 0;
  border-radius: 16rpx;
  transition: background .15s ease;
}

.zz-tab--press {
  background: rgba(0, 0, 0, .04);
}

.zz-tab-icon {
  width: 50rpx;
  height: 50rpx;
  flex: none;
}

.zz-tab-label {
  font-size: 20rpx;
  line-height: 1.2;
  color: var(--zz-ink-3);
}

.zz-tab.on .zz-tab-label {
  color: var(--zz-brand-deep);
  font-weight: 600;
}

.zz-tabbar-holder {
  height: calc(116rpx + env(safe-area-inset-bottom));
}
</style>
