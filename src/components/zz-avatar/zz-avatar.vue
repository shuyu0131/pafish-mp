<template>
  <view class="zz-avatar" :style="boxStyle">
    <image
      v-if="url && !imgErr"
      class="zz-avatar-img"
      :src="url"
      mode="aspectFill"
      @error="imgErr = true"
    />
    <text v-else class="zz-avatar-char" :style="charStyle">{{ ch }}</text>
  </view>
</template>

<script>
// 单字头像：有图用图（加载失败回退首字），无图用「展示名首字符 + 中性灰底」，
// 与 TDesign 原生观感一致。
import { avatarColor, avatarChar } from '@/common/theme.js'

export default {
  name: 'ZzAvatar',
  props: {
    url: { type: String, default: '' },
    name: { type: String, default: '' },
    size: { type: Number, default: 56 }, // rpx
  },
  data() {
    return { imgErr: false }
  },
  computed: {
    ch() { return avatarChar(this.name) },
    boxStyle() {
      const s = this.size + 'rpx'
      // size 是 rpx，圆角保持同单位，避免跨机型 px 换算偏差
      return `width:${s};height:${s};border-radius:${this.size / 2}rpx;background:${avatarColor(this.name)};`
    },
    // 占位字随头像尺寸缩放，固定字号在大头像上偏小、小头像上溢出
    charStyle() {
      return `font-size:${Math.round(this.size * 0.38)}rpx;`
    },
  },
  watch: {
    url() { this.imgErr = false },
  },
}
</script>

<style scoped>
.zz-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.zz-avatar-img { width: 100%; height: 100%; }
.zz-avatar-char {
  color: #ffffff;
  font-weight: 700;
  line-height: 1;
  font-size: 26rpx;
}
</style>
