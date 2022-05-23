<template>
  <el-dialog :visible.sync="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px">
      <el-form-item prop="name" :label="$t('base.name')">
        <el-input v-model="dataForm.name" :placeholder="$t('base.name')"></el-input>
      </el-form-item>
      <el-form-item prop="cron" label="cron">
        <el-input v-model="dataForm.cron" placeholder="cron">
          <el-link type="primary" href="https://www.bejson.com/othertools/cron/" target="_blank" :underline="false" slot="append">在线cron生成</el-link>
        </el-input>
      </el-form-item>
      <el-form-item prop="params" :label="$t('base.params')">
        <el-input v-model="dataForm.params" :placeholder="$t('base.params')"></el-input>
      </el-form-item>
      <el-form-item prop="remark" :label="$t('base.remark')">
        <el-input v-model="dataForm.remark" :placeholder="$t('base.remark')" type="textarea"></el-input>
      </el-form-item>
      <el-form-item prop="logType" label="日志类型">
        <el-radio-group v-model="dataForm.logType" size="mini">
          <el-radio-button label="db">数据库</el-radio-button>
          <el-radio-button label="file">日志文件</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="state" :label="$t('base.state')">
        <el-radio-group v-model="dataForm.state" size="mini">
          <el-radio-button :label="0">暂停</el-radio-button>
          <el-radio-button :label="1">启用</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button @click="visible = false">{{ $t('cancel') }}</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t('confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import mixinFormModule from '@/mixins/form-module'

export default {
  mixins: [mixinFormModule],
  data () {
    return {
      // 表单参数
      mixinFormModuleOptions: {
        dataFormSaveURL: `/sys/sched/save`,
        dataFormUpdateURL: `/sys/sched/update`,
        dataFormInfoURL: `/sys/sched/info`
      },
      dataForm: {
        id: '',
        name: '',
        params: null,
        cron: '',
        remark: '',
        logType: 'db',
        state: 0
      }
    }
  },
  computed: {
    dataRule () {
      return {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        cron: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        state: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        logType: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init () {
      this.visible = true
      this.formLoading = true
      this.$nextTick(() => {
        this.resetForm()
        this.initFormData()
      })
    }
  }
}
</script>
