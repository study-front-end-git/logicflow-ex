<template>
  <div class="model-node-editor">
    <div class="editor-header">
      <div><h3>大模型节点</h3><p>配置模型、提示词及模型生成参数</p></div>
      <span class="editor-header__tag">LLM</span>
    </div>

    <div class="editor-content">
      <section class="editor-section">
        <div class="section-title"><span>基础信息</span><small>节点名称与模型选择</small></div>
        <div class="setting-card basic-card">
          <label class="form-field"><span>节点名称</span><el-input v-model.trim="form.title" size="small" placeholder="请输入节点名称" /></label>
          <label class="form-field"><span>选择模型</span><el-select v-model="form.config.modelId" size="small" placeholder="请选择模型"><el-option label="默认对话模型" value="default" /><el-option label="快速生成模型" value="fast" /><el-option label="深度推理模型" value="reasoning" /></el-select></label>
        </div>
      </section>

      <section class="editor-section input-section">
        <div class="input-section__title">
          <i class="el-icon-arrow-down"></i>
          <span>输入</span>
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

      <section class="editor-section">
        <div class="section-title"><span>提示词</span><small>定义模型的角色和任务</small></div>
        <div class="setting-card prompt-card">
          <label class="form-field form-field--full"><span>系统提示词</span><el-input v-model="form.config.systemPrompt" type="textarea" :rows="3" resize="none" placeholder="例如：你是一名专业的内容助手" /></label>
          <label class="form-field form-field--full prompt-card__user">
            <span>用户提示词</span>
            <el-input ref="inputRef" @input="handleUserPromptInput" v-model="form.config.userPrompt" type="textarea" :rows="5" resize="none" placeholder="输入提示词，可引用上游节点变量" />
          </label>
          <div v-if="showVariablePanel" class="variable-panel">
            <div class="variable-panel__title">选择上游变量</div>
            <div
              class="variable-panel-item"
              v-for="item in form.data"
              :key="`${item.id}`"
              @mousedown.prevent
              @click="insertVariable(item)"
            >
              <!-- <span class="variable-panel-item__node">{{ item.nodeTitle }}</span> -->
              <span class="variable-panel-item__info">
                <strong>{{ item.name }}</strong>
                <em>{{ item.type }}</em>
              </span>
            </div>
            <div v-if="form.data.length === 0" class="variable-panel__empty">暂无可引用的上游变量</div>
          </div>
          <div class="variable-tip"><i class="el-icon-connection"></i><span>输入“/”可以选择输入变量</span></div>
        </div>
      </section>

      <section class="editor-section input-section">
        <div class="input-section__title">
          <i class="el-icon-arrow-down"></i>
          <span>输出</span>
        </div>

        <div class="parameter-head">
          <span>参数名</span>
          <span>参数类型</span>
        </div>

        <div v-for="(item,index) in form.output" :key="item.id" class="parameter-item">
          <div class="parameter-row" style="justify-items: end;">
            <el-input
              v-model="item.name"
              size="small"
              placeholder="请输入参数名"
            />

            <el-input
              v-model="item.type"
              placeholder="变量类型"
              :disabled="true"
            />

            <button class="parameter-remove" type="button" aria-label="删除参数" @click="removeOutputParam(index)">
              <i class="el-icon-minus"></i>
            </button>
          </div>
        </div>

        <button @click="addOutputParam" class="parameter-add" type="button">
          <i class="el-icon-plus"></i>
          <span>添加</span>
        </button>
      </section>

      <!-- <section class="editor-section editor-section--last">
        <div class="section-title"><span>生成参数</span><small>调整模型输出效果</small></div>
        <div class="setting-card model-settings">
          <div class="slider-field">
            <div><span>随机性</span><strong>{{ form.config.temperature }}</strong></div>
            <el-slider v-model="form.config.temperature" :min="0" :max="2" :step="0.1" :show-tooltip="false" />
            <small>数值越高，生成内容越有创造性</small>
          </div>
          <label class="form-field"><span>最大输出长度</span><el-input-number v-model="form.config.maxTokens" size="small" :min="1" :max="32768" :controls="false" /></label>
        </div>
        <div class="output-format">
          <div>
            <strong>输出格式</strong>
            <small>选择模型最终返回的数据格式</small>
          </div>
          <el-radio-group v-model="form.config.outputFormat" size="small" @change="syncOutput">
            <el-radio-button label="text">Text</el-radio-button>
            <el-radio-button label="json">JSON</el-radio-button>
          </el-radio-group>
        </div>
        <div class="output-preview">
          <span class="output-preview__dot"></span>
          <div><strong>{{ outputItem.name }}</strong><small>{{ form.config.outputFormat === 'json' ? '模型生成的 JSON 对象' : '模型生成的文本内容' }}</small></div>
          <span class="output-preview__type">{{ outputItem.shortLabel }}</span>
        </div>
      </section> -->
    </div>

    <div class="editor-footer"><el-button @click="handleCancel">取消</el-button><el-button type="primary" @click="save">保存配置</el-button></div>
  </div>
</template>

<script>
import { UUID } from 'uuidjs'

