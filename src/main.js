import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/style/common.scss'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 接口
import api from './api/api'

Vue.use(ElementUI)
Vue.config.productionTip = false

Vue.prototype.$api = api

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
