<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__websocket">
      <el-form size="small" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="websocketAddress" placeholder="WebSocket地址" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button @click="connectWebsocket()" :type="websocket ? 'danger' : 'success'">{{ websocket ? '断开' : '连接'}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script>
export default {
  components: { },
  data () {
    return {
      websocket: null,
      websocketAddress: process.env.VUE_APP_WS_URL + '/ws/' + this.$store.state.user.id
    }
  },
  destroyed () {
    if (this.websocket) {
      this.websocket.close()
    }
  },
  methods: {
    // 连接websocket
    connectWebsocket () {
      if (!this.websocketAddress) {
        this.$message.error('请配置WebSocket地址')
        return
      }
      if (!('WebSocket' in window)) {
        this.$message.error('当前浏览器不支持WebSocket')
        return
      }
      console.log(this.websocketAddress)
      this.websocket = new WebSocket(this.websocketAddress)
      // 连接错误
      this.websocket.onerror = function () {
        console.log('WebSocket连接发生错误   状态码：' + this.websocket.readyState)
      }
      // 连接成功
      this.websocket.onopen = (e) => {
        console.log(e)
        // console.log('WebSocket连接成功    状态码：' + this.websocket.readyState)
      }
      // 收到消息的回调
      this.websocket.onmessage = function (event) {
        // 根据服务器推送的消息做自己的业务处理
        console.log('服务端返回：' + event.data)
      }
      // 连接关闭的回调
      this.websocket.onclose = function () {
        console.log('WebSocket连接关闭    状态码：' + this.websocket.readyState)
      }
      // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
      window.onbeforeunload = function () {
        this.websocket.close()
      }
    }
  }
}
</script>
