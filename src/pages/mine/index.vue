<template>
  <view class="mine">
    <!-- 身份卡 -->
    <zz-card pad="32rpx" class="idcard">
      <block v-if="logged">
        <view class="idrow">
          <!-- 微信头像昵称填写能力：chooseAvatar + type=nickname，绝不用 getUserProfile -->
          <button class="avabtn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <zz-avatar :size="116" :url="user.avatarUrl" :name="dispName" />
          </button>
          <view class="idc">
            <view class="nrow">
              <input
                v-if="editingNick" class="nick-ipt" type="nickname" :value="user.nickname || ''"
                placeholder="填写昵称" @blur="saveNick" @confirm="saveNick"
              />
              <text v-else class="nick" @tap="startEditNick">{{ dispName }}</text>
              <text v-if="!editingNick" class="badge" @tap="startEditNick">改昵称</text>
            </view>
            <text class="uid">纸鱼号：{{ openidTail }}</text>
          </view>
        </view>
      </block>
      <block v-else-if="loginOn">
        <view class="hi">
          <view class="hi-mark">
            <t-icon name="user" size="52rpx" color="#8b8b8b" />
          </view>
          <view class="hic">
            <text class="hit">Hi，来做第一条评论吧</text>
            <text class="hisub">登录后可评论、点赞与收藏</text>
          </view>
        </view>
        <view class="wxbtn" :class="{ dis: logging }" hover-class="zz-press-op" :hover-stay-time="60" @tap="doLogin">{{ logging ? '登录中…' : '微信一键登录' }}</view>
      </block>
      <block v-else>
        <view class="hi">
          <view class="hi-mark">
            <t-icon name="user" size="52rpx" color="#8b8b8b" />
          </view>
          <view class="hic">
            <text class="hit">{{ brand }}</text>
            <text class="hisub">游客模式：浏览全站文章与微语</text>
          </view>
        </view>
      </block>
    </zz-card>

    <!-- 统计卡（登录且功能开启时）。点赞数没有对应页面，只作展示不可点 -->
    <zz-card v-if="logged && loginOn" pad="30rpx 0" class="statcard">
      <view class="st" v-if="showCmt" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/mine/comments')">
        <text class="sv">{{ fmtNum(stats.comments) }}</text><text class="sl">评论</text>
      </view>
      <view class="st" v-if="showLike">
        <text class="sv">{{ fmtNum(stats.likes) }}</text><text class="sl">点赞</text>
      </view>
      <view class="st" v-if="showFav" hover-class="zz-press-op" :hover-stay-time="60" @tap="go('/pages/mine/favorites')">
        <text class="sv">{{ fmtNum(stats.favorites) }}</text><text class="sl">收藏</text>
      </view>
    </zz-card>

    <!-- 菜单 -->
    <zz-card pad="0" class="mlist">
      <view v-if="showCmt" class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/mine/comments')">
        <t-icon name="chat" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">我的评论</text><t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view v-if="showFav" class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/mine/favorites')">
        <t-icon name="star" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">我的收藏</text><t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/mine/history')">
        <t-icon name="time" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">浏览历史</text><t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view class="mi" hover-class="zz-press" :hover-stay-time="60" @tap="copyRepo">
        <t-icon name="code" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">项目开源地址</text>
        <text class="tip">GitHub</text>
        <t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
      <view class="mi last" hover-class="zz-press" :hover-stay-time="60" @tap="go('/pages/settings/index')">
        <t-icon name="setting" size="40rpx" color="rgba(0,0,0,0.6)" />
        <text class="lb">设置</text><t-icon name="chevron-right" size="32rpx" color="rgba(0,0,0,0.4)" />
      </view>
    </zz-card>

    <zz-tabbar active="mine" />
    <zz-login-sheet @done="onLoggedIn" />
  </view>
</template>

