<template>
  <el-popover
      placement="top"
      title="钉钉扫码登录"
      @show="onScanShow()"
      @hide="onScanHide()"
      trigger="click">
    <div id="dingtalk-scan-container" style="width: 350px; height: 350px">
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
    },
    state: {
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
      // 钉钉扫码登录https://open.dingtalk.com/document/orgapp-server/obtain-identity-credentials
      this.iFrameSrc = 'https://login.dingtalk.com/oauth2/auth?iframe=true' +
          '&client_id=' + this.appid +
          '&state=' + this.state +
          '&redirect_uri=' + encodeURIComponent(this.callback) +
          '&response_type=code' +
          '&scope=openid' +
          '&prompt=consent'
    },
    /**
     * 监听第三方登录跳转返回
     */
    listenOauthLoginCallback () {
      window.addEventListener('message', (event) => {
        if (event.origin === 'https://login.dingtalk.com' && event.data && event.data.success) {
          // 监听钉钉返回的data
          window.location.href = event.data.redirectUrl
        }
      }, false)
    }
  }
}
</script>
