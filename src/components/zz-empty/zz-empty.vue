<template>
  <view class="zz-empty">
    <image class="zz-empty-art" :src="art" mode="aspectFit" />
    <text class="zz-empty-title">{{ realTitle }}</text>
    <text class="zz-empty-desc">{{ realDesc }}</text>
    <view
      v-if="actionText"
      class="zz-empty-action"
      hover-class="zz-press-op"
      :hover-stay-time="60"
      @tap="$emit('action')"
    >{{ actionText }}</view>
  </view>
</template>

<script>
// 品牌空态：手绘插画 + 标题 + 说明 + 可选动作。
// 只有 3 张空态图，按语义复用；文案由页面覆盖。
const DEFAULTS = {
  posts: { title: '鱼塘还很安静', desc: '等第一篇文章落下来', art: '/static/illus/empty-posts.png' },
  favorites: { title: '收藏夹空空的', desc: '遇到喜欢的文章就收进来', art: '/static/illus/empty-posts.png' },
  history: { title: '还没有足迹', desc: '去纸鱼逛逛', art: '/static/illus/empty-posts.png' },
  search: { title: '没有找到相关文章', desc: '换个关键词，或者看看热门标签', art: '/static/illus/empty-posts.png' },
  comments: { title: '还没有评论', desc: '来坐第一排', art: '/static/illus/empty-comments.png' },
  offline: { title: '网络好像走丢了', desc: '检查网络后重试', art: '/static/illus/empty-offline.png' },
  closed: { title: '功能已关闭', desc: '该功能暂未开放', art: '/static/illus/empty-posts.png' },
  notfound: { title: '文章不存在', desc: '可能已下架或被移动', art: '/static/illus/empty-posts.png' },
}

export default {
  name: 'ZzEmpty',
  props: {
    type: { type: String, default: 'posts' },
    title: { type: String, default: '' },
    desc: { type: String, default: '' },
    actionText: { type: String, default: '' },
  },
  emits: ['action'],
  computed: {
    preset() { return DEFAULTS[this.type] || DEFAULTS.posts },
    art() { return this.preset.art },
    realTitle() { return this.title || this.preset.title },
    realDesc() { return this.desc || this.preset.desc },
  },
}
</script>

<style scoped>
.zz-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  text-align: center;
  background: var(--zz-card);
  border-radius: var(--zz-radius);
  box-shadow: var(--zz-shadow);
}

.zz-empty-art {
  width: 300rpx;
  height: 300rpx;
  display: block;
}

.zz-empty-title {
  margin-top: 8rpx;
  font-size: 30rpx;
  line-height: 1.4;
  font-weight: 600;
  color: var(--zz-ink);
}

.zz-empty-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.55;
  color: var(--zz-ink-3);
}

.zz-empty-action {
  margin-top: 26rpx;
  padding: 12rpx 28rpx;
  border: 1rpx solid var(--zz-line);
  border-radius: 999rpx;
  background: var(--zz-card);
  color: var(--zz-brand-deep);
  font-size: 23rpx;
  font-weight: 600;
}

.zz-press-op {
  opacity: .55;
}
</style>
