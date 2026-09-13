<template>
  <el-drawer
    class="workflow-drawer"
    title="试运行"
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
      <section class="try-run-input">
        <h3>试运行输入</h3>

        <div v-if="inputValues.length" class="try-run-input__list">
          <label
            v-for="item in inputValues"
            :key="item.id"
            class="try-run-field"
          >
            <span class="try-run-field__label">
              <span>{{ item.name || '未命名参数' }}<i v-if="item.required !== false">*</i></span>
              <em>{{ item.type || 'String' }}</em>
            </span>

            <el-input
              autosize
              v-model="item.content"
              size="small"
              type="textarea"
              :placeholder="`请输入${item.name || '参数值'}`"
            />
          </label>
        </div>

        <div v-else class="try-run-input__empty">
          暂无需要填写的输入参数
        </div>
      </section>

      <section v-if="outputContent !== ''" class="run-result">
        <el-collapse accordion>
          <el-collapse-item

          >
            <template slot="title">
              <span class="run-result__collapse-title">运行结果</span>
            </template>
            <div v-loading="isShowLoading" class="run-result__content">
              <div v-if="outputName !== ''" class="run-result__section">
                <div class="run-result__heading">
                  <span>输出变量</span>
                  <copy-com :text="outputContent"></copy-com>

                  <!-- <i class="el-icon-copy-document" title="复制"></i> -->
                </div>
                <div class="run-result__box run-result__box--output">
                  <span class="run-result__variable">{{ outputName }}:</span>
                  <span>"{{ outputContent }}"</span>
                  <span @click="previewContent" class="run-result__preview"><i class="el-icon-view"></i>预览</span>
                </div>
              </div>

              <div v-else class="run-result__section">
                <div class="run-result__heading">
                  <span>回答内容</span>
                  <copy-com :text="outputContent"></copy-com>
                  <!-- <i class="el-icon-copy-document" title="复制"></i> -->
                </div>
                <div class="run-result__box">
                  {{ outputContent }}
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </section>

      <div class="editor-footer">
        <el-button type="primary" @click="handleTryRun">试运行</el-button>
      </div>
    </div>

    <el-dialog
      title="预览"
      :visible.sync="dialogVisible"
      custom-class="run-preview-dialog"
      append-to-body
    >
      <preview-com :workflowId="workflowId" :content="outputContent"></preview-com>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span> -->
    </el-dialog>

  </el-drawer>
</template>

<script>
import PreviewCom from '../PreviewCom.vue'
import CopyCom from '../CopyCom.vue'

