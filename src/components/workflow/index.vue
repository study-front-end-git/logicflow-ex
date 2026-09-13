<template>
  <div class="workflow-container">
    <div @dragover.prevent.stop="dragover" @drop.prevent.stop="drop" class="workflow" ref="container"></div>
    <div class="drag-click-list" @click="openDragClickList">
      <input id="node-list-switch" class="drag-click-list__switch" type="checkbox">

      <label
        class="drag-click-list__trigger"
        for="node-list-switch"
        title="展开或收起节点列表"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m10 7-4 5 4 5" />
          <path d="M7 12h7" />
          <path d="M16 7h2M16 12h2M16 17h2" />
        </svg>
      </label>

      <drag-click-list ref="dragClickListRef" class="drag-click-list__panel" />
    </div>

    <div class="canvas-toolbar">
      <!-- <button class="canvas-toolbar__button canvas-toolbar__mouse" type="button" title="选择工具">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="3" width="10" height="17" rx="5" />
          <path d="M12 3v5" />
        </svg>
        <i class="el-icon-arrow-down"></i>
      </button> -->

      <!-- <button class="canvas-toolbar__zoom" type="button" title="画布缩放"> -->
        <!-- <span>88%</span>
        <i class="el-icon-arrow-down"></i> -->
        <el-select size="small" @change="handleZoom" v-model="currentSize" placeholder="请选择">
          <el-option
            @click="clickOption(item.label)"
            v-for="item in sizeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      <!-- </button> -->

      <span class="canvas-toolbar__divider"></span>

      <!-- <button class="canvas-toolbar__button" type="button" title="备注">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5h14v11H11l-4 3v-3H5V5Z" />
          <circle cx="9" cy="10.5" r="1" />
          <circle cx="12" cy="10.5" r="1" />
          <circle cx="15" cy="10.5" r="1" />
        </svg>
      </button> -->

      <button @click="handleControl" class="canvas-toolbar__button" type="button" title="缩略图">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      </button>

      <button @click="downloadPic" class="canvas-toolbar__button" type="button" title="导出为图片">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="16" height="13" rx="1.5" />
          <path d="m6 14 3.5-3.5 2.5 2 3-3 4 4M16 17l4 4M20 16v5h-5" />
        </svg>
      </button>

      <el-button @click="handleTryRun" size="small" type="primary">试运行</el-button>

      <!-- <button class="canvas-toolbar__button" type="button" title="画布预览">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h16v12H9l-4 3v-3H4V5Z" />
          <path d="m15 13 4 4M19 12v5h-5" />
        </svg>
      </button> -->

      <!-- <span class="canvas-toolbar__divider"></span>

      <label class="canvas-toolbar__add" for="node-list-switch">
        <i class="el-icon-plus"></i>
        <span>添加节点</span>
      </label> -->
    </div>

    <my-drawer
      ref="myDrawer"
      @changeProperties="changeProperties"
    ></my-drawer>

    <try-run-edit
      @tryRun="tryRun"
      :workflowId="workflowId"
      ref="tryRunRef"
    >
    </try-run-edit>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
// import '@logicflow/core/dist/style/index.css'
import '@logicflow/core/lib/style/index.css'
import '@logicflow/extension/lib/style/index.css'
import StartNode from './start-node/start-node.js'
import { UUID } from 'uuidjs'
import MyDrawer from './MyDrawer.vue'
import EndNode from './end-node/end-node.js'
import inputNode from './input-node/input-node.js'
import modelNode from './model-node/model-node.js'
import dragClickList from './drag-click-list.vue'
import { createWorkflowNode, DEFAULT_NODE_SIZE } from './enum/node-factory.js'
import { validateEdge } from './scripts/edgeRules.js'
import customEdge from './scripts/custom-edge.js'
import { MiniMap, Snapshot } from '@logicflow/extension'
import TryRunEdit from './TryRunEdit.vue'
import httpNode from './http-node/http-node.js'
import ifElseNode from './if-else-node/if-else-node.js'
// import { saveNodeData } from '../../api/api.js'

