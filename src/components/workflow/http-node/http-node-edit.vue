<template>
  <div class="http-node-editor">
    <div class="editor-header">
      <div><h3>HTTP 请求</h3><p>配置第三方 API 的请求参数与响应输出</p></div>
      <span class="editor-header__tag">HTTP</span>
    </div>

    <div class="editor-content">
      <el-form label-position="top" :model="formData" size="small">
        <section class="form-section">
          <div class="section-title"><span>基础信息</span><small>节点名称与用途说明</small></div>
          <div class="setting-card">
            <el-form-item label="节点名称"><el-input v-model.trim="formData.title" placeholder="请输入节点名称" /></el-form-item>
            <el-form-item label="插件名称"><el-input v-model.trim="formData.pluginName" placeholder="例如：用户中心" /></el-form-item>
            <el-form-item class="form-item--full" label="功能描述">
              <el-input v-model="formData.description" type="textarea" :rows="2" resize="none" placeholder="简要描述该接口的用途" />
            </el-form-item>
          </div>
        </section>

        <section class="form-section">
          <div class="section-title"><span>请求配置</span><small>请求地址和基础行为</small></div>
          <div class="request-line">
            <el-select v-model="formData.config.method" class="method-select">
              <el-option v-for="method in methodOptions" :key="method" :label="method" :value="method" />
            </el-select>
            <el-input v-model.trim="formData.config.url" placeholder="https://api.example.com/users/{userId}"><i slot="prefix" class="el-icon-link"></i></el-input>
          </div>
          <div class="setting-card">
            <el-form-item label="超时时间（ms）"><el-input-number v-model="formData.config.timeout" :min="1000" :step="1000" :controls="false" /></el-form-item>
            <el-form-item label="响应类型">
              <el-select v-model="formData.config.responseType"><el-option label="JSON" value="json" /><el-option label="Text" value="text" /><el-option label="Binary" value="binary" /></el-select>
            </el-form-item>
            <el-form-item class="form-item--full" label="凭证 ID"><el-input v-model.trim="formData.config.credentialId" placeholder="可选，请填写后端凭证 ID" /></el-form-item>
          </div>
        </section>

        <!-- <section class="form-section">
          <div class="section-title"><span>输入参数</span><small>节点运行所需的手动或上游输入</small></div>
          <div v-for="(item, index) in formData.data" :key="item.id" class="parameter-card">
            <div class="parameter-row">
              <el-input v-model.trim="item.name" placeholder="参数名" />
              <el-select v-model="item.valueType" @change="resetParameterValue(item)"><el-option label="手动" value="input" /><el-option label="引用" value="reference" /></el-select>
              <el-input v-if="item.valueType === 'input'" v-model="item.inputValue" placeholder="参数值" />
              <el-cascader v-else v-model="item.referenceValue" :options="upperParamOptions" :props="{ expandTrigger: 'hover' }" placeholder="选择上游变量" @change="syncReference($event, item)" />
              <button type="button" class="parameter-remove" @click="removeItem(formData.data, index)"><i class="el-icon-minus"></i></button>
            </div>
            <el-input v-model="item.description" class="parameter-description" placeholder="参数描述（可选）" />
          </div>
          <div v-if="!formData.data.length" class="empty-state">暂无输入参数</div>
          <button type="button" class="parameter-add" @click="addInputParam"><i class="el-icon-plus"></i><span>添加输入参数</span></button>
        </section> -->

        <section v-for="group in requestGroups" :key="group.field" class="form-section">
          <div class="section-title"><span>{{ group.title }}</span><small>{{ group.description }}</small></div>
          <div v-for="(item, index) in formData.config[group.field]" :key="item.id" class="parameter-card">
            <div class="parameter-row">
              <el-input v-model.trim="item.key" :placeholder="group.placeholder" />
              <el-select v-model="item.valueType" @change="resetParameterValue(item)"><el-option label="手动" value="input" /><el-option label="引用" value="reference" /></el-select>
              <el-input v-if="item.valueType === 'input'" v-model="item.inputValue" placeholder="参数值" />
              <el-cascader v-else v-model="item.referenceValue" :options="upperParamOptions" :props="{ expandTrigger: 'hover' }" placeholder="选择上游变量" @change="syncReference($event, item)" />
              <button type="button" class="parameter-remove" @click="removeItem(formData.config[group.field], index)"><i class="el-icon-minus"></i></button>
            </div>
            <el-input v-model="item.description" class="parameter-description" placeholder="参数描述（可选）" />
          </div>
          <div v-if="!formData.config[group.field].length" class="empty-state">暂无配置项</div>
          <button type="button" class="parameter-add" @click="addRequestParam(group.field, group.field === 'pathParams')"><i class="el-icon-plus"></i><span>添加</span></button>
        </section>

        <section class="form-section">
          <div class="section-title"><span>Body</span><small>配置请求体类型和内容</small></div>
          <el-radio-group v-model="formData.config.body.type" class="body-type">
            <el-radio-button label="none">None</el-radio-button><el-radio-button label="json">JSON</el-radio-button><el-radio-button label="form-data">Form Data</el-radio-button><el-radio-button label="x-www-form-urlencoded">Form URL</el-radio-button><el-radio-button label="raw">Raw</el-radio-button>
          </el-radio-group>
          <template v-if="bodyUsesFields">
            <div v-for="(item, index) in formData.config.body.fields" :key="item.id" class="parameter-card">
              <div class="parameter-row">
                <el-input v-model.trim="item.key" placeholder="字段名" />
                <el-select v-model="item.valueType" @change="resetParameterValue(item)"><el-option label="手动" value="input" /><el-option label="引用" value="reference" /></el-select>
                <el-input v-if="item.valueType === 'input'" v-model="item.inputValue" placeholder="字段值" />
                <el-cascader v-else v-model="item.referenceValue" :options="upperParamOptions" :props="{ expandTrigger: 'hover' }" placeholder="选择上游变量" @change="syncReference($event, item)" />
                <button type="button" class="parameter-remove" @click="removeItem(formData.config.body.fields, index)"><i class="el-icon-minus"></i></button>
              </div>
            </div>
            <button type="button" class="parameter-add" @click="addBodyField"><i class="el-icon-plus"></i><span>添加 Body 字段</span></button>
          </template>
          <el-input v-else-if="formData.config.body.type === 'raw'" v-model="formData.config.body.raw" type="textarea" :rows="6" resize="vertical" placeholder="请输入原始请求体" />
          <div v-else class="empty-state">当前请求不携带 Body</div>
        </section>

        <!-- <section class="form-section">
          <div class="section-title"><span>输出参数</span><small>从响应中提取并提供给下游节点</small></div>
          <div v-for="(item, index) in formData.output" :key="item.id" class="parameter-card">
            <div class="parameter-row output-row">
              <el-input v-model.trim="item.name" placeholder="输出名称" />
              <el-select v-model="item.type" @change="syncShortLabel(item)"><el-option v-for="type in typeOptions" :key="type" :label="type" :value="type" /></el-select>
              <el-input v-model.trim="item.responsePath" placeholder="响应路径，如 data.id" />
              <button type="button" class="parameter-remove" @click="removeItem(formData.output, index)"><i class="el-icon-minus"></i></button>
            </div>
            <el-input v-model="item.description" class="parameter-description" placeholder="输出描述（可选）" />
          </div>
          <div v-if="!formData.output.length" class="empty-state">暂无输出参数</div>
          <button type="button" class="parameter-add" @click="addOutputParam"><i class="el-icon-plus"></i><span>添加输出参数</span></button>
        </section> -->

        <section class="form-section">
          <div class="section-title"><span>响应数据</span><small>运行结果数据</small></div>
          <template v-if="tryRunRes">
            <div v-loading="isShowRunResLoading" class="parameter-card">
              <json-viewer v-model="tryRunRes" copyable></json-viewer>
            </div>
          </template>
          <template v-else>
            <div class="empty-state">暂无输出参数</div>
          </template>

        </section>
      </el-form>
    </div>

    <div class="editor-footer">
      <el-button @click="openTestPanel">试运行</el-button>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="save">保存配置</el-button>
    </div>

    <!-- <transition name="slide-area">
      <div v-if="isShowSlider" :style="{height:`${autoHeight}px`}" class="slider">
        <div @mousedown="startResize" class="slider-top"></div>
        <div class="slider-content"></div>
        <div class="slider-bottom">
          <el-button @click="closeSlider">关闭</el-button>

          <el-button @click="TryHttpRun">试运行</el-button>
        </div>

      </div>
    </transition> -->
    <transition name="slide-area">
      <div
        v-if="isShowSlider"
        :style="{ height: `${autoHeight}px` }"
        class="slider"
      >
        <div
          class="slider-top"
          @mousedown="startResize"
        ></div>

        <div class="slider-header">
          <div>
            <strong>HTTP 节点试运行</strong>
            <small>为引用的上游变量填写临时测试值</small>
          </div>

          <button
            type="button"
            class="slider-close"
            @click="closeSlider"
          >
            <i class="el-icon-close"></i>
          </button>
        </div>

        <div class="slider-content">
          <div
            v-if="referencedParams.length"
            class="test-param-list"
          >
            <label
              v-for="item in referencedParams"
              :key="item.key"
              class="test-param"
            >
              <span class="test-param__label">
                <strong>{{ item.paramName }}</strong>
                <em>{{ item.type }}</em>
              </span>

              <small>{{ item.nodeTitle }} · {{ item.nodeId }}</small>

              <el-input
                v-model="testInputValues[item.key]"
                :type="item.type === 'Object' || item.type === 'Array'
                  ? 'textarea'
                  : 'text'"
                :rows="3"
                :placeholder="`请输入 ${item.paramName} 的测试值`"
              />
            </label>
          </div>

          <div v-else class="test-param-empty">
            当前 HTTP 节点没有引用上游变量，可以直接运行
          </div>
        </div>

        <div class="slider-bottom">
          <el-button @click="closeSlider">
            关闭
          </el-button>

          <el-button
            type="primary"
            @click="TryHttpRun"
          >
            试运行
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { UUID } from 'uuidjs'
import JsonViewer from 'vue-json-viewer'
// import _ from 'lodash'

