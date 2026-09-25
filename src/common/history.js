// 本地浏览历史与搜索历史：仅存设备本地（隐私友好，个人主体无服务器同步）。
import { K, HISTORY_LIMIT, SEARCH_LIMIT } from './config.js'
import { dayGroup } from './format.js'

function load(key, fallback) {
  try {
    const v = uni.getStorageSync(key)
    return Array.isArray(v) ? v : fallback
  } catch (e) { return fallback }
}
function save(key, val) { try { uni.setStorageSync(key, val) } catch (e) { /* noop */ } }

/** 记录一次浏览：同 slug 刷新到最前并更新时间 */
export function pushView(post) {
  if (!post || !post.slug) return
  const list = load(K.HISTORY, [])
  const ts = Date.now()
  const hit = list.find((x) => x.slug === post.slug)
  if (hit) {
    hit.ts = ts
    hit.title = post.title || hit.title
  } else {
    list.unshift({ slug: post.slug, title: post.title || '', ts })
  }
  save(K.HISTORY, list.slice(0, HISTORY_LIMIT))
}

export function views() {
  const list = load(K.HISTORY, [])
  const groups = []
  for (const item of list) {
    const g = dayGroup(item.ts)
    const last = groups[groups.length - 1]
    if (last && last.name === g) last.items.push(item)
    else groups.push({ name: g, items: [item] })
  }
  return groups
}

export function removeView(slug) {
  save(K.HISTORY, load(K.HISTORY, []).filter((x) => x.slug !== slug))
}

export function clearViews() { save(K.HISTORY, []) }

export function searchHistory() { return load(K.SEARCH, []) }

export function pushSearch(q) {
  q = String(q || '').trim()
  if (!q) return
  let list = load(K.SEARCH, []).filter((x) => x !== q)
  list.unshift(q)
  save(K.SEARCH, list.slice(0, SEARCH_LIMIT))
}

export function removeSearch(q) {
  save(K.SEARCH, load(K.SEARCH, []).filter((x) => x !== q))
}

export function clearSearch() { save(K.SEARCH, []) }

/** 估算缓存占用（设置页「清除缓存」提示用）：按 storage 全量字符长度粗估 */
export function cacheSize() {
  try {
    const info = uni.getStorageInfoSync()
    return (info.keys || []).reduce((sum, k) => {
      const v = uni.getStorageSync(k)
      return sum + (typeof v === 'string' ? v.length : JSON.stringify(v || '').length)
    }, 0)
  } catch (e) { return 0 }
}
