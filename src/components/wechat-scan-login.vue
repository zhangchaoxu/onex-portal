<template>
  <el-popover
      placement="top"
      title="微信扫码登录"
      @show="onScanShow()"
      @hide="onScanHide()"
      trigger="click">
    <div id="wechat-scan-container">
      <iframe :src="iFrameSrc" width="350px" height="350px" frameBorder="0" scrolling="no" allowTransparency="true"/>
    </div>
    <el-link :underline="false" title="微信" class="no-underline" slot="reference">
      <i class="ad-icon-wechat-fill" style="font-size: 24px; margin-left: 12px; margin-right: 12px;"/>
    </el-link>
  </el-popover>
</template>

<script>
export default {
  name: 'wechat-scan-login',
  data () {
    return {
      iFrameSrc: ''
    }
  },
  props: {
    appid: {
      type: String
    },
    callback: {
      type: String
    }
  },
  created () {
    // 监听
    this.listenOauthLoginCallback()
  },
  methods: {
    onScanHide () {
      this.iFrameSrc = ''
    },
    onScanShow () {
      // 微信扫码登录https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
      let url = 'https://open.weixin.qq.com/connect/qrconnect' +
          '?appid=' + this.appid +
          '&redirect_uri=' + encodeURIComponent(this.callback) +
          '&scope=snsapi_login' +
          '&style=black' +
          '&login_type=jssdk' +
          '&state=STATE'
      this.iFrameSrc = url
    },
    /**
     * 监听第三方登录跳转返回
     */
    listenOauthLoginCallback () {
      console.log('listenOauthLoginCallback')
      window.addEventListener('message', (event) => {
        console.log(event)
        if (event.origin === 'https://login.dingtalk.com' && event.data) {
          // 监听钉钉返回的data(loginTmpCode)
          window.location.href = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize' +
              '?appid=' + this.appid +
              '&redirect_uri=' + encodeURIComponent(this.callback) +
              '&loginTmpCode=' + event.data +
              '&response_type=code' +
              '&scope=snsapi_login' +
              '&state=STATE'
        }
      }, false)
    }
  }
}
</script>
