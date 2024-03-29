<template>
  <el-drawer :visible.sync="visible" title="站点详情" size="50%" :wrapperClosable="false" :close-on-press-escape="false" custom-class="drawer" ref="drawer">
    <div class="drawer__content">
      <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px" :disabled="!$hasPermission('cms:site:update')">
        <el-form-item label="编码" prop="code">
          <el-input v-model="dataForm.code" placeholder="编码" :disabled="dataFormMode === 'view'"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="dataForm.title" placeholder="标题"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dataForm.descr" placeholder="描述"></el-input>
        </el-form-item>
        <el-form-item label="网址" prop="domain">
          <el-input v-model="dataForm.domain" placeholder="网址"></el-input>
        </el-form-item>
        <el-form-item label="LOGO" prop="logo">
          <el-input v-model="dataForm.logo" placeholder="LOGO">
            <el-upload
                slot="append"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :limit="3"
                :on-exceed="handleExceed"
                :file-list="fileList">
              <el-button icon="el-icon-upload"/>
            </el-upload>
          </el-input>
        </el-form-item>
        <el-form-item label="版权信息" prop="copyright">
          <el-input v-model="dataForm.copyright" placeholder="版权信息"></el-input>
        </el-form-item>
        <el-form-item label="关键词" prop="keywords">
          <multi-tags-input ref="multiTagsInput" v-model="dataForm.keywords"/>
        </el-form-item>
        <el-form-item label="图片" prop="imgs">
          <el-input v-model="dataForm.imgs" placeholder="图片"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="dataForm.state" placeholder="选择状态" class="w-percent-100">
            <el-option
                v-for="item in stateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="drawer__footer">
        <el-button @click="$refs.drawer.closeDrawer()">{{ $t('close') }}</el-button>
        <el-button type="primary" @click="dataFormSubmitHandle()" v-if="$hasPermission('cms:site:update')">{{ $t('confirm') }}</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import mixinFormModule from '@/mixins/form-module'
import MultiTagsInput from '@/components/multi-tags-input'

export default {
  mixins: [mixinFormModule],
  components: { MultiTagsInput },
  data () {
    return {
      // 表单模块参数
      mixinFormModuleOptions: {
        dataFormSaveURL: `/cms/site/save`,
        dataFormUpdateURL: `/cms/site/update`,
        dataFormInfoURL: `/cms/site/info?id=`
      },
      stateOptions: [{
        value: 0,
        label: '下线'
      }, {
        value: 1,
        label: '上线'
      }],
      dataForm: {
        code: '',
        name: '',
        title: '',
        descr: '',
        domain: '',
        logo: '',
        copyright: '',
        keywords: '',
        imgs: '',
        state: 1
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
        title: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        state: [
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
