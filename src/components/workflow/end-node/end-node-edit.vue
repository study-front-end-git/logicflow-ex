<template>
  <div class="end-node-editor">
    <div class="editor-header">
      <div>
        <h3>结束节点</h3>
        <p>设置工作流结束时需要返回的内容</p>
      </div>
      <el-button v-if="form.outputMode === 'variable'" type="primary" size="small" icon="el-icon-plus" @click="addParam">
        添加参数
      </el-button>
    </div>

    <div class="editor-content">
      <section class="output-setting">
        <div class="section-title">
          <span>输出类型</span>
          <small>选择工作流最终返回内容的方式</small>
        </div>

        <el-radio-group v-model="form.outputMode" class="output-type-list">
          <el-radio label="variable" class="output-type-card">
            <span class="output-type-card__icon">
              <i class="el-icon-connection"></i>
            </span>
            <span class="output-type-card__content">
              <strong>返回变量</strong>
              <small>将节点中的变量作为结构化数据返回</small>
            </span>
          </el-radio>

          <el-radio label="text" class="output-type-card">
            <span class="output-type-card__icon output-type-card__icon--text">
              <i class="el-icon-document"></i>
            </span>
            <span class="output-type-card__content">
              <strong>返回文本</strong>
              <small>直接返回一段固定或动态文本内容</small>
            </span>
          </el-radio>
        </el-radio-group>
      </section>

      <section v-if="form.outputMode === 'variable'" class="editor-section input-section">
        <div class="input-section__title">
          <i class="el-icon-arrow-down"></i>
          <span>输出</span>
        </div>

        <div class="parameter-head">
          <span>参数名</span>
          <span>参数值</span>
        </div>

        <div v-for="(item, index) in form.data" :key="item.id" class="parameter-item">
          <div class="parameter-row">
            <el-input
              v-if="item.valueType === 'input'"
              v-model="item.name"
              size="small"
              placeholder="请输入参数名"
            />
            <el-input
              v-else
              :value="getReferenceParamName(item.referenceValue)"
              size="small"
              placeholder="请选择引用参数"
              readonly
            />

            <el-select
              v-model="item.valueType"
              size="small"
              placeholder="取值方式"
            >
              <el-option label="输入" value="input" />
              <el-option label="引用" value="reference" />
            </el-select>

            <el-input
              v-if="item.valueType === 'input'"
              v-model="item.inputValue"
              size="small"
              placeholder="请输入参数值"
            />

            <el-cascader
              v-else
              v-model="item.referenceValue"
              size="small"
              :options="upperParamOptions"
              :props="{ expandTrigger: 'hover' }"
              placeholder="请选择上游参数"
              @change="handleReferenceChange($event, item)"
            />

            <button class="parameter-remove" type="button" aria-label="删除参数" @click="removeParam(index)">
              <i class="el-icon-minus"></i>
            </button>

          </div>
        </div>

        <button @click="addParam" class="parameter-add" type="button">
          <i class="el-icon-plus"></i>
          <span>添加</span>
        </button>
      </section>

      <section v-else class="text-output-section">
        <div class="section-title">
          <span>返回文本</span>
          <small>支持填写固定文本或工作流结果说明</small>
        </div>
        <el-input
          v-model="form.cueWord"
          type="textarea"
          :rows="8"
          maxlength="2000"
          show-word-limit
          resize="none"
          placeholder="请输入工作流结束时返回的文本"
        />
      </section>
    </div>

    <div class="editor-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="save">保存配置</el-button>
    </div>
  </div>
</template>

<script>
import { UUID } from 'uuidjs'

const clone = value => JSON.parse(JSON.stringify(value || {}))

const createInputParameter = () => ({
  id: UUID.generate(),
  name: '',
  type: 'String',
  shortLabel: 'Str',
  valueType: 'input',
  inputValue: '',
  referenceKey: [],
  referenceValue: []
})

