<template>
  <view class="home zz-page">
    <template v-if="!searchMode">
    <view class="sky">
      <image class="sky-img" src="/static/illus/sky-bg.png" mode="aspectFill" />
      <zz-navbar variant="sky" />
    </view>

    <view v-if="feat('search')" class="home-search-wrap">
      <zz-search-bar
        v-model="keyword"
        overlap
        @search="doSearch"
        @clear="clearKeyword"
      />
    </view>

    <view v-if="noticeList.length" class="notice-card" hover-class="zz-press-op" :hover-stay-time="60" @tap="nextNotice">
      <view class="notice-icon">
        <t-icon name="notification" size="26rpx" color="#e6811d" />
      </view>
      <text class="notice-label">公告</text>
      <text class="notice-text">{{ currentNotice }}</text>
      <view v-if="noticeList.length > 1" class="notice-all">
        <text>全部</text>
        <t-icon name="chevron-right" size="22rpx" color="#9aa3ad" />
      </view>
    </view>

    <view v-if="quicks.length" class="quick-grid">
      <view
        v-for="q in quicks"
        :key="q.key"
        class="quick"
        :class="{ on: cat === q.slug }"
        hover-class="zz-press-op"
        :hover-stay-time="60"
        @tap="toggleCat(q.slug)"
      >
        <image class="quick-art" :src="q.art" :mode="q.fit" />
        <text class="quick-label">{{ q.name }}</text>
      </view>
    </view>

    <view class="section">
      <zz-section-head
        icon="book"
        title="最新文章"
        :sub="feed.length ? feed.length + ' 篇' : ''"
      />

      <view v-if="firstLoading" class="sk">
        <zz-skeleton type="post" :rows="3" />
      </view>

      <view v-else-if="feed.length" class="feed">
        <zz-article-row v-for="p in feed" :key="p.id" :post="p" @select="openPost(p)" />
        <view class="more">
          <text v-if="loadingMore">正在加载更多…</text>
          <text v-else-if="noMore">— 到底啦 —</text>
        </view>
      </view>

      <zz-empty
        v-else-if="err"
        type="offline"
        :desc="err"
        action-text="重新加载"
        @action="reload"
      />
      <zz-empty
        v-else
        type="posts"
        :title="cat ? '这个分类下还空着' : '还没有文章'"
        :desc="cat ? '换个分类看看，或者去分类页逛逛' : '等第一篇文章落下来'"
        action-text="去分类看看"
        @action="goCategories"
      />
    </view>

    </template>

    <template v-else>
      <zz-navbar title="搜索">
        <template #right>
          <view class="search-cancel" @tap="exitSearch">取消</view>
        </template>
      </zz-navbar>

      <view class="search-mode-wrap">
        <zz-search-bar
          v-model="keyword"
          @search="doSearch"
          @clear="clearKeyword"
        />
      </view>

      <view class="section search-results">
        <zz-section-head
          icon="search"
          title="搜索结果"
          :sub="searchTotal ? searchTotal + ' 篇' : ''"
        />

        <view v-if="searchFirstLoading" class="sk">
          <zz-skeleton type="post" :rows="3" />
        </view>

        <view v-else-if="searchList.length" class="feed">
          <zz-article-row v-for="p in searchList" :key="p.id" :post="p" @select="openPost(p)" />
          <view class="more">
            <text v-if="searchLoading">正在加载更多…</text>
            <text v-else-if="searchNoMore">— 没有更多结果 —</text>
          </view>
        </view>

        <zz-empty
          v-else-if="searchErr"
          type="offline"
          :desc="searchErr"
          action-text="重新搜索"
          @action="retrySearch"
        />
        <zz-empty
          v-else
          type="search"
          :title="'没有找到「' + searchQ + '」'"
          desc="换个关键词试试"
          action-text="返回首页"
          @action="exitSearch"
        />
      </view>
    </template>

    <zz-tabbar active="posts" />
    <zz-login-sheet />
  </view>
</template>

