<template>
  <el-drawer :visible.sync="visible" title="角色详情" size="50%" :wrapperClosable="false" :close-on-press-escape="false" custom-class="drawer" ref="drawer">
    <div class="drawer__content">
      <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px" :disabled="!$hasPermission('uc:role:update')">
        <el-form-item prop="name" :label="$t('base.name')">
          <el-input v-model="dataForm.name" :placeholder="$t('base.name')"/>
        </el-form-item>
        <el-form-item prop="remark" :label="$t('base.remark')">
          <el-input v-model="dataForm.remark" type="textarea" :placeholder="$t('base.remark')"/>
        </el-form-item>
        <el-form-item size="mini" :label="$t('role.menuList')">
          <el-tree
              :data="menuList"
              :props="{ label: 'name', children: 'children' }"
              node-key="id"
              ref="menuListTree"
              accordion
              check-strictly
              show-checkbox>
          </el-tree>
        </el-form-item>
      </el-form>
      <div class="drawer__footer">
        <el-button @click="$refs.drawer.closeDrawer()">{{ $t('close') }}</el-button>
        <el-button type="primary" @click="dataFormSubmitHandle()" v-if="$hasPermission('uc:role:update')">{{ $t('confirm') }}</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import mixinFormModule from '@/mixins/form-module'
export default {
  mixins: [mixinFormModule],
  data () {
    return {
      // 表单模块参数
      mixinFormModuleOptions: {
        dataFormSaveURL: `/uc/role/save`,
        dataFormUpdateURL: `/uc/role/update`,
        dataFormInfoURL: `/uc/role/info?id=`
      },
      menuList: [],
      dataForm: {
        id: '',
        name: '',
        menuIdList: [],
        remark: ''
      }
    }
  },
  computed: {
    dataRule () {
      return {
        name: [
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
        this.$refs['dataForm'].resetFields()
        this.$refs.menuListTree.setCheckedKeys([])
        Promise.all([
          this.getMenuList()
        ]).then(() => {
          this.initFormData()
        })
      })
    },
    // 获取菜单列表
    getMenuList () {
      return this.$http.get('/uc/menu/tree').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        }
        this.menuList = res.data
      }).catch(() => {})
    },
    // 获取部门列表
    getDeptList () {
      return this.$http.get('/uc/dept/list').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        }
        this.deptList = res.data
      }).catch(() => {})
    },
    // form信息获取成功
    onGetInfoSuccess (res) {
      this.dataForm = {
        ...this.dataForm,
        ...res.data
      }
      this.dataForm.menuIdList.forEach(item => this.$refs.menuListTree.setChecked(item, true))
    },
    // 表单提交之前的数据处理
    beforeDateFormSubmit () {
      this.dataForm.menuIdList = [
        ...this.$refs.menuListTree.getHalfCheckedKeys(),
        ...this.$refs.menuListTree.getCheckedKeys()
      ]
      this.dataFormSubmitParam = this.dataForm
      return true
    }
  }
}
</script>
