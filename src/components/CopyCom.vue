<template>
  <div @click="handleCopy" class="copy">
    <i class="el-icon-copy-document" title="复制"></i>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  components: {},
  props: {
    text: String
  },
  data () {
    return {
    }
  },
  watch: {},
  computed: {},
  methods: {
    async handleCopy () {
      const clipboard = navigator.clipboard
      if (!clipboard) {
        console.log('不支持')
      }

      try {
        await clipboard.writeText(this.text)
        Message.success('复制成功')
        console.log('success')
      } catch (error) {
        Message.error('复制出错')
        console.log('failed', error)
      }
    }
  },
  created () {},
  mounted () {}
}
</script>
<style lang="scss" scoped>
.copy{
  cursor: pointer;

  &:hover{
    color: blue;
  }
}
</style>
