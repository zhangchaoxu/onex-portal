<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-shop__supplier">
      <el-form :inline="true" :model="searchDataForm" size="small" @submit.native.prevent>
        <el-form-item class="middle-item" v-if="$hasRole('sysadmin')">
          <el-input v-model="searchDataForm.tenantName" placeholder="租户" readonly>
            <tenant-pick class="small-button" slot="append" :userId="searchDataForm.tenantId" @onTenantPicked="onTenantPicked"/>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchDataForm.name" placeholder="供应商名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item v-if="$hasPermission('shop:supplier:export')">
          <el-button type="info" @click="exportHandle()">{{ $t('export') }}</el-button>
        </el-form-item>
        <el-form-item v-if="$hasPermission('shop:supplier:save')">
          <el-button type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" @sort-change="dataListSortChangeHandle" style="width: 100%;">
        <el-table-column prop="tenantName" label="租户" header-align="center" align="center" min-width="100" v-if="$hasRole('sysadmin')"/>
        <el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
        <el-table-column prop="imgs" label="图标" header-align="center" align="center" width="100">
          <template slot-scope="scope">
            <el-image v-if="scope.row.imgs" lazy class="table-img" :src="scope.row.imgs.split(',')[0]" :preview-src-list="scope.row.imgs.split(',')" fit="cover"/>
          </template>
        </el-table-column>
        <el-table-column prop="sort" sortable="custom" label="排序" header-align="center" align="center" width="100"></el-table-column>
        <el-table-column prop="state" label="状态" header-align="center" align="center" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.state === 0" size="small" type="info">未审核</el-tag>
            <el-tag v-else-if="scope.row.state === 1" size="small" type="success">已审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="简介" header-align="center" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-button v-if="$hasPermission('shop:supplier:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{ $t('update') }}</el-button>
            <el-button v-if="$hasPermission('shop:supplier:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}</el-button>
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
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    </div>
  </el-card>
</template>

<script>
import mixinBaseModule from '@/mixins/base-module'
import mixinListModule from '@/mixins/list-module'
import AddOrUpdate from './supplier-add-or-update'
import TenantPick from '../uc/tenant-pick'

export default {
  mixins: [mixinListModule, mixinBaseModule],
  components: { AddOrUpdate, TenantPick },
  data () {
    return {
      mixinListModuleOptions: {
        getDataListURL: '/shop/supplier/page',
        getDataListIsPage: true,
        exportURL: '/shop/supplier/export',
        deleteURL: '/shop/supplier/delete',
        deleteIsBatch: false
      },
      searchDataForm: {
        name: '',
        tenantId: '',
        tenantName: ''
      }
    }
  }
}
</script>