<script setup>
// 首页：天空头图 + 公告 + 图片轮播 + 分类四宫格 + 文章卡流。
// 数据仍走 /mp/posts + /mp/categories；分类切换用服务端 category 参数。
import { ref, computed } from 'vue'
import { onLoad, onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { state, feat } from '@/common/store.js'
import { posts, categories } from '@/common/request.js'
import { categoryCover } from '@/common/theme.js'
import { pushSearch } from '@/common/history.js'

const QUICK_DEFS = [
  { key: 'tech', keys: ['技术', '开发', '编程', '代码', 'tech'], art: '/static/illus/cat-tech.png' },
  { key: 'build', keys: ['建站', '博客', '主题', '插件', 'blog'], art: '/static/illus/cat-build.png' },
  { key: 'life', keys: ['生活', '日常', 'life'], art: '/static/illus/cat-life.png' },
  { key: 'essay', keys: ['随笔', '记录', '读书', 'note'], art: '/static/illus/cat-essay.png' },
]

const list = ref([])
const cats = ref([])
const cat = ref('')
const initialCat = ref('')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const err = ref('')

const keyword = ref('')
const searchMode = ref(false)
const searchQ = ref('')
const searchList = ref([])
const searchPage = ref(1)
const searchTotalPages = ref(1)
const searchTotal = ref(0)
const searchLoading = ref(false)
const searchErr = ref('')

function noticeOf(n) {
  if (!n) return ''
  if (typeof n === 'string') return n.trim()
  if (typeof n === 'object') return String(n.text || n.content || n.title || '').trim()
  return ''
}
const noticeIndex = ref(0)
const noticeList = computed(() => {
  const out = []
  const one = noticeOf(state.notice)
  if (one) out.push(one)
  for (const n of (state.notices || [])) {
    const t = noticeOf(n)
    if (t) out.push(t)
  }
  if (!out.length) {
    for (const b of (state.banners || [])) {
      const t = noticeOf(b && (b.title || b.text))
      if (t) out.push(t)
    }
  }
  if (!out.length) out.push(`${state.site.name || '纸鱼博客'} 已上线，文章与微语都可以在这里读到。`)
  return out
})
const currentNotice = computed(() => {
  const list = noticeList.value
  return list[noticeIndex.value % list.length] || ''
})
function nextNotice() {
  if (noticeList.value.length > 1) {
    noticeIndex.value = (noticeIndex.value + 1) % noticeList.value.length
  }
}

const feed = computed(() => list.value)

const quicks = computed(() => {
  const top = cats.value.filter((c) => !c.parentId)
  const used = new Set()
  const out = []
  for (const def of QUICK_DEFS) {
    const hit = top.find((c) => !used.has(c.slug) && def.keys.some((k) => String(c.name || '').toLowerCase().includes(String(k).toLowerCase())))
    if (hit) {
      used.add(hit.slug)
      const cover = categoryCover(hit)
      out.push({ key: def.key, name: hit.name, slug: hit.slug, art: cover || def.art, fit: cover ? 'aspectFill' : 'aspectFit' })
    }
  }
  for (const c of top) {
    if (out.length >= 4) break
    if (used.has(c.slug)) continue
    const def = QUICK_DEFS[out.length] || QUICK_DEFS[QUICK_DEFS.length - 1]
    used.add(c.slug)
    const cover = categoryCover(c)
    out.push({ key: def.key + c.slug, name: c.name, slug: c.slug, art: cover || def.art, fit: cover ? 'aspectFill' : 'aspectFit' })
  }
  return out.slice(0, 4)
})
const firstLoading = computed(() => loading.value && !list.value.length)
const loadingMore = computed(() => loading.value && list.value.length > 0)
const noMore = computed(() => page.value >= totalPages.value)

const searchFirstLoading = computed(() => searchLoading.value && !searchList.value.length)
const searchNoMore = computed(() => searchPage.value >= searchTotalPages.value)

async function fetchSearch(reset) {
  if (searchLoading.value) return
  searchLoading.value = true
  if (reset) {
    searchErr.value = ''
    searchPage.value = 1
    searchTotalPages.value = 1
  }
  try {
    const r = await posts({
      page: searchPage.value,
      perPage: state.postsPerPage,
      q: searchQ.value,
    })
    const items = r.posts || []
    searchList.value = reset ? items : searchList.value.concat(items)
    searchTotalPages.value = r.totalPages || 1
    searchTotal.value = r.total || searchList.value.length
    searchErr.value = ''
  } catch (e) {
    searchErr.value = (e && e.message) || '搜索失败'
    if (reset) searchList.value = []
    searchTotalPages.value = 1
  } finally {
    searchLoading.value = false
  }
}

function doSearch() {
  if (!feat('search')) return
  const q = keyword.value.trim()
  if (!q) return
  searchQ.value = q
  searchMode.value = true
  searchPage.value = 1
  searchTotal.value = 0
  searchList.value = []
  searchErr.value = ''
  pushSearch(q)
  uni.pageScrollTo({ scrollTop: 0, duration: 200 })
  fetchSearch(true)
}

function retrySearch() { fetchSearch(true) }

function exitSearch() {
  searchMode.value = false
  keyword.value = ''
  searchQ.value = ''
  searchList.value = []
  searchErr.value = ''
  searchLoading.value = false
  uni.pageScrollTo({ scrollTop: 0, duration: 200 })
}

function clearKeyword() {
  keyword.value = ''
  if (searchMode.value) exitSearch()
}

async function fetchPage(reset) {
  if (loading.value) return
  loading.value = true
  if (reset) { err.value = ''; page.value = 1; totalPages.value = 1 }
  try {
    const r = await posts({
      page: page.value,
      perPage: state.postsPerPage,
      category: cat.value || undefined,
    })
    const items = r.posts || []
    list.value = reset ? items : list.value.concat(items)
    totalPages.value = r.totalPages || 1
    err.value = ''
  } catch (e) {
    err.value = (e && e.message) || '加载失败'
    if (reset) list.value = []
  } finally {
    loading.value = false
  }
}

function reload() { fetchPage(true) }

function toggleCat(slug) {
  if (!slug) return
  const next = cat.value === slug ? '' : slug
  if (next === cat.value) return
  cat.value = next
  list.value = []
  uni.pageScrollTo({ scrollTop: 0, duration: 200 })
  fetchPage(true)
}

function goCategories() {
  uni.reLaunch({ url: '/pages/category/index' })
}
function openPost(p) { uni.navigateTo({ url: '/pages/post/detail?slug=' + encodeURIComponent(p.slug) }) }

let inited = false
onLoad((q) => { initialCat.value = String((q && q.cat) || '') })
onShow(() => {
  if (inited) return
  inited = true
  cat.value = initialCat.value
  fetchPage(true)
  categories().then((r) => { cats.value = r.categories || [] }).catch(() => { /* 分类缺席不影响正文 */ })
})

onReachBottom(() => {
  if (searchMode.value) {
    if (searchLoading.value || searchNoMore.value) return
    searchPage.value += 1
    fetchSearch(false)
    return
  }
  if (loading.value || noMore.value) return
  page.value += 1
  fetchPage(false)
})

onPullDownRefresh(async () => {
  if (searchMode.value) await fetchSearch(true)
  else await fetchPage(true)
  uni.stopPullDownRefresh()
})
</script>

<style scoped>
.home {
  padding-bottom: 16rpx;
}

.sky {
  position: relative;
  height: 556rpx;
  overflow: hidden;
  background-color: #beebff;
  box-shadow: 0 20rpx 40rpx rgba(190, 235, 255, .7);
}

.sky-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.home-search-wrap {
  position: relative;
  z-index: 3;
  margin: -48rpx 72rpx 0;
}

/* 搜索态 */
.search-cancel {
  padding: 10rpx 0 10rpx 16rpx;
  font-size: 23rpx;
  font-weight: 500;
  color: var(--zz-brand-deep);
}

.search-mode-wrap {
  padding: 12rpx 60rpx 0;
}

.search-results {
  padding-top: 16rpx;
}

/* 公告卡 */
.notice-card {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-height: 96rpx;
  margin: 20rpx 36rpx 0;
  padding: 0 22rpx;
  border-radius: 24rpx;
  background: var(--zz-card);
  box-shadow: var(--zz-shadow);
}

.notice-icon {
  width: 52rpx;
  height: 52rpx;
  flex: none;
  border-radius: 50%;
  background: var(--zz-orange-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-label {
  flex: none;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--zz-orange);
}

.notice-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 24rpx;
  color: var(--zz-ink-2);
}

.notice-all {
  flex: none;
  display: flex;
  align-items: center;
  gap: 2rpx;
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

/* 分类四宫格 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-items: center;
  margin: 20rpx 24rpx 0;
  padding: 18rpx 8rpx 16rpx;
  background: var(--zz-card);
  border-radius: var(--zz-radius);
  box-shadow: var(--zz-shadow);
}

.quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx;
  border-radius: 14rpx;
}

.quick.on {
  background: var(--zz-brand-soft);
}

.quick-art {
  width: 80rpx;
  height: 80rpx;
  border-radius: 14rpx;
}

.quick-label {
  font-size: 26rpx;
  line-height: 1.2;
  font-weight: 500;
  color: var(--zz-ink);
}

/* 文章流 */
.section {
  padding: 20rpx 24rpx 18rpx;
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.more {
  padding: 20rpx 0 8rpx;
  text-align: center;
}

.more text {
  font-size: 20rpx;
  color: var(--zz-ink-3);
}

.sk {
  padding-top: 4rpx;
}

.dot {
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: #c2cad2;
}
</style>
