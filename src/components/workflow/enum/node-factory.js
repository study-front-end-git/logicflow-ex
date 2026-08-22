import { UUID } from 'uuidjs'
import { NODE_TITLE } from './workflow-enum'

const DEFAULT_NODE_SIZE = {
  width: 300,
  height: 85
}

const createParameter = (overrides = {}) => ({
  id: UUID.generate(),
  name: '',
  description: '',
  type: 'String',
  shortLabel: 'Str',
  required: true,
  ...overrides
})

const NODE_PROPERTY_FACTORIES = {
  'start-node': () => ({
    description: '工作流的起始节点，用于定义工作流输入',
    data: [
      createParameter({ name: 'input' })
    ]
  }),

  'end-node': () => ({
    description: '工作流的结束节点，用于定义工作流输出',
    outputMode: 'variable',
    isCustomReply: false,
    data: [
      {
        id: UUID.generate(),
        name: 'output',
        type: 'String',
        shortLabel: 'Str',
        valueType: 'reference',
        inputValue: '',
        referenceKey: [],
        referenceValue: []
      }
    ],
    cueWord: ''
  }),

  'input-node': () => ({
    description: '接收手动输入或引用变量，并向下游输出数据',
    inputType: 'input',
    data: [
      createParameter({
        name: 'input',
        valueType: 'manual',
        inputValue: '',
        defaultValue: ''
      })
    ],
    output: [
      createParameter({
        name: 'output',
        required: false
      })
    ],
    config: {
      inputMode: 'manual'
    }
  }),

  'model-node': () => ({
    description: '调用大模型处理输入内容并生成结果',
    inputType: 'input',
    data: [
      createParameter({
        name: 'prompt',
        valueType: 'input',
        inputValue: '',
        referenceKey: [],
        referenceValue: []
      })
    ],
    output: [
      createParameter({
        name: 'text',
        required: false,
        format: 'text'
      })
    ],
    config: {
      modelId: '',
      systemPrompt: '',
      userPrompt: '',
      temperature: 0.7,
      maxTokens: 2048,
      outputFormat: 'text'
    }
  })
}

export function createDefaultNodeProperties (type, overrides = {}) {
  const createProperties = NODE_PROPERTY_FACTORIES[type]
  const defaults = createProperties ? createProperties() : {}

  return {
    ...defaults,
    ...overrides
  }
}

export function createWorkflowNode ({
  type,
  x,
  y,
  workflowId,
  label,
  title,
  width = DEFAULT_NODE_SIZE.width,
  height = DEFAULT_NODE_SIZE.height,
  properties = {}
}) {
  if (!type) {
    throw new Error('创建节点失败：缺少节点 type')
  }

  return {
    id: UUID.generate(),
    type,
    x,
    y,
    text: '',
    properties: createDefaultNodeProperties(type, {
      workflowId,
      label: label || NODE_TITLE[type] || type,
      title: title || NODE_TITLE[type] || type,
      width,
      height,
      ...properties
    })
  }
}

export { DEFAULT_NODE_SIZE, NODE_PROPERTY_FACTORIES }