export default {
  name: 'WorkFlowIndex',
  components: {
    MyDrawer,
    dragClickList,
    TryRunEdit
  },
  props: {},
  data () {
    return {
      lf: null,
      renderData: null,
      clickNodeIdList: [],
      workflowId: this.$route.params.id,
      name: this.$route.params.name,
      nodeTypeList: { 'input-node': [], 'model-node': [] },
      ignoreNextNodeClick: false,
      sizeOptions: [
        {
          value: 1,
          label: '100%'
        },
        {
          value: 0.5,
          label: '50%'
        },
        {
          value: 1.5,
          label: '150%'
        },
        {
          value: 2,
          label: '200%'
        }

      ],
      currentSize: 1,
      isShowMiniMap: false,
      version: null
    }
  },
  watch: {},
  computed: {},
  methods: {
    registerNode (instance) {
      instance.register(StartNode)
      instance.register(EndNode)
      instance.register(inputNode)
      instance.register(modelNode)
      instance.register(httpNode)
      instance.register(ifElseNode)
    },
    async initRenderData (instance) {
      await this.getRenderData()
      if (this.renderData) {
        instance.render(this.renderData)
      } else {
        console.log('本地没有renderdata')

        this.renderData = {
          nodes: [
            // 开始节点
            {
              id: UUID.generate(),
              type: 'start-node',
              x: 500,
              y: 300,
              text: '',
              properties: {
                workflowId: this.$route.params.id,
                description: '工作流的起始节点，用于开始工作流',
                label: '开始',
                width: 160,
                height: 80,
                data: [
                  {
                    id: UUID.generate(),
                    name: 'input',
                    description: '',
                    shortLabel: 'Str',
                    type: 'String',
                    required: true
                  }
                ]
              }
            },
            // 结束节点
            {
              id: UUID.generate(),
              type: 'end-node',
              x: 1200,
              y: 300,
              text: '',
              properties: {
                description: '工作流的最终节点，用户返回工作流运行后的结果信息',
                label: '结束',
                workflowId: this.workflowId, // 添加workflowId到节点属性中
                width: 160,
                height: 80,
                isCustomReply: false,
                data: [
                  {
                    id: UUID.generate(),
                    name: 'output',
                    type: 'String',
                    children: [],
                    valueType: 'input',
                    inputValue: 'output',
                    shortLabel: 'Str',
                    referenceKey: [],
                    referenceValue: []
                  }
                ],
                cueWord: '' // 自定义回复内容
              }
            }
          ],
          edges: []
        }
        instance.render(this.renderData)

        const paramData = {
          name: this.name,
          description: this.name,
          graphData: this.renderData
        }
        this.putSaveNodeData(paramData)
      }
    },
    async getRenderData () {
      try {
        const response = await this.$api.getNodeData(this.workflowId)

        this.renderData = response.data.graphData
        this.version = response.data.version

        console.log('读取到的画布：', this.renderData)
        console.log('当前版本：', this.version)
      } catch (error) {
        if (error.response?.status === 404) {
          this.renderData = null
          this.version = null
          return
        }

        throw error
      }
    },
    registerEvent (instance) {
      instance.on('node:click', (data) => {
        if (this.ignoreNextNodeClick) {
          return
        }
        console.log('node data:', data)

        this.$refs.myDrawer.handleOpen(data, instance)

        if (this.clickNodeIdList.length >= 1) {
          this.clickNodeIdList.forEach(item => {
            instance.getNodeModelById(item)?.setProperties({
              active: false
            })
          })
        }
        const node = instance.getNodeModelById(data.data.id)
        this.clickNodeIdList.push(data.data.id)
        console.log('node:', node)

        node.setProperties({
          active: true
        })
      })

      instance.on('blank:click', (e) => {
        const node = instance.getNodeModelById(this.clickNodeIdList[this.clickNodeIdList.length - 1])
        if (node) {
          node.setProperties({
            active: false
          })
          this.clickNodeIdList = []
        }
      })

      instance.on('node:dragstart', () => {
        this.ignoreNextNodeClick = true
        this.$refs.myDrawer.handleCancel()
      })

      instance.on('node:drag', () => {
        this.$refs.myDrawer.handleCancel()
      })

      instance.on('node:drop', () => {
        this.$refs.myDrawer.handleCancel()

        // 因为在drop后会有一个浏览器补发的点击 所以可能会导致打开抽屉
        // 可以用一个定时器去忽略这次的点击
        setTimeout(() => {
          this.ignoreNextNodeClick = false
        }, 100)

        this.saveGraphData()
      })

      instance.on('node:delete', (data) => {
        this.saveGraphData()
      })

      instance.on('edge:add', (data) => {
        console.log('data:', data)

        const result = validateEdge(instance, this, data)
        console.log('连线result:', result)

        this.saveGraphData()
      })

      instance.on('blank:mousedown', () => {
        this.$refs.container.classList.add('lf-dragging')
      })

      instance.on('blank:mouseup', () => {
        this.$refs.container.classList.remove('lf-dragging')
      })

      instance.on('node:add', (data) => {
        console.log('有节点添加进来data:', data)

        this.saveGraphData()
      })

      instance.on('edge:delete', () => {
        this.saveGraphData()
      })
    },

    changeProperties (data, id) {
      const node = this.lf.getNodeModelById(id)

      if (!node) return

      // 上面的setPtoperties只能改变model上的数据，
      // 下面的这个事件才能改变view层的数据
      node.setProperties(Array.isArray(data) ? { data } : data)
      this.lf.graphModel.eventCenter.emit('save', { data, id, lf: this.lf })

      this.saveGraphData()
    },

    openDragClickList () {
      console.log('点击率')

      this.$refs.dragClickListRef.handleOpenList()
    },

    dragover () {
      // console.log('dragover')
    },

    drop (e) {
      console.log('drop')
      const type = this.$store.state.dragItemType
      console.log('drop type:', type)

      console.log('x,y', e.clientX, e.clientY)
      this.addNode(type, { x: e.clientX, y: e.clientY })
    },

    addNode (type, position, bid, versionId, output, input, data, desc, knowledgeOutput) {
      if (position) {
        const { title } = this.getNodeIndex(type)

        const nodeWidth = DEFAULT_NODE_SIZE.width
        const nodeHeight = DEFAULT_NODE_SIZE.height

        let { x, y } = position
        x = x - nodeWidth / 2
        y = y - nodeHeight / 2

        const node = createWorkflowNode({
          type,
          x,
          y,
          workflowId: this.workflowId,
          width: nodeWidth,
          height: nodeHeight,
          title: title || '',
          properties: {
            ...(bid ? { bid } : {}),
            ...(versionId ? { versionId } : {}),
            ...(output ? { output } : {}),
            ...(input ? { input } : {}),
            ...(type !== 'workflow-node' ? { inputType: 'input' } : {}),
            ...(data || knowledgeOutput ? { data: data || knowledgeOutput } : {}),
            ...(desc ? { desc } : {})
          }
        })

        this.lf.addNode(node)
      }
    },

    // 该方法是为了生成不重复的title
    // 可以转化成寻找最小可用编号
    // 感觉以后再遇到这种使编号不重复的问题都可以这样做
    getNodeIndex (newType) {
      const titleMap = {
        'input-node': '输入',
        'model-node': '大模型',
        'http-node': 'http插件',
        'if-else-node': 'if-else'
      }

      if (!titleMap[newType]) return

      const nodeSet = new Set()
      const nodes = this.lf.getGraphData().nodes.filter(item => {
        return item.type === newType
      })
      console.log('nodes list:', nodes)

      const baseTitle = `${titleMap[newType]}_`

      if (nodes.length !== 0) {
        for (const node of nodes) {
          if (node.properties.title === titleMap[newType]) {
            nodeSet.add(0)
          } else if (node.properties.title.includes(baseTitle)) {
            const index = +node.properties.title.split('_')[1]
            nodeSet.add(index)
          }
        }

        // 最重要一步
        let index = 0
        while (nodeSet.has(index)) {
          index += 1
        }

        return {
          title: index === 0 ? `${titleMap[newType]}` : `${titleMap[newType]}_${index}`
        }
      } else {
        return {
          title: `${titleMap[newType]}`
        }
      }
    },

    async saveGraphData () {
      if (!this.lf) return

      console.log('param vresion:', this.version)

      const saveData = this.lf.getGraphData()
      const paramData = {
        name: this.name,
        description: this.name,
        graphData: saveData,
        ...(this.version !== null
          ? { version: this.version }
          : {})
      }
      await this.putSaveNodeData(paramData)
      // localStorage.setItem(`workflow${this.workflowId}`, JSON.stringify(saveData))
    },

    handleZoom (newval) {
      console.log('newval:', newval)
      if (typeof newval === 'string') {
        if (newval === '放大') {
          this.currentSize = this.currentSize + 0.1
          console.log('this.currentSize:', this.currentSize)

          this.lf.zoom(this.currentSize)
        } else {
          this.currentSize = this.currentSize - 0.1
          console.log('this.currentSize:', this.currentSize)

          this.lf.zoom(this.currentSize)
        }
      }
      this.lf.zoom(newval)
    },

    handleControl (e) {
      this.isShowMiniMap = !this.isShowMiniMap
      console.log('此时isShowMap:', this.isShowMiniMap)

      const miniMap = this.lf?.extension?.miniMap
      if (!this.isShowMiniMap) {
        miniMap.hide()
      } else {
        const position = this.lf.getPointByClient(
          e.clientX,
          e.clientY
        )

        miniMap.show(
          position.domOverlayPosition.x - 120,
          position.domOverlayPosition.y - 180
        )
      }
    },

    downloadPic () {
      this.lf.getSnapshot()
      this.$message({
        message: '导出成功',
        type: 'success'
      })
    },

    handleTryRun () {
      this.$refs.tryRunRef.handleOpen()
    },

    async putSaveNodeData (paramData) {
      const data = await this.$api.saveNodeData(this.workflowId, paramData)
      console.log('响应data:', data)
      this.version = data.data?.version
      console.log('this.verison:', this.version)
    },

    async tryRun (runtimeData) {
      try {
        this.$store.commit('getIsShowLoading', true)
        const data = await this.$api.tryRunModel(this.workflowId, runtimeData)
        this.$store.commit('getRunTimeData', data)
        console.log('model run data:', data)
      } catch (error) {
        console.log(error)
      } finally {
        this.$store.commit('getIsShowLoading', false)
      }
    }

    // async getGetNodeData () {
    //   const data = await this.$api.getNodeData(this.workflowId)
    //   console.log('响应get data:', data)
    // }

  },
  created () {},
  async mounted () {
    // 初始化
    this.lf = new LogicFlow({
      container: this.$refs.container,
      grid: {
        size: 20,
        visible: true,
        type: 'dot',
        config: {
          color: '#ababab',
          thickness: 1
        }
      },
      background: {
        background: '#EFEFF4'
      },
      hoverOutline: false, // 禁止节点hover时出现边框
      adjustNodePosition: true, // 允许拖动节点
      autoExpand: false,
      snapline: true,
      adjustEdge: false,
      edgeTextEdit: false,
      nodeTextEdit: false,
      draggable: true, // 允许画布拖拽
      stopScrollGraph: true,
      stopMoveGraph: false, // 允许画布移动
      edgeType: 'custom-edge',
      adjustEdgeStartAndEnd: true,

      edge: {
        draggable: true, // 默认所有边允许拖拽端点
        draggableAll: false // 默认不允许整条边整体拖拽
      },
      defaultEdge: { type: 'custom-edge' },
      style: {
        bezier: {
          stroke: '#4D53E8',
          strokeWidth: 2,
          hover: {
            stroke: '#4D53E8',
            strokeWidth: 2
          }
        },
        outline: {
          fill: 'transparent',
          stroke: '#949494',
          strokeDasharray: '3,3',
          hover: {
            stroke: '#949494'
          }
        }
      },
      keyboard: {
        enabled: true,
        shortcuts: [
          {
            keys: ['backspace', 'delete'],
            callback: () => {
              const elements = this.lf.getSelectElements(true)
              this.lf.clearSelectElements()
              elements.edges.forEach((edge) => this.lf.deleteEdge(edge.id))
              elements.nodes.forEach((node) => this.lf.deleteNode(node.id))
            }
          },
          {
            keys: ['ctrl+c', 'meta+c'],
            callback: () => {
              const elements = this.lf.getSelectElements(true)
              console.log('elements:', elements.nodes[0].type)
              const type = elements.nodes[0].type
              if (type !== 'start-node' && type !== 'start-node') {
                this.$message({
                  message: '复制成功',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: '开始或者结束节点不可复制',
                  type: 'warning'
                })
              }
            }
          },
          {
            // 需验证
            keys: ['ctrl+v', 'meta+v'],
            callback: () => {
              const elements = this.lf.getSelectElements(true)
              console.log('elements:', elements.nodes[0])
              const { id, type } = elements.nodes[0]
              if (type !== 'start-node' && type !== 'start-node') {
                this.lf.cloneNode(id)
                this.$message({
                  message: '粘贴成功',
                  type: 'success'
                })
              }
            }
          }
        ]
      },
      plugins: [
        MiniMap,
        Snapshot
      ]
    })
    // 注册节点
    this.registerNode(this.lf)
    // 注册边
    this.lf.register(customEdge)
    // 渲染
    await this.initRenderData(this.lf)
    // 注册事件
    this.registerEvent(this.lf)

    this.$emit('getlf', this.lf)

    // this.getGetNodeData()
  }
}
</script>
<style lang="scss" scoped>
.workflow-container{
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;

  .workflow{
    flex: 1;
    min-width: 0;
    min-height: 0;
    background: #efeff4;

    &.lf-dragging {
      cursor: -webkit-grabbing !important;
      cursor: -moz-grabbing !important;
      cursor: grabbing !important;
      * {
        cursor: inherit !important;
    }
  }

  }

  .drag-click-list {
    position: absolute;
    z-index: 20;
    inset: 0 auto 0 0;
    width: 306px;
    pointer-events: none;

    &__switch {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }

    &__trigger {
      position: absolute;
      z-index: 22;
      top: 24px;
      left: 18px;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e0e3ec;
      border-radius: 9px;
      color: #5962dc;
      background: #fff;
      box-shadow: 0 7px 20px rgba(42, 48, 82, .14);
      cursor: pointer;
      pointer-events: auto;
      transition: left .24s ease, color .2s ease, background .2s ease, transform .2s ease, box-shadow .2s ease;

      &:hover {
        color: #fff;
        background: #626be7;
        box-shadow: 0 9px 23px rgba(70, 79, 190, .26);
        transform: translateY(-2px);
      }

      svg {
        width: 19px;
        height: 19px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    &__panel {
      position: absolute;
      z-index: 20;
      inset: 0 auto 0 0;
      width: 306px;
      height: 100%;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateX(-100%);
      transition: opacity .22s ease, transform .22s ease, visibility .22s ease;
    }

    &__switch:checked {
      ~ .drag-click-list__trigger {
        left: 254px;
        color: #4f576c;
        background: #fff;
      }

      ~ .drag-click-list__panel {
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
        transform: translateX(0);
      }
    }
  }

  .canvas-toolbar {
    position: absolute;
    z-index: 30;
    bottom: 16px;
    left: calc(100vw / 2);
    margin-left: -91px;
    height: 48px;
    padding: 5px 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    border: 1px solid #d9dde8;
    border-radius: 13px;
    background: rgba(255, 255, 255, .96);
    box-shadow: 0 5px 16px rgba(46, 54, 83, .12);
    backdrop-filter: blur(8px);

    &__button,
    &__zoom,
    &__add {
      height: 36px;
      border: 0;
      border-radius: 9px;
      color: #3f4557;
      background: transparent;
      cursor: pointer;
      transition: color .2s ease, background .2s ease;
    }

    &__button {
      width: 37px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 19px;
        height: 19px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      &:hover { color: #554cf4; background: #f0efff; }
    }

    &__mouse {
      width: 43px;
      gap: 5px;

      svg { width: 17px; }
      i { font-size: 10px; }
    }

    &__zoom {
      width: 86px;
      padding: 0 11px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #d7dce9;
      font-size: 13px;

      i { color: #73798b; font-size: 11px; }
      &:hover { border-color: #aeb5d3; background: #f8f8fc; }
    }

    &__divider { width: 1px; height: 23px; margin: 0 3px; background: #eceef3; }

    &__add {
      min-width: 140px;
      padding: 0 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      color: #514cf0;
      background: #eeedff;
      font-size: 15px;
      font-weight: 500;

      i { font-size: 17px; }
      &:hover { color: #fff; background: #5a53f2; }
    }
  }

}
</style>
