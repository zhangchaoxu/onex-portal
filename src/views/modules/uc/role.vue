<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-uc__role">
      <el-form :inline="true" :model="searchForm" size="small" @submit.native.prevent>
        <el-form-item class="small-item">
          <el-input v-model="searchForm.tenantCode" :placeholder="$t('base.tenant')" clearable/>
        </el-form-item>
        <el-form-item class="small-item">
          <el-input v-model="searchForm.search" :placeholder="$t('base.keyword')" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-if="$hasPermission('uc:role:edit')" type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="dataListLoading"
        :data="dataList"
        border
        @selection-change="dataListSelectionChangeHandle"
        @sort-change="dataListSortChangeHandle"
        style="width: 100%;">
        <el-table-column prop="tenantCode" label="租户" header-align="center" align="center" width="100"/>
        <el-table-column prop="name" :label="$t('base.name')" header-align="center" align="center"/>
        <el-table-column prop="remark" :label="$t('base.remark')" header-align="center" align="center" show-tooltip-when-overflow/>
        <el-table-column prop="sort" label="排序" header-align="center" align="center" width="100" sortable="custom"/>
        <el-table-column prop="createTime" :label="$t('base.createTime')" sortable="custom" header-align="center" align="center" width="180"/>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-button v-if="$hasPermission('uc:role:query')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{ $t('view') }}</el-button>
            <el-button v-if="$hasPermission('uc:role:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}</el-button>
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
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"/>
    </div>
  </el-card>
</template>

<script>
import mixinBaseModule from '@/mixins/base-module'
import mixinListModule from '@/mixins/list-module'
import AddOrUpdate from './role-add-or-update'

export default {
  mixins: [mixinBaseModule, mixinListModule],
  components: { AddOrUpdate },
  data () {
    return {
      mixinListModuleOptions: {
        getDataListURL: '/uc/role/page',
        getDataListIsPage: true,
        deleteURL: '/uc/role/delete',
        deleteBatchURL: '/uc/role/deleteBatch',
        deleteIsBatch: false
      },
      searchForm: {
        tenantCode: null,
        search: null
      }
    }
  }
}
</script>
