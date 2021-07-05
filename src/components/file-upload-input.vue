<template>
  <el-input v-model="text" :placeholder="placeholder" class="w-percent-100">
    <el-upload
        slot="append"
        :before-upload="beforeFileUpload"
        :on-success="uploadSuccessHandle"
        :limit="limit"
        :accept="selfAcceptFileFormat"
        :drag="drag"
        :file-list="uploadFileList"
        :data="{ paramCode : ossParamCode }"
        :multiple="false"
        :on-exceed="uploadExceedHandle"
        :on-remove="uploadRemoveHandle"
        :show-file-list="false"
        :action="uploadUrl">
      <el-button icon="el-icon-upload"/>
    </el-upload>
  </el-input>
</template>

<script>
/**
 * 文件上传组件
 * 更多接口见 {https://element.eleme.cn/#/zh-CN/component/upload}
 *
 * @author Charles zhangchaoxu@gmail.com
 */
import Cookies from 'js-cookie'
import { isURL } from '@/utils/validate'

export default {
  name: 'file-upload-input',
  props: {
    // 绑定的v-model,必须用value
    // 参考https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model
    // 绑定的v-model,必须用value
    value: String,
    content: String,
    // 拖拽支持
    drag: {
      type: Boolean,
      default: false
    },
    // 模式,支持image、file、excel、custom
    mode: {
      type: String,
      default: 'file'
    },
    // oss 参数
    ossParamCode: {
      type: String,
      default: ''
    },
    // oss 参数
    placeholder: {
      type: String,
      default: '请输入文件地址或上传文件'
    },
    // 接收的文件格式
    acceptFileFormat: {
      type: String,
      default: ''
    },
    // 接受的文件类型
    acceptFileType: {
      type: Array,
      default: function () {
        return ['image/jpeg', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/msword', 'text/html', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      }
    },
    // 限制个数
    limit: {
      type: Number,
      default: 1
    },
    // 限制大小M
    sizeLimit: {
      type: Number,
      default: 10
    },
    // 上传地址
    uploadUrl: {
      type: String,
      default: `${process.env.VUE_APP_API_URL}/sys/oss/upload?token=${Cookies.get('token')}`
    }
  },
  data () {
    return {
      uploadFileList: [],
      // 已上传文件个数
      uploadFileLength: 0,
      text: '',
      selfAcceptFileFormat: ''
    }
  },
  watch: {
    // 监听prop传的value
    value (newVal, oldVal) {
      this.text = newVal
    },
    content (newVal, oldVal) {
      this.text = newVal
    },
    text () {
      this.$emit('input', this.text)
    }
  },
  methods: {
    getUploadFileListFromString (files) {
      let fileList = []
      if (files) {
        files.split(',').forEach(item => {
          let split = item.split('/')
          fileList.push({ url: item, name: split[split.length - 1] })
        })
      }
      return fileList
    },
    // 获得上传文件路径拼接
    getUploadFileString (fileList) {
      if (!fileList) {
        fileList = this.uploadFileList
      }
      let files = []
      fileList.forEach(item => {
        if (item.status === 'success') {
          if (isURL(item.url)) {
            // 原先已上传文件
            files.push(item.url)
          } else if (item.response && item.response.code === 0 && item.response.data) {
            // 未上传文件
            files.push(item.response.data.src)
          }
        }
      })
      return files.join(',')
    },
    // 文件超出数量限制
    uploadExceedHandle (files, fileList) {
      this.$message.warning(`共选择了 ${files.length + fileList.length} 个文件,超出数量限制`)
    },
    // 文件上传成功
    uploadSuccessHandle (res, file, fileList) {
      if (res.code !== 0) {
        return this.$message.error(res.toast)
      } else {
        this.text = this.getUploadFileString(fileList)
        this.uploadFileLength = fileList.length
        this.$emit('input', this.text)
      }
    },
    // 文件上传失败
    uploadErrorHandle (err, file, fileList) {
      console.log(err)
      console.log(file)
      this.text = this.getUploadFileString(fileList)
      this.uploadFileLength = fileList.length
      this.$emit('input', this.text)
    },
    // 文件发生变化
    uploadChangeHandle (file, fileList) {
    },
    // 文件移除成功
    uploadRemoveHandle (file, fileList) {
      this.text = this.getUploadFileString(fileList)
      this.uploadFileLength = fileList.length
      this.$emit('input', this.text)
    },
    // 文件上传检查
    beforeFileUpload (file) {
      // 是否允许格式
      const isAllowType = true // (file.type === 'image/jpeg' || file.type === 'image/jpeg' || file.type === 'image/png')
      // 是否大小范围内
      const isLtLimit = file.size / 1024 / 1024 < this.sizeLimit
      if (!isAllowType) {
        this.$message.error('只支持' + this.acceptFileFormat + '格式文件!')
        return false
      }
      if (!isLtLimit) {
        this.$message.error('上传文件大小不能超过 ' + this.sizeLimit + 'MB')
        return false
      }
      return true
    }
  }
}
</script>
