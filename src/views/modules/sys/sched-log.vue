<template>
  <el-dialog :visible.sync="visible" :title="$t('schedule.log')" :close-on-click-modal="false" :close-on-press-escape="false" width="75%">
    <el-form :inline="true" :model="searchDataForm" size="small" @submit.native.prevent>
      <el-form-item>
        <el-input v-model="searchDataForm.taskId" :placeholder="$t('schedule.jobId')" clearable/>
      </el-form-item>
      <el-form-item>
        <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="dataListLoading"
      :data="dataList"
      border
      @sort-change="dataListSortChangeHandle"
      height="460"
      style="width: 100%;">
      <el-table-column prop="taskId" :label="$t('schedule.jobId')" header-align="center" align="center" width="160"/>
      <el-table-column prop="taskName" :label="$t('schedule.beanName')" header-align="center" align="center"/>
      <el-table-column prop="params" :label="$t('schedule.params')" header-align="center" align="center"/>
      <el-table-column prop="state" :label="$t('schedule.status')" header-align="center" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.state === 1" size="small">{{ $t('schedule.statusLog1') }}</el-tag>
          <el-tag v-else type="danger" size="small" @click.native="showErrorInfo(scope.row.id)" style="cursor: pointer;">{{ $t('schedule.statusLog0') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="times" :label="$t('schedule.times')" header-align="center" align="center"></el-table-column>
      <el-table-column prop="createTime" :label="$t('schedule.createDate')" header-align="center" align="center" width="160"/>
    </el-table>
    <el-pagination
      :current-page="searchForm.pageNo"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="searchForm.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="pageSizeChangeHandle"
      @current-change="pageCurrentChangeHandle"/>
  </el-dialog>
</template>

<script>
import mixinListModule from '@/mixins/list-module'
export default {
  mixins: [mixinListModule],
  data () {
    return {
      visible: false,
      mixinListModuleOptions: {
        getDataListURL: '/sys/schedLog/page',
        getDataListIsPage: true
      },
      searchDataForm: {
        taskId: ''
      }
    }
  },
  methods: {
    init () {
      this.visible = true
      this.getDataList()
    },
    // 失败信息
    showErrorInfo (id) {
      this.$http.get(`/sys/schedLog/${id}`).then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        }
        this.$alert(res.data.error)
      }).catch(() => {})
    }
  }
}
</script>
