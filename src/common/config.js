// 站点与运行时常量。BASE_URL 指向纸鱼博客站点根（含插件的 /mp/* 路由）。
// 开发环境：php -S 127.0.0.1:8123 router.php；发布前改为 https 正式域名。
export const BASE_URL = 'https://ty.waikanl.cn'

// 小程序自身版本（与仓库 tag 对齐，展示在「设置 → 当前版本」）
export const APP_VERSION = '1.0'

// 开源仓库地址（设置页「项目开源地址」用，H5 里可跳转，小程序内复制提示）
export const REPO_URL = 'https://github.com/shuyu0301/pafish-mp'

// storage keys
export const K = {
  TOKEN: 'zz_token',
  TOKEN_EXP: 'zz_token_exp', // 过期时间戳（ms）
  USER: 'zz_user',           // {openid, nickname, avatarUrl}
  CONFIG: 'zz_config',       // /mp/config 快照 {features, site, csrf?...}
  HISTORY: 'zz_history',     // 浏览历史（本地）
  SEARCH: 'zz_search_hist',  // 搜索历史（本地）
  MICRO: 'zz_micro_current', // 微语详情整条传递（插件暂无按 id 端点）
}

export const HISTORY_LIMIT = 100
export const SEARCH_LIMIT = 20
