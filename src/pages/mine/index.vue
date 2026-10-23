<template>
  <view class="mine zz-page">
    <view class="profile" :style="{ paddingTop: statusBarHeight + 'px' }">
      <image class="profile-bg" src="/static/img/banner-1.jpg" mode="aspectFill" />
      <view class="profile-info">
        <button v-if="logged" class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <zz-avatar :size="128" :url="user.avatarUrl" :name="dispName" />
        </button>
        <view v-else class="avatar-btn" @tap="onEditTap">
          <view class="avatar-guest">
            <t-icon name="user" size="56rpx" color="#ffffff" />
          </view>
        </view>

        <view class="profile-text">
          <view class="name-row">
            <input
              v-if="editingNick"
              class="nick-input"
              type="nickname"
              :value="user.nickname || ''"
              placeholder="填写昵称"
              @blur="saveNick"
              @confirm="saveNick"
            />
            <text v-else class="profile-name" @tap="onEditTap">{{ dispName }}</text>
          </view>

          <text class="profile-handle">
            {{ logged ? '纸鱼号：' + openidTail : (loginOn ? '登录后把喜欢的内容留在鱼塘里' : '游客模式：浏览全站文章与微语') }}
          </text>

          <button v-if="loginOn && !logged" class="login-btn" :class="{ dis: logging }" @tap="doLogin">
            {{ logging ? '登录中…' : '微信一键登录' }}
          </button>
          <view v-else-if="logged" class="edit-pill" hover-class="zz-press-op" :hover-stay-time="60" @tap="startEditNick">
            <t-icon name="edit" size="22rpx" color="#222831" />
            <text>编辑资料</text>
          </view>
        </view>
      </view>

      <view class="profile-stats">
        <view class="pstat">
          <text class="pnum">{{ fmtNum(stats.comments) }}</text>
          <text class="plabel">评论</text>
        </view>
        <view class="pstat">
          <text class="pnum">{{ fmtNum(stats.likes) }}</text>
          <text class="plabel">点赞</text>
        </view>
        <view class="pstat">
          <text class="pnum">{{ fmtNum(stats.favorites) }}</text>
          <text class="plabel">收藏</text>
        </view>
      </view>
    </view>

    <view class="service-row">
      <view class="service" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/settings/about')">
        <view class="service-icon is-orange"><t-icon name="book" size="32rpx" color="#f37b1d" /></view>
        <view class="service-text">
          <text class="service-title">关于纸鱼</text>
          <text class="service-sub">站点与作者</text>
        </view>
      </view>
      <view class="service" hover-class="zz-press-op" :hover-stay-time="60" @tap="copyIssues">
        <view class="service-icon is-blue"><t-icon name="chat" size="32rpx" color="#0081ff" /></view>
        <view class="service-text">
          <text class="service-title">问题反馈</text>
          <text class="service-sub">GitHub Issues</text>
        </view>
      </view>
    </view>

    <view class="mine-grid">
      <view class="grid-item" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/mine/favorites')">
        <t-icon name="star" size="38rpx" color="#e8b96a" />
        <text>我的收藏</text>
      </view>
      <view class="grid-item" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/mine/history')">
        <t-icon name="time" size="38rpx" color="#2fa8e8" />
        <text>浏览历史</text>
      </view>
      <view class="grid-item" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/mine/comments')">
        <t-icon name="chat" size="38rpx" color="#39b54a" />
        <text>我的评论</text>
      </view>
      <view class="grid-item" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/settings/index')">
        <t-icon name="setting" size="38rpx" color="#6739b6" />
        <text>设置</text>
      </view>
    </view>

    <view class="mine-list">
      <view class="list-row" hover-class="zz-press-op" :hover-stay-time="60" @tap="copyRepo">
        <t-icon name="code" size="32rpx" color="#8794a0" />
        <text class="list-label">项目开源地址</text>
        <text class="list-note">GitHub</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
      <view class="list-row" hover-class="zz-press-op" :hover-stay-time="60" @tap="clearCache">
        <t-icon name="delete" size="32rpx" color="#8794a0" />
        <text class="list-label">清除缓存</text>
        <text class="list-note">{{ cacheTip }}</text>
        <t-icon name="chevron-right" size="26rpx" color="#c2cad2" />
      </view>
      <view class="list-row last">
        <t-icon name="info-circle" size="32rpx" color="#8794a0" />
        <text class="list-label">当前版本</text>
        <text class="list-note">v{{ APP_VERSION }}</text>
      </view>
    </view>

    <view class="quote-card">
      <image class="quote-icon" src="/static/illus/tab-mine-on.png" mode="aspectFit" />
      <text class="quote-text">记录不是为了被看见，是为了不忘记。</text>
      <text class="quote-by">纸鱼 · 2026</text>
    </view>

    <zz-tabbar active="mine" />
    <zz-login-sheet @done="onLoggedIn" />
  </view>
