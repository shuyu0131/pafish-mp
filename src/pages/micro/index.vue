<template>
  <view class="mpage zz-page">
    <zz-navbar title="微语" center />

    <view class="micro-wrap">
      <view v-if="!feat('micro')" class="pad">
        <zz-empty type="closed" title="微语功能已关闭" desc="该功能暂未开放" />
      </view>

      <view v-else class="mflow">
        <view v-if="err && !list.length" class="pad">
          <zz-empty type="offline" :desc="err" action-text="重新加载" @action="reload" />
        </view>

        <template v-else>
          <view v-if="firstLoading" class="sk">
            <zz-skeleton type="comment" :rows="3" />
          </view>

          <view v-else class="list">
            <view v-for="g in groups" :key="g.key" class="day-group">
              <view class="day-label">{{ g.label }}</view>
              <zz-micro-item v-for="m in g.items" :key="m.id" :item="m" />
            </view>
          </view>

          <zz-empty
            v-if="!list.length && !loading"
            type="comments"
            title="今天还没有新微语"
            desc="等站长写下第一条"
          />
          <view v-if="list.length" class="more">
            <text v-if="loading">正在加载更多…</text>
            <text v-else-if="noMore">— 今天就到这里 —</text>
          </view>
        </template>
      </view>
    </view>

    <zz-tabbar active="micro" />
    <zz-login-sheet />
  </view>
</template>

<script setup>
// 微语：白卡时间流，点赞在卡内完成；整个 Tab 由 features.micro 远程隐藏。
import { ref, computed } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'
import { state, feat, auditMode } from '@/common/store.js'
import { micro } from '@/common/request.js'
import { fmtDayLabel } from '@/common/format.js'

const list = ref([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const err = ref('')

const noMore = computed(() => page.value >= totalPages.value)
const firstLoading = computed(() => loading.value && !list.value.length)
const groups = computed(() => {
  const out = []
  for (const m of list.value) {
    const label = fmtDayLabel(m.publishedAt)
    const last = out[out.length - 1]
    if (last && last.label === label) last.items.push(m)
    else out.push({ key: label + '-' + (m.id || out.length), label, items: [m] })
  }
  return out
})

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
  // 审核模式：任何分享都退回中性首页卡片
  if (auditMode()) return { title: state.site.name || '纸鱼博客', path: '/pages/index/index' }
  const id = res && res.from === 'button' && res.target && res.target.dataset.id
  if (id) {
    const hit = list.value.find((m) => String(m.id) === String(id))
    const text = hit ? String(hit.content || '').replace(/[#>*`\s]+/g, ' ').slice(0, 24) : ''
    return { title: text || state.site.name || '纸鱼博客', path: '/pages/micro/index', imageUrl: '/static/illus/share-brand.png' }
  }
  return { title: state.site.name || '纸鱼博客', path: '/pages/micro/index', imageUrl: '/static/illus/share-brand.png' }
})
</script>

<style scoped>
.micro-wrap {
  padding: 8rpx 24rpx 20rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.day-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.day-label {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 2rpx 4rpx 0;
  font-size: 19rpx;
  color: var(--zz-ink-3);
  letter-spacing: .04em;
}

.day-label::after {
  content: "";
  flex: 1;
  height: 1rpx;
  background: var(--zz-line);
}

.pad {
  padding-top: 14rpx;
}

.sk {
  padding: 8rpx 0;
}

.more {
  padding: 20rpx 0 8rpx;
  text-align: center;
}

.more text {
  font-size: 20rpx;
  color: var(--zz-ink-3);
}
</style>
