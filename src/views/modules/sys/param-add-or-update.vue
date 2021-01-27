<template>
  <el-dialog :visible.sync="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm"  label-width="120px">
      <el-form-item prop="code" :label="$t('base.code')">
        <el-input v-model="dataForm.code" :placeholder="$t('base.code')"/>
      </el-form-item>
      <el-form-item prop="content" label="开放内容">
        <el-input v-model="dataForm.content" :placeholder="$t('base.content')">
          <el-link type="primary" href="https://www.bejson.com/jsoneditoronline/" target="_blank" :underline="false" slot="append">在线json编辑</el-link>
        </el-input>
      </el-form-item>
      <el-form-item prop="contentPri" label="私有内容">
        <template slot="label">
          私有内容
          <el-popover
              placement="top-end"
              trigger="click">
            <div>
              开放内容: 数据开放访问,请勿存放密钥等信息<br/>
              私有内容: 数据不开放访问,若与开放内容重复,会覆盖开放内容
            </div>
            <i class="el-icon-info" slot="reference"/>
          </el-popover>
        </template>
        <el-input v-model="dataForm.contentPri" :placeholder="$t('base.content')">
          <el-link type="primary" href="https://www.bejson.com/jsoneditoronline/" target="_blank" :underline="false" slot="append">在线json编辑</el-link>
        </el-input>
      </el-form-item>
      <el-form-item prop="remark" :label="$t('base.remark')">
        <el-input v-model="dataForm.remark" :placeholder="$t('base.remark')"/>
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
      // 表单模块参数
      mixinFormModuleOptions: {
        dataFormSaveURL: `/sys/param/save`,
        dataFormUpdateURL: `/sys/param/update`,
        dataFormInfoURL: `/sys/param/info?id=`
      },
      dataForm: {
        id: '',
        code: '',
        content: '',
        remark: ''
      }
    }
  },
  computed: {
    dataRule () {
      return {
        code: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
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
