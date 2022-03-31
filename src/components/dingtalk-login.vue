<template>
  <el-link :underline="false" title="钉钉" class="no-underline" slot="reference" :href="iFrameSrc">
    <i class="ad-icon-dingtalk" style="font-size: 24px; margin-left: 12px; margin-right: 12px;"/>
  </el-link>
</template>

<script>
export default {
  name: 'dingtalk-login',
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
    this.loadUrl()
  },
  methods: {
    loadUrl () {
      // 钉钉扫码登录https://open.dingtalk.com/document/orgapp-server/tutorial-obtaining-user-personal-information
      this.iFrameSrc = 'https://login.dingtalk.com/oauth2/auth?' +
          'redirect_uri=' + encodeURIComponent(this.callback) +
          '&response_type=code' +
          '&client_id=' + this.appid +
          '&scope=openid' +
          '&state=' + this.state +
          '&prompt=consent'
    }
  }
}
</script>
