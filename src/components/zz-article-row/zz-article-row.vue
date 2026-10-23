<template>
  <!-- Halo 式文章卡：标题/摘要在上，封面在右上（有封面才显示），
       底部是分类标签 + 浏览/点赞。事件名用 select，避免和原生 tap 双触发。 -->
  <view class="zz-post" hover-class="zz-post--press" :hover-stay-time="60" @tap="$emit('select')">
    <view class="zz-post-head">
      <view class="zz-post-body">
        <text class="zz-post-title">{{ post.title }}</text>
        <text v-if="post.excerpt" class="zz-post-excerpt">{{ post.excerpt }}</text>
      </view>
      <view v-if="coverImg" class="zz-post-cover">
        <image class="zz-post-cover-img" :src="coverImg" mode="aspectFill" />
      </view>
    </view>

    <view class="zz-post-foot">
      <text v-if="isTop" class="zz-post-pin">置顶</text>
      <text v-if="tagText" class="zz-post-tag">{{ tagText }}</text>
      <view class="zz-post-stats">
        <view class="zz-stat">
          <t-icon name="rocket" size="30rpx" color="#8794a0" />
          <text>{{ fmtNum(post.viewCount) }}</text>
        </view>
        <view class="zz-stat">
          <t-icon name="heart" size="30rpx" color="#8794a0" />
          <text>{{ fmtNum(post.likeCount) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { fmtNum } from '@/common/format.js'
import { postCover } from '@/common/theme.js'

export default {
  name: 'ZzArticleRow',
  props: {
    post: { type: Object, required: true },
  },
  emits: ['select'],
  computed: {
    isTop() { return !!(this.post.isPinned || this.post.categoryPinned) },
    coverImg() { return postCover(this.post) },
    categoryName() {
      const c = this.post.category
      if (c && c.name) return c.name
      if (this.post.categoryName) return this.post.categoryName
      const tags = this.post.tags || []
      return (tags[0] && tags[0].name) || ''
    },
    tagText() { return this.categoryName ? '#' + this.categoryName : '' },
  },
  methods: { fmtNum },
}
</script>

<style scoped>
.zz-post {
  padding: 28rpx;
  background: var(--zz-card);
  border-radius: 20rpx;
  box-shadow: var(--zz-shadow);
}

.zz-post--press {
  background: #fafdff;
}

.zz-post-head {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.zz-post-body {
  flex: 1;
  min-width: 0;
}

.zz-post-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 34rpx;
  line-height: 1.45;
  font-weight: 500;
  color: var(--zz-ink);
}

.zz-post-excerpt {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: var(--zz-ink-2);
}

.zz-post-cover {
  width: 260rpx;
  height: 180rpx;
  flex: none;
  border-radius: 16rpx;
  overflow: hidden;
  background: var(--zz-paper);
}

.zz-post-cover-img {
  width: 100%;
  height: 100%;
  display: block;
}

.zz-post-foot {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
}

.zz-post-pin {
  flex: none;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: var(--zz-green-soft);
  color: var(--zz-green);
  font-size: 19rpx;
  font-weight: 500;
  line-height: 1.3;
}

.zz-post-tag {
  flex: none;
  max-width: 220rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #f4f6f8;
  color: var(--zz-ink-2);
  font-size: 21rpx;
  font-weight: 500;
  line-height: 1.3;
}

.zz-post-stats {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: none;
}

.zz-stat {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: var(--zz-ink-2);
  font-variant-numeric: tabular-nums;
}
</style>
