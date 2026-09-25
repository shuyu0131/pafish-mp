// 生成小程序静态图片素材：空状态插图 + 分享兜底图。
// 风格约束：TDesign 原生配色（品牌蓝 #0052d9 / 浅蓝 #f2f3ff / 灰阶），扁平线稿，
// 无渐变、无 emoji、圆角适中。运行：node scripts/gen-illus.mjs
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'static', 'img')

// 五角星顶点（外接圆半径 ro、内切圆半径 ri，尖朝上）
function starPts(cx, cy, ro, ri) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ri
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

const GRAY = '#9b9b9b' // 主线
const LIGHT = '#e7e7e7' // 次级灰
const SOFT = '#f2f3ff' // 品牌浅蓝底
const BRAND = '#0052d9' // 品牌蓝点缀

// 288×288 空状态插图共用：右下浅蓝圆作背景衬托
const backdrop = (cy = 156, r = 104, cx = 148) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SOFT}" />`

const svgs = {
  // 通用内容空（文章 / 列表）
  'empty': `
${backdrop()}
<rect x="96" y="72" width="112" height="148" rx="14" fill="#fff" stroke="${GRAY}" stroke-width="8"/>
<line x1="118" y1="116" x2="162" y2="116" stroke="${BRAND}" stroke-width="9" stroke-linecap="round"/>
<line x1="118" y1="146" x2="186" y2="146" stroke="${LIGHT}" stroke-width="9" stroke-linecap="round"/>
<line x1="118" y1="174" x2="178" y2="174" stroke="${LIGHT}" stroke-width="9" stroke-linecap="round"/>
<circle cx="196" cy="204" r="18" fill="${BRAND}"/>`,

  // 搜索（输入提示 / 无结果）
  'empty-search': `
<circle cx="150" cy="158" r="104" fill="${SOFT}" />
<circle cx="128" cy="126" r="58" fill="#fff" stroke="${GRAY}" stroke-width="8"/>
<circle cx="128" cy="126" r="34" fill="${SOFT}"/>
<circle cx="112" cy="126" r="7" fill="${LIGHT}"/>
<circle cx="128" cy="126" r="7" fill="${BRAND}"/>
<circle cx="144" cy="126" r="7" fill="${LIGHT}"/>
<line x1="171" y1="169" x2="206" y2="204" stroke="${GRAY}" stroke-width="11" stroke-linecap="round"/>`,

  // 评论 / 微语（气泡）
  'empty-comment': `
<circle cx="144" cy="152" r="102" fill="${SOFT}" />
<rect x="72" y="80" width="152" height="102" rx="24" fill="#fff" stroke="${GRAY}" stroke-width="8"/>
<path d="M 108 182 L 108 212 L 138 182" fill="#fff" stroke="${GRAY}" stroke-width="8" stroke-linejoin="round"/>
<line x1="98" y1="118" x2="198" y2="118" stroke="${LIGHT}" stroke-width="9" stroke-linecap="round"/>
<line x1="98" y1="146" x2="170" y2="146" stroke="${LIGHT}" stroke-width="9" stroke-linecap="round"/>
<rect x="178" y="164" width="64" height="46" rx="16" fill="#fff" stroke="${BRAND}" stroke-width="7"/>
<circle cx="196" cy="187" r="5.5" fill="${BRAND}"/>
<circle cx="210" cy="187" r="5.5" fill="${BRAND}"/>
<circle cx="224" cy="187" r="5.5" fill="${BRAND}"/>`,

  // 收藏（星标）
  'empty-fav': `
<circle cx="144" cy="152" r="102" fill="${SOFT}" />
<polygon points="${starPts(144, 146, 76, 33)}" fill="#fff" stroke="${GRAY}" stroke-width="8" stroke-linejoin="round"/>
<polygon points="${starPts(206, 92, 22, 10)}" fill="${BRAND}"/>`,

  // 浏览历史（时钟）
  'empty-history': `
<circle cx="144" cy="152" r="102" fill="${SOFT}" />
<circle cx="144" cy="150" r="70" fill="#fff" stroke="${GRAY}" stroke-width="8"/>
<line x1="144" y1="150" x2="144" y2="112" stroke="${GRAY}" stroke-width="8" stroke-linecap="round"/>
<line x1="144" y1="150" x2="174" y2="164" stroke="${BRAND}" stroke-width="8" stroke-linecap="round"/>
<circle cx="144" cy="150" r="8" fill="${BRAND}"/>
<path d="M 74 120 A 76 76 0 0 1 108 84" fill="none" stroke="${LIGHT}" stroke-width="8" stroke-linecap="round"/>
<path d="M 100 78 L 112 82 L 106 94" fill="none" stroke="${LIGHT}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // 功能已关闭（开关）
  'empty-off': `
<circle cx="144" cy="150" r="102" fill="${SOFT}" />
<rect x="66" y="118" width="152" height="66" rx="33" fill="${LIGHT}"/>
<circle cx="99" cy="151" r="25" fill="#fff" stroke="${GRAY}" stroke-width="6"/>
<line x1="146" y1="151" x2="186" y2="151" stroke="#bdbdbd" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 16"/>`,

  // 登录（人像）
  'empty-login': `
<circle cx="144" cy="146" r="98" fill="${SOFT}" />
<circle cx="144" cy="144" r="86" fill="none" stroke="#c9c9c9" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 20"/>
<circle cx="144" cy="120" r="30" fill="#fff" stroke="${GRAY}" stroke-width="8"/>
<path d="M 96 210 C 96 172 192 172 192 210" fill="#fff" stroke="${GRAY}" stroke-width="8" stroke-linecap="round"/>
<circle cx="204" cy="92" r="14" fill="${BRAND}"/>`,
}

// 5:4 分享兜底图：品牌蓝底 + 白色文章卡
const shareBody = `
<rect width="500" height="400" fill="${BRAND}"/>
<rect x="150" y="76" width="200" height="248" rx="16" fill="#fff"/>
<path d="M 302 76 L 350 124 L 302 124 Z" fill="${SOFT}"/>
<line x1="178" y1="150" x2="246" y2="150" stroke="${BRAND}" stroke-width="11" stroke-linecap="round"/>
<line x1="178" y1="186" x2="322" y2="186" stroke="${LIGHT}" stroke-width="11" stroke-linecap="round"/>
<line x1="178" y1="218" x2="306" y2="218" stroke="${LIGHT}" stroke-width="11" stroke-linecap="round"/>
<line x1="178" y1="250" x2="322" y2="250" stroke="${LIGHT}" stroke-width="11" stroke-linecap="round"/>
<polygon points="${starPts(250, 296, 22, 10)}" fill="${BRAND}"/>`
const shareSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">${shareBody}</svg>`

await mkdir(OUT, { recursive: true })

for (const [name, body] of Object.entries(svgs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="288" height="288" viewBox="0 0 288 288">${body}</svg>`
  await sharp(Buffer.from(svg)).png({ palette: true, compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`))
  console.log('ok', name)
}

await sharp(Buffer.from(shareSvg.trim()))
  .png({ palette: true, compressionLevel: 9 })
  .toFile(path.join(OUT, 'share-fallback.png'))
console.log('ok share-fallback')
