<template>
  <view class="home">
    <!-- 顶栏：搜索入口（search 关闭时隐藏）+ 分类 Chips -->
    <view class="hd">
      <view v-if="feat('search')" class="srow" @tap="goSearch">
        <!-- 只读搜索入口：t-search 样式隔离穿不透，静态入口直接用原生 view 绘制，观感对齐 t-search -->
        <view class="search-fake" hover-class="zz-press" :hover-stay-time="60">
          <t-icon name="search" size="40rpx" color="rgba(0,0,0,0.26)" />
          <text class="search-ph">搜索文章</text>
        </view>
      </view>
      <scroll-view class="chips" scroll-x enable-flex :show-scrollbar="false">
        <view class="chip" :class="{ on: cat === '' }" hover-class="zz-press" :hover-stay-time="60" @tap="pickCat('')">全部</view>
        <view
          v-for="c in topCats" :key="c.slug"
          class="chip" :class="{ on: cat === c.slug }"
          hover-class="zz-press" :hover-stay-time="60"
          @tap="pickCat(c.slug)"
        >{{ c.name }}</view>
      </scroll-view>
    </view>

    <!-- 轮播：插件配置横幅 > 带封面文章 > 内置默认横幅（仅全部分类下展示） -->
    <view v-if="cat === '' && banner.length" class="banner">
      <t-swiper
        :list="bannerImgs"
        height="340rpx"
        :autoplay="true"
        :interval="4500"
        :duration="300"
        :loop="true"
        :navigation="{ type: 'dots' }"
        @click="onBannerTap"
      />
    </view>

    <!-- 首屏骨架：三行列表占位 -->
    <view v-if="firstLoading" class="sk">
      <t-skeleton :row-col="skRows" :loading="true" />
    </view>

    <view v-else-if="list.length" class="feed">
      <view v-for="p in list" :key="p.id" class="feed-item">
        <zz-article-row :post="p" @tap="openPost(p)" />
      </view>
      <view class="more">
        <text v-if="loadingMore">正在加载更多…</text>
        <text v-else-if="noMore">· 没有更多文章了 ·</text>
      </view>
    </view>

    <view v-else class="pad-empty">
      <t-empty :description="err || emptyText" icon="search" />
      <view v-if="err" class="retry" hover-class="zz-press-op" :hover-stay-time="60" @tap="reload">
        <t-icon name="refresh" size="28rpx" color="#0052d9" />
        <text class="retry-txt">重新加载</text>
      </view>
    </view>

    <zz-tabbar active="home" />
    <zz-login-sheet />
  </view>
</template>

<script setup>
// 首页：单栏文章流。置顶/排序由服务端处理，前端只做分页拼接。
// 顶部轮播复用「全部」首页数据里带封面的文章，不额外发请求。
import { ref, computed } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { state, feat } from '@/common/store.js'
import { posts, categories } from '@/common/request.js'
import { usableCover } from '@/common/theme.js'

const list = ref([])
const cats = ref([])
const cat = ref('')      // 当前分类 slug，'' = 全部
const banner = ref([])   // 轮播 [{img, slug}]（仅全部分类下展示）
const page = ref(1)

// 内置默认横幅：图库真实照片（本地打包非热链，无中文文案）；插件端配置 banners 后优先用配置
const DEFAULT_BANNERS = [
  { img: '/static/img/banner-1.jpg', slug: '' },
  { img: '/static/img/banner-2.jpg', slug: '' },
  { img: '/static/img/banner-3.jpg', slug: '' },
]
const bannerImgs = computed(() => banner.value.map((b) => b.img))
const totalPages = ref(1)
const loading = ref(false)
const err = ref('')

