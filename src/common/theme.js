import { BASE_URL } from './config.js'

// 分类视觉：纸鱼原创插画 + ColorUI 浅色底。
// 分类只决定插画和色签，不决定整块页面颜色。

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export const CATEGORY_STYLES = {
  tech: {
    key: 'tech',
    art: '/static/illus/cat-tech.png',
    bg: '#e7f7ff',
    fg: '#1cbbb4',
    soft: '#d2f1f0',
    label: '技术',
    icon: 'code',
  },
  build: {
    key: 'build',
    art: '/static/illus/cat-build.png',
    bg: '#e9f7ed',
    fg: '#39b54a',
    soft: '#d7f0db',
    label: '建站',
    icon: 'server',
  },
  life: {
    key: 'life',
    art: '/static/illus/cat-life.png',
    bg: '#fdeaf2',
    fg: '#e03997',
    soft: '#f9d7ea',
    label: '生活',
    icon: 'gift',
  },
  essay: {
    key: 'essay',
    art: '/static/illus/cat-essay.png',
    bg: '#f1ebfa',
    fg: '#6739b6',
    soft: '#e1d7f0',
    label: '随笔',
    icon: 'book',
  },
  design: {
    key: 'design',
    art: '/static/illus/cat-design.png',
    bg: '#fdeee4',
    fg: '#f37b1d',
    soft: '#fde6d2',
    label: '设计',
    icon: 'brush',
  },
}

const CATEGORY_KEYS = [
  [['技术', '开发', '编程', '代码', 'tech', 'code'], 'tech'],
  [['建站', '博客', '主题', '插件', 'blog', 'build'], 'build'],
  [['生活', '日常', 'life'], 'life'],
  [['随笔', '记录', '读书', 'note', 'essay'], 'essay'],
  [['设计', 'ui', 'design'], 'design'],
]

export function categoryKey(post) {
  const raw = [
    (post && post.name) || '',
    (post && post.slug) || '',
    (post && post.category && post.category.name) || '',
    (post && post.category && post.category.slug) || '',
    (post && post.categoryName) || '',
  ].join(' ').toLowerCase()
  for (const [keys, key] of CATEGORY_KEYS) {
    if (keys.some((k) => raw.indexOf(String(k).toLowerCase()) >= 0)) return key
  }
  return 'essay'
}

export function categoryStyle(post) {
  return CATEGORY_STYLES[categoryKey(post)] || CATEGORY_STYLES.essay
}

export function categoryArt(post) {
  return categoryStyle(post).art
}

/** 无封面时的浅色底 + 线性图标（历史/收藏小缩略图用） */
export function coverStyle(post) {
  const style = categoryStyle(post)
  return { bg: style.bg, fg: style.fg, icon: style.icon }
}

/**
 * 小程序 <image> 真正可用的封面地址：svg 小程序不支持渲染，空地址同理；
 * 不满足时返回 null，调用方回落到插画占位。
 * @param {string} url
 * @returns {string|null}
 */
export function usableCover(url) {
  let u = String(url || '').trim()
  if (!u) return null
  if (/\.svg(\?|#|$)/i.test(u)) return null
  if (/^(https?:)?\/\//i.test(u) || u.startsWith('data:') || u.startsWith('/static/')) return u
  const base = String(BASE_URL || '').replace(/\/+$/, '')
  if (!base) return u
  return base + (u[0] === '/' ? u : '/' + u)
}

function pickCover(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') return value.url || value.src || value.path || ''
  return ''
}

/** 分类配置封面：兼容 coverUrl / cover / image / thumb / coverImage / coverPath */
export function categoryCover(cat) {
  if (!cat) return null
  const raw = cat.coverUrl || cat.cover || cat.image || cat.thumb || cat.coverImage || cat.coverPath || cat.thumbnail
  return usableCover(pickCover(raw))
}

/** 文章配置封面：兼容 coverUrl / cover / image / thumbnail / coverPath */
export function postCover(post) {
  if (!post) return null
  const raw = post.coverUrl || post.cover || post.image || post.thumbnail || post.coverPath
  return usableCover(pickCover(raw))
}

const AVATAR_COLORS = ['#60c2ff', '#f37b1d', '#39b54a', '#6739b6', '#e03997', '#1cbbb4']

/** 单字头像底色：按名字稳定取一个品牌色 */
export function avatarColor(name) {
  const s = String(name || '鱼')
  return AVATAR_COLORS[hash(s) % AVATAR_COLORS.length]
}

/** 取展示名首字符：中文取首字，英文取大写首字母 */
export function avatarChar(name) {
  const s = String(name || '鱼').trim()
  if (!s) return '鱼'
  return /[a-zA-Z]/.test(s[0]) ? s[0].toUpperCase() : s[0]
}
