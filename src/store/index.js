import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dragItemType: null,
    runtimeResponseData: null,
    isShowLoading: false
  },
  getters: {
  },
  mutations: {
    getDragType (state, type) {
      console.log('出发了')

      state.dragItemType = type
    },
    getRunTimeData (state, data) {
      state.runtimeResponseData = data
    },
    getIsShowLoading (state, bool) {
      state.isShowLoading = bool
    }
  },
  actions: {
  },
  modules: {
  }
})
