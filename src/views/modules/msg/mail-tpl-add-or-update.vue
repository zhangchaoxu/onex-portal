<template>
    <el-dialog :visible.sync="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px">
            <el-row>
              <el-col :span="12">
                <el-form-item prop="channel" :label="$t('base.channel')">
                  <el-select v-model="dataForm.channel" placeholder="请选择渠道" class="w-percent-100">
                    <el-option label="短信" value="sms"/>
                    <el-option label="电子邮件" value="email"/>
                    <el-option label="微信公众号模板消息" value="wx_mp_template"/>
                    <el-option label="微信小程序订阅消息" value="wx_ma_subscribe"/>
                    <el-option label="APP推送" value="app_push"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="type" :label="$t('base.type')">
                  <el-select v-model="dataForm.type" placeholder="请选择类型" class="w-percent-100">
                    <el-option label="验证码" :value="1"/>
                    <el-option label="状态通知" :value="2"/>
                  </el-select>
                </el-form-item>
              </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('base.code')" prop="code">
                        <el-input v-model="dataForm.code" :placeholder="$t('base.code')"/>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item prop="name" :label="$t('base.name')">
                        <el-input v-model="dataForm.name" :placeholder="$t('base.name')"/>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="配置" prop="param">
                <template slot="label">
                  配置
                  <el-popover
                      placement="top-end"
                      trigger="click">
                    <div>
                      短信配置参考:<br/>{"appKey":"LTA123456","appSecret":"abcd","appId":"","sign":"大鱼测试","tplId":"SMS_123456", "regionId":"cn-hangzhou"}<br/>
                      电邮配置参考:<br/>{"appKey":"LTA123456","appSecret":"abcd","appId":"","sign":"大鱼测试","tplId":"SMS_123456", "regionId":"cn-hangzhou"}
                    </div>
                    <i class="el-icon-info" slot="reference"/>
                  </el-popover>
                </template>
                <el-input v-model="dataForm.param" placeholder="平台配置" type="textarea"/>
            </el-form-item>
            <div v-if="dataForm.channel === 'sms'">
                <el-form-item label="内容" prop="content">
                    <el-input v-model="dataForm.content" placeholder="内容仅作记录,实际内容请在短信平台修改" type="textarea"/>
                </el-form-item>
            </div>
            <div v-else-if="dataForm.channel === 'email'">
                <el-form-item prop="title" label="邮件标题">
                    <el-input v-model="dataForm.title" placeholder="请输入邮件标题"/>
                </el-form-item>
                <el-form-item prop="content" label="邮件内容">
                    <quill-editor v-model="dataForm.content" ref="editorContent"/>
                </el-form-item>
            </div>
            <div v-else-if="dataForm.channel === 'wx_mp_template'">
                <el-form-item prop="title" label="标题">
                    <el-input v-model="dataForm.title" placeholder="请输入标题"/>
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <el-input v-model="dataForm.content" placeholder="内容仅作记录,实际内容由微信平台对应模板生成" type="textarea"/>
                </el-form-item>
            </div>
        </el-form>
        <template slot="footer">
            <el-button @click="visible = false">{{ $t('cancel') }}</el-button>
            <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t('confirm') }}</el-button>
        </template>
    </el-dialog>
</template>

<script>
import mixinFormModule from '@/mixins/form-module'
import QuillEditor from '@/components/quill-editor'

export default {
  mixins: [mixinFormModule],
  components: { QuillEditor },
  data () {
    return {
      // 表单模块参数
      mixinFormModuleOptions: {
        dataFormSaveURL: `/msg/mailTpl/save`,
        dataFormUpdateURL: `/msg/mailTpl/update`,
        dataFormInfoURL: `/msg/mailTpl/info?id=`
      },
      dataForm: {
        id: '',
        name: '',
        type: '',
        channel: 'sms',
        code: '',
        title: '',
        content: '',
        param: ''
      }
    }
  },
  watch: {
    'dataForm.type' () {
      this.$refs['dataForm'].clearValidate()
    }
  },
  computed: {
    dataRule () {
      return {
        channel: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        code: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        title: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        param: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init () {
      this.formLoading = true
      this.visible = true
      this.$nextTick(() => {
        this.resetForm()
        this.initFormData()
      })
    }
  }
}
</script>
