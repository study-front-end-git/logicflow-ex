<template>
  <div class="if-else-node">
    <div class="if-else-node__header">
      <span class="if-else-node__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="12" r="2" />
          <circle cx="19" cy="6" r="2" />
          <circle cx="19" cy="18" r="2" />
          <path d="M7 12h3.5c3.2 0 3.2-6 6.5-6M10.5 12c3.2 0 3.2 6 6.5 6" />
        </svg>
      </span>
      <div class="if-else-node__heading">
        <span class="if-else-node__title" :title="nodeTitle">{{ nodeTitle }}</span>
        <span class="if-else-node__meta">{{ conditionSummary }}</span>
      </div>
      <span class="if-else-node__badge">IF</span>
    </div>

    <div class="if-else-node__body">
      <div class="if-else-node__condition" :title="conditionText">
        <i class="el-icon-connection"></i>
        <span>{{ conditionText }}</span>
      </div>

      <div class="if-else-node__branches">
        <div class="if-else-node__branch if-else-node__branch--if">
          <span class="if-else-node__branch-dot"></span>
          <div><strong>IF</strong><small>满足条件</small></div>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="if-else-node__branch if-else-node__branch--else">
          <span class="if-else-node__branch-dot"></span>
          <div><strong>ELSE</strong><small>不满足条件</small></div>
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['graphModel', 'model', 'title'],
  data () {
    const properties = this.model?.properties || {}
    return {
      nodeTitle: properties.title || this.title || 'IF/ELSE',
      config: properties.config || { logic: 'and', conditions: [] }
    }
  },
  computed: {
    enabledConditions () {
      return (this.config.conditions || []).filter(item => item.enabled !== false)
    },
    conditionSummary () {
      const count = this.enabledConditions.length
      return count ? `${count} 个条件 · ${(this.config.logic || 'and').toUpperCase()}` : '未配置条件'
    },
    conditionText () {
      const condition = this.enabledConditions[0]
      if (!condition) return '请配置判断条件'

      const left = this.formatOperand(condition.left)
      const right = this.formatOperand(condition.right)
      const operatorMap = {
        equals: '=',
        notEquals: '≠',
        greaterThan: '>',
        greaterThanOrEqual: '≥',
        lessThan: '<',
        lessThanOrEqual: '≤',
        contains: '包含',
        notContains: '不包含',
        isEmpty: '为空',
        isNotEmpty: '不为空'
      }

      return `${left} ${operatorMap[condition.operator] || condition.operator || '='}${['isEmpty', 'isNotEmpty'].includes(condition.operator) ? '' : ` ${right}`}`
    }
  },
  methods: {
    formatOperand (operand = {}) {
      if (operand.valueType === 'reference') {
        const path = Array.isArray(operand.referenceValue) ? operand.referenceValue : []
        return path.length ? path.slice(1).join('.') : '未选择变量'
      }
      return operand.inputValue === '' || operand.inputValue == null ? '空值' : String(operand.inputValue)
    },
    updateNode ({ data, id }) {
      if (id !== this.model.id || Array.isArray(data)) return
      this.nodeTitle = data.title || this.title || 'IF/ELSE'
      this.config = data.config || { logic: 'and', conditions: [] }
    }
  },
  mounted () {
    this.graphModel.eventCenter.on('save', this.updateNode)
  }
}
</script>

<style lang="scss" scoped>
.if-else-node {
  width: 100%; height: 100%; padding: 11px 14px;
  display: flex; flex-direction: column; color: #292c3d;
  border: 1px solid #d8dceb; border-radius: 9px;
  background: linear-gradient(135deg, #fff 0%, #fffdf9 100%);
  box-shadow: 0 4px 12px rgba(52, 59, 102, .11);
  box-sizing: border-box; cursor: default;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  transition: border-color .2s ease, box-shadow .2s ease;

  &:hover { border-color: #e0a64b; box-shadow: 0 7px 18px rgba(177, 119, 30, .16); }

  &__header { min-width: 0; display: flex; align-items: center; gap: 9px; }
  &__icon {
    width: 29px; height: 29px; flex: 0 0 29px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 6px; color: #fff;
    background: linear-gradient(145deg, #f1b958, #d98b22);
    box-shadow: 0 3px 7px rgba(202, 126, 23, .24);
    svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  }
  &__heading { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  &__title { overflow: hidden; font-size: 16px; font-weight: 600; line-height: 20px; text-overflow: ellipsis; white-space: nowrap; }
  &__meta { color: #a0a5b2; font-size: 10px; line-height: 14px; }
  &__badge { padding: 3px 7px; border-radius: 5px; color: #b26a12; background: #fff1d8; font-size: 10px; font-weight: 700; }
  &__body { min-height: 0; margin-top: 10px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
  &__condition {
    min-width: 0; height: 27px; padding: 0 9px;
    display: flex; align-items: center; gap: 6px; overflow: hidden;
    border: 1px solid #eee4d4; border-radius: 6px;
    color: #6f5b3e; background: #fffaf1; font-size: 10px;
    i { flex: 0 0 auto; color: #d8922d; }
    span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
  &__branches { min-height: 0; flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  &__branch {
    min-width: 0; padding: 8px 9px; display: flex; align-items: center; gap: 7px;
    border: 1px solid #e5e8ee; border-radius: 7px; background: #fafbfc;
    &-dot { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; }
    div { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 1px; }
    strong { font-size: 10px; line-height: 13px; }
    small { overflow: hidden; color: #9ba0ad; font-size: 9px; line-height: 12px; text-overflow: ellipsis; white-space: nowrap; }
    > i { color: #a4a9b5; font-size: 10px; }
    &--if { color: #23815f; background: #f4fbf8; border-color: #d9eee6; .if-else-node__branch-dot { background: #39a97e; } }
    &--else { color: #bf625f; background: #fff8f7; border-color: #f1dfdd; .if-else-node__branch-dot { background: #dc716c; } }
  }
}
</style>
