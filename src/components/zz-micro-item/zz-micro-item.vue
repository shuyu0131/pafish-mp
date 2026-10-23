<template>
  <!-- 微语卡：白卡 + 头像/作者/时间 + 正文 + 1/2 列配图 + 点赞/分享。 -->
  <view class="zz-micro">
    <view class="zz-micro-head">
      <zz-avatar :url="avatarUrl" :name="authorName" :size="64" />
      <view class="zz-micro-head-txt">
        <text class="zz-micro-author">{{ authorName }}</text>
        <text class="zz-micro-time">{{ fmtTime(item.publishedAt) }}<text v-if="edited"> · 修改于 {{ fmtClock(item.updatedAt) }}</text></text>
      </view>
      <text v-if="item.isPinned" class="zz-micro-pin">置顶</text>
    </view>

    <view class="zz-micro-say">
      <rich-text v-if="item.contentHtml" :nodes="sayNodes" />
      <text v-else>{{ item.content }}</text>
    </view>

    <view v-if="media.length" class="zz-micro-media" :class="{ one: media.length === 1 }">
      <image
        v-for="(u, i) in media"
        :key="i"
        class="zz-micro-pic"
        :src="u"
        :mode="media.length === 1 ? 'widthFix' : 'aspectFill'"
        @tap.stop="preview(i)"
      />
    </view>

    <view class="zz-micro-foot">
      <view v-if="showLike" class="zz-micro-act" :class="{ on: item.liked }" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="onLike">
        <t-icon :name="item.liked ? 'thumb-up-filled' : 'thumb-up'" size="30rpx"
          :color="item.liked ? '#f37b1d' : '#9aa3ad'" />
        <text class="zz-micro-act-txt">{{ fmtNum(item.likeCount || 0) }}</text>
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <button v-if="!audit" class="zz-micro-act zz-micro-share" open-type="share" :data-id="item.id" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop>
        <t-icon name="share-1" size="30rpx" color="#9aa3ad" />
        <text class="zz-micro-act-txt">分享</text>
      </button>
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
// 微语卡：列表接口已下发完整正文与配图，没有详情页，整卡不可点。
import { fmtClock, fmtNum, fmtTime } from '@/common/format.js'
import { styleHtml } from '@/common/mdcss.js'
import { state, feat, auditMode } from '@/common/store.js'
import { toggleMicroLike, ensureLogin, toast } from '@/common/request.js'

export default {
  name: 'ZzMicroItem',
  props: {
    item: { type: Object, required: true },
  },
  computed: {
    authorName() { return (this.item.author && (this.item.author.name || this.item.author.nickname)) || '站长' },
    avatarUrl() { return (this.item.author && this.item.author.avatarUrl) || '' },
    sayNodes() { return styleHtml(this.item.contentHtml) },
    media() {
      return (this.item.media || [])
        .map((m) => (typeof m === 'string' ? m : (m && m.url) || ''))
        .filter(Boolean)
    },
    edited() {
      const a = Date.parse(this.item.publishedAt || 0)
      const b = Date.parse(this.item.updatedAt || 0)
      return !!b && b - a > 60000
    },
    showLike() { return feat('like') && !auditMode() },
    audit() { return state.features.auditMode },
  },
  methods: {
    fmtClock, fmtNum, fmtTime,
    preview(i) {
      uni.previewImage({ urls: this.media, current: i })
    },
    async onLike() {
      if (this._busy || !ensureLogin()) return
      this._busy = true
      try {
        const r = await toggleMicroLike(this.item.id)
        this.item.liked = r.active
        this.item.likeCount = r.count
      } catch (e) {
        toast((e && e.message) || '操作失败')
      } finally {
        this._busy = false
      }
    },
  },
}
</script>

<style scoped>
.zz-micro {
  display: flex;
  flex-direction: column;
  padding: 22rpx;
  background: var(--zz-card);
  border-radius: var(--zz-radius);
  box-shadow: var(--zz-shadow);
}

.zz-micro-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.zz-micro-head-txt {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.zz-micro-author {
  font-size: 24rpx;
  font-weight: 500;
  color: var(--zz-ink);
}

.zz-micro-time {
  font-size: 19rpx;
  color: var(--zz-ink-3);
}

.zz-micro-pin {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  color: #b07a1f;
  font-size: 17rpx;
  font-weight: 600;
  line-height: 1.4;
}

.zz-micro-pin::before {
  content: "";
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: #e8b96a;
}

.zz-micro-say {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.75;
  color: var(--zz-ink);
  word-break: break-all;
}

.zz-micro-media {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.zz-micro-pic {
  border-radius: 16rpx;
  background: var(--zz-paper);
}

.zz-micro-media:not(.one) .zz-micro-pic {
  width: calc((100% - 12rpx) / 2);
  height: 240rpx;
}

.zz-micro-media.one .zz-micro-pic {
  width: 100%;
  max-height: 520rpx;
}

.zz-micro-foot {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-top: 16rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid var(--zz-line);
}

.zz-micro-act {
  display: flex;
  align-items: center;
  gap: 8rpx;
  line-height: 1;
  padding: 4rpx 0;
}

.zz-micro-act-txt {
  font-size: 21rpx;
  color: var(--zz-ink-3);
}

.zz-micro-act.on .zz-micro-act-txt {
  color: var(--zz-orange);
}

.zz-micro-share {
  margin: 0;
  background: transparent;
  border: none;
  padding: 4rpx 0;
}

.zz-micro-share::after {
  border: none;
}

.zz-press-op {
  opacity: .55;
}
</style>
