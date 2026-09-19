import { HtmlNode, HtmlNodeModel } from '@logicflow/core'
import Vue from 'vue'
import endNode from './end-node.vue'

class VueNodeModel extends HtmlNodeModel {
  setAttributes () {
    this.width = 300 // 设置节点宽度
    this.height = 100 // 设置节点高度

    this.targetRules = [] // 禁止作为连线终点
  }

  // 自定义锚点样式
  getAnchorStyle () {
    const style = super.getAnchorStyle()
    style.fill = 'rgb(145, 151, 241)'
    style.hover.r = 8
    style.hover.fill = 'rgb(24, 125, 255)'
    style.hover.stroke = 'rgb(24, 125, 255)'
    return style
  }

  // 定义连线样式
  getAnchorLineStyle (anchorInfo) {
    const style = super.getAnchorLineStyle()
    style.stroke = 'rgb(24, 125, 255)'
    return style
  }

  // 定义连线规则
  // getConnectedTargetRules () {
  //   const rules = super.getConnectedTargetRules()
  //   const notAsTarget = {
  //     message: '起始节点不能作为连线的终点',
  //     validate: () => false
  //   }
  //   rules.push(notAsTarget)
  //   return rules
  // }

  getDefaultAnchor () {
    const { x, y, id, width } = this
    const anchors = [ // 定义锚点为节点左右各一个
      {
        x: x - width / 2,
        y: y,
        id: `${id}_0`,
        type: 'left'
      }

    ]
    return anchors
  }

  getNodeStyle () {
    const style = super.getNodeStyle()
    if (this.properties.active) {
      style.stroke = '#aab1ee'
      // style.strokeWidth = 3
    }
    return style
  }
}

class VueNode extends HtmlNode {
  setHtml (root) {
    const VueComponent = Vue.extend(endNode)
    const EndNodeVue = new VueComponent({
      propsData: {
        title: '结束',
        graphModel: {
          eventCenter: this.props.graphModel.eventCenter
        },
        model: {
          id: this.props.model.id,
          properties: {
            data: this.props.model.properties?.data || [],
            outputMode: this.props.model.properties?.outputMode || 'variable',
            cueWord: this.props.model.properties?.cueWord || ''
          }
        }
      }
    })

    EndNodeVue.$mount()
    root.appendChild(EndNodeVue.$el)
  }
}

export default {
  type: 'end-node',
  view: VueNode,
  model: VueNodeModel
}