export default {
  components: {
    PreviewCom,
    CopyCom
  },
  props: {
    workflowId: String
  },
  data () {
    return {
      isShowDrawer: false,
      input: [],
      output: null,
      inputValues: [],
      runtimeContext: {},
      LastRunDataInputs: null,
      LastRunDataOutput: null,
      outputContent: '',
      dialogVisible: false,
      outputName: ''
    }
  },
  watch: {
    runtimeResponseData: {
      handler (newval) {
        console.log('runtimeResponseData改变了')
        if (newval?.data) this.applyOutput(newval.data.output)
      },
      deep: true
    }
    // isShowLoading (newval) {
    //   this.isShowLoading = newval
    // }
  },
  computed: {
    runtimeResponseData () {
      return this.$store.state.runtimeResponseData
    },
    isShowLoading: {
      get () {
        return this.$store.state.isShowLoading
      },
      set (newval) {
        this.isShowLoading = newval
      }

    }
    // outputContent () {
    //   return this.LastRunDataOutput.json ? this.LastRunDataOutput.json : this.LastRunDataOutput.text
    // }

  },
  methods: {
    handleClosed () {
      this.isShowDrawer = false
      this.inputValues = []
    },

    async handleOpen () {
      this.isShowDrawer = true
      await this.initializeRunData()
    },

    loadWorkflowData () {
      const savedData = localStorage.getItem(
        `workflow${this.workflowId}`
      )

      if (!savedData) {
        this.input = []
        this.inputValues = []
        this.output = null
        return
      }

      try {
        const graphData = JSON.parse(savedData)
        const nodes = Array.isArray(graphData.nodes)
          ? graphData.nodes
          : []

        const inputNodes = nodes.filter(item => {
          return (
            item.type === 'start-node' ||
          item.type === 'input-node'
          )
        })

        this.input = inputNodes.flatMap(item => {
          return Array.isArray(item.properties?.data)
            ? item.properties.data
            : []
        })

        this.inputValues = this.input.map(item => ({
          ...item,
          content: ''
        }))

        console.log('input:', this.input)
      } catch (error) {
        console.error('读取试运行数据失败：', error)
        this.input = []
        this.inputValues = []
      }
    },

    handleTryRun () {
      try {
        if (!this.workflowId) {
          throw new Error('缺少工作流 ID')
        }

        const runtimeInput = this.inputValues.reduce((result, item) => {
          const content = item.content

          if (
            item.required !== false &&
            !String(content ?? '').trim()
          ) {
            throw new Error(`请输入参数：${item.name || '未命名参数'}`)
          }

          if (!item.name) {
            throw new Error('存在未命名的输入参数')
          }

          if (Object.prototype.hasOwnProperty.call(result, item.name)) {
            throw new Error(`输入参数名称重复：${item.name}`)
          }

          result[item.name] = this.formatInputValue(content, item.type)
          return result
        }, {})

        const runtimeData = {
          workflowId: this.workflowId,
          runMode: 'agnes-2.0-flash',
          inputs: runtimeInput
        }

        this.runtimeContext = runtimeData
        console.log('发送给后端的试运行数据：', runtimeData)

        this.$emit('tryRun', runtimeData)
      } catch (error) {
        this.$message.warning(error.message || '试运行参数处理失败')
      }
    },

    formatInputValue (value, type = 'String') {
      if (type === 'Number') {
        const numberValue = Number(value)

        if (Number.isNaN(numberValue)) {
          throw new Error('Number 类型参数必须是有效数字')
        }

        return numberValue
      }

      if (type === 'Boolean') {
        if (value === true || value === 'true') return true
        if (value === false || value === 'false') return false
        throw new Error('Boolean 类型参数只能填写 true 或 false')
      }

      if (type === 'Object' || type === 'Array') {
        let parsedValue

        try {
          parsedValue = JSON.parse(value)
        } catch (error) {
          throw new Error(`${type} 类型参数必须是合法 JSON`)
        }

        if (type === 'Array' && !Array.isArray(parsedValue)) {
          throw new Error('Array 类型参数必须是数组')
        }

        if (
          type === 'Object' &&
          (!parsedValue || Array.isArray(parsedValue) || typeof parsedValue !== 'object')
        ) {
          throw new Error('Object 类型参数必须是对象')
        }

        return parsedValue
      }

      return String(value ?? '')
    },
    isPlainObject (val) {
      return Object.prototype.toString.call(val) === '[object Object]'
    },
    applyOutput (output) {
      this.LastRunDataOutput = output

      if (this.isPlainObject(output)) {
        const entries = Object.entries(output)
        const [name, content] = entries[0] || ['', '']
        this.outputName = name
        this.outputContent = typeof content === 'string'
          ? content
          : JSON.stringify(content, null, 2)
      } else {
        this.outputName = ''
        this.outputContent = output == null ? '' : String(output)
      }
    },
    async initializeRunData () {
      try {
        const response = await this.$api.getRunConfig(this.workflowId)
        const definitions = response.data.inputDefinitions || []
        const latestRun = response.data.latestRun
        const previousInputs = latestRun?.inputs || {}

        this.input = definitions
        this.LastRunDataInputs = latestRun?.inputs || null
        this.inputValues = definitions.map(item => ({
          ...item,
          content: Object.prototype.hasOwnProperty.call(previousInputs, item.name)
            ? previousInputs[item.name]
            : item.defaultValue ?? ''
        }))

        this.applyOutput(latestRun?.output ?? null)
      } catch (error) {
        console.error('初始化试运行数据失败：', error)
        this.input = []
        this.inputValues = []
        this.applyOutput(null)
        this.$message.error(error.response?.data?.message || '初始化试运行数据失败')
      }
    },
    async getLastRunData () {
      try {
        const data = await this.$api.getRunData(this.workflowId)
        console.log('getLastRunData :', data)
        if (data.code === 0) {
          this.LastRunDataInputs = data.data.inputs
          this.LastRunDataOutput = data.data.output

          console.log('this.LastRunDataOutput:', this.LastRunDataOutput)
          if (this.isPlainObject(this.LastRunDataOutput)) {
            console.log('是对象')

            const json = JSON.stringify(this.LastRunDataOutput)
            console.log('json:', json)

            this.outputContent = json.split(':')[1]
            this.outputName = json.split(':')[0]
          } else {
            this.outputContent = this.LastRunDataOutput
            this.outputName = ''
          }
          this.inputValues = this.input.map(item => ({
            ...item,
            content: this.LastRunDataInputs[item.name] ? this.LastRunDataInputs[item.name] : ''
          }))
        }
      } catch (err) {
        console.log('err', err)
      }
    },
    previewContent () {
      this.dialogVisible = true
    },
    handleDialogClose () {
    }
  },
  created () {},
  mounted () {

  }
}
</script>
<style lang="scss" scoped>
.workflow-drawer {
  right: 0;
  position: absolute;

  &__content {
    height: 100%;
    overflow-y: auto;
    position: relative;
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

.try-run-input,
.run-result {
  padding: 20px 12px 28px;
  color: #282b3a;
  background: #fff;

  h3 {
    margin: 0 0 18px;
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__empty {
    padding: 34px 12px;
    border: 1px dashed #dfe2eb;
    border-radius: 9px;
    color: #a0a5b3;
    background: #fafbfe;
    font-size: 13px;
    text-align: center;
  }
}

.run-result {
  margin: 0 12px 86px;
  padding: 0;
  overflow: hidden;
  border: 1px solid #e7eaf2;
  border-radius: 12px;
  box-shadow: 0 6px 22px rgba(31, 35, 48, 0.06);

  ::v-deep .el-collapse {
    border: 0;
  }

  ::v-deep .el-collapse-item__header {
    height: 52px;
    padding: 0 18px;
    border-bottom-color: #eceef4;
    color: #282b3a;
    font-size: 15px;
    font-weight: 600;
    line-height: 52px;
  }

  ::v-deep .el-collapse-item__arrow {
    color: #8b91a3;
    font-size: 14px;
  }

  ::v-deep .el-collapse-item__wrap {
    border-bottom: 0;
  }

  ::v-deep .el-collapse-item__content {
    padding: 0;
  }

  &__collapse-title {
    display: flex;
    align-items: center;
  }

  &__content {
    padding: 20px 16px 22px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    background: #fff;
  }

  &__heading {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 7px;
    color: #252938;
    font-size: 15px;
    font-weight: 600;

    i {
      color: #858b9c;
      cursor: pointer;
      font-size: 13px;
      transition: color 0.2s ease;

      &:hover {
        color: #625bf6;
      }
    }
  }

  &__box {
    min-height: 92px;
    padding: 10px 12px;
    border: 1px solid #e1e5ee;
    border-radius: 8px;
    color: #303443;
    background: #fff;
    font-size: 13px;
    line-height: 20px;
    white-space: pre-wrap;
    word-break: break-word;
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: #cbd0dc;
      box-shadow: 0 3px 12px rgba(31, 35, 48, 0.05);
    }

    &--output {
      min-height: 116px;
    }
  }

  &__variable {
    margin-right: 3px;
    color: #5b54e8;
    font-family: Consolas, Monaco, monospace;
  }

  &__preview {
    margin-left: 8px;
    padding: 2px 7px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 5px;
    color: #555b6e;
    background: #f1f2f6;
    font-size: 12px;
    line-height: 18px;

    i {
      font-size: 12px;
    }
  }
}

.try-run-field {
  min-width: 0;
  display: block;

  &__label {
    margin-bottom: 9px;
    display: flex;
    align-items: center;
    gap: 7px;
    color: #353846;
    font-size: 13px;

    span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    i { margin-left: 2px; color: #f05252; font-style: normal; }
    em {
      padding: 2px 7px;
      border-radius: 4px;
      color: #555b70;
      background: #eff0f6;
      font-size: 10px;
      font-style: normal;
      line-height: 16px;
    }
  }
}

.try-run-input ::v-deep .el-input__inner {
  height: 38px;
  border-color: #cfd5e4;
  border-radius: 8px;
  color: #343746;
  background: #fff;
  line-height: 38px;
}

.try-run-input ::v-deep .el-input__inner:hover,
.try-run-input ::v-deep .el-input__inner:focus {
  border-color: #7773ee;
}

.editor-footer {
  position: fixed;
  bottom: 0;
  // margin: auto -22px 0;
  padding: 16px 22px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eceef4;
  background: #fff;
}
.run-result__preview{
  cursor: pointer;
  &:hover{
    color: #5962dc;
  }
}
</style>

<style lang="scss">
.run-preview-dialog {
  width: min(720px, calc(100vw - 32px)) !important;
  margin-top: 8vh !important;
  overflow: hidden;
  border-radius: 10px;

  .el-dialog__header {
    padding: 18px 20px;
    border-bottom: 1px solid #eceef4;
  }

  .el-dialog__body {
    min-height: 100px;
    max-height: calc(84vh - 70px);
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;
  }
}

@media (max-width: 600px) {
  .run-preview-dialog {
    width: calc(100vw - 24px) !important;
    margin-top: 12px !important;

    .el-dialog__body {
      max-height: calc(100vh - 90px);
      padding: 16px;
    }
  }
}
</style>
