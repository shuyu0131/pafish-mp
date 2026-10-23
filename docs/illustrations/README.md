# 纸鱼手绘插画集

纸鱼博客小程序的第一版原创插画。风格参考依沫博客的“粗描边 + 浅色填充 + 大量留白”，但图形全部围绕纸鱼自己的内容重新设计。

## 风格规则

- 深灰描边：`#3E4652`，400×400 画布下 8–9px，圆头圆角。
- 浅色填充：天空蓝 `#BFE6FF`、奶黄 `#FFE08A`、珊瑚粉 `#FFB7C5`、薄荷 `#C9F0D8`、雾紫 `#D9CCF5`、奶油 `#FFF4E0`。
- 透明背景，无渐变，无 emoji，无 3D，无投影。
- 每个图形最多 3 个主色 + 白色；细节用短线和点，不堆元素。
- 图形主体居中，四周留 40px 以上空白，方便缩到 48px 仍可读。

## 文件与用途

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `cat-tech.png` | 200×200 | 技术：灯泡里的纸鱼 |
| `cat-build.png` | 200×200 | 建站：屏幕里的小屋 |
| `cat-life.png` | 200×200 | 生活：纸船、鱼与海 |
| `cat-essay.png` | 200×200 | 随笔：手帐、鱼书签与茶 |
| `cat-design.png` | 200×200 | 设计：调色盘、鱼与画笔 |
| `empty-posts.png` | 320×320 | 无文章 / 无搜索结果：空鱼缸与纸船 |
| `empty-comments.png` | 320×320 | 无评论：气泡里的鱼 |
| `empty-offline.png` | 320×320 | 网络错误：雨伞鱼 |
| `tab-posts.png` / `tab-posts-on.png` | 96×96 | 底栏「文章」未选中 / 选中 |
| `tab-micro.png` / `tab-micro-on.png` | 96×96 | 底栏「微语」未选中 / 选中 |
| `tab-category.png` / `tab-category-on.png` | 96×96 | 底栏「分类」未选中 / 选中 |
| `tab-mine.png` / `tab-mine-on.png` | 96×96 | 底栏「我的」未选中 / 选中 |
| `sky-bg.png` | 780×578 | 首页天空头图底 |
| `share-brand.png` | 500×400 | 分享卡片兜底图 |

底栏选中态统一为：深灰描边 `#3E4652` + 天空蓝填充 `#60C2FF`；未选中为灰蓝 `#A8B4C8` 描边、无填充。底栏背景为白色，图标透明底。

## 目录

```
docs/illustrations/
├─ src/          # 可编辑 SVG 源文件
├─ png/          # 评审用 PNG（已压缩）
└─ README.md
src/static/illus/ # 小程序打包用的 PNG 副本
```

## 生成

```bash
npm run gen:brand-illus
# 或
node scripts/gen-brand-illus.mjs
```

脚本会：

1. 生成 `docs/illustrations/src/*.svg`；
2. 导出 `docs/illustrations/png/*.png`；
3. 打印每个文件大小与合计，超过 120KB 时直接失败。

打包副本需要手动同步（或复制脚本最后一次输出）：

```bash
cp docs/illustrations/png/*.png src/static/illus/
```

当前整套 PNG 合计约 **77.3KB**；加上现有 `banner-1.jpg` 后，`src/static` 图片总量约 **197.9KB / 200KB**。

## 集成建议

- 四宫格：`cat-tech / cat-build / cat-life / cat-essay`；设计分类用在发现页与文章封面。
- 文章卡无封面：按分类使用 `cat-*`，背景用对应的浅色。
- 空态：`empty-posts` 用于无文章/无搜索结果，`empty-comments` 用于评论区，`empty-offline` 用于网络错误。
- 底栏：`tab-*` + `tab-*-on` 成对使用；底栏高度 62px，图标显示 25px。
- 首页天空头：`sky-bg`，状态栏底色取 `#BEEBFF`。
- 分享兜底：`share-brand`；正式版可在 Canvas 上叠加文章标题。
- 正式接入时把 `banner-1.jpg` 改为远程/插件配置，可再释放约 114KB 预算。

## 禁止

- 不要用 emoji 替代图标。
- 不要给插画加渐变、发光、3D 阴影。
- 不要把插画拉伸到非等比尺寸；按 `contain` 使用。
- 不要直接在插画上叠文字；文字放在白卡或纯色块上。
