import axios from 'axios'
import { Message } from 'element-ui'

// 创建实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 120000, // 毫秒
  headers: {
    'Content-Type': 'application/json'
  }
})

const pendingMap = new Map()

const getRequestKey = (config) => {
  return [
    config.method,
    config.url,
    JSON.stringify(config.params),
    JSON.stringify(config.data)
  ].join('&')
}

const deleteKey = (config) => {
  const key = getRequestKey(config)
  if (pendingMap.has(key)) {
    pendingMap.get(key).abort()
    pendingMap.delete(key)
  }
}

instance.interceptors.request.use(config => {
  // 在发送请求前要做的事儿
  deleteKey(config)

  const controll = new AbortController()
  config.signal = controll.signal
  const key = getRequestKey(config)
  pendingMap.set(key, controll)
  return config
}, err => {
  // 在请求错误时要做的事儿

  if (err.name === 'CanceledError') {
    console.log('请求被手动取消', err)
    return Promise.reject(new Error('canceled'))
  }
  // 该返回的数据则是axios.catch(err)中接收的数据
  return Promise.reject(err)
})

instance.interceptors.response.use(response => {
  // 请求成功对响应数据做处理

  // 该返回的数据则是axios.then(res)中接收的数据
  deleteKey(response.config)

  const { data, status } = response

  switch (status) {
    case 200:
      if (data.status >= 1000 && data.status < 2000 && data.msg) {
        Message.warning(data.msg)
      }
      break
    case 302:
      break
    case 401:
      Message.error(data.msg || '登录过期，请重新登录')
      // logout()
      break
    case 403:
      Message.error(data.msg || '无权限访问')
      break
    case 404:
      break
    case 504:
      break
    case 500:
      Message.error('哎呀网络连接不畅，请刷新重试～')
      break
  }

  return data
}, err => {
  // 在请求错误时要做的事儿

  // 该返回的数据则是axios.catch(err)中接收的数据
  if (axios.isCancel(err)) {
    Message.warning('请求被取消')
  } else {
    console.error(err.response?.data?.message || '网络错误')
  }
  return Promise.reject(err)
})

export default instance
