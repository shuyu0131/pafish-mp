<template>
  <view class="about zz-page">
    <view class="hero">
      <image class="mark" src="/static/illus/tab-mine-on.png" mode="aspectFit" />
      <view class="idc">
        <text class="word">{{ siteName }}</text>
        <text v-if="site.subtitle" class="sub">{{ site.subtitle }}</text>
      </view>
      <text v-if="site.description" class="desc">{{ site.description }}</text>
    </view>

    <view class="grp"><text class="grp-t">内容</text></view>
    <zz-card pad="0">
      <view class="mi" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/index/index')">
        <t-icon name="book" size="34rpx" color="#8794a0" />
        <text class="lb">全部文章</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
      <view class="mi" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/micro/index')">
        <t-icon name="chat" size="34rpx" color="#8794a0" />
        <text class="lb">微语时间流</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
      <view class="mi last" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/search/index')">
        <t-icon name="search" size="34rpx" color="#8794a0" />
        <text class="lb">搜索文章</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
    </zz-card>

    <view class="grp"><text class="grp-t">订阅</text></view>
    <zz-card pad="0">
      <view class="mi" hover-class="zz-press-op" :hover-stay-time="60" @tap="copy(rssUrl, 'RSS 地址已复制，粘贴到阅读器即可订阅')">
        <t-icon name="rss" size="34rpx" color="#8794a0" />
        <text class="lb">RSS 订阅</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
      <view v-if="site.url" class="mi last" hover-class="zz-press-op" :hover-stay-time="60" @tap="copy(site.url, '站点地址已复制，浏览器打开即可访问')">
        <t-icon name="earth" size="34rpx" color="#8794a0" />
        <text class="lb">站点地址</text>
        <text class="tip">{{ shortUrl }}</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
    </zz-card>

    <view class="grp"><text class="grp-t">版本</text></view>
    <zz-card pad="0">
      <view class="mi">
        <t-icon name="mobile" size="34rpx" color="#8794a0" />
        <text class="lb">小程序版本</text>
        <text class="tip">v{{ APP_VERSION }}</text>
      </view>
      <view class="mi last">
        <t-icon name="app" size="34rpx" color="#8794a0" />
        <text class="lb">接口插件</text>
        <text class="tip">{{ pluginVersion ? 'wechat_mp v' + pluginVersion : '—' }}</text>
      </view>
    </zz-card>

    <view class="grp"><text class="grp-t">相关链接</text></view>
    <zz-card pad="0">
      <view class="mi" hover-class="zz-press-op" :hover-stay-time="60" @tap="copy(REPO_URL, '开源地址已复制')">
        <t-icon name="code" size="34rpx" color="#8794a0" />
        <text class="lb">开源仓库</text>
        <text class="tip">GitHub</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
      <view class="mi last" hover-class="zz-press-op" :hover-stay-time="60" @tap="copy(REPO_URL + '/issues', '反馈地址已复制')">
        <t-icon name="help-circle" size="34rpx" color="#8794a0" />
        <text class="lb">问题反馈</text>
        <text class="tip">GitHub Issues</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
    </zz-card>

    <text class="foot">本站由纸鱼博客驱动</text>
    <view class="page-bottom" />
  </view>
</template>

<script setup>
// 关于页：品牌卡 + 内容入口 + RSS + 版本与项目链接。
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { state } from '@/common/store.js'
import { config, toast } from '@/common/request.js'
import { APP_VERSION, REPO_URL, BASE_URL } from '@/common/config.js'

const pluginVersion = ref('')

const site = computed(() => state.site || {})
const siteName = computed(() => site.value.name || '纸鱼博客')
const shortUrl = computed(() => String(site.value.url || '').replace(/^https?:\/\//, ''))
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
.about {
  padding: 20rpx 24rpx;
}

.hero {
  padding: 26rpx;
  border-radius: var(--zz-radius);
  background: var(--zz-card);
  box-shadow: var(--zz-shadow);
}

.mark {
  width: 88rpx;
  height: 88rpx;
  display: block;
}

.idc {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.word {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--zz-ink);
}

.sub {
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.desc {
  display: block;
  margin-top: 16rpx;
  font-size: 21rpx;
  line-height: 1.7;
  color: var(--zz-ink-2);
}

.grp {
  padding: 24rpx 4rpx 12rpx;
}

.grp-t {
  font-size: 19rpx;
  font-weight: 500;
  color: var(--zz-ink-3);
  letter-spacing: .04em;
}

.mi {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 86rpx;
  padding: 0 22rpx;
  border-bottom: 1rpx solid var(--zz-line);
}

.mi.last { border-bottom: none; }

.lb {
  flex: 1;
  min-width: 0;
  font-size: 23rpx;
  color: var(--zz-ink);
}

.tip {
  max-width: 320rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 18rpx;
  color: var(--zz-ink-3);
}

.foot {
  display: block;
  margin-top: 32rpx;
  text-align: center;
  font-size: 18rpx;
  color: #b4bdc6;
}

.page-bottom {
  height: calc(env(safe-area-inset-bottom) + 32rpx);
}
</style>
