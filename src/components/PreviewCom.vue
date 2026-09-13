<template>
  <div v-loading="loading" ref="preview" class="preview-content"></div>
</template>

<script>
// import Vditor from 'vditor'
import 'vditor/dist/index.css'
import VditorPreview from 'vditor/dist/method.min'
export default {
  components: {},
  props: {
    workflowId: String,
    content: String

  },
  data () {
    return {
      vditor: null,
      loading: false
    }
  },
  watch: {

  },
  computed: {},
  methods: {
    async render () {
      try {
        this.loading = true
        await VditorPreview.preview(this.$refs.preview, this.content, {
          theme: {
            current: 'light'
          },
          hljs: {
            style: 'github'
          }
        })
      } finally {
        this.loading = false
      }
    }
  },
  created () {},
  mounted () {
    this.render()
  }
}
</script>
<style lang="scss" scoped>
.preview-content {
  width: 100%;
  min-width: 0;
  line-height: 1.7;
  overflow-wrap: anywhere;
  word-break: break-word;

  ::v-deep pre {
    max-width: 100%;
    overflow-x: auto;
  }

  ::v-deep img {
    max-width: 100%;
    height: auto;
  }

  ::v-deep table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
