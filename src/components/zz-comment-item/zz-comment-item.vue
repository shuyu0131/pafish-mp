<template>
  <view class="zz-cmt">
    <zz-avatar :url="comment.avatarUrl" :name="comment.authorName" :size="64" />
    <view class="zz-cmt-main">
      <view class="zz-cmt-line1">
        <text class="zz-cmt-author">{{ comment.authorName }}</text>
        <text v-if="isAuthor" class="zz-cmt-badge">作者</text>
        <text v-if="comment.isPinned" class="zz-cmt-pin">置顶</text>
        <text class="zz-cmt-time">{{ fmtRel(comment.createdAt) }}</text>
      </view>
      <text class="zz-cmt-content">{{ comment.content }}</text>
      <view class="zz-cmt-actions">
        <text v-if="replyOn" class="zz-cmt-reply" @tap="$emit('reply', comment)">回复</text>
      </view>
      <view v-if="comment.parentContent" class="zz-cmt-parent">
        <text class="zz-cmt-parent-txt">@{{ comment.parentAuthor || '前一层' }}：{{ comment.parentContent }}</text>
      </view>
      <slot name="post-link" />
    </view>
  </view>
</template>

<script>
// 评论条目：头像 + 昵称/作者徽章/时间 + 正文 + 父评论引用。
import { fmtRel } from '@/common/format.js'

export default {
  name: 'ZzCommentItem',
  props: {
    comment: { type: Object, required: true },
    replyOn: { type: Boolean, default: true },
    isAuthor: { type: Boolean, default: false },
  },
  emits: ['reply'],
  methods: { fmtRel },
}
</script>

<style scoped>
.zz-cmt {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0;
}

.zz-cmt-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.zz-cmt-line1 {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.zz-cmt-author {
  font-size: 23rpx;
  font-weight: 500;
  color: var(--zz-ink-2);
}

.zz-cmt-pin {
  display: inline-flex;
  align-items: center;
  gap: 5rpx;
  color: #b07a1f;
  font-size: 17rpx;
  font-weight: 600;
  line-height: 1.2;
}

.zz-cmt-pin::before {
  content: "";
  width: 5rpx;
  height: 5rpx;
  border-radius: 50%;
  background: #e8b96a;
}

.zz-cmt-badge {
  padding: 0 8rpx;
  border-radius: 8rpx;
  background: var(--zz-brand-soft);
  color: var(--zz-brand-deep);
  font-size: 17rpx;
  line-height: 30rpx;
}

.zz-cmt-time {
  margin-left: auto;
  font-size: 19rpx;
  color: var(--zz-ink-3);
}

.zz-cmt-content {
  font-size: 26rpx;
  line-height: 1.65;
  color: var(--zz-ink);
  word-break: break-all;
}

.zz-cmt-actions {
  display: flex;
}

.zz-cmt-reply {
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.zz-cmt-parent {
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  background: var(--zz-paper);
}

.zz-cmt-parent-txt {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 22rpx;
  line-height: 1.55;
  color: var(--zz-ink-2);
}
</style>
