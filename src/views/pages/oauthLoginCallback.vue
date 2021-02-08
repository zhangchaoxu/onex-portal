<template>
  <el-card v-loading="formLoading" element-loading-text="登录跳转中..."/>
</template>

<script>
/**
 * 登录回调页面
 * 接收回调返回的参数(code、state、source)
 * 其中source为传参
 */
import { redirectLogin } from '@/utils'

export default {
  data () {
    return {
      formLoading: true
    }
  },
  created () {
    let type = this.$route.query.type
    let code = this.$route.query.code
    if (type && code) {
      this.oauthLoginHandle(type, code)
    } else {
      this.loginFail('回调参数异常')
    }
  },
  methods: {
    /**
     * 第三方code登录
     */
    oauthLoginHandle (type, code) {
      this.formLoading = true
      this.$http.post(`/uc/userOauth/oauthLoginByCode`, { code: code, paramCode: type, type: type }).then(({ data: res }) => {
        if (res.code !== 0) {
          this.$message.error(res.toast)
        }
        this.onFormSubmitSuccess(res)
        console.log(res.data)
      }).finally(() => {
        this.formLoading = false
      })
    },
    // 登录失败
    loginFail (message) {
      this.$confirm(message, this.$t('prompt.title'), {
        confirmButtonText: `重新登录`,
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        // 重新登录
        redirectLogin()
      })
    }
  }
}
</script>
