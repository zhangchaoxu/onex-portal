<template>
  <el-card shadow="never" class="aui-card--fill">
    <el-row :gutter="10">
      <!-- 左侧为消息模板区 -->
      <el-col :span="6">
        <div class="mod-msg__mail-tpl">
          <el-table v-loading="tplDataListLoading" :data="tplDataList" highlight-current-row @current-change="handleCurrentTplChange" style="width: 100%;">
            <el-table-column prop="id" label="模板" header-align="center" align="center" min-width="120">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.code" placement="left">
                  <span>{{ scope.row.name }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column :label="$t('handle')" fixed="right"  header-align="center" align="center" width="80">
              <template slot="header" slot-scope="scope">
                <i class="el-icon-circle-plus-outline" @click="tplAddOrUpdateHandle()" v-if="$hasPermission('msg:mailTpl:edit')"></i>
              </template>
              <template slot-scope="scope">
                <el-dropdown trigger="hover" @command="handleTplCommand">
                  <span class="el-dropdown-link">操作<i class="el-icon-arrow-down el-icon--right"/></span>
                   <el-dropdown-menu slot="dropdown">
                     <el-dropdown-item icon="el-icon-s-promotion" :command="{ command: 'send', id: scope.row.id, code: scope.row.code, channel: scope.row.channel }"
                                       v-if="$hasPermission('msg:mailLog:send')">发送
                     </el-dropdown-item>
                     <el-dropdown-item icon="el-icon-view" :command="{ command: 'info', id: scope.row.id }" v-if="$hasPermission('msg:mailTpl:query')">详情</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-edit" :command="{ command: 'update', id: scope.row.id }"  v-if="$hasPermission('msg:mailTpl:edit')">修改</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-delete" :command="{ command: 'delete', id: scope.row.id }"  v-if="$hasPermission('msg:mailTpl:delete')">删除</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <!-- 弹窗, 新增 / 修改 -->
          <tpl-add-or-update v-if="tplAddOrUpdateVisible" ref="tplAddOrUpdate" @refreshDataList="getTplDataList"/>
          <!-- 弹窗, 发送邮件 -->
          <send v-if="sendVisible" ref="send" @refreshDataList="getDataList"/>
        </div>
      </el-col>
      <!-- 右侧为消息记录区 -->
      <el-col :span="18">
        <div class="mod-msg__mail-log">
          <el-form :inline="true" :model="searchDataForm" size="small" @submit.native.prevent>
            <el-form-item class="small-item">
              <el-input v-model="searchDataForm.tplCode" placeholder="模板编码"/>
            </el-form-item>
            <el-form-item class="small-item">
              <el-input v-model="searchDataForm.mailTo" placeholder="收件人"/>
            </el-form-item>
            <el-form-item class="tiny-item">
              <el-select v-model="searchDataForm.state" :placeholder="$t('base.state')" clearable>
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
              @cell-click="cellClickHandle"
              @selection-change="dataListSelectionChangeHandle"
              @sort-change="dataListSortChangeHandle"
              style="width: 100%;">
            <el-table-column prop="tplCode" label="模板编码" header-align="center" align="center" min-width="120"/>
            <el-table-column prop="mailFrom" label="发件人" header-align="center" align="center"/>
            <el-table-column prop="mailTo" label="收件人" header-align="center" align="center"/>
            <el-table-column prop="mailCc" label="抄送" header-align="center" align="center"/>
            <el-table-column prop="subject" label="标题" header-align="center" align="center"/>
            <el-table-column prop="content" :label="$t('base.content')" header-align="center" align="center" class-name="nowrap html link" :formatter="htmlFmt"/>
            <el-table-column prop="state" label="状态" header-align="center" align="center" width="80">
              <template slot-scope="scope">
                <el-popover
                    placement="top"
                    width="260"
                    :disabled="!scope.row.result"
                    :content="scope.row.result">
                  <div slot="reference">
                    <el-tag v-if="scope.row.state === 1" size="small">{{ $t('success') }}</el-tag>
                    <el-tag v-else size="small" type="danger">{{ $t('error') }}</el-tag>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="$t('base.createTime')" header-align="center" align="center" width="160"/>
            <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="100" v-if="$hasPermission('msg:mailLog:delete')">
              <template slot-scope="scope">
                <el-popconfirm
                    v-if="$hasPermission('msg:mailLog:delete')"
                    @confirm="deleteOneHandle(scope.row.id)"
                    :title="$t('deleteConfirm')">
                  <el-button  type="text" size="small" slot="reference">{{ $t('delete') }}</el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              :current-page="searchForm.pageNo"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="searchForm.pageSize"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="pageSizeChangeHandle"
              @current-change="pageCurrentChangeHandle"/>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import mixinBaseModule from '@/mixins/base-module'
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
        deleteIsBatch: false
      },
      searchDataForm: {
        tplCode: null,
        mailTo: '',
        state: null
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
      this.$http.post(`/msg/mailTpl/list`, {}).then(({ data: res }) => {
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
      if (val) {
        // 搜索右边数据
        this.searchDataForm.tplCode = val.code
        this.queryDataList()
      }
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
    // 处理模板操作
    handleTplCommand (command) {
      if (command.command === 'update') {
        this.tplAddOrUpdateHandle(command.id)
      } else if (command.command === 'delete') {
        this.tplDeleteHandle(command.id)
      } else if (command.command === 'send') {
        this.tplSendHandle(command.code, command.channel)
      }
    },
    // 发送邮件
    tplSendHandle (code, channel) {
      this.sendVisible = true
      this.$nextTick(() => {
        this.$refs.send.dataForm.tplCode = code
        this.$refs.send.dataForm.tplChannel = channel
        this.$refs.send.init()
      })
    },
    // 模板删除
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
