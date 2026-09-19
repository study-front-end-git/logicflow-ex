<template>
  <div class="input-node">
    <div class="input-node__header">
      <span class="input-node__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 6.5 9 12l5.5 5.5" />
          <path d="M9.5 12H20" />
        </svg>
      </span>

      <span class="input-node__title">{{ model.title ? model.title : title }}</span>

      <div class="input-node__actions">
        <!-- <button class="input-node__run" type="button" aria-label="运行节点">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m8 5 11 7-11 7V5Z" />
          </svg>
        </button> -->
        <div></div>

        <!-- <button class="input-node__more" type="button" aria-label="更多操作">
          <span></span>
          <span></span>
          <span></span>
        </button> -->

        <command-delete bg-color="#f0f1f8" color="#5962dc" :eventCenter="graphModel.eventCenter" :id="model.id"></command-delete>
      </div>
    </div>

    <div class="input-node__body">

        <span class="input-node__label">输入</span>
        <div v-for="item in nodeData" :key="item.id">
          <span class="input-node__param">
            <span class="input-node__param-type">{{ item.shortLabel }}.</span>
            <span class="input-node__param-name">{{ item.name }}</span>
          </span>
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
    'graphModel',
    'model',
    'title'
  ],
  data () {
    return {
      nodeData: this.model?.properties?.data,
      id: this.model?.id
    }
  },
  watch: {},
  computed: {},
  methods: {

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
.input-node {
  width: 100%;
  height: 100%;
  padding: 11px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #292c3d;
  background: linear-gradient(135deg, #fff 0%, #fbfbff 100%);
  border: 1px solid #d8dceb;
  border-radius: 9px;
  box-shadow: 0 4px 12px rgba(52, 59, 102, .11);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  cursor: default;
  transition: border-color .2s ease, box-shadow .2s ease;

  &:hover {
    border-color: #8e94f4;
    box-shadow: 0 7px 18px rgba(71, 76, 164, .16);
  }

  &__header {
    min-width: 0;
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
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  &__title {
    min-width: 0;
    overflow: hidden;
    color: #292c3d;
    font-size: 17px;
    font-weight: 600;
    line-height: 27px;
    letter-spacing: .3px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  &__run,
  &__more {
    width: 25px;
    height: 25px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 5px;
    color: #373b4c;
    background: transparent;
    cursor: pointer;
    transition: color .18s ease, background .18s ease;

    &:hover {
      color: #5962dc;
      background: #f0f1f8;
    }
  }

  &__run svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  &__more {
    gap: 3px;

    span {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
    }
  }

  &__body {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  &__label {
    flex: 0 0 auto;
    color: #aeb3c9;
    font-size: 12px;
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
}
</style>
