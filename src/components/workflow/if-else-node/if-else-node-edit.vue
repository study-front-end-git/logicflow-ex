<template>
  <div class="if-else-editor">
    <div class="editor-header">
      <div><h3>IF/ELSE 节点</h3><p>根据条件判断结果选择后续执行分支</p></div>
      <span class="editor-header__tag">BRANCH</span>
    </div>

    <div class="editor-content">
      <section class="editor-section">
        <div class="section-title"><span>基础信息</span><small>节点名称与说明</small></div>
        <div class="setting-card">
          <label class="form-field"><span>节点名称</span><el-input v-model.trim="form.title" size="small" placeholder="请输入节点名称" /></label>
          <label class="form-field"><span>节点描述</span><el-input v-model="form.description" size="small" placeholder="请输入节点描述" /></label>
        </div>
      </section>

      <section class="editor-section">
        <div class="condition-header">
          <div class="section-title"><span>判断条件</span><small>满足条件进入 IF，否则进入 ELSE</small></div>
          <el-radio-group v-model="form.config.logic" size="mini">
            <el-radio-button label="and">AND</el-radio-button>
            <el-radio-button label="or">OR</el-radio-button>
          </el-radio-group>
        </div>

        <div v-for="(condition, index) in form.config.conditions" :key="condition.id" class="condition-card">
          <div class="condition-card__header">
            <span class="condition-card__index">{{ index + 1 }}</span>
            <strong>条件 {{ index + 1 }}</strong>
            <el-switch v-model="condition.enabled" active-color="#df9a32" />
            <button type="button" class="condition-card__delete" :disabled="form.config.conditions.length === 1" @click="removeCondition(index)">
              <i class="el-icon-delete"></i>
            </button>
          </div>

          <div class="operand-block">
            <span class="operand-block__label">左值</span>
            <div class="operand-block__settings">
              <el-select disabled v-model="condition.left.valueType" size="small" @change="resetOperand(condition.left)">
                <el-option label="引用变量" value="reference" /><el-option label="手动输入" value="input" />
              </el-select>
              <el-input disabled v-model="selectParamType" size="small" />

            </div>
            <el-cascader
              ref="cascader"
              v-model="condition.left.referenceValue"
              size="small"
              :options="upperParamOptions"
              :props="{ expandTrigger: 'hover' }"
              placeholder="请选择上游变量"
              @change="syncReference"
            />
          </div>

          <div class="operator-row">
            <span></span>
            <el-select v-model="condition.operator" size="small" placeholder="请选择判断方式">
              <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <span></span>
          </div>

          <div v-if="!unaryOperators.includes(condition.operator)" class="operand-block">
            <span class="operand-block__label">右值</span>
            <div class="operand-block__settings">
              <el-select disabled v-model="condition.right.valueType" size="small" @change="resetOperand(condition.right)">
                <el-option label="手动输入" value="input" /><el-option label="引用变量" value="reference" />
              </el-select>
              <el-select v-model="condition.right.type" size="small"><el-option v-for="type in typeOptions" :key="type" :label="type" :value="type" /></el-select>
            </div>
            <el-input v-model="condition.right.inputValue" size="small" :placeholder="inputPlaceholder(condition.right.type)" />
          </div>
        </div>

        <button type="button" class="condition-add" @click="addCondition"><i class="el-icon-plus"></i><span>添加条件</span></button>
      </section>

      <section class="editor-section editor-section--last">
        <div class="section-title"><span>执行分支</span><small>节点固定包含两个出口</small></div>
        <div class="branch-list">
          <div v-for="branch in form.branches" :key="branch.id" class="branch-card" :class="`branch-card--${branch.id}`">
            <span class="branch-card__icon"><i :class="branch.id === 'if' ? 'el-icon-check' : 'el-icon-close'"></i></span>
            <div><strong>{{ branch.name }}</strong><small>{{ branch.description }}</small></div>
            <span class="branch-card__anchor">{{ branch.anchorSuffix }}</span>
          </div>
        </div>
      </section>
    </div>

    <div class="editor-footer"><el-button @click="handleCancel">取消</el-button><el-button type="primary" @click="save">保存配置</el-button></div>
  </div>
</template>

<script>
import { UUID } from 'uuidjs'

