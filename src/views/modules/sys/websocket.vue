<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__websocket">
      <el-row>
        <el-col :span="8">
          <span>连接数</span>
        </el-col>
        <el-col :span="16">
          <el-form size="small" label-position="left" @submit.native.prevent>
            <el-form-item label="地址">
              <el-input v-model="websocketAddress" placeholder="WebSocket地址" clearable/>
            </el-form-item>
            <el-form-item class="small-item">
              <el-button @click="connectWebsocket()" :type="websocket ? 'danger' : 'success'">{{ websocket ? '断开' : '连接'}}</el-button>
            </el-form-item>
          </el-form>
          <el-form size="small" label-position="top" @submit.native.prevent>
            <el-form-item label="记录">
              <el-input v-model="websocketMessage"
                        :autosize="{ minRows: 10}"
                        disabled
                        type="textarea"/>
            </el-form-item>
            <el-form-item label="消息">
              <el-input placeholder="消息" v-model="websocketMessageSend" type="textarea"/>
            </el-form-item>
            <el-form-item class="small-item">
              <el-button @click="sendWebsocketMessage()" type="primary">发送</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
export default {
  components: { },
  data () {
    return {
      websocketAddress: process.env.VUE_APP_WS_URL + '/ws/' + this.$store.state.user.id,
      websocket: null,
      websocketMessage: '',
      websocketMessageSend: ''
    }
  },
  destroyed () {
    if (this.websocket) {
      this.websocket.close()
    }
  },
  methods: {
    // 发送消息
    sendWebsocketMessage () {
      if (this.websocket) {
        this.websocket.send(this.websocketMessageSend)
        this.websocketMessage += '发送消息：' + this.websocketMessageSend + '\n'
      } else {
        this.websocketMessage += '请先连接WebSocket' + '\n'
      }
    },
    // 连接websocket
    connectWebsocket () {
      if (this.websocket) {
        // 已连接,断开连接
        this.websocket.close()
        this.websocket = null
      } else {
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
        this.websocket.onerror = () => {
          console.log('WebSocket连接发生错误   状态码：' + this.websocket.readyState)
          this.websocketMessage += 'WebSocket连接发生错误   状态码：' + this.websocket.readyState + '\n'
        }
        // 连接成功
        this.websocket.onopen = (e) => {
          console.log(e)
          this.websocketMessage += 'WebSocket连接成功    状态码：' + this.websocket.readyState + '\n'
        }
        // 收到消息的回调
        this.websocket.onmessage = (event) => {
          // 根据服务器推送的消息做自己的业务处理
          console.log('收到消息：' + event.data)
          this.websocketMessage += '收到消息：' + event.data + '\n'
        }
        // 连接关闭的回调
        this.websocket.onclose = () => {
          console.log('WebSocket连接关闭')
          this.websocketMessage += 'WebSocket连接关闭' + '\n'
        }
        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = () => {
          this.websocket.close()
        }
      }
    }
  }
}
</script>
