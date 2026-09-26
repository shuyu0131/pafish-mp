// 压缩打包进代码包的静态图：微信「代码质量」要求包内图片与音频资源总大小不超过 200K（各文件相加，
// 不是单文件上限）。默认横幅只留一张，所以可以直接按原始 1200px 宽、较高质量出图。
// 运行：node scripts/optimize-img.mjs
import sharp from 'sharp'
import { stat, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'static', 'img')

const BUDGET = 200 * 1024

let total = 0
async function report(name) {
  const { size } = await stat(path.join(DIR, name))
  total += size
  console.log(name.padEnd(20), (size / 1024).toFixed(1) + ' KB')
}

// libvips 不允许读写同一路径，先落临时文件再改名；直接写字节，避免二次编码掉回默认质量
async function write(file, buf) {
  const tmp = file + '.tmp'
  await writeFile(tmp, buf)
  await rename(tmp, file)
}

const banner = path.join(DIR, 'banner-1.jpg')
await write(banner, await sharp(banner)
  .resize({ width: 1200, withoutEnlargement: true })
  .jpeg({ quality: 80, mozjpeg: true, progressive: false })
  .toBuffer())
await report('banner-1.jpg')

const logo = path.join(DIR, 'logo.png')
await write(logo, await sharp(logo).resize({ width: 192 }).png({ palette: true, compressionLevel: 9 }).toBuffer())
await report('logo.png')

await report('share-fallback.png')

console.log('-'.repeat(32))
console.log('合计'.padEnd(20), (total / 1024).toFixed(1) + ' KB / 200 KB')
if (total > BUDGET) {
  console.error('超出 200K 预算')
  process.exit(1)
}