const clone = value => JSON.parse(JSON.stringify(value || {}))
const operand = (value = {}) => ({ type: 'String', valueType: 'input', inputValue: '', referenceKey: [], referenceValue: [], ...value })
const condition = (value = {}) => {
  const defaults = { id: UUID.generate(), enabled: true, left: operand({ valueType: 'reference' }), operator: 'equals', right: operand() }
  return { ...defaults, ...value, left: operand(value.left || defaults.left), right: operand(value.right || defaults.right) }
}
const defaultBranches = () => [
  { id: 'if', name: 'IF', description: '满足条件时执行', anchorSuffix: '_1' },
  { id: 'else', name: 'ELSE', description: '不满足条件时执行', anchorSuffix: '_2' }
]

export default {
  props: { editData: { type: Object, default: () => ({}) }, inComingParams: { type: Array, default: () => [] } },
  data () {
    const source = clone(this.editData)
    const conditions = Array.isArray(source.config?.conditions) ? source.config.conditions.map(item => condition(item)) : [condition()]
    return {
      form: { ...source, title: source.title || 'IF/ELSE', description: source.description || '', data: Array.isArray(source.data) ? source.data : [], output: Array.isArray(source.output) ? source.output : [], config: { logic: source.config?.logic || 'and', conditions }, branches: Array.isArray(source.branches) && source.branches.length ? source.branches : defaultBranches() },
      typeOptions: ['String', 'Number', 'Boolean', 'Object', 'Array'],
      unaryOperators: ['isEmpty', 'isNotEmpty'],
      operatorOptions: [
        { value: 'equals', label: '等于 =' }, { value: 'notEquals', label: '不等于 ≠' },
        { value: 'greaterThan', label: '大于 >' }, { value: 'greaterThanOrEqual', label: '大于等于 ≥' },
        { value: 'lessThan', label: '小于 <' }, { value: 'lessThanOrEqual', label: '小于等于 ≤' },
        { value: 'contains', label: '包含' }, { value: 'notContains', label: '不包含' },
        { value: 'isEmpty', label: '为空' }, { value: 'isNotEmpty', label: '不为空' }
      ],
      selectParamType: 'String'
    }
  },
  computed: {
    upperParamOptions () {
      const normalize = output => (Array.isArray(output) ? output : []).map((item, index) => {
        const name = item.value ?? item.name ?? item.key ?? index
        const option = { value: name, label: `${item.label}-${item.type}` || `${item.name}-${item.type}` || `${item.key}-${item.type}` || `参数${index + 1}` }
        const children = normalize(item.children)
        if (children.length) option.children = children
        return option
      })
      return this.inComingParams.map(node => ({ value: node.nodeId, label: node.title || node.nodeType || '上游节点', children: normalize(node.output) })).filter(item => item.children.length)
    }
  },
  methods: {
    addCondition () {
      this.form.config.conditions.push(condition())
    },
    removeCondition (index) {
      if (this.form.config.conditions.length > 1) this.form.config.conditions.splice(index, 1)
    },
    resetOperand (item) {
      if (item.valueType === 'reference') item.inputValue = ''; else { item.referenceValue = []; item.referenceKey = [] }
    },
    syncReference (value) {
      // console.log('value:', value)
      // const i = 0

      // const getItem = (value, i) => {
      //   if (i === value.length - 1) return this.upperParamOptions.filter(item => item.value === value[i])
      //   return getItem(this.upperParamOptions.filter(item => {
      //     return item.value === value[i]
      //   }), i + 1)
      // }
      // getItem(value, i)

      // 递归
      const getItme = (options, value, i = 0) => {
        const item = options.find(item =>
          item.value === value[i]
        )

        if (i === value.length - 1) return item

        return getItme(item.children, value, i + 1)
      }
      const selectItem = getItme(this.upperParamOptions, value)
      console.log('selectItem', selectItem)
      this.selectParamType = selectItem.label.split('-')[1]
    },
    inputPlaceholder (type) {
      return type === 'Object' || type === 'Array' ? '请输入合法 JSON' : `请输入 ${type} 值`
    },
    handleCancel () {
      this.$emit('handleCancel')
    },
    save () {
      if (!this.form.title.trim()) return this.$message.warning('请输入节点名称')
      const enabled = this.form.config.conditions.filter(item => item.enabled !== false)
      if (!enabled.length) return this.$message.warning('请至少启用一条判断条件')
      const invalid = enabled.some(item => !this.isOperandValid(item.left) || (!this.unaryOperators.includes(item.operator) && !this.isOperandValid(item.right)))
      if (invalid) return this.$message.warning('请完整填写判断条件')
      this.$emit('saveEditData', clone(this.form))
    },
    isOperandValid (item) {
      return item.valueType === 'reference' ? Array.isArray(item.referenceValue) && item.referenceValue.length >= 2 : item.inputValue !== '' && item.inputValue != null
    },
    handleSelect (value) {
      console.log(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.if-else-editor { height: 100%; padding: 0 22px; display: flex; flex-direction: column; color: #292c3d; background: #fff; }
.editor-header { padding: 22px 0 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #eceef4; h3 { margin: 0 0 6px; font-size: 16px; } p { margin: 0; color: #999eae; font-size: 12px; } &__tag { height: 20px; padding: 0 8px; border-radius: 5px; color: #a9680f; background: #fff0d5; font-size: 10px; font-weight: 700; line-height: 20px; } }
.editor-content { flex: 1; padding: 20px 2px; overflow-y: auto; }.editor-section { padding-bottom: 22px; margin-bottom: 20px; border-bottom: 1px solid #eceef4; }.editor-section--last { border-bottom: 0; }
.section-title { margin-bottom: 12px; display: flex; justify-content: space-between; gap: 10px; > span { font-size: 14px; font-weight: 600; } small { color: #a3a7b6; font-size: 11px; text-align: right; } }
.setting-card { padding: 14px; display: flex; flex-direction: column; gap: 13px; border: 1px solid #e4e7ef; border-radius: 10px; background: #fafbfe; }.form-field { display: block; > span { margin-bottom: 6px; display: block; color: #777c8f; font-size: 12px; } }
.condition-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; .section-title { flex: 1; } }
.condition-card { padding: 13px; border: 1px solid #e7dfd2; border-radius: 11px; background: #fffcf7; box-shadow: 0 3px 9px rgba(116, 79, 25, .05); }.condition-card + .condition-card { margin-top: 11px; }
.condition-card__header { margin-bottom: 12px; display: flex; align-items: center; gap: 8px; strong { flex: 1; font-size: 12px; } }.condition-card__index { width: 21px; height: 21px; border-radius: 6px; color: #a56816; background: #ffedcf; font-size: 10px; font-weight: 700; line-height: 21px; text-align: center; }.condition-card__delete { width: 25px; height: 25px; padding: 0; border: 0; border-radius: 6px; color: #a0a5b1; background: transparent; cursor: pointer; &:hover:not(:disabled) { color: #d95757; background: #fff0ef; } &:disabled { opacity: .35; cursor: not-allowed; } }
.operand-block { padding: 10px; border: 1px solid #ebe7df; border-radius: 8px; background: #fff; &__label { margin-bottom: 8px; display: block; color: #8b7659; font-size: 11px; font-weight: 600; } &__settings { margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 7px; } }
.operator-row { padding: 9px 0; display: grid; grid-template-columns: 1fr 132px 1fr; align-items: center; gap: 8px; span { height: 1px; background: #e6dccb; } }
.condition-add { margin-top: 11px; padding: 0; display: inline-flex; align-items: center; gap: 5px; border: 0; color: #bd7417; background: transparent; font-size: 13px; cursor: pointer; i { font-size: 16px; } &:hover { color: #8f5207; } }
.branch-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }.branch-card { padding: 11px; display: flex; align-items: center; gap: 9px; border: 1px solid; border-radius: 9px; &__icon { width: 27px; height: 27px; display: inline-flex; align-items: center; justify-content: center; border-radius: 7px; } div { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; } strong { font-size: 12px; } small { color: #8f95a4; font-size: 9px; } &__anchor { color: #a4a8b2; font-size: 9px; } &--if { color: #278663; border-color: #d9eee5; background: #f5fbf8; .branch-card__icon { background: #e2f5ed; } } &--else { color: #c05e5a; border-color: #f1dddd; background: #fff8f7; .branch-card__icon { background: #fde9e7; } } }
.editor-footer { margin: auto -22px 0; padding: 16px 22px; display: flex; justify-content: flex-end; border-top: 1px solid #eceef4; background: #fff; }
.if-else-editor { ::v-deep .el-select, ::v-deep .el-cascader { width: 100%; } ::v-deep .el-input__inner { border-color: #dfe2eb; border-radius: 7px; } ::v-deep .el-input__inner:focus { border-color: #df9a32; } ::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner { border-color: #df9a32; background: #df9a32; box-shadow: -1px 0 0 0 #df9a32; } ::v-deep .el-button--primary { border-color: #df9a32; background: #df9a32; } }
</style>
