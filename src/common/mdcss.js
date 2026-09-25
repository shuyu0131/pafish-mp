// 为 rich-text 节点补内联样式：rich-text 不继承页面 CSS，
// 服务端 md() 产出的 HTML 只有裸标签，这里统一注入 TDesign 原生风配色。
// 注意：md() 会给 code/pre 生成 class 属性（如 language-php），
// 所有标签规则必须容忍属性，否则整段 markdown 无样式。
const CODE_BG = '#eeeeee'   // gray-2
const CODE_FG = 'rgba(0,0,0,0.9)'
const PRE_BG = '#f6f6f6'    // 浅色代码块，原生默认
const BRAND = '#0052d9'

const PRE_STYLE = `background:${PRE_BG};color:#333333;border-radius:10rpx;padding:22rpx 24rpx;font-size:22rpx;line-height:1.7;overflow-x:auto;font-family:Consolas,Menlo,monospace;margin:20rpx 0`
// pre 内的 code 不叠行内 code 的底色与内边距，只保留等宽字体与行高
const PRE_CODE_STYLE = 'display:block;background:transparent;color:#333333;border-radius:0;padding:0;font-size:inherit;line-height:1.7;font-family:Consolas,Menlo,monospace'

export function styleHtml(html, opts = {}) {
  if (!html) return ''
  let s = String(html)

  s = s.replace(/<pre(\s[^>]*)?>/g, `<pre style="${PRE_STYLE}">`)
  s = s.replace(/<code(\s[^>]*)?>/g, `<code style="background:${CODE_BG};color:${CODE_FG};border-radius:6rpx;padding:2rpx 10rpx;font-size:23rpx;font-family:Consolas,Menlo,monospace">`)
  // 上一条把 pre 内的 code 也染成行内样式，这里还原为块级代码样式
  s = s.replace(/(<pre style="[^"]*">)(\s*)<code style="[^"]*">/g, `$1$2<code style="${PRE_CODE_STYLE}">`)
  s = s.replace(/<\/code>\s*<\/pre>/g, '</code></pre>')
  s = s.replace(/<blockquote(\s[^>]*)?>/g, `<blockquote style="border-left:6rpx solid #dcdcdc;background:#f7f7f7;color:rgba(0,0,0,0.6);padding:14rpx 20rpx;margin:20rpx 0;font-size:25rpx;border-radius:0 8rpx 8rpx 0">`)
  s = s.replace(/<h1(\s[^>]*)?>/g, `<h1 style="font-size:36rpx;font-weight:700;margin:36rpx 0 16rpx;color:rgba(0,0,0,0.9)">`)
  s = s.replace(/<h2(\s[^>]*)?>/g, `<h2 style="font-size:32rpx;font-weight:700;margin:36rpx 0 16rpx;color:rgba(0,0,0,0.9)">`)
  s = s.replace(/<h3(\s[^>]*)?>/g, `<h3 style="font-size:29rpx;font-weight:700;margin:30rpx 0 14rpx;color:rgba(0,0,0,0.9)">`)
  s = s.replace(/<h4(\s[^>]*)?>/g, `<h4 style="font-size:27rpx;font-weight:600;margin:26rpx 0 12rpx;color:rgba(0,0,0,0.9)">`)
  s = s.replace(/<p(\s[^>]*)?>/g, `<p style="margin:0 0 24rpx">`)
  s = s.replace(/<ul(\s[^>]*)?>/g, `<ul style="margin:0 0 22rpx;padding-left:36rpx">`)
  s = s.replace(/<ol(\s[^>]*)?>/g, `<ol style="margin:0 0 22rpx;padding-left:36rpx">`)
  s = s.replace(/<li(\s[^>]*)?>/g, `<li style="margin:8rpx 0">`)
  s = s.replace(/<strong(\s[^>]*)?>/g, `<strong style="font-weight:700">`)
  s = s.replace(/<em(\s[^>]*)?>/g, `<em style="font-style:italic">`)
  s = s.replace(/<del(\s[^>]*)?>/g, `<del style="color:rgba(0,0,0,0.4)">`)
  s = s.replace(/<a /g, `<a style="color:${BRAND};text-decoration:underline" `)
  s = s.replace(/<table(\s[^>]*)?>/g, `<table style="width:100%;border-collapse:collapse;font-size:24rpx">`)
  s = s.replace(/<td(\s[^>]*)?>/g, `<td style="border:2rpx solid #e7e7e7;padding:10rpx 14rpx">`)
  s = s.replace(/<th(\s[^>]*)?>/g, `<th style="border:2rpx solid #e7e7e7;padding:10rpx 14rpx;background:#f3f3f3">`)
  s = s.replace(/<img /g, `<img style="width:100%;border-radius:10rpx;margin:16rpx 0" `)
  s = s.replace(/<hr(\s[^>]*)?>/g, `<hr style="border:none;border-top:2rpx solid #e7e7e7;margin:28rpx 0">`)
  return s
}