</template>

<script setup>
// 我的：照片头图（数据并入头部）+ 服务卡 + 四宫格 + 列表 + 引用卡。
// 登录/昵称/头像/审计模式逻辑保持不变。
import { ref, computed } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { state, feat, auditMode, isLoggedIn, displayName } from '@/common/store.js'
import { me, login, saveProfile, uploadAvatar, toast } from '@/common/request.js'
import { fmtNum } from '@/common/format.js'
import { REPO_URL, APP_VERSION } from '@/common/config.js'
import { cacheSize, clearViews, clearSearch } from '@/common/history.js'
import { STATUS_BAR_HEIGHT } from '@/common/ui.js'

const statusBarHeight = STATUS_BAR_HEIGHT
const editingNick = ref(false)
const logging = ref(false)
const cacheChars = ref(0)

const logged = computed(() => isLoggedIn())
const loginOn = computed(() => feat('login') && !auditMode())
const user = computed(() => state.user || {})
const stats = computed(() => state.stats || { comments: 0, likes: 0, favorites: 0 })
const dispName = computed(() => (logged.value ? displayName() : '游客'))
const openidTail = computed(() => String(user.value.openid || '').slice(-6))
const cacheTip = computed(() => {
  const n = cacheChars.value
  return n < 1024 ? n + ' B' : Math.max(1, Math.round(n / 1024)) + ' KB'
})

async function refresh() {
  cacheChars.value = cacheSize()
  if (!logged.value || !loginOn.value) return
  try { await me() } catch (e) { /* 游客可用，静默 */ }
}

function onEditTap() {
  if (!logged.value) {
    if (loginOn.value) doLogin()
    return
  }
  startEditNick()
}
function startEditNick() {
  if (!logged.value) { onEditTap(); return }
  editingNick.value = true
}
async function saveNick(e) {
  editingNick.value = false
  const nick = String((e && e.detail && e.detail.value) || '').trim()
  if (!nick || nick === (user.value.nickname || '')) return
  try {
    await saveProfile(nick)
    toast('昵称已更新')
  } catch (err) { toast(err.message || '更新失败') }
}

async function onChooseAvatar(e) {
  const url = e && e.detail && e.detail.avatarUrl
  if (!url || !logged.value) return
  try {
    await uploadAvatar(url)
    toast('头像已更新')
  } catch (err) { toast(err.message || '头像上传失败') }
}

async function doLogin() {
  if (logging.value || !loginOn.value) return
  logging.value = true
  try {
    await login()
    await me()
    toast('欢迎回来')
  } catch (e) { toast(e.message || '登录失败') } finally {
    logging.value = false
  }
}
function onLoggedIn() { refresh() }

function go(u) { uni.navigateTo({ url: u }) }
function copyRepo() {
  uni.setClipboardData({ data: REPO_URL, success: () => toast('开源地址已复制，浏览器打开即可访问') })
}
function copyIssues() {
  uni.setClipboardData({ data: REPO_URL + '/issues', success: () => toast('反馈地址已复制') })
}
function clearCache() {
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

onShow(refresh)

onShareAppMessage(() => {
  const neutral = auditMode()
  return {
    title: neutral ? (state.site.name || '纸鱼博客') : `${state.site.name || '纸鱼博客'} · 记录与分享`,
    path: '/pages/index/index',
    imageUrl: '/static/illus/share-brand.png',
  }
})
</script>

<style scoped>
.profile {
  position: relative;
  min-height: 540rpx;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #1b2836;
  color: #ffffff;
  overflow: hidden;
}

.profile-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.profile::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(12, 24, 38, .48);
}

