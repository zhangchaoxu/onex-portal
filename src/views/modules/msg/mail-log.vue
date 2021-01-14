<template>
  <el-card shadow="never" class="aui-card--fill">
    <el-row :gutter="10">
      <el-col :span="6">
        <div class="mod-msg__mail-tpl">
          <el-form :inline="true" :model="searchDataForm" size="small">
            <el-form-item v-if="$hasPermission('msg:mailTpl:save')">
              <el-button type="primary" @click="tplAddOrUpdateHandle()">{{ $t('add') }}模板</el-button>
            </el-form-item>
          </el-form>
          <el-table v-loading="tplDataListLoading" :data="tplDataList" highlight-current-row @current-change="handleCurrentTplChange" style="width: 100%;">
            <el-table-column prop="id" :label="$t('base.code')" header-align="center" align="center" min-width="120"/>
            <el-table-column prop="name" :label="$t('base.name')" header-align="center" align="center" width="150" show-tooltip-when-overflow/>
            <el-table-column :label="$t('handle')" fixed="right"  header-align="center" align="center" width="80">
              <template slot-scope="scope">
                <el-dropdown trigger="hover" @command="handleTplCommand">
                  <span class="el-dropdown-link">操作<i class="el-icon-arrow-down el-icon--right"/></span>
                   <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item icon="el-icon-view" :command="{ command: 'info', id: scope.row.id }" v-if="$hasPermission('msg:mailTpl:info')">详情</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-edit" :command="{ command: 'update', id: scope.row.id }"  v-if="$hasPermission('msg:mailTpl:update')">修改</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-delete" :command="{ command: 'delete', id: scope.row.id }"  v-if="$hasPermission('msg:mailTpl:delete')">删除</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <!-- 弹窗, 新增 / 修改 -->
          <tpl-add-or-update v-if="tplAddOrUpdateVisible" ref="tplAddOrUpdate" @refreshDataList="getTplDataList"/>
          <!-- 弹窗, 发送邮件 -->
          <send v-if="sendVisible" ref="send"/>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="mod-msg__mail-log">
          <el-form :inline="true" :model="searchDataForm" size="small">
            <el-form-item class="small-item">
              <el-input v-model="searchDataForm.tplId" placeholder="模板编码" clearable/>
            </el-form-item>
            <el-form-item class="small-item">
              <el-input v-model="searchDataForm.mailTo" placeholder="收件人" clearable/>
            </el-form-item>
            <el-form-item class="small-item">
              <el-select v-model="searchDataForm.status" :placeholder="$t('base.status')" clearable>
                <el-option :label="$t('success')" :value="1"/>
                <el-option :label="$t('error')" :value="0"/>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
            </el-form-item>
            <el-form-item v-if="$hasPermission('msg:mailLog:delete')">
              <el-button type="danger" @click="deleteHandle()">{{ $t('deleteBatch') }}</el-button>
            </el-form-item>
          </el-form>
          <el-table
              v-loading="dataListLoading"
              :data="dataList"
              border
              @selection-change="dataListSelectionChangeHandle"
              @sort-change="dataListSortChangeHandle"
              style="width: 100%;">
            <el-table-column prop="tplCode" label="模板编码" header-align="center" align="center" min-width="120"/>
            <el-table-column prop="mailFrom" label="发件人" header-align="center" align="center"/>
            <el-table-column prop="mailTo" label="收件人" header-align="center" align="center"/>
            <el-table-column prop="mailCc" label="抄送" header-align="center" align="center"/>
            <el-table-column prop="subject" label="标题" header-align="center" align="center"/>
            <el-table-column prop="content" :label="$t('base.content')" header-align="center" align="center" class-name="nowrap">
              <template slot-scope="scope">
                <el-link type="primary" @click="htmlViewHandle(scope.row.content)" :underline="false">{{ scope.row.content }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" header-align="center" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.status === 1" size="small">{{ $t('success') }}</el-tag>
                <el-tag v-else size="small" type="danger">{{ $t('error') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="$t('base.createTime')" header-align="center" align="center" width="180"/>
            <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
              <template slot-scope="scope">
                <el-button v-if="$hasPermission('msg:mailLog:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              :current-page="page"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="limit"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="pageSizeChangeHandle"
              @current-change="pageCurrentChangeHandle"/>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>import mixinBaseModule from '@/mixins/base-module'
import mixinListModule from '@/mixins/list-module'
import TplAddOrUpdate from './mail-tpl-add-or-update'
import Send from './mail-send'

export default {
  mixins: [mixinBaseModule, mixinListModule],
  components: { TplAddOrUpdate, Send },
  data () {
    return {
      // 模板数据
      tplDataListLoading: false,
      tplDataList: [],
      sendVisible: false,
      // 当前选中模板
      currentTpl: null,
      // 模板修改或者新增
      tplAddOrUpdateVisible: false,
      // 记录数据
      mixinListModuleOptions: {
        getDataListURL: '/msg/mailLog/page',
        getDataListIsPage: true,
        deleteURL: '/msg/mailLog/delete',
        deleteBatchURL: '/msg/mailLog/deleteBatch',
        deleteIsBatch: true
      },
      searchDataForm: {
        tplId: '',
        mailTo: '',
        status: null
      }
    }
  },
  activated () {
    if (this.mixinListModuleOptions.activatedIsNeed && !this.lazyLoad) {
      this.getDataList()
    }
    this.getTplDataList()
  },
  methods: {
    /**
     * 获取模板列表
     */
    getTplDataList () {
      this.tplDataListLoading = true
      this.$http.get(`/msg/mailTpl/list`, { params: {} }).then(({ data: res }) => {
        if (res.code !== 0) {
          this.tplDataList = []
          return this.$message.error(res.toast)
        } else {
          this.tplDataList = res.data
        }
      }).finally(() => {
        this.tplDataListLoading = false
      })
    },
    /**
     * 切换当前选中模板
     */
    handleCurrentTplChange (val) {
      this.currentTpl = val
      // 搜索右边数据
      this.searchDataForm.tplId = val.id
      this.queryDataList()
    },
    /**
     * 新增修改模板
     */
    tplAddOrUpdateHandle (id) {
      this.tplAddOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.tplAddOrUpdate.clear()
        this.$refs.tplAddOrUpdate.dataForm.id = id
        this.$refs.tplAddOrUpdate.dataFormMode = !id ? 'save' : 'update'
        this.$refs.tplAddOrUpdate.init()
      })
    },
    // 发送邮件
    sendHandle (tplType, tplCode) {
      this.sendVisible = true
      this.$nextTick(() => {
        this.$refs.send.dataForm.tplType = tplType
        this.$refs.send.dataForm.tplCode = tplCode
        this.$refs.send.init()
      })
    },
    // 处理模板操作
    handleTplCommand (command) {
      // {command: "info", id: "1273468852126146561"}
      if (command.command === 'update') {
        this.tplAddOrUpdateHandle(command.id)
      } else if (command.command === 'delete') {
        this.tplDeleteHandle(command.id)
      }
    },
    tplDeleteHandle (id) {
      // 对话框提示是否删除
      this.$confirm(`确定删除该模板`, this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/msg/mailTpl/delete?id=` + id).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.toast)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getTplDataList()
            }
          })
        })
      })
    }
  }
}
</script>

<style>
.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
