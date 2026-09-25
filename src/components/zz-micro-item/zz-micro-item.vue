<template>
  <zz-card pad="28rpx" @tap="openCard">
    <view class="zz-micro">
      <view class="zz-micro-head">
        <zz-avatar :url="avatarUrl" :name="authorName" :size="64" />
        <view class="zz-micro-head-txt">
          <text class="zz-micro-author">{{ authorName }}</text>
          <text class="zz-micro-time">{{ fmtClock(item.publishedAt) }}<text v-if="edited"> · 修改于 {{ fmtClock(item.updatedAt) }}</text></text>
        </view>
        <text v-if="item.isPinned" class="zz-micro-pin">置顶</text>
      </view>

      <view class="zz-micro-say">
        <rich-text v-if="item.contentHtml" :nodes="sayNodes" />
        <text v-else>{{ item.content }}</text>
      </view>

      <view v-if="media.length" class="zz-micro-media" :class="{ one: media.length === 1 }">
        <image
          v-for="(u, i) in media" :key="i"
          class="zz-micro-pic"
          :src="u"
          :mode="media.length === 1 ? 'widthFix' : 'aspectFill'"
          @tap.stop="preview(i)"
        />
      </view>

      <view class="zz-micro-foot">
        <view v-if="showLike" class="zz-micro-act" :class="{ on: item.liked }" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="onLike">
          <t-icon :name="item.liked ? 'thumb-up-filled' : 'thumb-up'" size="30rpx"
            :color="item.liked ? '#0052d9' : 'rgba(0,0,0,0.4)'" />
          <text class="zz-micro-act-txt">{{ fmtNum(item.likeCount || 0) }}</text>
        </view>
        <view v-if="!flat" class="zz-micro-act" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="open">
          <t-icon name="browse" size="30rpx" color="rgba(0,0,0,0.4)" />
          <text class="zz-micro-act-txt">全文</text>
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <button v-if="!audit" class="zz-micro-act zz-micro-share" open-type="share" :data-id="item.id" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop>
          <t-icon name="share-1" size="30rpx" color="rgba(0,0,0,0.4)" />
          <text class="zz-micro-act-txt">分享</text>
        </button>
        <!-- #endif -->
      </view>
    </view>
  </zz-card>
</template>

<script>
// 微语卡片：头像+昵称+时间 / Markdown 渲染后的正文 / 配图 / 点赞 / 跳详情。
// 点赞在卡内完成，受 like 开关与审核模式门控；flat 为详情页内嵌模式（无跳详情入口）。
import { fmtClock, fmtNum } from '@/common/format.js'
import { styleHtml } from '@/common/mdcss.js'
import { K } from '@/common/config.js'
import { state, feat, auditMode } from '@/common/store.js'
import { toggleMicroLike, ensureLogin, toast } from '@/common/request.js'

export default {
  name: 'ZzMicroItem',
  props: {
    item: { type: Object, required: true },
    flat: { type: Boolean, default: false },
  },
  computed: {
    authorName() { return (this.item.author && (this.item.author.name || this.item.author.nickname)) || '站长' },
    avatarUrl() { return (this.item.author && this.item.author.avatarUrl) || '' },
    sayNodes() { return styleHtml(this.item.contentHtml) },
    // 服务端 media[] 为对象（含 url），兼容旧契约的纯字符串
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
    fmtClock, fmtNum,
    openCard() { if (!this.flat) this.open() },
    open() {
      // 详情端点由插件后续提供，当前整条经 storage 传递
      try { uni.setStorageSync(K.MICRO, JSON.parse(JSON.stringify(this.item))) } catch (e) { /* 满则跳过 */ }
      uni.navigateTo({ url: '/pages/micro/detail?id=' + encodeURIComponent(this.item.id) })
    },
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
.zz-micro { display: flex; flex-direction: column; }
.zz-micro-head { display: flex; align-items: center; gap: 16rpx; }
.zz-micro-head-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4rpx; }
.zz-micro-author { font-size: 26rpx; font-weight: 600; color: var(--zz-ink); }
.zz-micro-time { font-size: 22rpx; color: var(--zz-ink-3); }
.zz-micro-pin {
  font-size: 20rpx; color: var(--zz-brand);
  background: var(--zz-brand-soft);
  border-radius: 8rpx; padding: 4rpx 12rpx; flex: none;
}
.zz-micro-say {
  font-size: 28rpx; line-height: 1.8; color: var(--zz-ink);
  margin-top: 20rpx; word-break: break-all;
}
.zz-micro-media { margin-top: 20rpx; display: flex; flex-wrap: wrap; gap: 10rpx; }
.zz-micro-pic { border-radius: 12rpx; background: var(--zz-block); }
.zz-micro-media:not(.one) .zz-micro-pic { width: calc((100% - 20rpx) / 3); height: 218rpx; }
.zz-micro-media.one .zz-micro-pic { width: 100%; max-height: 560rpx; }
.zz-micro-foot {
  display: flex; align-items: center; gap: 44rpx;
  margin-top: 22rpx; padding-top: 18rpx;
  border-top: 1rpx solid var(--zz-line);
}
.zz-micro-act {
  display: flex; align-items: center; gap: 10rpx;
  line-height: 1; padding: 6rpx 0;
}
.zz-micro-act-txt { font-size: 24rpx; color: var(--zz-ink-3); }
.zz-micro-act.on .zz-micro-act-txt { color: var(--zz-brand); }
.zz-micro-share {
  background: transparent; border: none; padding: 6rpx 0; margin: 0; line-height: 1;
}
.zz-micro-share::after { border: none; }
/* 小程序组件样式隔离：按压态类需组件内自带 */
.zz-press-op { opacity: 0.55; }
</style>