const topCats = computed(() => cats.value.filter((c) => !c.parentId))
const firstLoading = computed(() => loading.value && !list.value.length)
const loadingMore = computed(() => loading.value && list.value.length > 0)
const noMore = computed(() => page.value >= totalPages.value)
const emptyText = computed(() => (cat.value ? '这个分类下还空着' : '还没有文章'))
const skRows = [{ type: 'rect', height: '160rpx', width: '100%' }, { type: 'text', width: '80%' }, { type: 'text', width: '50%' }, { type: 'rect', height: '160rpx', width: '100%' }, { type: 'text', width: '70%' }, { type: 'text', width: '40%' }]

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
    if (reset) banner.value = buildBanner(items)
    totalPages.value = r.totalPages || 1
    err.value = ''
  } catch (e) {
    err.value = (e && e.message) || '加载失败'
    if (reset) { list.value = []; banner.value = [] }
  } finally {
    loading.value = false
  }
}

function reload() { fetchPage(true) }

/** 轮播来源：插件配置横幅优先，其次带封面的文章，最后内置默认横幅（最多 5 张） */
function buildBanner(items) {
  if (cat.value !== '') return []
  const cfg = (state.banners || [])
    .filter((b) => b && usableCover(b.image))
    .slice(0, 5)
    .map((b) => ({ img: usableCover(b.image), slug: b.slug || '' }))
  if (cfg.length) return cfg
  const covers = items.filter((p) => usableCover(p.coverUrl)).slice(0, 5)
    .map((p) => ({ img: usableCover(p.coverUrl), slug: p.slug }))
  return covers.length ? covers : DEFAULT_BANNERS
}

function pickCat(slug) {
  if (cat.value === slug) return
  cat.value = slug
  list.value = []
  uni.pageScrollTo({ scrollTop: 0, duration: 200 })
  fetchPage(true)
}

function goSearch() { uni.navigateTo({ url: '/pages/search/index' }) }
function openPost(p) { uni.navigateTo({ url: '/pages/post/detail?slug=' + encodeURIComponent(p.slug) }) }
function onBannerTap(e) {
  const b = banner.value[e && e.index]
  if (b && b.slug) openPost({ slug: b.slug })
}

let inited = false
onShow(() => {
  if (inited) return
  inited = true
  fetchPage(true)
  categories().then((r) => { cats.value = r.categories || [] }).catch(() => { /* 分类条缺席不影响正文 */ })
})

onReachBottom(() => {
  if (loading.value || noMore.value) return
  page.value += 1
  fetchPage(false)
})

onPullDownRefresh(async () => {
  await fetchPage(true)
  uni.stopPullDownRefresh()
})
</script>

<style scoped>
.hd {
  position: sticky; top: 0; z-index: 30;
  background: var(--zz-paper);
  border-bottom: 1rpx solid var(--zz-line);
}
.srow { padding: 8rpx 32rpx 4rpx; }
.search-fake {
  display: flex; align-items: center; gap: 12rpx;
  height: 80rpx; padding: 0 24rpx;
  background: var(--zz-card);
  border: 2rpx solid var(--zz-line);
  border-radius: 12rpx;
}
.search-ph { font-size: 28rpx; color: var(--zz-ink-3); }
.chips {
  white-space: nowrap; padding: 8rpx 32rpx 20rpx;
}
.chip {
  display: inline-flex; align-items: center;
  margin-right: 14rpx; padding: 10rpx 26rpx;
  background: var(--zz-card);
  border: 2rpx solid var(--zz-line);
  border-radius: 8rpx;
  font-size: 24rpx; color: var(--zz-ink-2); line-height: 1.5;
}
.chip.on {
  background: var(--zz-brand-soft);
  border-color: var(--zz-brand-soft);
  color: var(--zz-brand); font-weight: 600;
}

.banner {
  margin: 0 32rpx 8rpx;
  border-radius: 14rpx; overflow: hidden;
}

.feed { padding: 0; }
.feed-item { padding: 24rpx 32rpx; border-bottom: 1rpx solid var(--zz-line); }
.more { text-align: center; padding: 18rpx 0 8rpx; }
.more text { font-size: 24rpx; color: var(--zz-ink-3); }

.sk { padding: 32rpx 32rpx; }
.pad-empty { padding: 96rpx 32rpx 0; display: flex; flex-direction: column; align-items: center; }
.retry {
  margin-top: 8rpx;
  display: flex; align-items: center; gap: 8rpx;
  padding: 12rpx 32rpx;
}
.retry-txt { font-size: 26rpx; color: var(--zz-brand); }
</style>
