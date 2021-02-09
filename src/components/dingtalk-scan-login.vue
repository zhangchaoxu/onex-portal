<template>
  <el-popover
      placement="top"
      title="钉钉扫码登录"
      @show="onScanShow()"
      @hide="onScanHide()"
      trigger="click">
    <div id="dingtalk-scan-container">
      <iframe :src="iFrameSrc" width="350px" height="350px" frameBorder="0" scrolling="no" allowTransparency="true"/>
    </div>
    <el-link :underline="false" title="钉钉" class="no-underline" slot="reference">
      <i class="ad-icon-dingtalk" style="font-size: 24px; margin-left: 12px; margin-right: 12px;"/>
    </el-link>
  </el-popover>
</template>

<script>
export default {
  name: 'dingtalk-scan-login',
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
      // 钉钉扫码登录https://ding-doc.dingtalk.com/document/app/scan-qr-code-to-log-on-to-third-party-websites
      let url = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize' +
          '?appid=' + this.appid +
          '&redirect_uri=' + encodeURIComponent(this.callback) +
          '&response_type=code' +
          '&scope=snsapi_login' +
          '&state=STATE'
      this.iFrameSrc = 'https://login.dingtalk.com/login/qrcode.htm?goto=' + encodeURIComponent(url) + '&style=' + encodeURIComponent('border:none;background-color:#FFFFFF;')
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