.profile-info {
  position: relative;
  z-index: 2;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.profile-stats {
  position: relative;
  z-index: 2;
  display: flex;
  margin-top: 20rpx;
  padding: 16rpx 24rpx 20rpx;
  background: rgba(12, 24, 38, .34);
  border-top: 1rpx solid rgba(255, 255, 255, .18);
}

.pstat {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.pstat + .pstat::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4rpx;
  bottom: 4rpx;
  width: 1rpx;
  background: rgba(255, 255, 255, .18);
}

.pnum {
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.1;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.plabel {
  font-size: 20rpx;
  color: rgba(255, 255, 255, .72);
}

.avatar-btn {
  width: 132rpx;
  height: 132rpx;
  flex: none;
  padding: 0;
  margin: 0;
  border: 4rpx solid rgba(255, 255, 255, .9);
  border-radius: 50%;
  background: transparent;
  line-height: 1;
  overflow: hidden;
}

.avatar-btn::after { border: none; }

.avatar-guest {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--zz-brand);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-text {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.profile-name {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
}

.nick-input {
  width: 300rpx;
  height: 56rpx;
  padding: 0 12rpx;
  border-radius: 10rpx;
  background: rgba(255, 255, 255, .92);
  color: var(--zz-ink);
  font-size: 28rpx;
  font-weight: 600;
}

.profile-handle {
  display: block;
  margin-top: 6rpx;
  font-size: 19rpx;
  line-height: 1.5;
  color: rgba(255, 255, 255, .76);
}

.login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 12rpx 0 0 0;
  padding: 8rpx 22rpx;
  border: 0;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, .92);
  color: #222831;
  font-size: 19rpx;
  font-weight: 600;
  line-height: 1.2;
}

.login-btn::after { border: none; }

.login-btn.dis { opacity: .6; }

.edit-pill {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 12rpx;
  padding: 7rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, .92);
  color: #222831;
  font-size: 18rpx;
  font-weight: 600;
}

.service-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
  margin: 20rpx 24rpx 0;
}

.service {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 18rpx;
  border-radius: var(--zz-radius);
  background: var(--zz-card);
  box-shadow: var(--zz-shadow);
}

.service-icon {
  width: 60rpx;
  height: 60rpx;
  flex: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-icon.is-orange { background: var(--zz-orange-soft); }
.service-icon.is-blue { background: #cce6ff; }

.service-text { min-width: 0; }

.service-title {
  display: block;
  font-size: 23rpx;
  font-weight: 500;
  line-height: 1.2;
  color: var(--zz-ink);
}

.service-sub {
  display: block;
  margin-top: 3rpx;
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.mine-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 20rpx 24rpx 0;
  padding: 20rpx 6rpx 16rpx;
  border-radius: var(--zz-radius);
  background: var(--zz-card);
  box-shadow: var(--zz-shadow);
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: var(--zz-ink-2);
}

.mine-list {
  margin: 20rpx 24rpx 0;
  border-radius: var(--zz-radius);
  background: var(--zz-card);
  box-shadow: var(--zz-shadow);
  overflow: hidden;
}

.list-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: 86rpx;
  padding: 0 22rpx;
  border-bottom: 1rpx solid var(--zz-line);
}

.list-row.last { border-bottom: none; }

.list-label {
  flex: 1;
  min-width: 0;
  font-size: 23rpx;
  color: var(--zz-ink);
}

.list-note {
  font-size: 18rpx;
  color: var(--zz-ink-3);
}

.quote-card {
  margin: 20rpx 24rpx 0;
  padding: 22rpx 24rpx;
  border-radius: var(--zz-radius);
  background: #eaf8ff;
}

.quote-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
}

.quote-text {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  line-height: 1.6;
  font-weight: 500;
  color: #2f6b8a;
}

.quote-by {
  display: block;
  margin-top: 6rpx;
  font-size: 18rpx;
  color: #7c9aaf;
}
</style>
