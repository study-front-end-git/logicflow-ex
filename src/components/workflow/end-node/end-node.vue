<template>
  <div class="end-node">
    <div class="end-node__header">
      <span class="end-node__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.5 7.5a6 6 0 1 1 0 9" />
          <path d="M4 12h10" />
        </svg>
      </span>
      <span class="end-node__title">{{ title }}</span>
    </div>

    <div class="end-node__content">
      <div class="end-node__row">
        <span class="end-node__label">输出</span>
        <div v-for="item in nodeData" :key="item.id">
          <span class="end-node__param">
            <span class="end-node__param-type">{{ item.shortLabel }}.</span>
            <span class="end-node__param-name">{{ item.name }}</span>
          </span>
        </div>

      </div>

      <div class="end-node__row">
        <span class="end-node__label">输出类型</span>
        <span class="end-node__value">{{ outputMode === 'text' ? '返回文本' : '返回变量' }}</span>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  components: {},
  props: [
    'title',
    'graphModel',
    'model'
  ],
  data () {
    return {
      nodeData: this.model?.properties?.data || [],
      outputMode: this.model?.properties?.outputMode || 'variable',
      cueWord: this.model?.properties?.cueWord || ''
    }
  },
  watch: {},
  computed: {},
  methods: {},
  created () {},
  mounted () {
    this.graphModel.eventCenter.on('save', ({ data, id }) => {
      if (id !== this.model.id || Array.isArray(data)) return

      this.nodeData = data.data || []
      this.outputMode = data.outputMode || 'variable'
      this.cueWord = data.cueWord || ''
    })
  }
}
</script>
<style lang="scss" scoped>
.end-node {
  width: 100%;
  height: 100px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  color: #292c3d;
  background: linear-gradient(135deg, #fff 0%, #fbfbff 100%);
  border: 1px solid #d8dceb;
  border-radius: 9px;
  box-shadow: 0 4px 12px rgba(52, 59, 102, .11);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  cursor: default;
  transition: border-color .2s ease, box-shadow .2s ease;
  position: relative;

  &:hover {
    border-color: #4f55ee;
    box-shadow: 0 7px 18px rgba(71, 76, 164, .17);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  &__icon {
    width: 27px;
    height: 27px;
    flex: 0 0 27px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background: linear-gradient(145deg, #6972ff, #555ce8);
    box-shadow: 0 3px 7px rgba(82, 89, 229, .2);

    svg {
      width: 19px;
      height: 19px;
      fill: none;
      stroke: #fff;
      stroke-width: 2.3;
      stroke-linecap: round;
    }
  }

  &__title {
    color: #292c3d;
    font-size: 17px;
    font-weight: 600;
    line-height: 27px;
    letter-spacing: .5px;
  }

  &__content {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__row {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
    line-height: 22px;
  }

  &__label {
    min-width: 50px;
    flex: 0 0 auto;
    color: #aeb3c9;
    font-size: 12px;
    text-align: right;
    white-space: nowrap;
  }

  &__param {
    height: 23px;
    padding: 0 7px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    overflow: hidden;
    border-radius: 5px;
    background: #f0f1f7;
    font-size: 11px;
    line-height: 23px;
    white-space: nowrap;
  }

  &__param-type {
    color: #a4a9bd;
  }

  &__param-name {
    overflow: hidden;
    color: #373b4e;
    text-overflow: ellipsis;
  }

  &__value {
    overflow: hidden;
    color: #343748;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result{
    position: absolute;
    left: 0;
  top: calc(100% + 8px);
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, #fff 0%, #fbfbff 100%);
    border: 1px solid #d8dceb;
    border-radius: 9px;
    box-shadow: 0 4px 12px rgba(52, 59, 102, .11);
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    cursor: default;
    transition: border-color .2s ease, box-shadow .2s ease;
    padding: 10px 14px;
    z-index: 9999;
  }
}
</style>
