// 为 rich-text 节点补内联样式：rich-text 不继承页面 CSS，
// 服务端 md() 产出的 HTML 只有裸标签，这里统一注入 V2 纸鱼正文样式。
// 注意：md() 会给 code/pre 生成 class 属性（如 language-php），
// 所有标签规则必须容忍属性，否则整段 markdown 无样式。
const INK = '#222831'
const INK2 = '#5b6470'
const LINE = '#edf1f4'
const BRAND = '#2fa8e8'
const BRAND_SOFT = '#eaf8ff'
const CODE_BG = '#e8f6ff'
const CODE_FG = '#1686c4'
const PRE_BG = '#22262e'
const PRE_FG = '#f5f7fa'

const PRE_STYLE = `background:${PRE_BG};color:${PRE_FG};border-radius:16rpx;padding:22rpx 24rpx;font-size:21rpx;line-height:1.75;overflow-x:auto;font-family:Consolas,Menlo,monospace;margin:24rpx 0`
const PRE_CODE_STYLE = `display:block;background:transparent;color:${PRE_FG};border-radius:0;padding:0;font-size:inherit;line-height:1.75;font-family:Consolas,Menlo,monospace`

export function styleHtml(html, opts = {}) {
  if (!html) return ''
  let s = String(html)

  s = s.replace(/<pre(\s[^>]*)?>/g, `<pre style="${PRE_STYLE}">`)
  s = s.replace(/<code(\s[^>]*)?>/g, `<code style="background:${CODE_BG};color:${CODE_FG};border-radius:6rpx;padding:2rpx 10rpx;font-size:23rpx;font-family:Consolas,Menlo,monospace">`)
  s = s.replace(/(<pre style="[^"]*">)(\s*)<code style="[^"]*">/g, `$1$2<code style="${PRE_CODE_STYLE}">`)
  s = s.replace(/<\/code>\s*<\/pre>/g, '</code></pre>')
  s = s.replace(/<blockquote(\s[^>]*)?>/g, `<blockquote style="border-left:6rpx solid ${BRAND};background:${BRAND_SOFT};color:${INK2};padding:18rpx 22rpx;margin:24rpx 0;font-size:25rpx;line-height:1.7;border-radius:0 16rpx 16rpx 0">`)
  s = s.replace(/<h1(\s[^>]*)?>/g, `<h1 style="font-size:40rpx;font-weight:600;margin:36rpx 0 16rpx;color:${INK}">`)
  s = s.replace(/<h2(\s[^>]*)?>/g, `<h2 style="font-size:34rpx;font-weight:600;margin:34rpx 0 16rpx;padding-left:16rpx;border-left:6rpx solid ${BRAND};color:${INK}">`)
  s = s.replace(/<h3(\s[^>]*)?>/g, `<h3 style="font-size:32rpx;font-weight:600;margin:30rpx 0 12rpx;color:${INK}">`)
  s = s.replace(/<h4(\s[^>]*)?>/g, `<h4 style="font-size:29rpx;font-weight:500;margin:26rpx 0 10rpx;color:${INK}">`)
  s = s.replace(/<p(\s[^>]*)?>/g, '<p style="margin:0 0 28rpx">')
  s = s.replace(/<ul(\s[^>]*)?>/g, '<ul style="margin:0 0 24rpx;padding-left:36rpx">')
  s = s.replace(/<ol(\s[^>]*)?>/g, '<ol style="margin:0 0 24rpx;padding-left:36rpx">')
  s = s.replace(/<li(\s[^>]*)?>/g, '<li style="margin:8rpx 0">')
  s = s.replace(/<strong(\s[^>]*)?>/g, '<strong style="font-weight:700">')
  s = s.replace(/<em(\s[^>]*)?>/g, '<em style="font-style:italic">')
  s = s.replace(/<del(\s[^>]*)?>/g, `<del style="color:${INK2};opacity:.55">`)
  s = s.replace(/<a /g, `<a style="color:${BRAND};text-decoration:underline" `)
  s = s.replace(/<table(\s[^>]*)?>/g, '<table style="width:100%;border-collapse:collapse;font-size:23rpx;table-layout:fixed;word-break:break-all">')
  s = s.replace(/<td(\s[^>]*)?>/g, `<td style="border:1rpx solid ${LINE};padding:10rpx 14rpx">`)
  s = s.replace(/<th(\s[^>]*)?>/g, `<th style="border:1rpx solid ${LINE};padding:10rpx 14rpx;background:#f5f7fa">`)
  s = s.replace(/<img /g, '<img style="width:100%;border-radius:16rpx;margin:18rpx 0" ')
  s = s.replace(/<hr(\s[^>]*)?>/g, `<hr style="border:none;border-top:1rpx solid ${LINE};margin:36rpx 0">`)
  return s
}
