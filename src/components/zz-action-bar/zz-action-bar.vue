<template>
  <view>
    <view class="zz-actionbar-holder" />
    <view class="zz-actionbar">
      <view
        v-if="showLike"
        class="zz-action"
        :class="{ on: liked }"
        hover-class="zz-press-op"
        :hover-stay-time="60"
        @tap="$emit('like')"
      >
        <t-icon :name="liked ? 'thumb-up-filled' : 'thumb-up'" size="44rpx" :color="liked ? '#f37b1d' : '#5b6470'" />
        <text class="zz-action-txt">{{ likeText }}</text>
      </view>

      <view
        v-if="showFav"
        class="zz-action"
        :class="{ on: favorited }"
        hover-class="zz-press-op"
        :hover-stay-time="60"
        @tap="$emit('fav')"
      >
        <t-icon :name="favorited ? 'star-filled' : 'star'" size="44rpx" :color="favorited ? '#e8b96a' : '#5b6470'" />
        <text class="zz-action-txt">{{ favorited ? '已收藏' : '收藏' }}</text>
      </view>

      <view
        v-if="showComment"
        class="zz-action"
        hover-class="zz-press-op"
        :hover-stay-time="60"
        @tap="$emit('comment')"
      >
        <t-icon name="chat" size="44rpx" color="#5b6470" />
        <text class="zz-action-txt">{{ commentText }}</text>
      </view>

      <button
        v-if="showShare"
        class="zz-action zz-action-share"
        open-type="share"
        hover-class="zz-press-op"
        :hover-stay-time="60"
      >
        <t-icon name="share-1" size="44rpx" color="#5b6470" />
        <text class="zz-action-txt">分享</text>
      </button>
    </view>
  </view>
</template>

<script>
// 详情固定操作栏：默认灰色，只有点赞/收藏选中时出现橙/金。
import { fmtNum } from '@/common/format.js'

export default {
  name: 'ZzActionBar',
  props: {
    liked: { type: Boolean, default: false },
    favorited: { type: Boolean, default: false },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    showLike: { type: Boolean, default: true },
    showFav: { type: Boolean, default: true },
    showComment: { type: Boolean, default: true },
    showShare: { type: Boolean, default: true },
  },
  emits: ['like', 'fav', 'comment'],
  computed: {
    likeText() { return this.likeCount ? fmtNum(this.likeCount) : '点赞' },
    commentText() { return this.commentCount ? fmtNum(this.commentCount) : '评论' },
  },
}
</script>

<style scoped>
.zz-actionbar-holder {
  height: calc(124rpx + env(safe-area-inset-bottom));
}

.zz-actionbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  height: calc(124rpx + env(safe-area-inset-bottom));
  padding: 4rpx 24rpx calc(6rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--zz-card);
  border-top: 1rpx solid var(--zz-line);
  box-shadow: 0 -8rpx 24rpx rgba(31, 58, 87, .04);
}

.zz-action {
  min-width: 110rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 8rpx;
}

.zz-action-txt {
  font-size: 19rpx;
  line-height: 1.2;
  color: var(--zz-ink-2);
}

.zz-action.on .zz-action-txt {
  color: var(--zz-orange);
}

.zz-action.on.zz-action--fav .zz-action-txt {
  color: #c79a3a;
}

.zz-action-share {
  margin: 0;
  background: transparent;
  line-height: 1;
}

.zz-action-share::after {
  border: none;
}

.zz-press-op {
  opacity: .55;
}
</style>
