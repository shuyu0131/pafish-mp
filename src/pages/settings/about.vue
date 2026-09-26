<template>
  <view class="about">
    <!-- 站点身份卡：logo 用内置品牌标（本地打包深底白 P，与官网 SVG 同风格，不依赖远端 favicon） -->
    <zz-card pad="36rpx 32rpx" r="0" class="hero">
      <view class="idrow">
        <image class="mark" src="/static/img/logo.png" mode="aspectFill" />
        <view class="idc">
          <text class="word">{{ siteName }}</text>
          <text v-if="site.subtitle" class="sub">{{ site.subtitle }}</text>
        </view>
      </view>
      <text v-if="site.description" class="desc">{{ site.description }}</text>
    </zz-card>

    <view class="grp"><text class="grp-t">内容</text></view>
    <zz-card pad="0" r="0" class="rows">
      <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/index/index')">
        <t-icon name="book" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">全部文章</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/micro/index')">
        <t-icon name="chat" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">微语时间流</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view class="mi last" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/search/index')">
        <t-icon name="search" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">搜索文章</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
    </zz-card>

    <view class="grp"><text class="grp-t">订阅</text></view>
    <zz-card pad="0" r="0" class="rows">
      <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="copy(rssUrl, 'RSS 地址已复制，粘贴到阅读器即可订阅')">
        <t-icon name="rss" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">RSS 订阅</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view v-if="site.url" class="mi last" hover-class="zz-press" :hover-stay-time="60" @tap="copy(site.url, '站点地址已复制，浏览器打开即可访问')">
        <t-icon name="earth" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">站点地址</text>
        <text class="tip">{{ shortUrl }}</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
    </zz-card>

    <view class="grp"><text class="grp-t">版本</text></view>
    <zz-card pad="0" r="0" class="rows">
      <view class="mi">
        <t-icon name="mobile" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">小程序版本</text>
        <text class="tip">v{{ APP_VERSION }}</text>
      </view>
      <view class="mi last">
        <t-icon name="app" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">接口插件</text>
        <text class="tip">{{ pluginVersion ? 'wechat_mp v' + pluginVersion : '—' }}</text>
      </view>
    </zz-card>

    <view class="grp"><text class="grp-t">相关链接</text></view>
    <zz-card pad="0" r="0" class="rows">
      <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="copy(REPO_URL, '开源地址已复制')">
        <t-icon name="code" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">开源仓库</text>
        <text class="tip">GitHub</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view class="mi last" hover-class="zz-press" :hover-stay-time="60" @tap="copy(REPO_URL + '/issues', '反馈地址已复制')">
        <t-icon name="help-circle" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">问题反馈</text>
        <text class="tip">GitHub Issues</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
    </zz-card>

    <text class="foot">本站由纸鱼博客驱动</text>
    <view class="page-bottom" />
  </view>
</template>

<script setup>
// 关于页：博客场景导航 —— 内容入口、RSS 订阅、版本与项目链接。
// 插件版本读 /mp/config 的 version 字段（store.applyConfig 不留存，本页单独取一次）。
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { state } from '@/common/store.js'
import { config, toast } from '@/common/request.js'
import { APP_VERSION, REPO_URL, BASE_URL } from '@/common/config.js'

const pluginVersion = ref('')

const site = computed(() => state.site || {})
const siteName = computed(() => site.value.name || '纸鱼博客')
const shortUrl = computed(() => String(site.value.url || '').replace(/^https?:\/\//, ''))
// 站点 RSS：/rss.xml（站点地址若缺失则退回接口域名）
const rssUrl = computed(() => {
  const base = String(site.value.url || BASE_URL).replace(/\/+$/, '')
  return base + '/rss.xml'
})

onLoad(async () => {
  try {
    const body = await config()
    pluginVersion.value = body && body.version ? String(body.version) : ''
  } catch (e) { /* 网络失败时版本行显示占位符 */ }
})

function copy(data, tip) {
  uni.setClipboardData({ data: String(data), success: () => toast(tip) })
}
function go(u) { uni.reLaunch({ url: u }) }
</script>

<style scoped>
.hero { margin: 0; }
.idrow { display: flex; align-items: center; gap: 24rpx; }
.mark {
  width: 96rpx; height: 96rpx; border-radius: 12rpx;
  flex: none;
}
.idc { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
.word { font-size: 34rpx; font-weight: 600; color: var(--zz-ink); }
.sub { font-size: 24rpx; color: var(--zz-ink-3); }
.desc {
  display: block; font-size: 24rpx; color: var(--zz-ink-2); line-height: 1.7;
  margin-top: 24rpx;
}

.grp { padding: 32rpx 32rpx 0; }
.grp-t { display: block; font-size: 28rpx; font-weight: 600; color: var(--zz-ink); margin: 0 4rpx 16rpx; }

.rows { margin: 0; }
.mi {
  display: flex; align-items: center; gap: 22rpx;
  padding: 28rpx 32rpx; border-bottom: 1rpx solid var(--zz-line);
}
.mi.last { border-bottom: none; }
.lb { flex: 1; min-width: 0; font-size: 28rpx; color: var(--zz-ink); }
.tip { font-size: 22rpx; color: var(--zz-ink-3); max-width: 320rpx; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.foot { display: block; text-align: center; font-size: 22rpx; color: var(--zz-ink-3); margin-top: 48rpx; }
.page-bottom { height: calc(env(safe-area-inset-bottom) + 48rpx); }
</style>
