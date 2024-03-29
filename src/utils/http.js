import Vue from 'vue'
import axios from 'axios'
import Cookies from 'js-cookie'
import qs from 'qs'
import { redirectLogin } from '@/utils'
import isPlainObject from 'lodash/isPlainObject'

/**
 * axios init
 */
const http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 1000 * 180,
  withCredentials: true
})

/**
 * request interceptor
 */
http.interceptors.request.use(config => {
  config.headers['Accept-Language'] = Cookies.get('language') || 'zh-CN'
  config.headers[Cookies.get('tokenKey') || 'auth-token'] = Cookies.get('token') || ''
  // 默认参数
  const defaults = {}
  // 防止缓存，GET请求默认带_t参数
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      ...{ '_t': new Date().getTime() }
    }
  }
  if (isPlainObject(config.params)) {
    config.params = {
      ...defaults,
      ...config.params
    }
  }
  if (isPlainObject(config.data)) {
    config.data = {
      ...defaults,
      ...config.data
    }
    if (/^application\/x-www-form-urlencoded/.test(config.headers['content-type'])) {
      config.data = qs.stringify(config.data)
    }
  }
  return config
}, error => {
  console.log(error)
  Vue.prototype.$message.error('接口无法请求,请稍后再试')
  return Promise.reject(error)
})

/**
 * response interceptor
 */
http.interceptors.response.use(response => {
  if (response.data.code === 401) {
    // 清空登录信息，跳转登录页面
    redirectLogin()
    return Promise.reject(response.data.msg)
  }
  // 设置显示用消息
  response.data.toast = response.data.code + ':' + response.data.msg
  return response
}, error => {
  console.log(error)
  Vue.prototype.$message.error('接口无法访问,请稍后再试')
  return Promise.reject(error)
})

export default http
