import { HtmlNode, HtmlNodeModel } from '@logicflow/core'
import Vue from 'vue'
import modelNode from './model-node.vue'

class VueNodeModel extends HtmlNodeModel {
  setAttributes () {
    this.width = 300
    this.height = 85

    // this.targetRules = []
    // this.anchorsOffset = [[150, 40]]
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
        x: x + width / 2,
        y: y,
        id: `${id}_1`,
        type: 'right'
      },
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
    const VueComponent = Vue.extend(modelNode)
    const ModelVueInstance = new VueComponent({
      propsData: {
        title: '大模型',
        // data: safeProperties,
        graphModel: {
          eventCenter: this.props.graphModel.eventCenter
        },
        model: {
          id: this.props.model.id,
          properties: {
            data: this.props.model.properties?.data || [],
            output: this.props.model.properties?.output || [],
            config: this.props.model.properties?.config || {}
          }

        }
      }
    })

    ModelVueInstance.$mount()

    root.appendChild(ModelVueInstance.$el)
  }
}

export default {
  type: 'model-node',
  view: VueNode,
  model: VueNodeModel
}
