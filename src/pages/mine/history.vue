<template>
  <view class="hpage">
    <view v-if="hasAny" class="clr-row">
      <view class="clr" hover-class="zz-press-op" :hover-stay-time="60" @tap="clearAll">全部清空</view>
    </view>

    <block v-if="hasAny">
      <view v-for="g in groups" :key="g.name" class="sec">
        <text class="grp">{{ g.name }}</text>
        <zz-card pad="0" class="hs">
          <view v-for="(it, i) in g.items" :key="it.slug" class="hr" :class="{ last: i === g.items.length - 1 }" hover-class="zz-press" :hover-stay-time="60" @tap="openPost(it)">
            <view class="cv">
              <t-icon :name="coverStyle({ slug: it.slug }).icon" size="34rpx" :color="coverStyle({ slug: it.slug }).fg" />
            </view>
            <text class="ht">{{ it.title || it.slug }}</text>
            <text class="tm">{{ g.name === '今天' ? fmtClock(it.ts) : fmtShort(it.ts) }}</text>
            <view class="x" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="removeOne(it)">
              <t-icon name="close" size="30rpx" color="rgba(0,0,0,0.4)" />
            </view>
          </view>
        </zz-card>
      </view>
    </block>
    <view v-else class="pad">
      <t-empty description="还没有浏览记录" icon="time" />
      <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="goHome">
        <t-icon name="book" size="28rpx" color="#0052d9" />
        <text class="retry-txt">去逛逛</text>
      </view>
    </view>

    <view class="page-bottom" />
  </view>
</template>

<script setup>
// 浏览历史：仅设备本地存储（个人主体小程序，隐私友好）。按天分组，可逐条删除或清空。
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { views, removeView, clearViews } from '@/common/history.js'
import { fmtClock, fmtShort } from '@/common/format.js'
import { coverStyle } from '@/common/theme.js'

const groups = ref([])
const hasAny = computed(() => groups.value.some((g) => g.items.length))

function reload() { groups.value = views() }

function removeOne(it) {
  removeView(it.slug)
  reload()
}
function clearAll() {
  uni.showModal({
    title: '清空浏览历史',
    content: '将删除本机记录的全部浏览历史，无法恢复。',
    confirmText: '清空',
    confirmColor: '#d54941',
    success: (r) => {
      if (r.confirm) {
        clearViews()
        reload()
      }
    },
  })
}

function openPost(it) {
  uni.navigateTo({ url: '/pages/post/detail?slug=' + encodeURIComponent(it.slug) })
}
function goHome() { uni.reLaunch({ url: '/pages/index/index' }) }

onShow(reload)
</script>

<style scoped>
.clr-row { display: flex; justify-content: flex-end; padding: 24rpx 32rpx 0; }
.clr { font-size: 24rpx; color: var(--zz-ink-3); padding: 4rpx 0 4rpx 20rpx; }

.sec { padding: 16rpx 32rpx 0; }
.grp {
  display: block; font-size: 24rpx; font-weight: 600; color: var(--zz-ink-2);
  margin: 0 4rpx 16rpx;
}
.hr {
  display: flex; align-items: center; gap: 20rpx;
  padding: 24rpx 28rpx; border-bottom: 1rpx solid var(--zz-line);
}
.hr.last { border-bottom: none; }
.cv {
  width: 84rpx; height: 84rpx; border-radius: 12rpx; flex: none;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  background: var(--zz-block);
}
.ht {
  flex: 1; min-width: 0; font-size: 28rpx; font-weight: 400; color: var(--zz-ink);
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
.tm { font-size: 22rpx; color: var(--zz-ink-3); flex: none; }
.x { padding: 8rpx 12rpx; line-height: 1; flex: none; }

.pad { padding: 48rpx 32rpx 0; }
.retry {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
  margin-top: 24rpx; padding: 14rpx 0; line-height: 1;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
.page-bottom { height: calc(env(safe-area-inset-bottom) + 48rpx); }
</style>
