import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dragItemType: null
  },
  getters: {
  },
  mutations: {
    getDragType (state, type) {
      console.log('出发了')

      state.dragItemType = type
    }
  },
  actions: {
  },
  modules: {
  }
})
