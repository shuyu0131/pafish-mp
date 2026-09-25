// 时间 / 数字格式化。后端下发 ISO8601（Support::iso），各端解析保持简单。

function parse(iso) {
  if (!iso) return null
  const s = String(iso).trim()
  // 带时区的 ISO8601 各端原生可解析；先试原生
  let t = Date.parse(s)
  if (!Number.isNaN(t)) return t
  // 'YYYY-MM-DD HH:mm:ss'（无时区，按本地时间）→ iOS 需要斜杠格式
  t = Date.parse(s.replace(/-/g, '/'))
  return Number.isNaN(t) ? null : t
}

const pad = (n) => (n < 10 ? '0' + n : '' + n)

/** '09-21' */
export function fmtShort(iso) {
  const t = parse(iso)
  if (t === null) return ''
  const d = new Date(t)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** '09-23 · 12:40'（微语卡片） */
export function fmtClock(iso) {
  const t = parse(iso)
  if (t === null) return ''
  const d = new Date(t)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** '2026-09-12'（详情副信息） */
export function fmtDate(iso) {
  const t = parse(iso)
  if (t === null) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** '刚刚 / 8分钟前 / 3小时前 / 昨天 / 09-20'（我的评论列表） */
export function fmtRel(iso) {
  const t = parse(iso)
  if (t === null) return ''
  const diff = Date.now() - t
  const min = 60 * 1000, hour = 60 * min, day = 24 * hour
  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 2 * day) return '昨天'
  return fmtShort(iso)
}

/** 浏览历史分组：今天 / 昨天 / 更早 */
export function dayGroup(ts) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (ts >= todayStart) return '今天'
  if (ts >= todayStart - 86400000) return '昨天'
  return '更早'
}

/** 大数字缩写：1234 → 1.2k */
export function fmtNum(n) {
  n = Number(n) || 0
  if (n < 10000) return String(n)
  return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
}
