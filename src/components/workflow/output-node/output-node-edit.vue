<template>
    <div class="end-node-editor">
    <div class="editor-header">
      <div>
        <h3>输出节点</h3>
        <p>设置工作流结束时需要返回的内容</p>
      </div>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addParam">
        添加参数
      </el-button>
    </div>

    <div class="editor-content">

      <section class="editor-section input-section">
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

      <section class="text-output-section">
        <div class="section-title">
          <span>返回文本</span>
          <small>支持填写固定文本或工作流结果说明</small>
        </div>
        <el-input
          @input="handleInput"
          v-model="form.cueWord"
          ref="textarea"
          type="textarea"
          :rows="5"
          resize="none"
          placeholder="请输入工作流结束时返回的文本"
        />
        <div v-if="showVariablePanel" class="variable-panel">
          <div class="variable-panel__title">选择输出参数中的变量</div>
          <div
            v-for="item in variables"
            :key="item.id"
            class="variable-panel-item"
            @mousedown.prevent
            @click="insertVariable(item)"
          >
            <span class="variable-panel-item__info">
              <strong>{{ item.name }}</strong>
              <em>{{ item.type }}</em>
            </span>
          </div>
          <div v-if="variables.length === 0" class="variable-panel__empty">暂无可引用的变量</div>
        </div>
        <div class="variable-tip">
          <i class="el-icon-connection"></i>
          <span>输入“/”可以选择输出参数中的变量</span>
        </div>
      </section>

      <section class="run-result">
        <div class="run-result__header">
          <span class="run-result__title">
            运行结果
          </span>
          <span v-if="nodeRunResult" class="run-result__status">运行成功</span>
        </div>

        <div v-if="nodeRunResult" class="run-result__content">
          <div class="run-result__section">
            <div class="run-result__heading">
              <span>输出变量</span>
              <copy-com :text="outputVariablesText"></copy-com>
            </div>
            <div class="run-result__box run-result__box--output">
              <div
                v-for="item in outputVariableEntries"
                :key="item.name"
                class="run-result__variable-row"
              >
                <span class="run-result__variable">{{ item.name }}</span>
                <span class="run-result__separator">:</span>
                <pre>{{ item.displayValue }}</pre>
              </div>
              <div v-if="outputVariableEntries.length === 0" class="run-result__box-empty"></div>
            </div>
          </div>

          <div class="run-result__section">
            <div class="run-result__heading">
              <span>回答内容</span>
              <copy-com :text="answerContent"></copy-com>
            </div>
            <div class="run-result__box run-result__box--answer">{{ answerContent }}</div>
          </div>
        </div>

        <div v-else class="run-result__empty">
          <i class="el-icon-s-data"></i>
          <span>暂无该输出节点的运行结果</span>
          <small>工作流成功运行并经过当前节点后，结果会显示在这里</small>
        </div>
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
import CopyCom from '../../CopyCom.vue'

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
  components: { CopyCom },
  props: {
    editData: {
      type: Object,
      default: () => ({})
    },
    inComingParams: {
      type: Array,
      default: () => []
    },
    nodeId: {
      type: String,
      default: ''
    }
  },
  data () {
    const form = clone(this.editData)

    form.data = Array.isArray(form.data) ? form.data : []
    form.cueWord = form.cueWord || ''

    form.data.forEach(item => {
      this.$set(item, 'valueType', item.valueType || 'input')
      this.$set(item, 'inputValue', item.inputValue || '')
      this.$set(item, 'referenceValue', Array.isArray(item.referenceValue) ? item.referenceValue : [])
    })

    return {
      form,
      showVariablePanel: false
    }
  },
  watch: {},
  computed: {
    runtimeResponseData () {
      return this.$store.state.runtimeResponseData
    },
    runtimeTrace () {
      const response = this.runtimeResponseData
      if (Array.isArray(response?.data?.trace)) return response.data.trace
      return Array.isArray(response?.trace) ? response.trace : []
    },
    nodeRunResult () {
      return this.runtimeTrace.find(item => (
        item.nodeType === 'output-node' &&
        item.nodeId === this.nodeId &&
        item.status !== 'skipped' &&
        Object.prototype.hasOwnProperty.call(item, 'output')
      )) || null
    },
    outputVariableEntries () {
      const output = this.nodeRunResult?.output
      if (!this.isPlainObject(output)) return []

      return Object.entries(output).map(([name, value]) => ({
        name,
        displayValue: this.formatResultValue(value)
      }))
    },
    outputVariablesText () {
      const output = this.nodeRunResult?.output
      return this.isPlainObject(output) ? JSON.stringify(output, null, 2) : ''
    },
    answerContent () {
      const answer = this.nodeRunResult?.answer
      return answer == null ? '' : this.formatResultValue(answer)
    },
    variables () {
      return this.form.data
    },
    upperParamOptions () {
      const normalize = output => (Array.isArray(output) ? output : []).map((item, index) => {
        const name = item.value ?? item.name ?? item.key ?? index
        const option = {
          value: name,
          label: item.label || item.name || item.key || `参数${index + 1}`,
          type: item.type || '',
          shortLabel: item.shortLabel || ''
        }
        const children = normalize(item.children)
        if (children.length) option.children = children
        return option
      })
      return (this.inComingParams || []).map(node => ({
        value: node.nodeId,
        label: node.title || node.nodeType || '上游节点',
        children: normalize(node.output)
      })).filter(item => item.children.length)
    }
  },
  methods: {
    isPlainObject (value) {
      return Object.prototype.toString.call(value) === '[object Object]'
    },
    formatResultValue (value) {
      if (value == null) return ''
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    },
    getReferenceParamName (referenceValue) {
      return Array.isArray(referenceValue) ? referenceValue[referenceValue.length - 1] || '' : ''
    },
    handleReferenceChange (referenceValue, item) {
      const paramName = this.getReferenceParamName(referenceValue)
      const selectedItem = this.getReferenceItem(referenceValue)

      item.name = paramName
      item.type = selectedItem?.type || 'String'
      item.shortLabel = selectedItem?.shortLabel || this.getShortLabel(item.type)
      item.referenceValue = Array.isArray(referenceValue) ? [...referenceValue] : []
      item.referenceKey = Array.isArray(referenceValue) ? [...referenceValue] : []
    },
    getReferenceItem (referenceValue) {
      if (!Array.isArray(referenceValue) || !referenceValue.length) return null

      const findItem = (options, index = 0) => {
        if (!Array.isArray(options) || index >= referenceValue.length) return null

        const selectedItem = options.find(option => option.value === referenceValue[index])
        if (!selectedItem) return null
        if (index === referenceValue.length - 1) return selectedItem

        return findItem(selectedItem.children, index + 1)
      }

      return findItem(this.upperParamOptions)
    },
    getReferenceType (referenceValue) {
      return this.getReferenceItem(referenceValue)?.type || 'String'
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
    },
    handleInput (value) {
      const el = this.$refs.textarea.$refs.textarea

      const cursor = el.selectionStart

      if (value.slice(0, cursor).slice(-1).includes('/')) {
        this.showVariablePanel = true
      } else {
        this.showVariablePanel = false
      }
    },
    insertVariable (item) {
      console.log('this.form.data', this.form.data)

      const el = this.$refs.textarea.$refs.textarea
      const cursor = el.selectionStart
      const before = this.form.cueWord.slice(0, cursor)
      const after = this.form.cueWord.slice(cursor)
      const contentBeforeTrigger = before.endsWith('/') ? before.slice(0, -1) : before
      const variableText = `{{${item.name}}}`

      this.form.cueWord = contentBeforeTrigger + variableText + after
      this.showVariablePanel = false

      this.$nextTick(() => {
        const nextCursor = contentBeforeTrigger.length + variableText.length
        el.focus()
        el.setSelectionRange(nextCursor, nextCursor)
      })
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
  position: relative;
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #e4e7ef;
  border-radius: 10px;
  background: #fafbfe;
}

.variable-panel {
  position: absolute;
  z-index: 20;
  top: 116px;
  right: 16px;
  left: 16px;
  max-height: 220px;
  padding: 8px;
  overflow-y: auto;
  border: 1px solid #e1e4ed;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(39, 44, 70, .16);

  &__title {
    padding: 5px 7px 8px;
    color: #8b90a1;
    font-size: 11px;
  }

  &__empty {
    padding: 20px 8px;
    color: #a4a8b5;
    font-size: 12px;
    text-align: center;
  }
}

.variable-panel-item {
  padding: 8px 9px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 7px;
  color: #343847;
  cursor: pointer;
  transition: color .2s ease, background .2s ease;

  &__node {
    max-width: 105px;
    overflow: hidden;
    color: #858a9b;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__info {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  strong {
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    padding: 2px 6px;
    border-radius: 4px;
    color: #6e63ce;
    background: #f0edff;
    font-size: 10px;
    font-style: normal;
  }

  &:hover {
    color: #4c67ff;
    background: #f3f4ff;
  }
}

.variable-tip {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8f95a6;
  font-size: 10px;

  i {
    color: #795ad4;
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

.run-result {
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid #e3e6f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(49, 55, 91, .07);

  &__header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #eceef5;
    background: linear-gradient(135deg, #f8f8ff, #fbfcff);
  }

  &__title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #292d3d;
    font-size: 14px;
    font-weight: 600;

    i {
      color: #625bf6;
      font-size: 17px;
    }
  }

  &__status {
    padding: 3px 8px;
    border-radius: 10px;
    color: #159447;
    background: #eaf8ef;
    font-size: 10px;
  }

  &__content {
    padding: 17px 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__section + &__section {
    padding-top: 17px;
    border-top: 1px solid #eef0f5;
  }

  &__heading {
    margin-bottom: 9px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #252938;
    font-size: 13px;
    font-weight: 600;

    ::v-deep .copy {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      color: #858b9c;
      background: #f2f3f8;
      transition: color .2s ease, background .2s ease;

      &:hover {
        color: #625bf6;
        background: #ecebff;
      }
    }
  }

  &__box {
    min-height: 76px;
    padding: 12px 13px;
    border: 1px solid #e1e5ee;
    border-radius: 9px;
    color: #303443;
    background: #fafbfe;
    font-size: 13px;
    line-height: 21px;
    white-space: pre-wrap;
    word-break: break-word;
    box-sizing: border-box;
    transition: border-color .2s ease, box-shadow .2s ease;

    &:hover {
      border-color: #c8cbed;
      box-shadow: 0 4px 13px rgba(52, 57, 102, .06);
    }

    &--output {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    &--answer {
      min-height: 84px;
    }
  }

  &__variable-row {
    display: grid;
    grid-template-columns: minmax(70px, auto) 8px minmax(0, 1fr);
    align-items: start;
    gap: 4px;

    pre {
      min-width: 0;
      margin: 0;
      overflow: auto;
      color: #383c4d;
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  &__variable {
    color: #5b54e8;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    font-weight: 600;
  }

  &__separator {
    color: #9ca1b1;
  }

  &__empty {
    min-height: 150px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #969bac;
    text-align: center;

    i {
      margin-bottom: 10px;
      color: #bbbfee;
      font-size: 30px;
    }

    span {
      color: #666c7e;
      font-size: 13px;
      font-weight: 500;
    }

    small {
      margin-top: 5px;
      color: #a8adba;
      font-size: 10px;
      line-height: 16px;
    }
  }

  &__box-empty {
    min-height: 50px;
  }

  @media (max-width: 460px) {
    &__variable-row {
      grid-template-columns: minmax(56px, auto) 8px minmax(0, 1fr);
    }
  }
}

</style>
