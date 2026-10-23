<script>
// 全局启动：本地快照恢复 → 拉取 /mp/config（开关 + csrf + 站点信息）。
import { hydrate } from './common/store.js'
import { config } from './common/request.js'

export default {
  onLaunch() {
    hydrate()
    config().catch(() => { /* 离线冷启动走本地快照 */ })
  },
  onShow() {
    // 回前台静默刷新：远程审核开关要能在用户无感知时收敛 UI
    config().catch(() => {})
  },
}
</script>

<style>
/* ------------------------------------------------------------------
   V2「海盐天空」：浅灰蓝页面 + 白卡 + 天空蓝主色 + ColorUI 分类色。
   所有页面统一从 --zz-* 取色；TDesign 只保留底层组件（icon/popup）。
------------------------------------------------------------------ */
page {
  --zz-paper: #f5f7fa;
  --zz-card: #ffffff;
  --zz-ink: #222831;
  --zz-ink-2: #5b6470;
  --zz-ink-3: #9aa3ad;
  --zz-line: #edf1f4;

  --zz-brand: #60c2ff;
  --zz-brand-deep: #2fa8e8;
  --zz-brand-soft: #e7f7ff;

  --zz-orange: #f37b1d;
  --zz-orange-soft: #fde6d2;
  --zz-pink: #e03997;
  --zz-pink-soft: #f9d7ea;
  --zz-green: #39b54a;
  --zz-green-soft: #d7f0db;
  --zz-cyan: #1cbbb4;
  --zz-cyan-soft: #d2f1f0;
  --zz-purple: #6739b6;
  --zz-purple-soft: #e1d7f0;
  --zz-gold: #f6c445;
  --zz-black: #22262e;

  --zz-radius: 18rpx;
  --zz-radius-lg: 28rpx;
  --zz-shadow: 0 8rpx 28rpx rgba(31, 58, 87, .05);

  /* TDesign 只保留 t-icon / t-popup 等底层组件；品牌色跟天空蓝走 */
  --td-brand-color: #2fa8e8;
  --td-brand-color-1: #e7f7ff;
  --td-brand-color-2: #c9ecff;
  --td-brand-color-3: #a6dfff;
  --td-brand-color-4: #7fd0fb;
  --td-brand-color-5: #5fc2f6;
  --td-brand-color-6: #3fb4ee;
  --td-brand-color-7: #2fa8e8;
  --td-brand-color-8: #1f8cc6;
  --td-brand-color-9: #136f9f;
  --td-bg-color-page: #f5f7fa;
  --td-bg-color-container: #ffffff;
  --td-text-color-primary: #222831;
  --td-text-color-secondary: #5b6470;
  --td-text-color-placeholder: #9aa3ad;
  --td-border-level-1-color: #edf1f4;
  --td-radius-default: 6px;
  --td-radius-large: 12px;

  background: var(--zz-paper);
  color: var(--zz-ink);
  font-size: 28rpx;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}

view, text, button, input, textarea, image {
  box-sizing: border-box;
}

button::after {
  border: none;
}

/* 统一按压反馈 */
.zz-press { background-color: rgba(0, 0, 0, .05) !important; }
.zz-press-op { opacity: .55; }

/* 页面壳 */
.zz-page {
  min-height: 100vh;
  background: var(--zz-paper);
}

.zz-gutter {
  padding-left: 32rpx;
  padding-right: 32rpx;
}

.zz-safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 32rpx);
}

/* 页面底部提示 */
.zz-end {
  padding: 32rpx 0 16rpx;
  text-align: center;
  font-size: 20rpx;
  color: #b4bdc6;
  letter-spacing: .08em;
}

/* 兼容旧页面的灰条；V2 页面不再使用 */
.zz-gap {
  height: 24rpx;
  background: transparent;
}
</style>
