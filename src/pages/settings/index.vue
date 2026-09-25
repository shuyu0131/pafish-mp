<template>
  <view class="set">
    <view v-if="loginOn" class="sec">
      <text class="grp">账号</text>
      <zz-card pad="0">
        <view class="mi last" hover-class="zz-press" :hover-stay-time="60" @tap="accountTap">
          <text class="lb">微信账号</text>
          <text class="tip">{{ accountTip }}</text>
          <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
        </view>
      </zz-card>
    </view>

    <view class="sec">
      <text class="grp">通用</text>
      <zz-card pad="0">
        <view class="mi last" hover-class="zz-press" :hover-stay-time="60" @tap="doClearCache">
          <text class="lb">清除缓存</text>
          <text class="tip">{{ cacheTip }}</text>
          <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
        </view>
      </zz-card>
    </view>

    <view class="sec">
      <text class="grp">关于</text>
      <zz-card pad="0">
        <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/settings/about')">
          <text class="lb">关于纸鱼博客</text>
          <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
        </view>
        <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="copyRepo">
          <text class="lb">项目开源地址</text>
          <text class="tip">GitHub</text>
          <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
        </view>
        <view class="mi last">
          <text class="lb">当前版本</text>
          <text class="tip">v{{ APP_VERSION }}</text>
        </view>
      </zz-card>
    </view>

    <view v-if="logged" class="logout" hover-class="zz-press-op" :hover-stay-time="60" @tap="doLogout">退出登录</view>

    <view class="page-bottom" />
    <zz-login-sheet />
  </view>
</template>

<script setup>
// 设置：账号入口（登录关闭时整组隐藏）、本地缓存清理、关于与退出。
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { feat, auditMode, isLoggedIn, displayName, openLoginSheet, clearAuth } from '@/common/store.js'
import { toast } from '@/common/request.js'
import { cacheSize, clearViews, clearSearch } from '@/common/history.js'
import { APP_VERSION, REPO_URL } from '@/common/config.js'

const cacheChars = ref(0)

const loginOn = computed(() => feat('login') && !auditMode())
const logged = computed(() => isLoggedIn())
const accountTip = computed(() => (logged.value ? displayName() : '未登录'))
const cacheTip = computed(() => {
  const n = cacheChars.value
  return n < 1024 ? n + ' B' : Math.max(1, Math.round(n / 1024)) + ' KB'
})

function accountTap() {
  if (logged.value) {
    uni.reLaunch({ url: '/pages/mine/index' })
    return
  }
  openLoginSheet()
}

function doClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '将清空本机浏览历史与搜索历史，不影响账号与服务器数据。',
    confirmText: '清除',
    confirmColor: '#d54941',
    success: (r) => {
      if (!r.confirm) return
      clearViews()
      clearSearch()
      cacheChars.value = cacheSize()
      toast('缓存已清除')
    },
  })
}

function copyRepo() {
  uni.setClipboardData({ data: REPO_URL, success: () => toast('开源地址已复制') })
}

function doLogout() {
  uni.showModal({
    title: '退出登录',
    content: '退出后无法评论、点赞与收藏，本地历史仍保留。',
    confirmText: '退出',
    confirmColor: '#d54941',
    success: (r) => {
      if (r.confirm) {
        clearAuth()
        toast('已退出登录')
      }
    },
  })
}

function go(u) { uni.navigateTo({ url: u }) }

onShow(() => { cacheChars.value = cacheSize() })
</script>

<style scoped>
.sec { padding: 24rpx 32rpx 0; }
.grp {
  display: block; font-size: 28rpx; font-weight: 600; color: var(--zz-ink);
  margin: 0 4rpx 16rpx;
}
.mi {
  display: flex; align-items: center; gap: 16rpx;
  padding: 28rpx; border-bottom: 1rpx solid var(--zz-line);
}
.mi.last { border-bottom: none; }
.lb { flex: 1; min-width: 0; font-size: 28rpx; font-weight: 400; color: var(--zz-ink); }
.tip { font-size: 22rpx; color: var(--zz-ink-3); max-width: 320rpx; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.logout {
  margin: 40rpx 32rpx 0; background: var(--zz-card);
  border-radius: 18rpx;
  padding: 28rpx 0; text-align: center; font-size: 28rpx; font-weight: 600;
  color: #d54941;
}
.page-bottom { height: calc(env(safe-area-inset-bottom) + 48rpx); }
</style>
