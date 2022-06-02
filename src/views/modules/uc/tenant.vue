<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-uc__tenant">
      <el-form :inline="true" :model="searchForm" size="small" @submit.native.prevent>
        <el-form-item class="small-item">
          <el-input v-model="searchForm.search" placeholder="关键词搜索" clearable/>
        </el-form-item>
        <el-form-item class="small-item">
          <el-select v-model="searchForm.state" placeholder="状态" clearable>
            <el-option label="有效" :value="1"/>
            <el-option label="停用" :value="0"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item v-if="$hasPermission('uc:tenant:edit')">
          <el-button type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" @sort-change="dataListSortChangeHandle" style="width: 100%;">
        <el-table-column prop="code" label="编码" header-align="center" align="center" width="200"/>
        <el-table-column prop="name" label="名称" header-align="center" align="center"/>
        <el-table-column prop="remark" label="备注" header-align="center" align="center" show-tooltip-when-overflow/>
        <el-table-column prop="sort" label="排序" header-align="center" align="center" width="100" sortable="custom"/>
        <el-table-column prop="state" label="状态" header-align="center" align="center" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.state === 0" type="danger">停用</el-tag>
            <el-tag v-else-if="scope.row.state === 1" type="success">有效</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="160" sortable="custom"/>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-button v-if="$hasPermission('uc:tenant:edit')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{ $t('update') }}</el-button>
            <el-button v-if="$hasPermission('uc:tenant:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="mixinListModuleOptions.getDataListIsPage"
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
import AddOrUpdate from './tenant-add-or-update'

export default {
  mixins: [mixinBaseModule, mixinListModule],
  components: { AddOrUpdate },
  data () {
    return {
      mixinListModuleOptions: {
        getDataListURL: '/uc/tenant/page',
        getDataListIsPage: true,
        exportURL: '/uc/tenant/export',
        deleteURL: '/uc/tenant/delete',
        deleteIsBatch: false
      },
      searchForm: {
        search: null,
        state: null
      }
    }
  }
}
</script>
