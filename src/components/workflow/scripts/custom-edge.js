import { BezierEdge, BezierEdgeModel } from '@logicflow/core'

class CustomModel extends BezierEdgeModel {
  setAttributes () {
    this.offset = 20
  }

  getEdgeStyle () {
    const style = super.getEdgeStyle()
    style.stroke = 'blue'
    style.strokeDasharray = '0'

    if (this.isSelected) {
      style.strokeWidth = 4
      style.stroke = 'rgb(77, 213, 254)'
    }

    if (this.isHovered) {
      style.stroke = 'rgb(77, 213, 254)'
    }
    return style
  }

  getAnimation () {
    const animation = super.getAnimation()
    animation.stroke = 'blue'
    return animation
  }

  getTextStyle () {
    const style = super.getTextStyle()
    style.color = '#3451F1'
    style.fontSize = 30
    style.background.fill = '#F2F131'
    return style
  }

  // getOutlineStyle () {
  //   const style = super.getOutlineStyle()
  //   style.stroke = 'red'
  //   style.hover.stroke = 'red'
  //   return style
  // }
}

export default {
  type: 'custom-edge',
  view: BezierEdge,
  model: CustomModel
}
