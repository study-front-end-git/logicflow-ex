<template>
  <div class="start-node">
    <div class="start-node__header">
      <span class="start-node__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 7.5a6 6 0 1 0 0 9" />
          <path d="M10 12h10" />
        </svg>
      </span>
      <span class="start-node__title">{{ title }}</span>
    </div>

    <div class="start-node__body">
      <span class="start-node__label">输入</span>

      <div class="start-node__params">
        <div v-if="nodeData.length === 0" class="start-node__empty">
          未配置输入
        </div>
        <template v-else>
          <span
            v-for="item in nodeData"
            :key="item.id"
            class="param"
            :class="{ 'param--warning': !item.name || !item.type }"
            :title="item.type"
          >
            <span class="param__type">{{ item.shortLabel || getShortLabel(item.type) }}</span>
            <span class="param__name">{{ item.name || '未定义' }}</span>
          </span>
        </template>
      </div>

      <button @click="handleShowMore" class="start-node__more" type="button" aria-label="更多参数">
        <span></span>
        <span></span>
        <span></span>
      </button>
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
      id: this.model?.id,
      nodeData: this.model?.properties?.data ? this.model?.properties?.data : []
    }
  },
  watch: {
  },
  computed: {

  },
  methods: {
    getShortLabel (type) {
      const labels = {
        String: 'str.',
        Number: 'num.',
        Boolean: 'bool.',
        Object: 'obj.',
        Array: 'arr.'
      }
      return labels[type] || 'any.'
    },
    handleShowMore () {

    }
  },
  created () {},
  mounted () {
    this.graphModel.eventCenter.on('save', ({ data, id, lf }) => {
      if (id === this.id) {
        console.log('出发了data,', data)

        this.nodeData = data
        console.log('this.nodeData:', this.nodeData)
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.start-node {
  width: 100%;
  height: 100%;
  padding: 12px 14px 11px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #252838;
  background: linear-gradient(135deg, #fff 0%, #fbfbff 100%);
  border: 1px solid #d8dceb;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(48, 55, 88, .12);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  cursor: default;
  transition: border-color .2s ease, box-shadow .2s ease;

  .click{
    border-color: #aab1ee;
    box-shadow: 0 7px 18px rgba(63, 70, 126, .18);
  }

  &:hover {
    border-color: #aab1ee;
    box-shadow: 0 7px 18px rgba(63, 70, 126, .18);
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
    color: #262938;
    font-size: 17px;
    font-weight: 500;
    line-height: 27px;
  }

  &__body {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  &__label {
    flex: 0 0 auto;
    color: #aeb3ca;
    font-size: 12px;
    white-space: nowrap;
  }

  &__params {
    height: 29px;
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 5px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__empty {
    height: 23px;
    padding: 0 8px;
    display: inline-flex;
    align-items: center;
    color: #aeb3c5;
    border: 1px dashed #d9dce8;
    border-radius: 5px;
    background: #f8f8fb;
    font-size: 11px;
    white-space: nowrap;
  }

  .param {
    position: relative;
    height: 23px;
    padding: 0 6px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    border-radius: 5px;
    color: #373b4e;
    background: #f0f1f7;
    font-size: 11px;
    line-height: 23px;
    white-space: nowrap;

    &__type {
      color: #a4a9bd;
    }

    &--warning {
      color: #ff790d;
      background: #fff0e1;

      .param__type {
        color: #f3b67d;
      }
    }
  }

  &__more {
    width: 23px;
    height: 23px;
    padding: 0;
    flex: 0 0 23px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 0;
    border-radius: 5px;
    background: #f0f1f7;
    cursor: pointer;

    span {
      width: 2px;
      height: 2px;
      border-radius: 50%;
      background: #626980;
    }

    &:hover {
      background: #e7e9f2;
    }
  }
}
</style>
