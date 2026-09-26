<template>
  <!-- 通栏列表行：底色/内边距/分隔线由页面容器负责（白底 + 灰色分割线方案） -->
  <view hover-class="zz-ar--press" :hover-stay-time="60" @tap="$emit('tap')">
    <view class="zz-row">
      <view class="zz-row-main">
        <view class="zz-row-title-line">
          <text v-if="isTop" class="zz-row-pin">顶</text>
          <text class="zz-row-title">{{ post.title }}</text>
        </view>
        <text v-if="post.excerpt" class="zz-row-excerpt">{{ post.excerpt }}</text>
        <view class="zz-row-meta">
          <text v-if="post.category && post.category.name" class="zz-row-cat">{{ post.category.name }}</text>
          <text v-if="post.category && post.category.name" class="zz-row-dot">·</text>
          <text>{{ fmtShort(post.publishedAt) }}</text>
          <text class="zz-row-dot">·</text>
          <text class="zz-row-views">
            <t-icon name="browse" size="24rpx" color="rgba(0,0,0,0.4)" />
            <text class="zz-row-views-num">{{ fmtNum(post.viewCount) }}</text>
          </text>
        </view>
      </view>
      <view class="zz-row-cover" :style="cover.bg">
        <image v-if="coverImg" class="zz-row-cover-img" :src="coverImg" mode="aspectFill" />
        <t-icon v-else :name="cover.icon" size="44rpx" :color="cover.fg" />
      </view>
    </view>
  </view>
</template>

<script>
// 单栏文章条目：左文右图（160rpx 方图）。无封面时用主题分配的纯色占位 + 线性图标。
import { fmtShort, fmtNum } from '@/common/format.js'
import { coverStyle, usableCover } from '@/common/theme.js'

export default {
  name: 'ZzArticleRow',
  props: {
    post: { type: Object, required: true },
  },
  emits: ['tap'],
  computed: {
    isTop() { return !!(this.post.isPinned || this.post.categoryPinned) },
    coverImg() { return usableCover(this.post.coverUrl) },
    cover() {
      const c = coverStyle(this.post)
      return { bg: `background:${c.bg};`, icon: c.icon, fg: c.fg }
    },
  },
  methods: { fmtShort, fmtNum },
}
</script>

<style scoped>
.zz-row { display: flex; gap: 22rpx; }
.zz-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10rpx; }
.zz-row-title-line { display: flex; align-items: flex-start; gap: 10rpx; }
.zz-row-pin {
  flex-shrink: 0;
  font-size: 20rpx; color: var(--zz-brand);
  border: 1rpx solid var(--zz-brand);
  border-radius: 6rpx;
  padding: 0 8rpx; line-height: 32rpx; margin-top: 4rpx;
}
.zz-row-title {
  font-size: 30rpx; font-weight: 600; color: var(--zz-ink);
  line-height: 1.45;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
}
.zz-row-excerpt {
  font-size: 24rpx; color: var(--zz-ink-2); line-height: 1.55;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
}
.zz-row-meta {
  display: flex; align-items: center; gap: 8rpx;
  font-size: 22rpx; color: var(--zz-ink-3);
  margin-top: auto;
}
.zz-row-cat { color: var(--zz-brand); }
.zz-row-dot { color: var(--zz-line); }
.zz-row-views { display: flex; align-items: center; gap: 6rpx; }
.zz-row-views-num { font-size: 22rpx; color: var(--zz-ink-3); }
.zz-row-cover {
  width: 176rpx; height: 176rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.zz-row-cover-img { width: 100%; height: 100%; }
/* 小程序组件样式隔离：按压态类需组件内自带 */
.zz-ar--press { background-color: rgba(0, 0, 0, 0.05); }
</style>
