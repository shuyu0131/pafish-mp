# pafish-mp

纸鱼博客（pafish）的开源微信小程序前端：**uni-app + Vue3 + vite + [TDesign uni-app](https://tdesign.tencent.com/uniapp/overview)**，界面以 TDesign 原生样式为主，配套服务端插件 [`wechat_mp`](https://github.com/shuyu0301/pafish-php) 提供 `/mp/*` 接口。

> 本仓库不包含任何服务端密钥。小程序只持有接口地址与用户自己的登录 token；微信 `AppSecret`、pafish `/api/v1` 的 `X-API-Key` 全部留在插件服务端。

## 界面

直接使用 TDesign 默认视觉：品牌蓝主色、系统原生导航栏（`pages.json` 按页配置标题）、`t-tab-bar` 底部导航、`t-search` / `t-empty` / `t-skeleton` / `t-icon` 等原生组件。

## 功能

| 页面 | 说明 |
| --- | --- |
| 首页 | 文章信息流、置顶标记、分类筛选、下拉刷新与分页加载 |
| 文章详情 | 正文 rich-text 渲染（内联排版样式）、浏览量、点赞 / 收藏、评论列表与发表 |
| 微语 | 时间流卡片、图片九宫格预览、点赞与修改标记、单条分享（对应插件 `/mp/micro-like`） |
| 搜索 | 站内文章搜索 + 本地搜索历史（可在插件侧关闭） |
| 我的 | 微信头像昵称填写授权登录、我的评论 / 收藏、浏览历史 |
| 设置 / 关于 | 账号入口、清除缓存、站点与版本信息、退出登录 |
| 分类 / 标签 | 走首页筛选与文章行内标签，不占用一级导航 |

## 审核合规设计

个人小程序类目对评论、点赞、第三方登录等互动功能有审核限制，本项目按"**功能可以存在，也可以随时关掉过审**"实现：

- 插件端有一个 `audit_mode` 总开关。开启后 `/mp/config` 返回 `features.login / comment / like / favorite = false`，同时 **服务端对相应 POST 接口直接 403**——前端隐藏 + 服务端拦截双保险，抓包也绕不过。
- 微语浏览、文章浏览、搜索不受总开关影响，保证审核期间小程序仍有完整可读内容。
- 前端所有互动入口按 `feat()` / `auditMode()` 逐页门控；分享卡片在审核模式下退化为通用首页卡片。

## 快速开始

```bash
npm install
```

1. 修改 `src/common/config.js` 中的 `BASE_URL` 为你的站点地址（需 https 且在小程序后台配置 request 合法域名；本地联调用 `http://127.0.0.1:8123` 并勾选"不校验合法域名"）。
2. 编译：

```bash
npm run build:mp-weixin   # 产物在 dist/build/mp-weixin
```

3. 微信开发者工具导入 `dist/build/mp-weixin`，填入自己的小程序 AppID。

## 配套插件

服务端需要在 pafish 后台启用 `wechat_mp` 插件，并在插件设置页填写：

- 小程序 `AppID` / `AppSecret`（仅存服务端，用于 `/mp/login` 换取 openid）
- 功能开关：审核模式、登录、评论、点赞、收藏、微语、搜索、每页条数

插件启用后 `/mp/*` 接口自动注册，无需其他配置。接口约定：

- 读接口（`GET /mp/config`、`/mp/posts`、`/mp/micro` …）游客可直接访问；
- 互动接口需 `X-MP-Token` 请求头（`/mp/login` 返回的 token）+ 表单 `_csrf`（`/mp/config` 返回，会话级校验）。

## 技术栈

- uni-app 3.x / Vue 3 / vite / `@tdesign/uniapp`（easycom `t-*`）
- 状态与网络层自写在 `src/common/`（config / request / store / format / theme / history / mdcss）
- 业务组件 easycom `zz-*`（卡片、文章行、微语卡、头像、底栏、登录弹层），无原生 tabBar，底栏用 `t-tab-bar` + `uni.reLaunch` 切换

## 许可

MIT
