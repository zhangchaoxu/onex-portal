<template>
    <el-dialog :visible.sync="visible" title="修改状态" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px">
            <el-form-item prop="state" :label="$t('user.status')" size="mini">
                <el-radio-group v-model="dataForm.state">
                    <el-radio :label="0">{{ $t('user.status0') }}</el-radio>
                    <el-radio :label="1">{{ $t('user.status1') }}</el-radio>
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
      mixinFormModuleOptions: {
        dataFormUpdateURL: `/uc/user/changeStatus/`,
        dataFormInfoURL: `/uc/user/info?id=`
      },
      dataForm: {
        id: '',
        state: ''
      }
    }
  },
  computed: {
    dataRule () {
      return {
        state: [
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
