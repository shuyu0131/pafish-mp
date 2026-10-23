<template>
  <view class="zz-search" :class="{ 'is-overlap': overlap }" @tap="focus">
    <t-icon name="search" size="40rpx" color="#5b6470" />
    <input
      class="zz-search-input"
      :value="modelValue"
      :focus="focused"
      confirm-type="search"
      @input="onInput"
      @confirm="$emit('search')"
      @focus="focused = true"
      @blur="focused = false"
    />
    <view v-if="!modelValue && !focused" class="zz-search-ph" @tap.stop="focus">
      <text>哈喽，想看些什么</text>
      <text class="zz-search-hl">内容</text>
      <text>呢~</text>
    </view>
    <view v-if="modelValue" class="zz-search-clear" hover-class="zz-press-op" :hover-stay-time="60" @tap.stop="$emit('clear')">
      <t-icon name="close" size="24rpx" color="#8794a0" />
    </view>
  </view>
</template>

<script>
// 首页搜索：真实输入框，不跳转页面；overlap 变体压在插画下缘并做磨砂。
export default {
  name: 'ZzSearchBar',
  props: {
    modelValue: { type: String, default: '' },
    overlap: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'search', 'clear'],
  data() {
    return { focused: false }
  },
  methods: {
    focus() { this.focused = true },
    onInput(e) { this.$emit('update:modelValue', e.detail.value) },
  },
}
</script>

<style scoped>
.zz-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14rpx;
  height: 96rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  background: var(--zz-card);
  border: 1rpx solid rgba(255, 255, 255, .6);
  box-shadow: 0 10rpx 28rpx rgba(31, 58, 87, .08);
  overflow: hidden;
}

.zz-search.is-overlap {
  background: rgba(255, 255, 255, .72);
  backdrop-filter: blur(18rpx);
  -webkit-backdrop-filter: blur(18rpx);
  box-shadow: 0 18rpx 44rpx rgba(31, 58, 87, .16);
  z-index: 3;
}

.zz-search-input {
  flex: 1;
  min-width: 0;
  height: 96rpx;
  font-size: 30rpx;
  color: var(--zz-ink);
}

.zz-search-ph {
  position: absolute;
  left: 84rpx;
  right: 78rpx;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 30rpx;
  color: #8a97a2;
  pointer-events: none;
}

.zz-search-hl {
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  background: var(--zz-brand-soft);
  color: var(--zz-brand-deep);
  font-weight: 500;
}

.zz-search-clear {
  width: 40rpx;
  height: 40rpx;
  flex: none;
  border-radius: 50%;
  background: #f0f4f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zz-press-op {
  opacity: .55;
}
</style>
