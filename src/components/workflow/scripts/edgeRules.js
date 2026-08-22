/**
 * 边规则 主要用于验证边规则
 * 1. 禁止从结束节点出发连边
 * 2. 禁止从开始节点出发连边
 * @param {*} instance 实例
 * @param {*} vm 组件实例
 * @returns 验证结果
 */
export function validateEdge (instance, vm, { data }) {
  // return ({ data }) => {
  // 终点节点（to）
  console.log('接收到的data:', data)

  const targetNode = instance.getNodeModelById(data.targetNodeId)
  // 起点节点（from）
  const sourceNode = instance.getNodeModelById(data.sourceNodeId)
  console.log('起始节点', sourceNode)
  console.log('结束节点', targetNode)
  console.log('边数据', data)
  // 1. 禁止从开始节点禁止作为连接终点
  if (targetNode.type === 'start-node') {
    vm.$message.warning('开始节点禁止作为连接终点')
    instance.deleteEdge(data.id)
    return false
  }

  // 2. 禁止从结束节点禁止作为连接起点
  if (sourceNode.type === 'end-node') {
    vm.$message.warning('结束节点禁止作为连接起点')
    instance.deleteEdge(data.id)
    return false
  }

  // 禁止右侧锚点作为连接终点
  if (targetNode.id + '_1' === data.targetAnchorId && targetNode.type !== 'end-node' && targetNode.type !== 'start-node') {
    vm.$message.warning('右侧锚点禁止作为连接终点')
    instance.deleteEdge(data.id)
    return false
  }

  // 禁止左侧锚点作为连接起点
  if (sourceNode.id + '_0' === data.sourceAnchorId && sourceNode.type !== 'end-node' && sourceNode.type !== 'start-node') {
    vm.$message.warning('左侧锚点禁止作为连接起点')
    instance.deleteEdge(data.id)
    return false
  }

  return true
  // }
}