const clone = value => JSON.parse(JSON.stringify(value || {}))
const inputParam = (value = {}) => ({ id: UUID.generate(), name: '', description: '', type: 'String', shortLabel: 'Str', required: false, valueType: 'input', inputValue: '', referenceValue: [], referenceKey: [], ...value })
const requestParam = (value = {}) => ({ id: UUID.generate(), key: '', description: '', type: 'String', required: false, enabled: true, valueType: 'input', inputValue: '', referenceValue: [], referenceKey: [], ...value })
const outputParam = (value = {}) => ({ id: UUID.generate(), name: '', description: '', type: 'String', shortLabel: 'Str', responsePath: '', defaultValue: null, required: false, ...value })
const normalizeList = (list, factory) => (Array.isArray(list) ? list : []).map(item => factory({ ...item, id: item.id || UUID.generate(), referenceValue: Array.isArray(item.referenceValue) ? item.referenceValue : [], referenceKey: Array.isArray(item.referenceKey) ? item.referenceKey : [] }))

const normalizeForm = source => {
  const data = clone(source)
  const old = data.config || {}
  return {
    ...data,
    title: data.title || 'HTTP 请求',
    description: data.description || '',
    pluginName: data.pluginName || '',
    data: normalizeList(data.data, inputParam),
    config: {
      url: old.url ?? data.url ?? '',
      method: old.method ?? data.method ?? 'GET',
      headers: normalizeList(old.headers ?? data.headers, requestParam),
      query: normalizeList(old.query ?? data.query, requestParam),
      pathParams: normalizeList(old.pathParams ?? data.pathParams, requestParam),
      body: { type: old.body?.type ?? data.body?.type ?? 'none', fields: normalizeList(old.body?.fields ?? data.body?.fields, requestParam), raw: old.body?.raw ?? old.body?.value ?? data.body?.raw ?? data.body?.value ?? '' },
      timeout: 120000,
      credentialId: old.credentialId ?? data.credentialId ?? '',
      responseType: old.responseType ?? data.responseType ?? 'json'
    },
    output: normalizeList(data.output, outputParam)
  }
}

