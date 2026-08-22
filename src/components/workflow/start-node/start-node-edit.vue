<template>
  <div class="start-node-editor">
    <div class="editor-header">
      <div>
        <h3>开始节点</h3>
        <p>设置工作流启动时需要接收的输入参数</p>
      </div>
      <el-button @click="addParam" type="primary" size="small" icon="el-icon-plus">
        添加参数
      </el-button>
    </div>

    <div class="parameter-list">
      <div class="parameter-card" v-for="(item,index) in nodeData" :key="item.id">
        <span class="parameter-card__index">{{ index + 1 }}</span>
        <div class="parameter-card__fields">
          <label>
            <span>参数名称</span>
            <el-input @blur="validateData" size="small" v-model="item.name" placeholder="请输入参数名称" />
          </label>
          <label>
            <span>参数类型</span>
            <el-select size="small" v-model="item.type" placeholder="请选择类型">
              <el-option label="字符串 String" value="String" />
              <el-option label="数字 Number" value="Number" />
              <el-option label="布尔值 Boolean" value="Boolean" />
              <el-option label="对象 Object" value="Object" />
              <el-option label="数组 Array" value="Array" />
            </el-select>
          </label>
        </div>
        <el-button
          class="parameter-card__delete"
          type="text"
          icon="el-icon-delete"
          aria-label="删除参数"
          @click="deleteParam(index)"
        />
      </div>

    </div>

    <div class="editor-footer">
      <el-button @click="$emit('handleCancel')">取消</el-button>
      <el-button type="primary" @click="save">保存配置</el-button>
    </div>
  </div>
</template>

<script>
import { UUID } from 'uuidjs'
import { PARAM_NAME_RULE } from '../enum/paramrules'
import { PARAM_TYPE_OPTIONS } from '../enum/workflow-enum'

export default {
  components: {},
  props: {
    editData: Array
  },
  data () {
    return {
      nodeData: this.editData
    }
  },
  watch: {
    editData: {
      immediate: true,
      deep: true,
      handler (newVal) {
        this.nodeData = newVal
      }
    }
  },
  computed: {},
  methods: {
    addParam () {
      this.nodeData.push({
        id: UUID.generate(),
        name: '',
        description: '',
        shortLabel: 'Str',
        type: 'String',
        required: true
      }
      )
    },
    deleteParam (index) {
      this.nodeData.splice(index, 1)
    },
    save () {
      this.nodeData = this.nodeData.map(item => {
        if (PARAM_TYPE_OPTIONS[item.type].shortLabel === item.shortLabel) {
          return item
        } else {
          return { ...item, shortLabel: PARAM_TYPE_OPTIONS[item.type].shortLabel }
        }
      })
      console.log('start edit node new nodeData:', this.nodeData)

      const isPass = this.nodeData.every(item => {
        return this.checkData(item.name)
      })
      if (!isPass) return

      this.$emit('saveEditData', this.nodeData)
    },
    validateData (e) {
      console.log('e.target.value:', e.target.value)
      if (e.target.value && !PARAM_NAME_RULE.pattern.test(e.target.value)) {
        this.$message({
          message: PARAM_NAME_RULE.message,
          type: 'warning'
        })
      }
    },
    checkData (name) {
      console.log('name:', name)
      if (name && !PARAM_NAME_RULE.pattern.test(name)) {
        this.$message({
          message: PARAM_NAME_RULE.message,
          type: 'warning'
        })
        return false
      }
      return true
    }
  },
  created () {},
  mounted () {
  }
}
</script>
<style lang="scss" scoped>
.start-node-editor {
  height: 100%;
  padding: 0 22px;
  display: flex;
  flex-direction: column;
  color: #272a39;
  background: #fff;
}

.editor-header {
  padding: 22px 0 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #eceef4;

  h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #999eae;
    font-size: 12px;
    line-height: 18px;
  }
}

.parameter-list {
  flex: 1;
  padding: 18px 2px;
  overflow-y: auto;
}

.parameter-card {
  position: relative;
  margin-bottom: 12px;
  padding: 15px 38px 15px 42px;
  border: 1px solid #e4e7ef;
  border-radius: 10px;
  background: #fafbfe;
  transition: border-color .2s ease, box-shadow .2s ease;

  &:hover {
    border-color: #bdc3ed;
    box-shadow: 0 5px 14px rgba(67, 75, 129, .08);
  }

  &__index {
    position: absolute;
    top: 17px;
    left: 13px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: #5962dc;
    background: #e9ebff;
    font-size: 11px;
    font-weight: 600;
  }

  &__fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 145px;
    gap: 10px;

    label > span {
      margin-bottom: 6px;
      display: block;
      color: #777c8f;
      font-size: 12px;
    }
  }

  &__delete {
    position: absolute;
    top: 13px;
    right: 10px;
    padding: 6px;
    color: #a5aaba;

    &:hover {
      color: #ef5a62;
    }
  }
}

.editor-footer {
  margin: auto -22px 0;
  padding: 16px 22px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eceef4;
  background: #fff;
}

.start-node-editor {
  ::v-deep .el-select {
    width: 100%;
  }

  ::v-deep .el-input__inner {
    border-color: #dfe2eb;
    border-radius: 7px;
  }

  ::v-deep .el-button--primary {
    border-color: #626be7;
    background: #626be7;

    &:hover {
      border-color: #737bec;
      background: #737bec;
    }
  }
}
</style>