const clone = value => JSON.parse(JSON.stringify(value || {}))

const createInputParameter = () => ({
  id: UUID.generate(),
  name: '',
  description: '',
  type: 'String',
  shortLabel: 'Str',
  required: true,
  valueType: 'input',
  inputValue: '',
  referenceKey: [],
  referenceValue: []
})

const createOutputParameter = () => ({
  id: UUID.generate(),
  name: '',
  description: '',
  type: 'String',
  shortLabel: 'Str',
  required: false,
  format: 'text'
})

export default {
  components: {},
  props: [
    'editData',
    'fullEditData',
    'inComingParams'
  ],
  data () {
    const form = clone(this.editData)

    form.data = Array.isArray(form.data) ? form.data : []
    form.output = Array.isArray(form.output) ? form.output : []
    form.config = {
      modelId: '',
      systemPrompt: '',
      userPrompt: form.config?.prompt || '',
      temperature: 0.7,
      maxTokens: 2048,
      outputFormat: form.output?.[0]?.format || 'text',
      ...(form.config || {})
    }

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
    variables () {
      return (this.inComingParams || []).flatMap(node => {
        const output = Array.isArray(node.output) ? node.output : []

        return output.map((item, index) => ({
          nodeId: node.nodeId,
          nodeType: node.nodeType,
          nodeTitle: node.title || node.nodeType || '上游节点',
          paramId: item.id || `${node.nodeId}-${index}`,
          name: item.name || item.key || `参数${index + 1}`,
          type: item.type || 'String',
          shortLabel: item.shortLabel || 'Str',
          referenceValue: [
            node.nodeId,
            item.name || item.key || index
          ]
        }))
      })
    },
    upperParamOptions () {
      const normalizeHttpOutput = output => {
        return (Array.isArray(output) ? output : []).map((item, index) => {
          const value = item.value ?? item.name ?? item.key ?? index
          const option = {
            value,
            label: item.label || item.name || item.key || `参数${index + 1}`
          }
          const children = normalizeHttpOutput(item.children)

          if (children.length) option.children = children

          return option
        })
      }

      return (this.inComingParams || []).map(node => {
        const output = Array.isArray(node.output) ? node.output : []

        if (node.nodeType === 'http-node') {
          return {
            value: node.nodeId,
            label: node.title || node.nodeType,
            children: normalizeHttpOutput(output)
          }
        }

        return {
          value: node.nodeId,
          label: node.title || node.nodeType,
          children: output.map((item, index) => {
            const name = item.name || item.key || `参数${index + 1}`

            return {
              value: item.name || item.key || index,
              label: `${name} (${item.type || 'String'})`
            }
          })
        }
      }).filter(node => node.children.length)
    },
    outputItem () {
      return this.form.output[0] || {
        name: this.form.config.outputFormat === 'json' ? 'json' : 'text',
        shortLabel: this.form.config.outputFormat === 'json' ? 'Obj' : 'Str'
      }
    }
  },
  methods: {
    addParam () {
      this.form.data.push(createInputParameter())
    },
    addOutputParam () {
      this.form.output.push(createOutputParameter())
    },
    removeParam (index) {
      this.form.data.splice(index, 1)
    },
    removeOutputParam (index) {
      this.form.output.splice(index, 1)
    },
    getReferenceParamName (referenceValue) {
      return Array.isArray(referenceValue) ? referenceValue[referenceValue.length - 1] || '' : ''
    },
    handleReferenceChange (referenceValue, item) {
      console.log('change了')

      const paramName = this.getReferenceParamName(referenceValue)

      item.name = paramName
      item.referenceKey = Array.isArray(referenceValue) ? [...referenceValue] : []
    },
    syncOutput (format) {
      const isJSON = format === 'json'
      const current = this.form.output[0] || {}

      this.form.output = [{
        ...current,
        id: current.id || UUID.generate(),
        name: isJSON ? 'json' : 'text',
        description: isJSON ? '模型生成的 JSON 对象' : '模型生成的文本内容',
        type: isJSON ? 'Object' : 'String',
        shortLabel: isJSON ? 'Obj' : 'Str',
        required: false,
        format
      }]
    },
    handleCancel () {
      this.$emit('handleCancel')
    },
    save () {
      const hasEmptyName = this.form.data.some(item => !item.name?.trim())
      const hasEmptyOutputName = this.form.output.some(item => !item.name?.trim())
      const hasEmptyValue = this.form.data.some(item => {
        return item.valueType === 'reference'
          ? !Array.isArray(item.referenceValue) || item.referenceValue.length < 2
          : !item.inputValue?.trim()
      })

      if (!this.form.title?.trim()) {
        this.$message.warning('请输入节点名称')
        return
      }
      if (hasEmptyName) {
        this.$message.warning('请输入完整的参数名称')
        return
      }
      if (hasEmptyOutputName) {
        this.$message.warning('请输入完整的输出参数名称')
        return
      }
      if (hasEmptyValue) {
        this.$message.warning('请填写参数值或选择引用参数')
        return
      }

      this.form.inputType = this.form.data.every(item => item.valueType === 'input') ? 'input' : 'reference'
      this.form.data.forEach(item => {
        item.referenceKey = item.valueType === 'reference' ? [...item.referenceValue] : []
        if (item.valueType === 'reference') item.inputValue = ''
      })
      this.$emit('saveEditData', clone(this.form))
    },
    handleUserPromptInput (value) {
      const el = this.$refs.inputRef.$refs.textarea

      const cursor = el.selectionStart

      if (value.slice(0, cursor).slice(-1).includes('/')) {
        console.log('用户输入了/,', this.upperParamOptions, this.form.data)
        this.showVariablePanel = true
      } else {
        this.showVariablePanel = false
      }
    },
    insertVariable (item) {
      const el = this.$refs.inputRef.$refs.textarea
      const cursor = el.selectionStart

      const before = this.form.config.userPrompt.slice(0, cursor)
      const after = this.form.config.userPrompt.slice(cursor)
      const hasTrigger = before.endsWith('/')
      const contentBeforeTrigger = hasTrigger ? before.slice(0, -1) : before
      const variableText = `{{${item.name}}}`

      this.form.config.userPrompt = contentBeforeTrigger + variableText + after

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
.model-node-editor { height: 100%; padding: 0 22px; display: flex; flex-direction: column; color: #272a39; background: #fff; }
.editor-header {
  padding: 22px 0 20px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid #eceef4;
  h3 { margin: 0 0 6px; font-size: 16px; font-weight: 600; }
  p { margin: 0; color: #999eae; font-size: 12px; line-height: 18px; }
  &__tag { padding: 4px 8px; border-radius: 6px; color: #795ad4; background: #f0ebff; font-size: 10px; font-weight: 700; }
}
.editor-content { flex: 1; padding: 20px 2px; overflow-y: auto; }
.editor-section { padding-bottom: 22px; margin-bottom: 20px; border-bottom: 1px solid #eceef4; }
.editor-section--last { margin-bottom: 0; border-bottom: 0; }
.section-title {
  margin-bottom: 12px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  > span { color: #3b3f50; font-size: 14px; font-weight: 600; }
  small { color: #a3a7b6; font-size: 11px; }
}
.setting-card { position: relative; padding: 15px; border: 1px solid #e4e7ef; border-radius: 10px; background: #fafbfe; transition: border-color .2s ease, box-shadow .2s ease; }
.variable-panel{
  position: absolute;
  z-index: 10;
  right: 15px;
  // bottom: 42px;
  left: 15px;
  max-height: 220px;
  padding: 8px;
  overflow-y: auto;
  border: 1px solid #e1e4ed;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 10px 28px rgba(39, 44, 70, .16);

  &__title { padding: 5px 7px 8px; color: #8b90a1; font-size: 11px; }
  &__empty { padding: 20px 8px; color: #a4a8b5; font-size: 12px; text-align: center; }
}
.variable-panel-item{
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

  &__info { min-width: 0; flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  strong { overflow: hidden; font-size: 12px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
  em { padding: 2px 6px; border-radius: 4px; color: #6e63ce; background: #f0edff; font-size: 10px; font-style: normal; }

  &:hover{
    color: #4c67ff;
    background: #f3f4ff;
  }
}
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
.output-format {
  margin-top: 12px;
  padding: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid #e4e7ef;
  border-radius: 10px;
  background: #fafbfe;

  > div { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  strong { color: #414555; font-size: 13px; font-weight: 500; }
  small { color: #a1a6b5; font-size: 11px; }
}
.output-preview {
  margin-top: 12px; padding: 11px 13px; display: flex; align-items: center; gap: 10px; border: 1px solid #e4e7ef; border-radius: 10px; background: #fafbfe;
  &__dot { width: 8px; height: 8px; border-radius: 50%; background: #795ad4; box-shadow: 0 0 0 2px #e7defe; }
  div { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
  strong { color: #414555; font-size: 13px; font-weight: 500; }
  small { color: #a1a6b5; font-size: 11px; }
  &__type { padding: 3px 7px; border-radius: 5px; color: #795ad4; background: #f0ebff; font-size: 10px; font-weight: 600; }
}
.editor-footer { margin: auto -22px 0; padding: 16px 22px; display: flex; justify-content: flex-end; border-top: 1px solid #eceef4; background: #fff; }
.model-node-editor {
  ::v-deep .el-select { width: 100%; }
  ::v-deep .el-cascader { width: 100%; }
  ::v-deep .el-input-number { width: 100%; }
  ::v-deep .el-input__inner, ::v-deep .el-textarea__inner { border-color: #dfe2eb; border-radius: 7px; }
  .input-section ::v-deep .el-input__inner { height: 37px; line-height: 37px; background: #fff; }
  .input-section ::v-deep .el-select .el-input__inner,
  .input-section ::v-deep .el-cascader .el-input__inner { border-color: #dce4ff; }
  ::v-deep .el-textarea__inner { font-family: inherit; line-height: 20px; }
  ::v-deep .el-slider__bar { background: #795ad4; }
  ::v-deep .el-slider__button { border-color: #795ad4; }
  ::v-deep .el-button--primary { border-color: #626be7; background: #626be7; }
}
</style>
