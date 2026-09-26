// 网络层：/mp/* 全部端点 + CSRF + token 注入 + 错误语义。
// 约定：成功 resolve 后端 JSON；失败 reject(new Error(用户可读文案))。
// 安全：X-API-Key 是服务端密钥，绝不出现在小程序端；写操作走插件的
// X-MP-Token + session cookie + _csrf 三重校验。
//
// 两个稳定性要点（对应线上「网络有点打滑 / 请刷新页面重试」）：
// 1) 服务端 csrf 与 session cookie 绑定。冷启动时 onLaunch、onShow 与首次写操作
//    可能并发触发 /mp/config，服务端给每个不带 cookie 的请求各建一个会话，客户端
//    只留最后一份 cookie、却可能留着另一份 csrf —— 写操作必然 419。
//    因此 config() 单飞（并发共享同一个 promise），并在 419 时换新 csrf 重试一次。
// 2) 线上偶发连接被重置。幂等 GET 做退避重试；登录在 code 未被消费时换新 code 重来一次。
import { BASE_URL } from './config.js'
import { state, applyConfig, setAuth, setUser, setStats, clearAuth, openLoginSheet } from './store.js'

const NET_MSG = '网络有点打滑，稍后再试'
const GET_RETRY_DELAYS = [300, 900] // 仅用于幂等 GET

function header(auth = true) {
  const h = { 'content-type': 'application/json' }
  if (auth && state.token) h['X-MP-Token'] = state.token
  return h
}

function once(method, path, data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + path,
      method,
      data: data || undefined,
      header: header(),
      timeout: 15000,
      success: (res) => resolve(res),
      fail: () => reject(new Error(NET_MSG)),
    })
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET 幂等，抖动可安全重试；写操作只发一次，避免重复写入 */
async function raw(method, path, data) {
  const tries = method === 'GET' ? GET_RETRY_DELAYS.length + 1 : 1
  let last = null
  for (let i = 0; i < tries; i++) {
    try {
      return await once(method, path, data)
    } catch (e) {
      last = e
      if (i < tries - 1) await sleep(GET_RETRY_DELAYS[i])
    }
  }
  throw last
}

/** 统一判定：HTTP 2xx 且 body.ok，否则抛错；401/403 附带全局副作用 */
function unwrap(res, path) {
  const body = res && res.data
  if (res && res.statusCode === 401) {
    clearAuth()
    if (!/\/mp\/config/.test(path)) openLoginSheet()
    throw new Error((body && body.message) || '请先登录')
  }
  if (res && res.statusCode === 403) {
    // 服务端开关兜底：本地快照可能过期，静默刷新让 UI 收敛
    config().catch(() => {})
    throw new Error((body && body.message) || '功能已关闭')
  }
  if (!body || body.ok !== true) {
    throw new Error((body && (body.message || body.error)) || '服务异常，请稍后再试')
  }
  return body
}

async function get(path, params) {
  const qs = params ? buildQuery(params) : ''
  const res = await raw('GET', path + qs)
  return unwrap(res, path)
}

/** 写操作前刷新 config：拿新 csrf（session 绑定）并同步最新开关 */
async function ensureCsrf() {
  if (!state.csrf) await config()
  return state.csrf
}

async function post(path, body, opts = {}) {
  const send = async () => {
    const data = Object.assign({}, body || {})
    if (!opts.noCsrf) data._csrf = await ensureCsrf()
    return raw('POST', path, data)
  }
  let res = await send()
  if (res && res.statusCode === 419) {
    // csrf 与当前会话不匹配（多见于冷启动并发建会话）：换一份 csrf 再试一次。
    // 先等掉在途的 config——它本身会带回可用的 csrf；若没有在途的才另发一次，
    // 始终保证同一时刻只有一个会写 cookie 的请求。
    state.csrf = ''
    if (configInFlight) {
      await configInFlight.catch(() => { /* 失败则走下面补发 */ })
    }
    if (!state.csrf) {
      await config(true).catch(() => { /* 仍失败则交给下方 unwrap 报错 */ })
    }
    res = await send()
  }
  return unwrap(res, path)
}

function buildQuery(o) {
  const parts = []
  for (const k of Object.keys(o)) {
    const v = o[k]
    if (v === undefined || v === null || v === '') continue
    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
  }
  return parts.length ? '?' + parts.join('&') : ''
}

// ---- 端点 -------------------------------------------------------------------

let configInFlight = null

/**
 * GET /mp/config：功能开关 + csrf + 站点信息（登录前也允许）。
 * 单飞：并发调用共享同一个请求，避免服务端为每个无 cookie 请求各建会话。
 * @param {boolean} force 绕过单飞强制重新拉取（仅 419 自愈时使用）
 */
