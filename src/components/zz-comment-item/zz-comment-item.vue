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
// 评论条目：单字头像 + 昵称/时间 + 正文 + 回复；父评论引用以浅底块呈现。
// /mp/comments 返回不含父级内容时 parentContent 为空，块自动隐藏。
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
.zz-cmt { display: flex; gap: 18rpx; padding: 26rpx 0; }
.zz-cmt-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
.zz-cmt-line1 { display: flex; align-items: center; gap: 12rpx; }
.zz-cmt-author { font-size: 24rpx; font-weight: 600; color: var(--zz-ink-2); }
.zz-cmt-pin {
  font-size: 20rpx; color: var(--zz-brand);
  border: 1rpx solid var(--zz-brand); border-radius: 8rpx;
  padding: 0 8rpx; line-height: 28rpx;
}
.zz-cmt-badge {
  font-size: 20rpx; color: var(--zz-brand);
  background: var(--zz-brand-soft); border-radius: 8rpx;
  padding: 0 8rpx; line-height: 28rpx;
}
.zz-cmt-time { font-size: 22rpx; color: var(--zz-ink-3); margin-left: auto; }
.zz-cmt-content { font-size: 28rpx; color: var(--zz-ink); line-height: 1.6; word-break: break-all; }
.zz-cmt-actions { display: flex; }
.zz-cmt-reply { font-size: 22rpx; color: var(--zz-ink-3); }
.zz-cmt-parent {
  background: var(--zz-block);
  border-radius: 12rpx;
  padding: 14rpx 18rpx;
}
.zz-cmt-parent-txt {
  font-size: 24rpx; color: var(--zz-ink-2); line-height: 1.5;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
}
</style>
