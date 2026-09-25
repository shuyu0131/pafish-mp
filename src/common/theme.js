// 封面占位：文章没有封面图时，按分类映射一个 TDesign 线性图标 + 中性灰底；
// 原生风格不做多彩色板，分类只决定图标，不决定颜色。
// 约束：图标名必须来自 @tdesign/uniapp 的 t-icon 图标集。

const NEUTRAL = { bg: '#f3f3f3', fg: '#a6a6a6' }

const CATEGORY_MAP = [
  [['技术', 'tech', '开发', '编程', '代码'], 'code'],
  [['建站', 'blog', '主题', '插件'], 'server'],
  [['生活', 'life', '随笔日常'], 'gift'],
  [['随笔', 'note', '记录', '读书'], 'book'],
  [['微语', 'micro'], 'chat'],
  [['设计', 'ui', 'design'], 'brush'],
]

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const FALLBACK_ICONS = ['code', 'book', 'server', 'brush', 'chat', 'gift']

/**
 * 一篇文章的封面占位（无 coverUrl 时）。
 * @param {object} post 列表项 {slug, category}
 * @returns {{bg:string, fg:string, icon:string}}
 */
export function coverStyle(post) {
  const cat = ((post && post.category && post.category.name) || '') + ''
  const name = (post && post.slug) || ''
  for (const [keys, icon] of CATEGORY_MAP) {
    if (keys.some((k) => cat.indexOf(k) >= 0)) return { ...NEUTRAL, icon }
  }
  const icon = FALLBACK_ICONS[hash(name) % FALLBACK_ICONS.length]
  return { ...NEUTRAL, icon }
}

/**
 * 小程序 <image> 真正可用的封面地址：svg 小程序不支持渲染，空地址同理；
 * 不满足时返回 null，调用方回落到色块占位。
 * @param {string} url
 * @returns {string|null}
 */
export function usableCover(url) {
  const u = String(url || '').trim()
  if (!u) return null
  if (/\.svg(\?|#|$)/i.test(u)) return null
  return u
}

// 单字头像底色：统一中性灰，原生观感
export function avatarColor() {
  return '#e7e7e7'
}

/** 取展示名首字符：中文取首字，英文取大写首字母 */
export function avatarChar(name) {
  const s = String(name || '鱼').trim()
  if (!s) return '鱼'
  return /[a-zA-Z]/.test(s[0]) ? s[0].toUpperCase() : s[0]
}
