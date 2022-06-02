<template>
  <el-drawer :visible.sync="visible" :title="!dataForm.id ? $t('add') : $t('update')" size="50%" :wrapperClosable="false" :close-on-press-escape="false" custom-class="drawer" ref="drawer">
    <div class="drawer__content">
    <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="编码" prop="code">
            <el-input v-model="dataForm.code" placeholder="编码" :disabled="dataFormMode !== 'save'"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="名称" prop="name">
            <el-input v-model="dataForm.name" placeholder="名称"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="state">
            <el-radio-group v-model="dataForm.state" size="small">
              <el-radio-button :label="1">有效</el-radio-button>
              <el-radio-button :label="0">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number controls-position="right" :min="0" v-model="dataForm.sort" class="w-percent-100"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注" type="textarea" maxlength="100"/>
      </el-form-item>
    </el-form>
    <div class="drawer__footer">
      <el-button @click="$refs.drawer.closeDrawer()">{{ $t('close') }}</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle()" v-if="$hasPermission('uc:tenant:edit')">{{ $t('confirm') }}</el-button>
    </div>
    </div>
  </el-drawer>
</template>

<script>
import mixinFormModule from '@/mixins/form-module'
import mixinBaseModule from '@/mixins/base-module'

export default {
  mixins: [mixinFormModule, mixinBaseModule],
  data () {
    return {
      // 表单模块参数
      mixinFormModuleOptions: {
        dataFormSaveURL: `/uc/tenant/save`,
        dataFormUpdateURL: `/uc/tenant/update`,
        dataFormInfoURL: `/uc/tenant/info`
      },
      dateRange: null,
      dataForm: {
        id: '',
        name: '',
        code: '',
        state: 1,
        sort: 0
      }
    }
  },
  computed: {
    dataRule () {
      return {
        code: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        state: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        sort: [
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
