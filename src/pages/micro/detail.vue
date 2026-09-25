<template>
  <view class="mdet">
    <view v-if="item" class="wrap">
      <zz-micro-item :item="item" flat />
      <view class="hint">微语来自本站时间流，随想随记</view>
      <view class="more-btn" hover-class="zz-press-op" :hover-stay-time="60" @tap="goFeed">浏览更多微语</view>
    </view>
    <view v-else-if="loading" class="wrap hint">正在找回这条微语…</view>
    <view v-else class="pad">
      <t-empty description="内容不存在或已删除" icon="error-circle" />
      <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="goFeed">
        <t-icon name="time" size="28rpx" color="#0052d9" />
        <text class="retry-txt">去时间流看看</text>
      </view>
    </view>

    <zz-login-sheet />
  </view>
</template>

<script setup>
// 微语详情：插件暂无按 id 取单条的端点，整条数据由列表页写入
// zz_micro_current 带过来；找不到时按时间流分页兜底扫描（分享进入 / 缓存被清理），仍无则空态。
import { ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { K } from '@/common/config.js'
import { state, auditMode } from '@/common/store.js'
import { micro } from '@/common/request.js'

const item = ref(null)
const loading = ref(true)

function readCurrent(id) {
  try {
    const raw = uni.getStorageSync(K.MICRO)
    if (!raw) return null
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    return obj && String(obj.id) === String(id) ? obj : null
  } catch (e) { return null }
}

async function scan(id) {
  // 兜底：从时间流前 10 页里找
  for (let p = 1; p <= 10; p++) {
    try {
      const r = await micro(p)
      const hit = (r.items || []).find((m) => String(m.id) === String(id))
      if (hit) { item.value = hit; return }
      if ((r.items || []).length < 10) break
    } catch (e) { break }
  }
}

function goFeed() { uni.reLaunch({ url: '/pages/micro/index' }) }

onLoad(async (q) => {
  const id = String(q.id || '')
  if (id) item.value = readCurrent(id)
  if (id && !item.value) await scan(id)
  loading.value = false
})

onShareAppMessage(() => {
  if (auditMode()) return { title: state.site.name || '纸鱼博客', path: '/pages/index/index' }
  const text = item.value ? String(item.value.content || '').replace(/[#>*`\s]+/g, ' ').slice(0, 24) : ''
  return {
    title: text || state.site.name || '纸鱼博客',
    path: '/pages/micro/detail?id=' + encodeURIComponent(String((item.value && item.value.id) || '')),
    imageUrl: '/static/img/share-fallback.png',
  }
})
</script>

<style scoped>
.wrap { padding: 28rpx 32rpx 0; display: flex; flex-direction: column; gap: 28rpx; }
.hint { text-align: center; font-size: 24rpx; color: var(--zz-ink-3); }
.more-btn {
  align-self: center; font-size: 24rpx; font-weight: 600; color: var(--zz-brand);
  padding: 12rpx 36rpx; line-height: 1.2; margin-bottom: 48rpx;
}
.pad { padding: 48rpx 32rpx 0; }
.retry {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
  margin-top: 24rpx; padding: 14rpx 0; line-height: 1;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
</style>
