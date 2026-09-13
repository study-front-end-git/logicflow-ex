<template>
  <aside class="node-library">
    <div class="node-library__header">
      <h3>选择节点</h3>
      <p>拖拽节点到画布中进行编排</p>
    </div>

    <div class="node-library__scroll">
      <section class="node-library__section">
        <p class="node-library__section-title">基础节点</p>

        <div class="node-library__list" >
          <div v-for="item in listData" :key="item.id" >
            <div draggable="true" @dragstart="dragstart" @dragend="dragend" class="node-item" :data-node-type="item.type">
              <span  class="node-item__icon node-item__icon--input">
                <div :v-html="item.html">

                </div>
                <!-- <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.5 6.5 9 12l5.5 5.5" />
                  <path d="M9.5 12H20" />
                </svg> -->
              </span>
              <span class="node-item__content">
                <strong>{{ item.name }}</strong>
                <small>{{ item.intro }}</small>
              </span>
              <span class="node-item__drag"><i></i><i></i><i></i><i></i><i></i><i></i></span>
            </div>
          </div>

          <!-- <div class="node-item" data-node-type="model-node">
            <span class="node-item__icon node-item__icon--model">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
                <path d="m4.8 7.4 7.2 4.1 7.2-4.1M12 11.5V21" />
              </svg>
            </span>
            <span class="node-item__content">
              <strong>大模型节点</strong>
              <small>调用模型生成处理结果</small>
            </span>
            <span class="node-item__drag"><i></i><i></i><i></i><i></i><i></i><i></i></span>
          </div> -->
        </div>
      </section>

      <section class="node-library__section">
        <p class="node-library__section-title">更多能力</p>
        <div class="node-item node-item--disabled">
          <span class="node-item__icon node-item__icon--more">···</span>
          <span class="node-item__content">
            <strong>更多节点</strong>
            <small>代码、判断和知识库节点</small>
          </span>
        </div>
      </section>
    </div>

    <div class="node-library__tip">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.5" />
      </svg>
      <span>按住节点并拖动到画布</span>
    </div>
  </aside>
</template>

<script>
import { UUID } from 'uuidjs'

export default {
  components: {},
  props: {},
  data () {
    return {
      isShow: false,
      listData: [
        {
          id: UUID.generate(),
          type: 'input-node',
          html: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 6.5 9 12l5.5 5.5" />
              <path d="M9.5 12H20" />
            </svg>
          `,
          name: '输入节点',
          intro: '接受文本或变量输入'
        },
        {
          id: UUID.generate(),
          type: 'model-node',
          html: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
              <path d="m4.8 7.4 7.2 4.1 7.2-4.1M12 11.5V21" />
            </svg>
          `,
          name: '大模型节点',
          intro: '调用模型生成处理结果'
        },
        {
          id: UUID.generate(),
          type: 'http-node',
          html: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 14.5 14.5 9" />
              <path d="m7.2 17.7-1 .9a3.7 3.7 0 0 1-5.2-5.2l3.1-3.1a3.7 3.7 0 0 1 5.2 0" />
              <path d="m16.8 6.3 1-.9a3.7 3.7 0 0 1 5.2 5.2l-3.1 3.1a3.7 3.7 0 0 1-5.2 0" />
            </svg>
          `,
          name: 'http插件',
          intro: '可以自定义http插件'
        },
        {
          id: UUID.generate(),
          type: 'if-else-node',
          html: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 14.5 14.5 9" />
              <path d="m7.2 17.7-1 .9a3.7 3.7 0 0 1-5.2-5.2l3.1-3.1a3.7 3.7 0 0 1 5.2 0" />
              <path d="m16.8 6.3 1-.9a3.7 3.7 0 0 1 5.2 5.2l-3.1 3.1a3.7 3.7 0 0 1-5.2 0" />
            </svg>
          `,
          name: 'if-else',
          intro: '添加条件判断'
        }
      ],
      dragItemType: null
    }
  },
  watch: {},
  computed: {},
  methods: {
    handleOpenList () {
      this.isShow = true
    },
    dragstart (e) {
      const element = e.target.closest('.node-item')
      console.log('element:', element.dataset.nodeType)

      this.$store.commit('getDragType', element.dataset.nodeType)
    },
    dragend () {
      console.log('dragend')
    }
  },
  created () {},
  mounted () {}
}
</script>
<style lang="scss" scoped>
.node-library {
  width: 306px;
  height: 100%;
  padding: 27px 18px 18px;
  display: flex;
  flex-direction: column;
  color: #292d3d;
  background: linear-gradient(180deg, #eef3ff 0%, #e7eefc 100%);
  border-right: 1px solid #dce3f1;
  box-shadow: 8px 0 24px rgba(42, 51, 88, .1);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  backdrop-filter: blur(10px);

  &__header {
    padding: 0 2px 20px;

    h3 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: #8e97aa;
      font-size: 12px;
    }
  }

  &__scroll {
    min-height: 0;
    padding-right: 8px;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd4e4 transparent;

    &::-webkit-scrollbar { width: 7px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { border-radius: 7px; background: #cbd4e4; }
  }

  &__section {
    margin-bottom: 24px;
  }

  &__section-title {
    margin: 0 0 11px;
    color: #747e93;
    font-size: 14px;
    font-weight: 500;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__tip {
    padding: 14px 2px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #a3a7b5;
    border-top: 1px solid rgba(195, 204, 223, .7);
    font-size: 10px;

    svg {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
    }
  }
}

.node-item {
  min-width: 0;
  min-height: 62px;
  padding: 12px 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e5e7ef;
  border-radius: 12px;
  background: #fff;
  cursor: grab;
  user-select: none;
  transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;

  &:hover {
    border-color: #b9bfed;
    box-shadow: 0 6px 14px rgba(67, 75, 129, .1);
    transform: translateY(-2px);
  }

  &:active {
    cursor: grabbing;
    transform: scale(.98);
  }

  &--disabled {
    opacity: .58;
    cursor: not-allowed;

    &:hover {
      border-color: #e5e7ef;
      box-shadow: none;
      transform: none;
    }
  }

  &__icon {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: #fff;

    &--input {
      background: linear-gradient(145deg, #6972ff, #555ce8);
    }

    &--model {
      background: linear-gradient(145deg, #9270ed, #7354ce);
    }

    &--more {
      color: #737b8e;
      background: #e4e8f0;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  &__content {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;

    strong,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: #3b3f50;
      font-size: 14px;
      font-weight: 500;
    }

    small {
      color: #a3a7b6;
      font-size: 11px;
    }
  }

  &__drag {
    width: 10px;
    flex: 0 0 10px;
    display: grid;
    grid-template-columns: repeat(2, 3px);
    gap: 3px;

    i {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: #b9bdca;
    }
  }
}
</style>
