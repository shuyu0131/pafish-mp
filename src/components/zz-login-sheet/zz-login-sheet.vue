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
        <t-icon name="close" size="36rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <image class="zz-login-mark" src="/static/img/logo.png" mode="aspectFill" />
      <text class="zz-login-h3">登录{{ state.site.name || '纸鱼博客' }}</text>
      <view class="zz-login-p">
        <text class="zz-login-p-line">使用微信账号快捷登录</text>
        <text class="zz-login-p-line">你的评论与点赞将同步到本站</text>
      </view>
      <view class="zz-login-btn" :class="{ dis: busy }" hover-class="zz-press-op" :hover-stay-time="60" @tap="doLogin">
        <text>{{ busy ? '登录中…' : '微信一键登录' }}</text>
      </view>
      <view class="zz-login-no" hover-class="zz-press-op" :hover-stay-time="60" @tap="close">暂不登录</view>
    </view>
  </t-popup>
</template>

<script>
// 全局登录面板：任何页面需要登录时 openLoginSheet() 唤起（401 也会自动触发）。
// 只负责「一键登录」，昵称/头像补全走「我的」页的填写能力，不在此处混杂。
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
  border-radius: 14rpx 14rpx 0 0;
  padding: 64rpx 48rpx calc(56rpx + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; align-items: center;
}
.zz-login-x { position: absolute; top: 24rpx; right: 24rpx; padding: 16rpx; line-height: 0; }
.zz-login-mark {
  width: 112rpx; height: 112rpx;
  border-radius: 14rpx;
}
.zz-login-h3 { font-size: 34rpx; font-weight: 600; color: var(--zz-ink); margin-top: 28rpx; }
.zz-login-p { display: flex; flex-direction: column; align-items: center; gap: 6rpx; margin-top: 14rpx; }
.zz-login-p-line { font-size: 24rpx; color: var(--zz-ink-3); line-height: 1.7; }
.zz-login-btn {
  margin-top: 44rpx;
  width: 100%;
  background: var(--zz-brand);
  color: #FFFFFF;
  border-radius: 12rpx;
  padding: 26rpx 0;
  font-size: 30rpx; font-weight: 600;
  text-align: center;
}
.zz-login-btn.dis { opacity: 0.6; }
.zz-login-no { margin-top: 26rpx; font-size: 26rpx; color: var(--zz-ink-3); padding: 8rpx 24rpx; }
/* 小程序组件样式隔离：按压态类需组件内自带 */
.zz-press-op { opacity: 0.55; }
</style>
