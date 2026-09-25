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
   原生 TDesign 默认主题：页面底 #f3f3f3、白卡、默认品牌蓝 #0052d9。
   不做自定义色板，--zz-* 仅作为业务侧别名映射到 TDesign 原生取值，
   页面与自定义组件内 var() 沿节点树继承均可取到。
------------------------------------------------------------------ */
page {
  --zz-paper: #f3f3f3;        /* 页面底 = TDesign gray-1 */
  --zz-card: #ffffff;         /* 卡片 */
  --zz-ink: rgba(0, 0, 0, 0.9);   /* 主文本 */
  --zz-ink-2: rgba(0, 0, 0, 0.6); /* 次文本 */
  --zz-ink-3: rgba(0, 0, 0, 0.4); /* 弱文本 / meta */
  --zz-line: #e7e7e7;         /* 分隔线 = gray-3 */
  --zz-block: #eeeeee;        /* 浅块（输入底、占位底）= gray-2 */
  --zz-brand: #0052d9;        /* TDesign 默认品牌蓝 */
  --zz-brand-deep: #003cab;   /* 按下态 */
  --zz-brand-soft: #f2f3ff;   /* 选中浅底 */

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

/* 统一按压反馈（页面级元素用；自定义组件内需各自声明同款类）：
   色块/行按压叠 5% 黑，无底色按钮与文字按压压到 55% 不透明度 */
.zz-press { background-color: rgba(0, 0, 0, 0.05) !important; }
.zz-press-op { opacity: 0.55; }

/* 空状态插图统一尺寸（t-empty 为 shared 隔离，全局样式可穿透；
   t-image 无默认宽高，不约束会落到原生 image 的 320×240 兜底） */
.t-empty__thumb .t-image {
  width: 320rpx;
  height: 320rpx;
}

/* 搜索框样式：t-search 是 isolated 隔离，app.wxss 普通规则进不了组件内部，
   必须经 t-class-input-container 外部样式类下发（搜索页的 t-search 挂了它；
   首页/微语的只读搜索入口已改为原生 view 绘制，不走组件）。
   组件默认边框色=背景色（视觉隐形），这里白底 + gray-3 描边；
   border 加 !important 压掉组件聚焦态把 border-color 改回背景色的规则 */
.search-box {
  background: #ffffff;
  border: 2rpx solid #e7e7e7 !important;
}
</style>