<script setup>
// 我的页：登录态、资料编辑（chooseAvatar / nickname 填写能力）、统计与入口。
// login 关闭时整体退化为游客页（仅历史 / 开源地址 / 设置），与服务端 403 一致。
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { state, feat, auditMode, isLoggedIn, displayName } from '@/common/store.js'
import { me, login, saveProfile, uploadAvatar, toast } from '@/common/request.js'
import { fmtNum } from '@/common/format.js'
import { REPO_URL } from '@/common/config.js'

const editingNick = ref(false)
const logging = ref(false)

const logged = computed(() => isLoggedIn())
const loginOn = computed(() => feat('login') && !auditMode())
const showCmt = computed(() => logged.value && feat('comment') && !auditMode())
const showLike = computed(() => logged.value && feat('like') && !auditMode())
const showFav = computed(() => logged.value && feat('favorite') && !auditMode())
const user = computed(() => state.user || {})
const stats = computed(() => state.stats || { comments: 0, likes: 0, favorites: 0 })
const dispName = computed(() => displayName())
const openidTail = computed(() => String(user.value.openid || '').slice(-6))
const brand = computed(() => state.site.name || '纸鱼博客')

async function refresh() {
  if (!logged.value || !loginOn.value) return
  try { await me() } catch (e) { /* 游客可用，静默 */ }
}

function startEditNick() { editingNick.value = true }
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
  if (!url) return
  try {
    await uploadAvatar(url)
    toast('头像已更新')
  } catch (err) { toast(err.message || '头像上传失败') }
}

async function doLogin() {
  if (logging.value) return
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
  uni.setClipboardData({
    data: REPO_URL,
    success: () => toast('开源地址已复制，浏览器打开即可访问'),
  })
}

onShow(() => {
  editingNick.value = false
  refresh()
})
</script>

<style scoped>
.mine > .zz-card { margin: 24rpx 32rpx 0; }

.idrow { display: flex; align-items: center; gap: 26rpx; }
.avabtn {
  padding: 0; margin: 0; line-height: 1; border: none; background: transparent;
  width: 116rpx; height: 116rpx; flex: none;
}
.avabtn::after { border: none; }
.idc { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10rpx; }
.nrow { display: flex; align-items: center; gap: 16rpx; }
.nick { font-size: 34rpx; font-weight: 600; color: var(--zz-ink); }
.nick-ipt {
  font-size: 32rpx; font-weight: 600; color: var(--zz-ink); width: 300rpx;
  border-bottom: 2rpx solid var(--zz-brand); padding-bottom: 4rpx;
}
.badge {
  font-size: 20rpx; color: var(--zz-brand); background: var(--zz-brand-soft);
  border-radius: 8rpx; padding: 4rpx 12rpx; line-height: 1.2; flex: none;
}
.uid { font-size: 22rpx; color: var(--zz-ink-3); }

.hi { display: flex; align-items: center; gap: 28rpx; }
.hi-mark {
  width: 104rpx; height: 104rpx; flex: none;
  background: var(--zz-block); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.hic { display: flex; flex-direction: column; gap: 8rpx; min-width: 0; }
.hit { font-size: 32rpx; font-weight: 600; color: var(--zz-ink); }
.hisub { font-size: 24rpx; color: var(--zz-ink-3); }
.wxbtn {
  margin-top: 32rpx; background: var(--zz-brand); color: #fff;
  font-size: 28rpx; font-weight: 600;
  border-radius: 12rpx; padding: 22rpx 0; text-align: center; line-height: 1.2;
}
.wxbtn.dis { opacity: 0.6; }

.statcard { display: flex; }
.st { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.sv { font-size: 34rpx; font-weight: 600; color: var(--zz-ink); line-height: 1.2; }
.sl { font-size: 22rpx; color: var(--zz-ink-3); }

.mlist { overflow: hidden; }
.mi {
  display: flex; align-items: center; gap: 22rpx; padding: 30rpx 28rpx;
  border-bottom: 1rpx solid var(--zz-line);
}
.mi.last { border-bottom: none; }
.lb { flex: 1; min-width: 0; font-size: 28rpx; font-weight: 400; color: var(--zz-ink); }
.tip { font-size: 22rpx; color: var(--zz-ink-3); margin-right: 6rpx; }
</style>
