// 状态栏 / 胶囊 / 导航尺寸。
// 只在小程序里有胶囊；H5 走 44px 兜底，避免 getMenuButtonBoundingClientRect 不存在时整页错位。
const info = typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
const menu = typeof uni.getMenuButtonBoundingClientRect === 'function'
  ? uni.getMenuButtonBoundingClientRect()
  : null

let statusBar = 0
// #ifdef MP-WEIXIN
statusBar = Number(info.statusBarHeight) || 20
// #endif
export const STATUS_BAR_HEIGHT = statusBar
export const NAV_BAR_HEIGHT = menu && menu.height
  ? (menu.top - STATUS_BAR_HEIGHT) * 2 + menu.height
  : 44
export const NAV_TOTAL_HEIGHT = STATUS_BAR_HEIGHT + NAV_BAR_HEIGHT
// 胶囊占位：右侧动作必须停在胶囊左边，不能压住微信的 ••• / 圆点
let capsuleSpace = 16
// #ifdef MP-WEIXIN
capsuleSpace = menu && menu.left
  ? Math.max(76, Number(info.windowWidth) - menu.left + 8)
  : 96
// #endif
export const CAPSULE_SPACE = capsuleSpace
export const SAFE_BOTTOM = Number(info.safeArea && info.safeArea.bottom)
  ? Math.max(0, Number(info.screenHeight) - Number(info.safeArea.bottom))
  : 0
