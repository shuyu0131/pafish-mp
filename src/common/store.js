// 全局状态（响应式）：登录 token、用户、功能开关、CSRF、站点信息。
// 所有页面直接 import store 使用，Vue 响应式自动驱动 UI。
import { reactive } from 'vue'
import { K, BASE_URL } from './config.js'

function ls(key, fallback) {
  try {
    const v = uni.getStorageSync(key)
    return v === '' || v === null || v === undefined ? fallback : v
  } catch (e) { return fallback }
}
function ss(key, val) { try { uni.setStorageSync(key, val) } catch (e) { /* 存储满时静默降级 */ } }
function rm(key) { try { uni.removeStorageSync(key) } catch (e) { /* noop */ } }

export const state = reactive({
  token: '',
  tokenExp: 0,
  user: null,          // {openid, nickname, avatarUrl}
  stats: null,         // /mp/me {comments, likes, favorites}
  features: {          // /mp/config.features 快照；默认全开，冷启动会用本地缓存覆盖
    auditMode: false, login: true, comment: true, like: true,
    favorite: true, micro: true, search: true,
  },
  site: { name: '纸鱼博客', subtitle: '', description: '', url: BASE_URL },
  banners: [],         // 旧轮播配置，已不在前端展示；仅兼容其 title/text 作为公告
  notice: '',          // /mp/config.notice 单条公告（字符串或 {text/content/title}）
  notices: [],         // /mp/config.notices 多条公告
  postsPerPage: 10,
  csrf: '',
  configLoaded: false,
  loginSheet: false,   // 登录弹层（zz-login-sheet 各页挂载，读这个标志）
})

/** 功能开关判定：auditMode 关闭 login/comment/like/favorite（服务端同样 403 兜底） */
export function feat(name) {
  return !!state.features[name]
}
export function auditMode() {
  return !!state.features.auditMode
}

/** 未登录 / 未填昵称时的展示名：鱼友 + openid 派生稳定编号 */
export function displayName() {
  const nick = (state.user && state.user.nickname || '').trim()
  if (nick) return nick
  const oid = (state.user && state.user.openid) || ''
  let h = 7
  for (let i = 0; i < oid.length; i++) h = (h * 31 + oid.charCodeAt(i)) >>> 0
  return '鱼友' + (h % 9000 + 1000)
}

export function isLoggedIn() {
  return !!state.token && state.tokenExp > Date.now()
}

/** 冷启动：从本地存储恢复登录态与上次 config 快照 */
export function hydrate() {
  const token = ls(K.TOKEN, '')
  const exp = Number(ls(K.TOKEN_EXP, 0)) || 0
  if (token && exp > Date.now()) {
    state.token = token
    state.tokenExp = exp
    const u = ls(K.USER, null)
    if (u && typeof u === 'object') state.user = u
  } else if (token) {
    clearAuth()
  }
  const cfg = ls(K.CONFIG, null)
  if (cfg && typeof cfg === 'object') {
    if (cfg.features) Object.assign(state.features, cfg.features)
    if (cfg.site) Object.assign(state.site, cfg.site)
    if (Array.isArray(cfg.banners)) state.banners = cfg.banners
    if (cfg.notice) state.notice = cfg.notice
    if (Array.isArray(cfg.notices)) state.notices = cfg.notices
    if (cfg.postsPerPage) state.postsPerPage = cfg.postsPerPage
  }
}

export function setAuth(token, expiresIn, user) {
  state.token = token
  state.tokenExp = Date.now() + Math.max(60, Number(expiresIn) || 604800) * 1000
  if (user) state.user = user
  ss(K.TOKEN, state.token)
  ss(K.TOKEN_EXP, state.tokenExp)
  if (user) ss(K.USER, user)
}

export function setUser(user) {
  state.user = user
  if (user) ss(K.USER, user)
}

export function setStats(stats) { state.stats = stats }

export function applyConfig(data) {
  if (!data || typeof data !== 'object') return
  if (data.features) { state.features = Object.assign({}, state.features, data.features); ss(K.CONFIG, snapshotConfig()) }
  if (data.csrf) state.csrf = String(data.csrf)
  if (data.site) Object.assign(state.site, data.site)
  const notice = data.notice !== undefined ? data.notice : data.announcement
  if (typeof notice === 'string') state.notice = notice.trim()
  else if (notice && typeof notice === 'object') state.notice = notice
  if (Array.isArray(data.notices)) state.notices = data.notices
  if (Array.isArray(data.banners)) {
    state.banners = data.banners
    ss(K.CONFIG, snapshotConfig())
  }
  if (data.postsPerPage) state.postsPerPage = Number(data.postsPerPage) || 10
  state.configLoaded = true
}

function snapshotConfig() {
  return {
    features: state.features,
    site: state.site,
    banners: state.banners,
    notice: state.notice,
    notices: state.notices,
    postsPerPage: state.postsPerPage,
  }
}

export function clearAuth() {
  state.token = ''
  state.tokenExp = 0
  state.user = null
  state.stats = null
  rm(K.TOKEN); rm(K.TOKEN_EXP); rm(K.USER)
}

export function openLoginSheet() { state.loginSheet = true }
export function closeLoginSheet() { state.loginSheet = false }
