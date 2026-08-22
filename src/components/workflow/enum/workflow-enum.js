// 参数类型选项
export const PARAM_TYPE_OPTIONS = {
  String: {
    value: 'String',
    label: 'String',
    leaf: true,
    // 缩略显示
    shortLabel: 'Str'
  },
  Integer: {
    value: 'Integer',
    label: 'Integer',
    leaf: true,
    // 缩略显示
    shortLabel: 'Int'
  },
  Number: {
    value: 'Number',
    label: 'Number',
    leaf: true,
    // 缩略显示
    shortLabel: 'No'
  },
  Boolean: {
    value: 'Boolean',
    label: 'Boolean',
    leaf: true,
    // 缩略显示
    shortLabel: 'Bool'
  },
  Time: {
    value: 'Time',
    label: 'Time',
    leaf: true,
    // 缩略显示
    shortLabel: 'Time'
  },
  Object: {
    value: 'Object',
    label: 'Object',
    leaf: true,
    // 缩略显示
    shortLabel: 'Obj'
  },
  Array: {
    value: 'Array',
    label: 'Array',
    children: {
      String: {
        value: 'String',
        label: 'String',
        leaf: true,
        // 缩略显示
        shortLabel: 'Str'
      },
      Integer: {
        value: 'Integer',
        label: 'Integer',
        leaf: true,
        // 缩略显示
        shortLabel: 'Int'
      },
      Number: {
        value: 'Number',
        label: 'Number',
        leaf: true,
        // 缩略显示
        shortLabel: 'Num'
      },
      Boolean: {
        value: 'Boolean',
        label: 'Boolean',
        leaf: true,
        // 缩略显示
        shortLabel: 'Bool'
      },
      Time: {
        value: 'Time',
        label: 'Time',
        leaf: true,
        // 缩略显示
        shortLabel: 'Time'
      },
      Object: {
        value: 'Object',
        label: 'Object',
        leaf: true,
        // 缩略显示
        shortLabel: 'Obj'
      }
    }
  }
}

export const NODE_TITLE = {
  'input-node': '输入',
  'model-node': '大模型'
}
