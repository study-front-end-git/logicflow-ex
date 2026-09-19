<template>
  <div class="output-node">
    <div class="output-node__header">
      <span class="output-node__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.5 7.5a6 6 0 1 1 0 9" />
          <path d="M4 12h10" />
        </svg>
      </span>
      <span class="output-node__title">{{  model.title ? model.title : title }}</span>

      <div class="output-node__actions">
        <command-delete
          color="#5962dc"
          bg-color="#eef0ff"
          :event-center="graphModel.eventCenter"
          :id="model.id"
        />
      </div>
    </div>

    <div class="output-node__content">
      <div class="output-node__row">
        <span class="output-node__label">输出</span>
        <div v-for="item in nodeData" :key="item.id">
          <span class="output-node__param">
            <el-tooltip :content="item.type" placement="top" effect="light">
              <div>
                <span class="output-node__param-type">{{ item.shortLabel }}.</span>
                <span class="output-node__param-name">{{ item.name }}</span>
              </div>
            </el-tooltip>
            <!-- <span class="output-node__param-type">{{ item.shortLabel }}.</span>
            <span class="output-node__param-name">{{ item.name }}</span> -->
          </span>

        </div>

      </div>

      <div class="output-node__row">
        <span class="output-node__label">输出内容</span>
        <span class="output-node__value">{{ cueWord ? cueWord : '未配置内容' }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import CommandDelete from '@/components/CommandDelete.vue'

export default {
  components: {
    CommandDelete
  },
  props: [
    'title',
    'graphModel',
    'model'
  ],
  data () {
    return {
      nodeData: this.model?.properties?.data || [],
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
      this.cueWord = data.cueWord || ''
    })
  }
}
</script>
<style lang="scss" scoped>
.output-node {
  width: 100%;
  height: 100%;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  &__actions {
    position: relative;
    z-index: 2;
    flex: 0 0 auto;
    margin-left: auto;
    display: flex;
    align-items: center;
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
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    color: #292c3d;
    font-size: 17px;
    font-weight: 600;
    line-height: 27px;
    letter-spacing: .5px;
    text-overflow: ellipsis;
    white-space: nowrap;
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
