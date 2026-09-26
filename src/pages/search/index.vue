<template>
  <view class="spage">
    <view class="srow">
      <t-search
        v-model:value="q" shape="square" :focus="focusIpt"
        placeholder="搜索文章标题与正文" action="取消"
        t-class-input-container="search-box"
        @submit="submit" @action-click="goBack"
      />
    </view>

    <!-- 搜索关闭（审核兜底） -->
    <view v-if="!feat('search')" class="pad">
      <t-empty description="搜索功能已关闭" icon="info-circle" />
    </view>

    <!-- 发现态：热门标签 + 历史 -->
    <block v-else-if="!submitted">
      <view v-if="hot.length" class="sec">
        <zz-section-head title="热门标签" />
        <view class="hot">
          <view v-for="(t, i) in hot" :key="t.slug" class="hc" hover-class="zz-press" :hover-stay-time="60" @tap="tapChip(t.name)">
            <text v-if="i < 3" class="rank">{{ i + 1 }}</text>
            <text>{{ t.name }}</text>
          </view>
        </view>
      </view>
      <view v-if="hist.length" class="sec">
        <view class="grp-row">
          <zz-section-head title="搜索历史" class="grp-flex" />
          <view class="clr" hover-class="zz-press-op" :hover-stay-time="60" @tap="clearAll">清空</view>
        </view>
        <view class="hs">
          <view v-for="h in hist" :key="h" class="hr" hover-class="zz-press" :hover-stay-time="60" @tap="tapChip(h)">
            <t-icon name="time" size="28rpx" color="rgba(0,0,0,0.4)" />
            <text class="ht">{{ h }}</text>
            <view class="x" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="removeOne(h)">
              <t-icon name="close" size="28rpx" color="rgba(0,0,0,0.4)" />
            </view>
          </view>
        </view>
      </view>
      <view v-if="!hot.length && !hist.length" class="pad">
        <t-empty description="输入关键词，找找感兴趣的内容" icon="search" />
      </view>
    </block>

    <!-- 结果态：单栏列表 -->
    <block v-else>
      <view v-if="firstLoading" class="sk">
        <t-skeleton :row-col="skRows" :loading="true" />
      </view>
      <view v-else-if="list.length" class="feed">
        <view v-for="p in list" :key="p.id" class="feed-item">
          <zz-article-row :post="p" @select="openPost(p)" />
        </view>
        <view class="more">
          <text v-if="loading">正在加载更多…</text>
          <text v-else-if="noMore">· 没有更多结果 ·</text>
        </view>
      </view>
      <view v-else class="pad">
        <t-empty :description="'没有搜到「' + submitted + '」的文章'" icon="search" />
        <view class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="backToDiscover">
          <t-icon name="refresh" size="28rpx" color="#0052d9" />
          <text class="retry-txt">换个关键词</text>
        </view>
      </view>
    </block>
  </view>
</template>

<script setup>
// 搜索页：发现态（热门标签 + 本地历史）与结果态（复用文章行）。
// search 开关关闭时输入口隐藏 + 本页兜底空态；服务端 q 参数同样 403。
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { state, feat } from '@/common/store.js'
import { posts, tags } from '@/common/request.js'
import { searchHistory, pushSearch, removeSearch, clearSearch } from '@/common/history.js'

const q = ref('')
const submitted = ref('')
const focusIpt = ref(true)
const hot = ref([])
const hist = ref([])

const list = ref([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const err = ref('')

const firstLoading = computed(() => loading.value && !list.value.length)
const noMore = computed(() => page.value >= totalPages.value)
const skRows = [{ type: 'rect', height: '160rpx', width: '100%' }, { type: 'text', width: '80%' }, { type: 'text', width: '50%' }, { type: 'rect', height: '160rpx', width: '100%' }, { type: 'text', width: '70%' }]

async function run(reset) {
  if (loading.value) return
  loading.value = true
  if (reset) { page.value = 1; totalPages.value = 1; err.value = '' }
  try {
    const r = await posts({ page: page.value, perPage: state.postsPerPage, q: submitted.value })
    const items = r.posts || []
    list.value = reset ? items : list.value.concat(items)
    totalPages.value = r.totalPages || 1
  } catch (e) {
    err.value = (e && e.message) || '搜索失败'
    if (reset) list.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function submit() {
  const kw = q.value.trim()
  if (!kw) return
  submitted.value = kw
  list.value = []
  pushSearch(kw)
  hist.value = searchHistory()
  run(true)
}
function tapChip(k) {
  q.value = k
  submit()
}
function backToDiscover() {
  submitted.value = ''
  q.value = ''
  list.value = []
  hist.value = searchHistory()
}
function removeOne(k) {
  removeSearch(k)
  hist.value = searchHistory()
}
function clearAll() {
  clearSearch()
  hist.value = []
}
function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) uni.navigateBack()
  else uni.reLaunch({ url: '/pages/index/index' })
}
function openPost(p) { uni.navigateTo({ url: '/pages/post/detail?slug=' + encodeURIComponent(p.slug) }) }

onLoad(() => {
  hist.value = searchHistory()
  tags().then((r) => {
    const ts = (r.tags || []).slice().sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
    hot.value = ts.slice(0, 7)
  }).catch(() => { /* 热门缺席不影响搜索 */ })
})

onReachBottom(() => {
  if (!submitted.value || loading.value || noMore.value) return
  page.value += 1
  run(false)
})
</script>

<style scoped>
.sec { padding: 24rpx 32rpx 0; }
.grp-row { display: flex; align-items: center; justify-content: space-between; }
.grp-flex { flex: 1; min-width: 0; }
.clr { font-size: 22rpx; color: var(--zz-ink-3); padding: 8rpx 0 8rpx 20rpx; }
.hot { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 20rpx; }
.hc {
  display: flex; align-items: center; gap: 10rpx;
  background: var(--zz-card);
  border: 2rpx solid var(--zz-line);
  border-radius: 8rpx; padding: 14rpx 26rpx;
  font-size: 24rpx; color: var(--zz-ink); line-height: 1.4;
}
.rank { font-size: 24rpx; font-weight: 600; color: var(--zz-brand); }

.hs {
  background: var(--zz-card);
  border: 2rpx solid var(--zz-line);
  border-radius: 14rpx; overflow: hidden; margin-top: 20rpx;
}
.hr {
  display: flex; align-items: center; gap: 20rpx;
  padding: 26rpx 28rpx; border-bottom: 1rpx solid var(--zz-line);
}
.hr:last-child { border-bottom: none; }
.ht { flex: 1; min-width: 0; font-size: 28rpx; color: var(--zz-ink); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.x { padding: 4rpx 8rpx; line-height: 0; }

.feed { padding: 0; }
.feed-item { padding: 24rpx 32rpx; border-bottom: 1rpx solid var(--zz-line); }
.more { text-align: center; padding: 18rpx 0 8rpx; }
.more text { font-size: 24rpx; color: var(--zz-ink-3); }

.sk { padding: 32rpx 32rpx; }
.pad { padding: 96rpx 32rpx 0; display: flex; flex-direction: column; align-items: center; }
.retry {
  margin-top: 8rpx;
  display: flex; align-items: center; gap: 8rpx;
  padding: 12rpx 32rpx;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
</style>

<style>
/* t-search 外部样式类的样式兜底：external class 按页面作用域匹配，
   scoped 块会附加 data-v 属性选择器、匹配不到组件内部节点，必须用非 scoped 块 */
.search-box {
  background: #ffffff;
  border: 2rpx solid #e7e7e7 !important;
}
</style>
