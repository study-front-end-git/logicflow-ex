<template>
  <div class="model-node">
    <div class="model-node__header">
      <span class="model-node__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
          <path d="m4.8 7.4 7.2 4.1 7.2-4.1M12 11.5V21" />
        </svg>
      </span>
      <span class="model-node__title">{{ model.title ? model.title : title }}</span>
      <div class="model-node__actions">
        <button class="model-node__run" type="button" aria-label="运行节点">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>
        </button>
        <button class="model-node__more" type="button" aria-label="更多操作"><span></span><span></span><span></span></button>
      </div>
    </div>
    <div class="model-node__body">
      <div class="model-node__port">
        <span class="model-node__label">输入</span>
        <span v-for="item in nodeData" :key="item.id" class="model-node__param">
          <span class="model-node__param-type">{{ item.shortLabel }}.</span>
          <span class="model-node__param-name">{{ item.name }}</span>
        </span>
      </div>

      <div class="model-node__port model-node__port--output">
        <span class="model-node__label">输出</span>
        <span class="model-node__param">
          <span class="model-node__param-type">{{ output[0].shortLabel }}.</span>
          <span class="model-node__param-name">{{ output[0].name }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: [
    'graphModel',
    'model',
    'title'
  ],
  data () {
    return {
      nodeData: this.model?.properties?.data,
      config: this.model?.properties?.config,
      output: this.model?.properties?.output
    }
  },
  watch: {},
  computed: {},
  methods: {},
  created () {},
  mounted () {
    this.graphModel.eventCenter.on('save', ({ data, id, lf }) => {
      if (id === this.model.id) {
        console.log('data更新了:', data)
        this.nodeData = data.data
        this.config = data.config
        this.output = data.output
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.model-node {
  width: 100%; height: 100%; padding: 11px 14px;
  display: flex; flex-direction: column; justify-content: space-between;
  color: #292c3d; background: linear-gradient(135deg, #fff 0%, #fcfbff 100%);
  border: 1px solid #d8dceb; border-radius: 9px;
  box-shadow: 0 4px 12px rgba(52, 59, 102, .11);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  transition: border-color .2s ease, box-shadow .2s ease;

  &:hover { border-color: #a791ef; box-shadow: 0 7px 18px rgba(105, 78, 177, .16); }
  &__header, &__body, &__port, &__actions { display: flex; align-items: center; }
  &__header { min-width: 0; gap: 9px; }
  &__icon {
    width: 27px; height: 27px; flex: 0 0 27px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 5px; color: #fff;
    background: linear-gradient(145deg, #9270ed, #7354ce);
    box-shadow: 0 3px 7px rgba(112, 80, 198, .22);
    svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; }
  }
  &__title { min-width: 0; overflow: hidden; font-size: 17px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  &__actions { margin-left: auto; gap: 7px; }
  &__run, &__more {
    width: 25px; height: 25px; padding: 0;
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; border-radius: 5px; color: #3b3e4e; background: transparent; cursor: pointer;
    &:hover { color: #795ad4; background: #f1edfb; }
  }
  &__run svg { width: 18px; height: 18px; fill: currentColor; }
  &__more { gap: 3px; span { width: 3px; height: 3px; border-radius: 50%; background: currentColor; } }
  &__body { min-width: 0; justify-content: space-between; gap: 12px; }
  &__port { min-width: 0; gap: 7px; }
  &__port--output { justify-content: flex-end; }
  &__label { flex: 0 0 auto; color: #aeb3c9; font-size: 11px; }
  &__param { height: 22px; padding: 0 7px; display: inline-flex; align-items: center; gap: 3px; overflow: hidden; border-radius: 5px; background: #f0f1f7; font-size: 10px; line-height: 22px; white-space: nowrap; }
  &__param-type { color: #a4a9bd; }
  &__param-name { overflow: hidden; color: #373b4e; text-overflow: ellipsis; }
}
</style>