export function config(force = false) {
  if (configInFlight && !force) return configInFlight
  const p = raw('GET', '/mp/config').then((res) => {
    const body = res.data && res.data.ok !== false ? res.data : null
    if (body) applyConfig(body)
    return body
  })
  configInFlight = p
  const clear = () => { if (configInFlight === p) configInFlight = null }
  p.then(clear, clear)
  return p
}

/** 强制登录态下刷新开关（保留 csrf 语义） */
export async function refreshConfig() { return config() }

/** GET /mp/posts */
export function posts(params) { return get('/mp/posts', params) }
/** GET /mp/post/{slug} —— 注意：返回裸文章对象（无 ok 包裹），unwrap 走 statusCode 分支 */
export function postDetail(slug) { return get('/mp/post/' + encodeURIComponent(slug)) }
/** GET /mp/comments */
export function comments(postId, page) { return get('/mp/comments', { postId, page: page || 1 }) }
export function categories() { return get('/mp/categories') }
export function tags() { return get('/mp/tags') }
/** GET /mp/micro */
export function micro(page) { return get('/mp/micro', { page: page || 1, perPage: 10 }) }

/** GET /mp/me —— 刷新用户资料与统计 */
export async function me() {
  const body = await get('/mp/me')
  if (body.user) setUser(body.user)
  setStats(body.stats || null)
  return body
}
export function myComments(page) { return get('/mp/me/comments', { page: page || 1 }) }
export function myFavorites(page) { return get('/mp/me/favorites', { page: page || 1 }) }

/** POST /mp/login —— uni.login 换 code，静默登录 */
export function login() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    // code 是一次性的：请求若因连接被重置而没到达服务端，就换个新 code 重来一次；
    // 若服务端已消费该 code，重试会得到「凭证无效」，此时交给用户手动重试。
    const attempt = (left) => {
      uni.login({
        provider: 'weixin',
        success: async ({ code }) => {
          try {
            const body = await post('/mp/login', { code })
            setAuth(body.token, body.expiresIn, body.user)
            resolve(body)
          } catch (e) {
            if (left > 0 && e && e.message === NET_MSG) attempt(left - 1)
            else reject(e)
          }
        },
        fail: () => reject(new Error('微信登录失败，请重试')),
      })
    }
    attempt(1)
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('请在微信开发者工具中预览真机登录'))
    // #endif
  })
}

/** POST /mp/profile {nickname} —— 头像昵称填写能力的昵称保存 */
export async function saveProfile(nickname) {
  const body = await post('/mp/profile', { nickname })
  if (body.user) setUser(body.user)
  return body
}

/** POST /mp/avatar —— chooseAvatar 临时文件上传（multipart，字段名 avatar） */
export async function uploadAvatar(filePath) {
  const csrf = await ensureCsrf()
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/mp/avatar',
      filePath,
      name: 'avatar',
      formData: { _csrf: csrf },
      header: state.token ? { 'X-MP-Token': state.token } : {},
      timeout: 20000,
      success: (res) => {
        let body = null
        try { body = JSON.parse(res.data) } catch (e) { /* 非 JSON 按失败处理 */ }
        if (res.statusCode === 401) { clearAuth(); reject(new Error('请先登录')); return }
        if (!body || body.ok !== true) { reject(new Error((body && body.message) || '头像上传失败')); return }
        if (body.user) setUser(body.user)
        resolve(body)
      },
      fail: () => reject(new Error('头像上传失败，请重试')),
    })
  })
}

/** POST /mp/comment {postId, content, parentId?} */
export async function submitComment(postId, content, parentId) {
  const body = { postId, content }
  if (parentId) body.parentId = parentId
  return post('/mp/comment', body)
}

/** POST /mp/like /mp/favorite —— 切换，返回 {active, count} */
export function toggleLike(postId) { return post('/mp/like', { postId }) }
export function toggleFavorite(postId) { return post('/mp/favorite', { postId }) }

/** POST /mp/micro-like {microId} —— 微语点赞切换，返回 {active, count} */
export function toggleMicroLike(microId) { return post('/mp/micro-like', { microId }) }

// ---- 交互护栏 ----------------------------------------------------------------

/** 需要登录的操作前置检查：未登录则弹登录层并返回 false */
export function ensureLogin() {
  if (state.token && state.tokenExp > Date.now()) return true
  openLoginSheet()
  return false
}

/** 轻量 toast */
export function toast(title, icon) {
  uni.showToast({ title, icon: icon || 'none', duration: 1800 })
}