export default {
  components: {},
  props: [
    'editData',
    'inComingParams'

  ],
  data () {
    const form = clone(this.editData)

    form.data = Array.isArray(form.data) ? form.data : []
    form.outputMode = form.outputMode || (form.isCustomReply ? 'text' : 'variable')
    form.cueWord = form.cueWord || ''

    form.data.forEach(item => {
      this.$set(item, 'valueType', item.valueType || 'input')
      this.$set(item, 'inputValue', item.inputValue || '')
      this.$set(item, 'referenceValue', Array.isArray(item.referenceValue) ? item.referenceValue : [])
    })

    return {
      form
    }
  },
  watch: {},
  computed: {
    upperParamOptions () {
      return (this.inComingParams || []).map(node => ({
        value: node.nodeId,
        label: node.title || node.nodeType,
        children: (Array.isArray(node.output) ? node.output : []).map((item, index) => ({
          value: item.name || item.key || index,
          label: `${item.name || item.key || `参数${index + 1}`} (${item.type || 'String'})`
        }))
      })).filter(node => node.children.length)
    }
  },
  methods: {
    getReferenceParamName (referenceValue) {
      return Array.isArray(referenceValue) ? referenceValue[1] || '' : ''
    },
    handleReferenceChange (referenceValue, item) {
      const paramName = this.getReferenceParamName(referenceValue)
      const sourceNode = (this.inComingParams || []).find(node => node.nodeId === referenceValue?.[0])
      const sourceParam = (sourceNode?.output || []).find(param => param.name === referenceValue?.[1])

      item.name = paramName
      item.type = sourceParam?.type || 'String'
      item.shortLabel = sourceParam?.shortLabel || this.getShortLabel(item.type)
      item.referenceKey = Array.isArray(referenceValue) ? [...referenceValue] : []
    },
    getShortLabel (type) {
      const labelMap = {
        String: 'Str',
        Number: 'Num',
        Boolean: 'Bool',
        Object: 'Obj',
        Array: 'Arr'
      }

      return labelMap[type] || 'Any'
    },
    addParam () {
      this.form.data.push(createInputParameter())
    },
    removeParam (index) {
      this.form.data.splice(index, 1)
    },
    handleCancel () {
      this.$emit('handleCancel')
    },
    save () {
      if (this.form.outputMode === 'text') {
        if (!this.form.cueWord.trim()) {
          this.$message.warning('请输入返回文本')
          return
        }
      } else {
        if (this.form.data.length === 0) {
          this.$message.warning('请至少添加一个输出参数')
          return
        }

        const invalidParam = this.form.data.some(item => {
          if (!item.name?.trim()) return true
          if (item.valueType === 'reference') {
            return !Array.isArray(item.referenceValue) || item.referenceValue.length < 2
          }
          return !item.inputValue?.trim()
        })

        if (invalidParam) {
          this.$message.warning('请完整填写输出参数')
          return
        }
      }

      this.form.isCustomReply = this.form.outputMode === 'text'
      this.form.data.forEach(item => {
        item.referenceKey = item.valueType === 'reference' ? [...item.referenceValue] : []
        if (item.valueType === 'reference') item.inputValue = ''
      })

      this.$emit('saveEditData', clone(this.form))
    }
  },
  created () {},
  mounted () {}
}
</script>
<style lang="scss" scoped>
.end-node-editor {
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

.editor-content {
  flex: 1;
  padding: 20px 2px;
  overflow-y: auto;
}

.output-setting {
  padding-bottom: 22px;
  border-bottom: 1px solid #eceef4;
}
.text-output-section {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #e4e7ef;
  border-radius: 10px;
  background: #fafbfe;
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

.output-type-list {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.output-type-card {
  height: 72px;
  margin: 0 !important;
  padding: 12px;
  display: flex !important;
  align-items: center;
  border: 1px solid #e3e6ee;
  border-radius: 9px;
  background: #fafbfe;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;

  &:hover {
    border-color: #bec4ed;
    box-shadow: 0 4px 12px rgba(67, 75, 129, .07);
  }

  &__icon {
    width: 34px;
    height: 34px;
    margin: 0 9px 0 7px;
    flex: 0 0 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: #5962dc;
    background: #e9ebff;
    font-size: 17px;

    &--text {
      color: #687285;
      background: #eef0f4;
    }
  }

  &__content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
      color: #414555;
      font-size: 13px;
      font-weight: 500;
    }

    small {
      overflow: hidden;
      color: #a2a6b5;
      font-size: 10px;
      line-height: 15px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.parameter-section {
  padding-top: 20px;
}

.parameter-list {
  padding-top: 2px;
}

.parameter-card {
  position: relative;
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
  }

  &__source {
    margin-top: 12px;
    display: block;
  }

  &__fields label > span,
  &__source > span {
    margin-bottom: 6px;
    display: block;
    color: #777c8f;
    font-size: 12px;
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

.end-node-editor {
  ::v-deep .el-radio__input {
    align-self: flex-start;
    margin-top: 8px;
  }

  ::v-deep .el-radio__input.is-checked + .el-radio__label {
    color: inherit;
  }

  ::v-deep .el-radio__input.is-checked .el-radio__inner {
    border-color: #626be7;
    background: #626be7;
  }

  ::v-deep .el-radio__label {
    min-width: 0;
    padding-left: 0;
    display: flex;
    align-items: center;
  }

  ::v-deep .el-select {
    width: 100%;
  }

  ::v-deep .el-cascader {
    width: 100%;
  }

  ::v-deep .el-input__inner {
    border-color: #dfe2eb;
    border-radius: 7px;
  }

  ::v-deep .el-textarea__inner {
    border-color: #dfe2eb;
    border-radius: 8px;
    font-family: inherit;
    line-height: 21px;
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

.editor-section { padding-bottom: 22px; margin-bottom: 20px; border-bottom: 1px solid #eceef4; }
.editor-section--last { margin-bottom: 0; border-bottom: 0; }
.section-title {
  margin-bottom: 12px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  > span { color: #3b3f50; font-size: 14px; font-weight: 600; }
  small { color: #a3a7b6; font-size: 11px; }
}
.setting-card { padding: 15px; border: 1px solid #e4e7ef; border-radius: 10px; background: #fafbfe; transition: border-color .2s ease, box-shadow .2s ease; }
.setting-card:hover { border-color: #c4b8eb; box-shadow: 0 5px 14px rgba(91, 68, 153, .08); }
.basic-card { display: grid; grid-template-columns: minmax(0, 1fr) 155px; gap: 10px; }
.parameter-fields { display: grid; grid-template-columns: minmax(0, 1fr) 145px; gap: 10px; }
.form-field { min-width: 0; display: block; }
.form-field > span { margin-bottom: 6px; display: block; color: #777c8f; font-size: 12px; }
.form-field--full { width: 100%; }
.input-section {
  padding: 14px 12px 16px;
  border: 0;
  border-radius: 10px;
  background: #f7f8fc;
}
.input-section__title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #202331;
  font-size: 16px;
  font-weight: 500;

  i { font-size: 13px; font-weight: 700; }
}
.parameter-head {
  margin: 14px 0 8px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2.15fr);
  gap: 6px;
  color: #999ead;
  font-size: 12px;
}
.parameter-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px minmax(0, 1.15fr) 24px;
  align-items: center;
  gap: 6px;
}
.parameter-item + .parameter-item { margin-top: 10px; }
.parameter-remove {
  width: 22px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #4f535d;
  border-radius: 50%;
  color: #4f535d;
  background: transparent;
  cursor: pointer;

  i { font-size: 11px; font-weight: 700; }
}
.parameter-remove:hover { color: #626be7; border-color: #626be7; }
.parameter-add {
  margin-top: 11px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  color: #4c67ff;
  background: transparent;
  font-size: 13px;
  cursor: pointer;

  i { font-size: 17px; font-weight: 600; }
}
.parameter-add:hover { color: #304fe9; }
.prompt-card__user { margin-top: 14px; }
.variable-tip { margin-top: 10px; display: flex; align-items: center; gap: 6px; color: #8f95a6; font-size: 10px; i { color: #795ad4; } }
.model-settings { display: grid; grid-template-columns: minmax(0, 1fr) 150px; gap: 18px; }
.slider-field > div { display: flex; justify-content: space-between; color: #777c8f; font-size: 12px; }
.slider-field strong { color: #795ad4; font-weight: 600; }
.slider-field small { color: #a5a9b8; font-size: 10px; }
.input-suffix { color: #a1a6b5; font-size: 10px; line-height: 32px; }
</style>