export default {
  components: {
    JsonViewer
  },
  props: {
    editData: { type: Object, default: () => ({}) },
    nodeId: { type: String, required: true },
    inComingParams: { type: Array, default: () => [] }
  },
  data () {
    return {
      formData: normalizeForm(this.editData),
      methodOptions: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      typeOptions: ['String', 'Number', 'Boolean', 'Object', 'Array'],
      requestGroups: [
        { field: 'headers', title: 'Headers', description: '发送给第三方 API 的请求头', placeholder: 'Header 名称' },
        { field: 'query', title: 'Query 参数', description: '追加在 URL 后的查询参数', placeholder: '参数名' },
        { field: 'pathParams', title: 'Path 参数', description: '替换 URL 中的 {参数名}', placeholder: '路径参数名' }
      ],
      isShowSlider: false,
      autoHeight: 350,
      startY: 0,
      startHeight: 0,
      tryRunRes: null,
      outputOptions: [],
      isShowRunResLoading: false,
      testInputValues: {}
    }
  },
  mounted () {
    this.getLastestHttpRunData()
  },
  computed: {
    bodyUsesFields () { return ['json', 'form-data', 'x-www-form-urlencoded'].includes(this.formData.config.body.type) },
    upperParamOptions () {
      return (this.inComingParams || []).map(node => ({ value: node.nodeId, label: node.title || node.nodeType, children: (Array.isArray(node.output) ? node.output : []).map((item, index) => ({ value: item.name || item.key || index, label: `${item.name || item.key || `参数${index + 1}`} (${item.type || 'String'})` })) })).filter(node => node.children.length)
    },
    workflowId () {
      return this.$route.params.id
    },
    referencedParams () {
      const sources = [
        ...(this.formData.config.headers || []),
        ...(this.formData.config.query || []),
        ...(this.formData.config.pathParams || []),
        ...(this.formData.config.body.fields || [])
      ]

      const referenceMap = new Map()

      sources.forEach(item => {
        const referenceValue = Array.isArray(item.referenceValue) && item.referenceValue.length >= 2
          ? item.referenceValue
          : item.referenceKey

        if (
          item.valueType !== 'reference' ||
          !Array.isArray(referenceValue) ||
          referenceValue.length < 2
        ) {
          return
        }

        const [nodeId, paramName] = referenceValue
        const sourceNode = this.inComingParams.find(node => node.nodeId === nodeId)
        const sourceParam = sourceNode && Array.isArray(sourceNode.output)
          ? sourceNode.output.find(output => output.name === paramName)
          : null
        const key = JSON.stringify([nodeId, paramName])

        if (!referenceMap.has(key)) {
          referenceMap.set(key, {
            key,
            nodeId,
            paramName,
            nodeTitle: sourceNode ? (sourceNode.title || sourceNode.nodeType || nodeId) : nodeId,
            type: sourceParam ? sourceParam.type : (item.type || 'String'),
            required: item.required !== false
          })
        }
      })

      return Array.from(referenceMap.values())
    }

  },
  methods: {
    addInputParam () { this.formData.data.push(inputParam()) },
    addRequestParam (field, required = false) { this.formData.config[field].push(requestParam({ required })) },
    addBodyField () { this.formData.config.body.fields.push(requestParam()) },
    addOutputParam () { this.formData.output.push(outputParam()) },
    removeItem (list, index) { list.splice(index, 1) },
    resetParameterValue (item) { if (item.valueType === 'input') { item.referenceValue = []; item.referenceKey = [] } else { item.inputValue = '' } },
    syncReference (value, item) { item.referenceKey = Array.isArray(value) ? [...value] : [] },
    syncShortLabel (item) { item.shortLabel = ({ String: 'Str', Number: 'Num', Boolean: 'Bool', Object: 'Obj', Array: 'Arr' })[item.type] || 'Any' },
    handleCancel () { this.$emit('handleCancel') },
    save () { this.$emit('saveEditData', clone(this.formData)) },
    formatTestInputValue (value, type, paramName) {
      if (type === 'String' || !type) return value == null ? '' : String(value)

      if (type === 'Number') {
        if (value === '' || value == null || Number.isNaN(Number(value))) {
          throw new Error(`${paramName} 需要输入有效的数字`)
        }
        return Number(value)
      }

      if (type === 'Boolean') {
        if (typeof value === 'boolean') return value
        const normalizedValue = String(value).trim().toLowerCase()
        if (normalizedValue === 'true') return true
        if (normalizedValue === 'false') return false
        throw new Error(`${paramName} 只能输入 true 或 false`)
      }

      if (type === 'Object' || type === 'Array') {
        let parsedValue
        try {
          parsedValue = typeof value === 'string' ? JSON.parse(value) : value
        } catch (error) {
          throw new Error(`${paramName} 需要输入合法的 JSON`)
        }

        const isValid = type === 'Array'
          ? Array.isArray(parsedValue)
          : parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)

        if (!isValid) {
          throw new Error(`${paramName} 需要输入 ${type === 'Array' ? 'JSON 数组' : 'JSON 对象'}`)
        }
        return parsedValue
      }

      return value
    },
    buildTestVariables () {
      return this.referencedParams.reduce((variables, item) => {
        if (!variables[item.nodeId]) variables[item.nodeId] = {}
        variables[item.nodeId][item.paramName] = this.formatTestInputValue(
          this.testInputValues[item.key],
          item.type,
          item.paramName
        )
        return variables
      }, {})
    },
    async TryHttpRun () {
      if (!this.formData.config.url || !this.formData.config.url.trim()) {
        Message.warning('请先填写请求地址')
        return
      }

      try {
        this.isShowRunResLoading = true
        const variables = this.buildTestVariables()

        const res = await this.$api.testAndSaveHttpNode(this.workflowId, this.nodeId,
          {
            config: this.formData.config,
            output: [],
            variables
          })
        if (res.code === 0) {
          Message.success('API 接口测试成功')
          this.tryRunRes = res.data.response.body
          this.formateOutput(this.tryRunRes)
          // this.outputOptions = Array.isArray(res.data.outputOptions) ? res.data.outputOptions : []
          this.isShowSlider = false
        } else {
          Message.error(`${res.message}`)
        }
      } catch (error) {
        Message.error(error.response?.data?.message || error.message || '运行失败')
      } finally {
        this.isShowRunResLoading = false
      }
    },
    closeSlider () {
      this.isShowSlider = !this.isShowSlider
    },
    startResize (e) {
      this.startY = e.clientY
      this.startHeight = this.autoHeight

      document.addEventListener('mousemove', this.resize)
      document.addEventListener('mouseup', this.endResize)

      // 防止拖拽时选中文字
      document.body.style.userSelect = 'none'
    },
    resize (e) {
      const y = this.startY - e.clientY
      const newHeight = this.startHeight + y

      if (newHeight < 250) {
        this.autoHeight = 250
      } else if (newHeight > 500) {
        this.autoHeight = 500
      } else {
        this.autoHeight = newHeight
      }
    },
    endResize () {
      document.body.style.userSelect = 'auto'

      document.removeEventListener('mousemove', this.resize)
      document.removeEventListener('mouseup', this.endResize)
    },
    openTestPanel () {
      this.referencedParams.forEach(item => {
        if (!(item.key in this.testInputValues)) {
          this.$set(this.testInputValues, item.key, '')
        }
      })

      this.isShowSlider = true
    },
    formateOutput (data) {
      const buildOptions = value => {
        let currentValue = value

        // 数组下标不是接口字段。对象数组使用第一条有效数据推断字段结构。
        if (Array.isArray(currentValue)) {
          currentValue = currentValue.find(item => {
            return this.isPlainObject(item) || Array.isArray(item)
          })
        }

        if (!this.isPlainObject(currentValue) && !Array.isArray(currentValue)) {
          return []
        }

        return Object.entries(currentValue).map(([key, childValue]) => {
          let type = ''

          if (Array.isArray(childValue)) {
            type = 'Array'
          } else if (this.isPlainObject(childValue)) {
            type = 'Object'
          } else {
            type = this.upperFirst(typeof (childValue))
          }
          const option = {
            value: key,
            label: key,
            type
          }
          const children = buildOptions(childValue)

          if (children.length) {
            option.children = children
          }

          return option
        })
      }

      this.outputOptions = buildOptions(data)
      this.formData.output = this.outputOptions
      this.save()
      console.log('响应字段 options：', this.outputOptions)

      // return this.outputOptions
    },

    upperFirst (str) {
      if (!str) return str
      // 第一个字符转大写 + 剩下全部小写
      return str[0].toUpperCase() + str.slice(1).toLowerCase()
    },

    isPlainObject (val) {
      return typeof val === 'object' && val !== null && !Array.isArray(val)
    },

    async getLastestHttpRunData () {
      const res = await this.$api.getLatestHttpNodeTestRun(this.workflowId, this.nodeId)
      console.log('httpnode res:', res)
      if (res.code === 0) {
        this.tryRunRes = res.data?.response?.body
      }
    }

  },
  beforeDestroy () {
    document.removeEventListener('mousemove', this.resize)
    document.removeEventListener('mouseup', this.endResize)
  }

}
</script>

