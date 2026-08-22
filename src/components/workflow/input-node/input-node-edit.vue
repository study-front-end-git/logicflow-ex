<template>
  <div class="input-node-editor">
    <div class="editor-header">
      <div>
        <h3>输入节点</h3>
        <p>配置节点接收的数据及默认输入内容</p>
      </div>
      <el-button @click="addParam" type="primary" size="small" icon="el-icon-plus">
        添加参数
      </el-button>
    </div>

    <div class="editor-content">

      <section class="editor-section editor-section--parameter">
        <div class="section-title">
          <span>输入参数</span>
          <small>设置该节点接收的数据格式</small>
        </div>

        <div v-for="(item,index) in nodeData" :key="item.id" class="setting-card parameter-card">
          <span class="parameter-card__index">{{ index+1 }}</span>

          <div class="parameter-card__fields">
            <label class="form-field">
              <span>参数名称</span>
              <el-input size="small" v-model="item.name" placeholder="请输入参数名称" />
            </label>

            <label class="form-field">
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
      </section>
    </div>

    <div class="editor-footer">
      <el-button @click="$emit('handleCancel')" >取消</el-button>
      <el-button @click="save" type="primary">保存配置</el-button>
    </div>
  </div>
</template>

<script>
import { UUID } from 'uuidjs'
import { PARAM_TYPE_OPTIONS } from '../enum/workflow-enum'
import { PARAM_NAME_RULE } from '../enum/paramrules'

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
  watch: {},
  computed: {},
  methods: {
    addParam () {
      const defaultData = {
        defaultValue: '',
        description: '',
        id: UUID.generate(),
        inputValue: '',
        name: '',
        required: true,
        shortLabel: 'Str',
        type: 'String',
        valueType: 'manual'
      }
      this.nodeData.push(defaultData)
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
      console.log('input edit node new nodeData:', this.nodeData)

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
  mounted () {}
}
</script>
<style lang="scss" scoped>
.input-node-editor {
  height: 100%;
  padding: 0 22px;
  display: flex;
  flex-direction: column;
  color: #272a39;
  background: #fff;
}

.editor-header {
  padding: 22px 0 20px;
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

.editor-content {
  flex: 1;
  padding: 20px 2px;
  overflow-y: auto;
}

.editor-section {
  padding-bottom: 22px;
  border-bottom: 1px solid #eceef4;

  &--parameter {
    padding-top: 20px;
    padding-bottom: 0;
    border-bottom: 0;
  }

  &--output {
    padding-top: 20px;
    padding-bottom: 0;
    border-bottom: 0;
  }
}

.section-title {
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  > span {
    color: #3b3f50;
    font-size: 14px;
    font-weight: 600;
  }

  small {
    color: #a3a7b6;
    font-size: 11px;
  }
}

.setting-card {
  border: 1px solid #e4e7ef;
  border-radius: 10px;
  background: #fafbfe;
  transition: border-color .2s ease, box-shadow .2s ease;

  &:hover {
    border-color: #bdc3ed;
    box-shadow: 0 5px 14px rgba(67, 75, 129, .08);
  }
}

.basic-card {
  padding: 15px;

  &__description { margin-top: 14px; }
}

.output-preview {
  min-height: 58px;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e4e7ef;
  border-radius: 10px;
  background: #fafbfe;

  &__status { width: 8px; height: 8px; flex: 0 0 8px; border-radius: 50%; background: #626be7; box-shadow: 0 0 0 2px #dfe2ff; }
  &__content { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
  &__content strong { color: #414555; font-size: 13px; font-weight: 500; }
  &__content small { color: #a1a6b5; font-size: 11px; }
  &__type { padding: 3px 7px; border-radius: 5px; color: #5962dc; background: #e9ebff; font-size: 10px; font-weight: 600; }
}

.parameter-card {
  position: relative;
  padding: 15px 15px 16px 42px;

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
  }
}

.form-field {
  min-width: 0;
  display: block;

  > span {
    margin-bottom: 6px;
    display: block;
    color: #777c8f;
    font-size: 12px;
  }

  &--full {
    width: 100%;
  }
}

.input-mode {
  margin: 14px 0;
}

.editor-footer {
  margin: auto -22px 0;
  padding: 16px 22px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eceef4;
  background: #fff;
}

.input-node-editor {
  ::v-deep .el-select {
    width: 100%;
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-textarea__inner {
    border-color: #dfe2eb;
    border-radius: 7px;
  }

  ::v-deep .el-textarea__inner {
    font-family: inherit;
    line-height: 20px;
  }

  ::v-deep .el-radio-button__inner {
    padding: 8px 16px;
    border-color: #dfe2eb;
    color: #707588;
  }

  ::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    border-color: #626be7;
    color: #fff;
    background: #626be7;
    box-shadow: -1px 0 0 0 #626be7;
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
