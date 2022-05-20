<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__sched">
      <el-form :inline="true" :model="searchForm" size="small" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="searchForm.search" :placeholder="$t('base.keyword')" clearable/>
        </el-form-item>
        <el-form-item class="small-item">
          <el-select v-model="searchForm.state" :placeholder="$t('base.state')" clearable>
            <el-option :label="$t('disable')" :value="0"/>
            <el-option :label="$t('enable')" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-if="$hasPermission('sys:sched:edit')" type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-if="$hasPermission('sys:schedLog.query')" type="success" @click="logHandle()">执行日志</el-button>
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
        <el-table-column type="selection" header-align="center" align="center" width="50"/>
        <el-table-column prop="name" :label="$t('base.name')" header-align="center" align="center" min-width="120"/>
        <el-table-column prop="params" :label="$t('base.params')" header-align="center" align="center" width="200" class-name="nowrap json link" show-tooltip-when-overflow/>
        <el-table-column prop="cron" label="cron" header-align="center" align="center" width="120"/>
        <el-table-column prop="remark" :label="$t('base.remark')" header-align="center" align="center" show-tooltip-when-overflow></el-table-column>
        <el-table-column prop="state" :label="$t('base.state')" header-align="center" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.state === 1" size="small">{{$t('enable')}}</el-tag>
            <el-tag v-else size="small" type="danger">{{$t('disable')}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-dropdown trigger="click" @command="editActionHandle" class="action-dropdown">
              <span class="el-dropdown-link">{{ $t('handle') }}<i class="el-icon-arrow-down el-icon--right"/></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="$hasPermission('sys:schedLog.query')" :command="composeEditCommandValue('log', scope.row)" icon="el-icon-tickets">{{ $t('schedule.log') }}</el-dropdown-item>
                <el-dropdown-item v-if="$hasPermission('sched:task:edit')" :command="composeEditCommandValue('addOrUpdate', scope.row)" icon="el-icon-edit">{{ $t('update') }}</el-dropdown-item>
                <el-dropdown-item v-if="$hasPermission('sched:task:delete')" :command="composeEditCommandValue('delete', scope.row)" icon="el-icon-delete">{{ $t('delete') }}</el-dropdown-item>
                <el-dropdown-item v-if="$hasPermission('sched:task:edit')" :command="composeEditCommandValue('run', scope.row)" icon="el-icon-video-play">{{ $t('run') }}</el-dropdown-item>
                <el-dropdown-item v-if="$hasPermission('sched:task:edit') && scope.row.state === 1" :command="composeEditCommandValue('pause', scope.row)" icon="el-icon-video-pause">{{ $t('pause') }}</el-dropdown-item>
                <el-dropdown-item v-if="$hasPermission('sched:task:edit') && scope.row.state === 0" :command="composeEditCommandValue('resume', scope.row)" icon="el-icon-refresh-right">{{ $t('resume') }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
      <!-- 弹窗, 新增 / 修改 -->
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
      <!-- 弹窗, 日志列表 -->
      <log v-if="logVisible" ref="log"></log>
    </div>
  </el-card>
</template>

<script>
import mixinBaseModule from '@/mixins/base-module'
import mixinListModule from '@/mixins/list-module'
import AddOrUpdate from './sched-add-or-update'
import Log from './sched-log'

export default {
  mixins: [mixinBaseModule, mixinListModule],
  components: { AddOrUpdate, Log },
  data () {
    return {
      mixinListModuleOptions: {
        getDataListURL: '/sys/sched/page',
        getDataListIsPage: true,
        deleteURL: '/sys/sched/delete',
        deleteBatchURL: '/sys/sched/deleteBatch',
        deleteIsBatch: true
      },
      searchForm: {
        name: ''
      },
      logVisible: false
    }
  },
  methods: {
    /** 其它更多按钮操作 */
    moreEditActionHandle (command) {
      if (command.command === 'pause') {
        // 暂停
        this.pauseHandle(command.row[this.mixinListModuleOptions.idKey])
      } else if (command.command === 'run') {
        // 运行
        this.runHandle(command.row[this.mixinListModuleOptions.idKey])
      } else if (command.command === 'resume') {
        // 恢复
        this.resumeHandle(command.row[this.mixinListModuleOptions.idKey])
      } else if (command.command === 'log') {
        // 日志
        this.logHandle(command.row[this.mixinListModuleOptions.idKey])
      }
    },
    // 暂停
    pauseHandle (id) {
      if (!id && this.dataListSelections.length <= 0) {
        return this.$message({
          message: this.$t('prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm(this.$t('prompt.info', { 'handle': this.$t('schedule.pause') }), this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        this.$http.put('/sys/sched/pause', id ? [id] : this.dataListSelections.map(item => item.id)).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.toast)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    },
    // 恢复
    resumeHandle (id) {
      if (!id && this.dataListSelections.length <= 0) {
        return this.$message({
          message: this.$t('prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm(this.$t('prompt.info', { 'handle': this.$t('schedule.resume') }), this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        this.$http.put('/sys/sched/resume', id ? [id] : this.dataListSelections.map(item => item.id)).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.toast)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    },
    // 执行
    runHandle (id) {
      if (!id && this.dataListSelections.length <= 0) {
        return this.$message({
          message: this.$t('prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm(this.$t('prompt.info', { 'handle': this.$t('schedule.run') }), this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        this.$http.put('/sys/sched/run', id ? [id] : this.dataListSelections.map(item => item.id)).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.toast)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    },
    // 日志列表
    logHandle () {
      this.logVisible = true
      this.$nextTick(() => {
        this.$refs.log.init()
      })
    }
  }
}
</script>
