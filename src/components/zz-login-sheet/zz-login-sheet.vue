<template>
  <t-popup
    :visible="state.loginSheet"
    placement="bottom"
    :close-on-overlay-click="true"
    :close-btn="false"
    @visible-change="onVisible"
  >
    <view class="zz-login">
      <view class="zz-login-x" hover-class="zz-press-op" :hover-stay-time="60" @tap="close">
        <t-icon name="close" size="36rpx" color="#9aa3ad" />
      </view>

      <image class="zz-login-mark" src="/static/illus/tab-mine-on.png" mode="aspectFit" />
      <text class="zz-login-h3">登录{{ state.site.name || '纸鱼博客' }}</text>
      <text class="zz-login-sub">把喜欢的内容留在鱼塘里</text>

      <view class="zz-login-benefits">
        <view class="zz-login-benefit">
          <t-icon name="check" size="26rpx" color="#2fa8e8" />
          <text>评论、点赞与收藏</text>
        </view>
        <view class="zz-login-benefit">
          <t-icon name="check" size="26rpx" color="#2fa8e8" />
          <text>同步你的纸鱼号与头像</text>
        </view>
        <view class="zz-login-benefit">
          <t-icon name="check" size="26rpx" color="#2fa8e8" />
          <text>随时可以在设置里退出</text>
        </view>
      </view>

      <view class="zz-login-btn" :class="{ dis: busy }" hover-class="zz-press-op" :hover-stay-time="60" @tap="doLogin">
        <text>{{ busy ? '登录中…' : '微信一键登录' }}</text>
      </view>
      <view class="zz-login-no" hover-class="zz-press-op" :hover-stay-time="60" @tap="close">暂不登录</view>
      <text class="zz-login-note">登录仅用于同步评论、点赞和收藏，不会读取你的其他信息。</text>
    </view>
  </t-popup>
</template>

<script>
// 全局登录面板：任何页面需要登录时 openLoginSheet() 唤起（401 也会自动触发）。
import { state, closeLoginSheet } from '@/common/store.js'
import { login, toast } from '@/common/request.js'

export default {
  name: 'ZzLoginSheet',
  emits: ['done'],
  data() { return { state, busy: false } },
  methods: {
    close() { if (!this.busy) closeLoginSheet() },
    onVisible(e) {
      const v = e && typeof e.visible === 'boolean' ? e.visible : !!e
      if (!v) this.close()
    },
    async doLogin() {
      if (this.busy) return
      this.busy = true
      try {
        await login()
        closeLoginSheet()
        toast('登录成功', 'success')
        this.$emit('done')
      } catch (e2) {
        toast((e2 && e2.message) || '登录失败，请重试')
      } finally {
        this.busy = false
      }
    },
  },
}
</script>

<style scoped>
.zz-login {
  position: relative;
  background: var(--zz-card);
  border-radius: 28rpx 28rpx 0 0;
  padding: 56rpx 48rpx calc(40rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.zz-login-x {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 16rpx;
  line-height: 0;
}

.zz-login-mark {
  width: 112rpx;
  height: 112rpx;
}

.zz-login-h3 {
  margin-top: 22rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: var(--zz-ink);
}

.zz-login-sub {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: var(--zz-ink-3);
}

.zz-login-benefits {
  width: 100%;
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.zz-login-benefit {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 20rpx;
  background: var(--zz-paper);
  border-radius: 12rpx;
  font-size: 23rpx;
  color: var(--zz-ink-2);
}

.zz-login-btn {
  margin-top: 36rpx;
  width: 100%;
  padding: 24rpx 0;
  border-radius: 12rpx;
  background: var(--zz-brand-deep);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
}

.zz-login-btn.dis { opacity: .6; }

.zz-login-no {
  margin-top: 18rpx;
  padding: 8rpx 24rpx;
  font-size: 23rpx;
  color: var(--zz-ink-3);
}

.zz-login-note {
  margin-top: 8rpx;
  font-size: 19rpx;
  line-height: 1.5;
  color: #b4bdc6;
  text-align: center;
}

.zz-press-op {
  opacity: .55;
}
</style>