<style lang="scss" scoped>
.http-node-editor { position: relative;height: 100%; padding: 0 22px; display: flex; flex-direction: column; color: #272a39; background: #fff; }
.editor-header { padding: 22px 0 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #eceef4; h3 { margin: 0 0 6px; font-size: 16px; } p { margin: 0; color: #999eae; font-size: 12px; } &__tag { height: 20px; padding: 0 8px; border-radius: 5px; color: #218d6c; background: #eaf8f3; font-size: 10px; font-weight: 700; line-height: 20px; } }
.editor-content { flex: 1; padding: 20px 2px; overflow-y: auto; }
.form-section { padding-bottom: 22px; margin-bottom: 20px; border-bottom: 1px solid #eceef4; }
.section-title { margin-bottom: 12px; display: flex; justify-content: space-between; gap: 10px; > span { font-size: 14px; font-weight: 600; } small { color: #a3a7b6; font-size: 11px; text-align: right; } }
.setting-card { padding: 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 10px; border: 1px solid #e4e7ef; border-radius: 10px; background: #fafbfe; }
.form-item--full { grid-column: 1 / -1; }
.request-line { margin-bottom: 12px; display: flex; gap: 8px; }.method-select { width: 105px; flex: 0 0 105px; }
.parameter-card { padding: 10px; border: 1px solid #e3e6ee; border-radius: 9px; background: #fafbfe; }.parameter-card + .parameter-card { margin-top: 9px; }
.parameter-row { display: grid; grid-template-columns: minmax(0, 1fr) 72px minmax(0, 1.1fr) 24px; align-items: center; gap: 6px; }.parameter-description { margin-top: 7px; }
.parameter-remove { width: 22px; height: 22px; padding: 0; border: 1px solid #c9cdd8; border-radius: 50%; color: #747a8b; background: #fff; cursor: pointer; &:hover { color: #e05252; border-color: #e05252; } }
.parameter-add { margin-top: 10px; padding: 0; display: inline-flex; align-items: center; gap: 5px; border: 0; color: #278f70; background: transparent; cursor: pointer; i { font-size: 16px; } }
.empty-state { padding: 16px; border: 1px dashed #dfe2eb; border-radius: 8px; color: #a0a5b3; background: #fafbfe; font-size: 12px; text-align: center; }.body-type { margin-bottom: 12px; display: flex; flex-wrap: wrap; }
.editor-footer { margin: auto -22px 0; padding: 16px 22px; display: flex; justify-content: flex-end; border-top: 1px solid #eceef4; background: #fff; }
.http-node-editor { ::v-deep .el-form-item { margin-bottom: 14px; } ::v-deep .el-form-item__label { padding-bottom: 4px; color: #777c8f; font-size: 12px; line-height: 18px; } ::v-deep .el-select, ::v-deep .el-cascader, ::v-deep .el-input-number { width: 100%; } ::v-deep .el-input__inner, ::v-deep .el-textarea__inner { border-color: #dfe2eb; border-radius: 7px; } ::v-deep .el-radio-button__inner { padding: 8px 9px; font-size: 10px; } ::v-deep .el-button--primary { border-color: #278f70; background: #278f70; } }
.slider {
  position: absolute;
  z-index: 30;
  right: -22px;
  bottom: 0;
  left: -22px;
  min-height: 250px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e0e4eb;
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
  background: #fff;
  box-shadow: 0 -10px 35px rgba(34, 42, 66, .16);
  box-sizing: border-box;

  &-top {
    width: 100%;
    height: 18px;
    flex: 0 0 18px;
    position: relative;
    background: #fafbfc;
    cursor: ns-resize;
    user-select: none;

    &::before {
      content: '';
      width: 48px;
      height: 4px;
      position: absolute;
      top: 7px;
      left: 50%;
      border-radius: 4px;
      background: #cbd1dc;
      transform: translateX(-50%);
      transition: width .2s ease, background .2s ease;
    }

    &:hover::before {
      width: 64px;
      background: #8b95a7;
    }
  }

  &-header {
    padding: 12px 20px 14px;
    flex: 0 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid #edf0f4;

    > div {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    strong {
      color: #252938;
      font-size: 15px;
      font-weight: 600;
      line-height: 21px;
    }

    small {
      color: #9298a8;
      font-size: 11px;
      line-height: 17px;
    }
  }

  &-close {
    width: 28px;
    height: 28px;
    padding: 0;
    flex: 0 0 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 7px;
    color: #777e8f;
    background: transparent;
    cursor: pointer;
    transition: color .2s ease, background .2s ease;

    &:hover {
      color: #de5252;
      background: #fff0f0;
    }
  }

  &-content {
    min-height: 0;
    padding: 16px 20px;
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    background: #f8f9fb;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background: #d1d5de;
    }
  }

  &-bottom {
    padding: 13px 20px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    border-top: 1px solid #e9ecf1;
    background: #fff;
    box-shadow: 0 -4px 14px rgba(35, 43, 66, .04);
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-textarea__inner {
    border-color: #dfe3eb;
    border-radius: 7px;
    background: #fff;
  }

  ::v-deep .el-input__inner:focus,
  ::v-deep .el-textarea__inner:focus {
    border-color: #45a989;
    box-shadow: 0 0 0 2px rgba(69, 169, 137, .1);
  }
}

.test-param-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.test-param {
  padding: 12px;
  display: block;
  border: 1px solid #e1e5ec;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 7px rgba(40, 48, 70, .04);
  transition: border-color .2s ease, box-shadow .2s ease;

  &:focus-within {
    border-color: #9bcfbd;
    box-shadow: 0 4px 12px rgba(45, 137, 107, .08);
  }

  &__label {
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 7px;

    strong {
      min-width: 0;
      overflow: hidden;
      color: #343847;
      font-size: 13px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      padding: 2px 6px;
      flex: 0 0 auto;
      border-radius: 4px;
      color: #278f70;
      background: #eaf8f3;
      font-size: 10px;
      font-style: normal;
      line-height: 16px;
    }
  }

  > small {
    margin-bottom: 9px;
    display: block;
    overflow: hidden;
    color: #9aa0ae;
    font-size: 10px;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.test-param-empty {
  min-height: 118px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d8dde6;
  border-radius: 10px;
  color: #969cab;
  background: #fff;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}

.slide-area-enter-active,
.slide-area-leave-active {
  transition: transform .28s ease, opacity .22s ease;
}

.slide-area-enter,
.slide-area-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.slide-area-enter-to,
.slide-area-leave {
  opacity: 1;
  transform: translateY(0);
}
</style>
