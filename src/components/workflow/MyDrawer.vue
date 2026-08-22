<template>
  <el-drawer
    class="workflow-drawer"
    title="配置节点"
    direction="rtl"
    size="420px"
    :visible.sync="isShowDrawer"
    :append-to-body="true"
    :destroy-on-close="true"
    :close-on-press-escape="true"
    :wrapper-closable="true"
    :modal="false"
    @closed="handleClosed"
  >
    <div class="workflow-drawer__content">
      <start-node-edit
        v-if="nodeType === 'start-node'"
        :editData="editData"
        @handleCancel="handleCancel"
        @saveEditData='saveEditData'
      />
      <end-node-edit
        v-if="nodeType === 'end-node'"
        :editData="editData"
        @handleCancel="handleCancel"
        @saveEditData='saveEditData'
        :inComingParams="inComingParams"
      >
      </end-node-edit>
      <input-node-edit
        v-if="nodeType === 'input-node'"
        :editData="editData"
        @handleCancel="handleCancel"
        @saveEditData='saveEditData'
      ></input-node-edit>
      <model-node-edit
        v-if="nodeType === 'model-node'"
        :editData="editData"
        :fullEditData="fullEditData"
        @handleCancel="handleCancel"
        @saveEditData='saveEditData'
        :inComingParams="inComingParams"
      ></model-node-edit>
    </div>
  </el-drawer>
</template>

<script>
import startNodeEdit from './start-node/start-node-edit.vue'
import endNodeEdit from './end-node/end-node-edit.vue'
import inputNodeEdit from './input-node/input-node-edit.vue'
import modelNodeEdit from './model-node/model-node-edit.vue'

export default {
  components: {
    startNodeEdit,
    endNodeEdit,
    inputNodeEdit,
    modelNodeEdit
  },
  props: {
  },
  data () {
    return {
      isShowDrawer: false,
      nodeType: null,
      editData: null,
      editNodeId: '',
      fullEditData: null,
      instance: null,
      inComingParams: null
    }
  },
  watch: {},
  computed: {},
  methods: {
    handleOpen (data, instance) {
      this.inComingParams = null

      this.isShowDrawer = true
      this.fullEditData = data
      this.nodeType = data.data.type
      this.instance = instance

      if (this.nodeType === 'model-node' || this.nodeType === 'end-node') {
        this.editData = data.data.properties
      } else {
        this.editData = data.data.properties.data
      }

      this.editNodeId = data.data.id

      this.inComingParams = this.formatUpperParams(this.editNodeId)
      console.log('得到的inComingParams：', this.inComingParams)
    },
    handleCancel () {
      this.isShowDrawer = false
    },
    saveEditData (data) {
      console.log('抽屉中的data:', data)

      this.editData = data
      this.isShowDrawer = false

      this.$emit('changeProperties', data, this.editNodeId)
    },
    formatUpperParams (id) {
      const params = []
      const visited = new Set([id])

      this.getIncomingNode(id, params, visited)
      return params
    },
    getIncomingNode (id, params, visited) {
      if (!id) return
      console.log('visited:', visited)

      const sourceNodeList = this.instance.getNodeIncomingNode(id)
      if (sourceNodeList.length === 0) return

      sourceNodeList.forEach(item => {
        if (visited?.has(item.id)) return

        visited?.add(item.id)
        // 根据你的节点结构，提取需要作为引用参数的数据
        // const output = item.properties?.output || item.properties?.data || []
        const output = item.type === 'model-node' ? item.properties?.output : item.properties?.data

        params.push({
          nodeId: item.id,
          nodeType: item.type,
          title: item.properties?.title || item.properties?.label,
          output
        })

        this.getIncomingNode(item.id, params, visited)
      })
      // 已经没有上游节点，结束递归
      // if (!sourceNodeList.length === 0) return

      // params.push(sourceNode.properties)
      // this.getIncomingNode(sourceNode.id, params)
    },
    handleClosed () {
      this.currentNodeId = ''
      this.inComingParams = []
    }
  },
  created () {},
  mounted () {}
}
</script>
<style lang="scss" scoped>
.workflow-drawer {
  right: 0;
  position: absolute;

  &__content {
    height: 100%;
    overflow: hidden;
  }

  ::v-deep .el-drawer {
    overflow: hidden;
    border-radius: 14px 0 0 14px;
    background: #fff;
    box-shadow: -12px 0 32px rgba(31, 37, 64, .14);
  }

  ::v-deep .el-drawer__header {
    height: 70px;
    margin: 0;
    padding: 0 22px;
    display: flex;
    align-items: center;
    color: #252838;
    border-bottom: 1px solid #eceef4;
    font-size: 18px;
    font-weight: 600;
  }

  ::v-deep .el-drawer__close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    color: #8d92a3;

    &:hover {
      color: #5962dc;
      background: #f0f1fa;
    }
  }

  ::v-deep .el-drawer__body {
    height: calc(100% - 70px);
    overflow: hidden;
  }
}
</style>
