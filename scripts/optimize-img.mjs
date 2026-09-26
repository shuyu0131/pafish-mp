// 压缩打包进代码包的静态图：微信「代码质量」要求包内图片与音频资源总大小不超过 200K（各文件相加）。
// 轮播图显示宽约 686rpx，按 1000px 宽重采样保留足够清晰度；logo 显示 96rpx，缩到 192px。
// 运行：node scripts/optimize-img.mjs
import sharp from 'sharp'
import { stat, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'static', 'img')

const banners = ['banner-1.jpg', 'banner-2.jpg', 'banner-3.jpg']

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

for (const name of banners) {
  const file = path.join(DIR, name)
  const buf = await sharp(file)
    .resize({ width: 1000, withoutEnlargement: true })
    .jpeg({ quality: 70, mozjpeg: true, progressive: false })
    .toBuffer()
  await write(file, buf)
  await report(name)
}

const logo = path.join(DIR, 'logo.png')
await write(logo, await sharp(logo).resize({ width: 192 }).png({ palette: true, compressionLevel: 9 }).toBuffer())
await report('logo.png')

await report('share-fallback.png')

console.log('-'.repeat(32))
console.log('合计'.padEnd(20), (total / 1024).toFixed(1) + ' KB / 200 KB')
if (total > 200 * 1024) {
  console.error('超出 200K 预算')
  process.exit(1)
}
