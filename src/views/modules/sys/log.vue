<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__log">
      <el-form :inline="true" :model="searchForm" size="small" @submit.native.prevent>
        <el-form-item class="small-item">
          <el-select v-model="searchForm.type" placeholder="类型" clearable>
            <el-option label="登录" value="login"/>
            <el-option label="登出" value="logout"/>
            <el-option label="操作" value="operation"/>
            <el-option label="异常" value="error"/>
            <el-option label="异步任务" value="asyncTask"/>
          </el-select>
        </el-form-item>
        <el-form-item class="small-item">
          <el-input v-model="searchForm.uri" placeholder="请求Uri" clearable/>
        </el-form-item>
        <el-form-item class="small-item">
          <el-select v-model="searchForm.state" placeholder="状态" clearable>
            <el-option :label="$t('error')" :value="0"/>
            <el-option :label="$t('success')" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item class="small-item">
          <el-input v-model="searchForm.createName" placeholder="用户" clearable/>
        </el-form-item>
        <el-form-item>
          <el-date-picker
                  v-model="searchForm.createTimeRange"
                  type="datetimerange"
                  :picker-options="dateRangePickerOptions"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  :range-separator="$t('datePicker.range')"
                  :start-placeholder="$t('datePicker.start')"
                  :end-placeholder="$t('datePicker.end')">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item v-if="$hasPermission('sys:log:export')">
          <el-button type="info" @click="exportHandle()">{{ $t('export') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="dataListLoading" :data="dataList" border @sort-change="dataListSortChangeHandle"
                @cell-click="cellClickHandle" style="width: 100%;">
        <el-table-column prop="type" label="类型" header-align="center" align="center" width="120">
          <template slot-scope="scope">
             <span v-if="scope.row.type === 'login'">登录</span>
             <span v-else-if="scope.row.type === 'logout'">登出</span>
             <span v-else-if="scope.row.type === 'operation'">操作</span>
             <span v-else-if="scope.row.type === 'error'">异常</span>
             <span v-else-if="scope.row.type === 'asyncTask'">异步任务</span>
             <span v-else>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createName" label="用户" header-align="center" align="center" width="150"/>
        <el-table-column prop="operation" label="操作" header-align="center" align="center" width="150"/>
        <el-table-column prop="uri" label="请求Uri" header-align="center" align="center" width="200"/>
        <el-table-column prop="requestTime" label="耗时" sortable="custom" header-align="center" align="center" width="120">
          <template slot-scope="scope">
            {{ `${scope.row.requestTime}ms` }}
          </template>
        </el-table-column>
        <el-table-column prop="requestParams" label="请求参数" header-align="center" align="center" class-name="nowrap json link" :formatter="jsonFmt"/>
        <el-table-column prop="content" label="内容" header-align="center" align="center" class-name="nowrap json link"/>
        <el-table-column prop="state" label="状态" sortable="custom" header-align="center" align="center" width="100">
          <template slot-scope="scope">
            <template v-if="scope.row.type !== 'asyncTask'">
              <el-tag v-if="scope.row.state === 0" size="small" type="danger">{{ $t('error') }}</el-tag>
              <el-tag v-else size="small" type="success">{{ $t('success') }}</el-tag>
            </template>
            <template v-else>
              <el-tag v-if="scope.row.state === 0" size="small" type="info">初始化</el-tag>
              <el-tag v-else-if="scope.row.state === 1" size="small" type="warning">处理中</el-tag>
              <el-tag v-else-if="scope.row.state === 100" size="small" type="success">已完成</el-tag>
              <el-tag v-else-if="scope.row.state === -1" size="small" type="success">失败</el-tag>
              <el-tag v-else size="small" type="success">{{ scope.row.state }}</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" sortable="custom" header-align="center" align="center" width="180"/>
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
  </el-card>
</template>

<script>
import mixinBaseModule from '@/mixins/base-module'
import mixinListModule from '@/mixins/list-module'

export default {
  mixins: [mixinBaseModule, mixinListModule],
  data () {
    return {
      mixinListModuleOptions: {
        getDataListURL: '/sys/log/page',
        getDataListIsPage: true,
        exportURL: '/sys/log/export',
        deleteURL: '/sys/log/delete',
        deleteBatchURL: '/sys/log/deleteBatch',
        deleteIsBatch: true
      },
      searchForm: {
        createName: '',
        state: '',
        uri: '',
        type: '',
        createTimeRange: null
      }
    }
  }
}
</script>
