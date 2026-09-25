<template>
  <view class="mpage">
    <view v-if="feat('search')" class="srow" @tap="goSearch">
      <!-- 只读搜索入口：t-search 样式隔离穿不透，静态入口直接用原生 view 绘制，观感对齐 t-search -->
      <view class="search-fake" hover-class="zz-press" :hover-stay-time="60">
        <t-icon name="search" size="40rpx" color="rgba(0,0,0,0.26)" />
        <text class="search-ph">搜索文章</text>
      </view>
    </view>

    <view v-if="!feat('micro')" class="pad">
      <t-empty description="微语功能已关闭" icon="info-circle" />
    </view>

    <view v-else class="mflow">
      <view v-if="err && !list.length" class="pad">
        <t-empty :description="err" icon="search" />
        <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="reload">
          <t-icon name="refresh" size="28rpx" color="#0052d9" />
          <text class="retry-txt">重新加载</text>
        </view>
      </view>
      <template v-else>
        <view v-for="m in list" :key="m.id" class="flow-item">
          <zz-micro-item :item="m" />
        </view>
        <t-empty v-if="!list.length && !loading" description="今天还没有新微语" icon="chat" />
        <view v-if="list.length" class="more">
          <text v-if="loading">正在加载更多…</text>
          <text v-else-if="noMore">· 到底啦 ·</text>
        </view>
      </template>
    </view>

    <zz-tabbar active="micro" />
    <zz-login-sheet />
  </view>
</template>

<script setup>
// 微语时间流：单列卡片流，点赞在卡内完成（zz-micro-item 自理）。
// 整个 Tab 由 features.micro 远程隐藏；本页直达时兜底显示「功能已关闭」。
import { ref, computed } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'
import { state, feat, auditMode } from '@/common/store.js'
import { micro } from '@/common/request.js'

const list = ref([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const err = ref('')

const noMore = computed(() => page.value >= totalPages.value)

async function fetchPage(reset) {
  if (loading.value) return
  loading.value = true
  if (reset) { err.value = ''; page.value = 1 }
  try {
    const r = await micro(page.value)
    const items = r.items || []
    list.value = reset ? items : list.value.concat(items)
    totalPages.value = r.totalPages || (items.length < 10 ? page.value : page.value + 1)
    err.value = ''
  } catch (e) {
    err.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function reload() { list.value = []; fetchPage(true) }

function goSearch() { uni.navigateTo({ url: '/pages/search/index' }) }

let inited = false
onShow(() => {
  if (inited || !feat('micro')) return
  inited = true
  fetchPage(true)
})

onReachBottom(() => {
  if (loading.value || noMore.value || !feat('micro')) return
  page.value += 1
  fetchPage(false)
})

onPullDownRefresh(async () => {
  if (feat('micro')) await fetchPage(true)
  uni.stopPullDownRefresh()
})

onShareAppMessage((res) => {
  // 卡片上的分享按钮：带 data-id 时直达该条微语详情；审核模式退回中性首页
  if (auditMode()) return { title: state.site.name || '纸鱼博客', path: '/pages/index/index' }
  const id = res && res.from === 'button' && res.target && res.target.dataset.id
  if (id) {
    const hit = list.value.find((m) => String(m.id) === String(id))
    const text = hit ? String(hit.content || '').replace(/[#>*`\s]+/g, ' ').slice(0, 24) : ''
    return { title: text || state.site.name || '纸鱼博客', path: '/pages/micro/detail?id=' + encodeURIComponent(id), imageUrl: '/static/img/share-fallback.png' }
  }
  return { title: state.site.name || '纸鱼博客', path: '/pages/micro/index', imageUrl: '/static/img/share-fallback.png' }
})
</script>

<style scoped>
.srow { padding: 8rpx 0 4rpx; }

.mflow { padding: 8rpx 32rpx 0; }
.flow-item { margin-bottom: 24rpx; }
.pad { padding: 48rpx 32rpx 0; }
.retry {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
  margin-top: 24rpx; padding: 14rpx 0; line-height: 1;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
.more { text-align: center; padding: 8rpx 0 16rpx; }
.more text { font-size: 24rpx; color: var(--zz-ink-3); }
.search-fake {
  display: flex; align-items: center; gap: 12rpx;
  height: 80rpx; padding: 0 24rpx;
  background: var(--zz-card);
  border: 2rpx solid var(--zz-line);
  border-radius: 12rpx;
}
.search-ph { font-size: 28rpx; color: var(--zz-ink-3); }
</style>
