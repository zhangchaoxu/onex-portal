<template>
    <el-card shadow="never" class="aui-card--fill">
        <div class="mod-uc__user-member">
            <el-form :inline="true" :model="searchForm" size="small" @submit.native.prevent>
                <el-form-item class="middle-item" v-if="$hasRole('sysadmin')">
                    <el-input v-model="searchForm.tenantName" placeholder="租户" readonly>
                        <tenant-pick class="small-button" slot="append" :userId="searchForm.tenantId" @onTenantPicked="onTenantPicked"/>
                    </el-input>
                </el-form-item>
                <el-form-item class="small-item">
                    <el-input v-model="searchForm.username" :placeholder="$t('user.username')" clearable/>
                </el-form-item>
                <el-form-item class="small-item">
                    <el-input v-model="searchForm.realName" :placeholder="$t('user.realName')" clearable/>
                </el-form-item>
                <el-form-item class="small-item">
                    <el-input v-model="searchForm.mobile" :placeholder="$t('user.mobile')" clearable/>
                </el-form-item>
                <el-form-item>
                    <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="$hasPermission('uc:user:save')" type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="$hasPermission('uc:user:delete')" type="danger" @click="deleteHandle()">{{ $t('deleteBatch') }}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="$hasPermission('uc:user:export')" type="info" @click="exportHandle()">{{ $t('export') }}</el-button>
                </el-form-item>
            </el-form>
            <el-table
                    v-loading="dataListLoading"
                    :data="dataList"
                    border
                    @selection-change="dataListSelectionChangeHandle"
                    @sort-change="dataListSortChangeHandle"
                    style="width: 100%;">
                <el-table-column type="selection" header-align="center" align="center" width="50"/>
                <el-table-column prop="tenantName" label="租户" header-align="center" align="center" min-width="100" v-if="$hasRole('sysadmin')"/>
                <el-table-column prop="username" :label="$t('user.username')" header-align="center" align="center">
                    <template slot-scope="scope">
                        <el-link type="primary" @click="previewHandle(scope.row.id)" :underline="false">{{ scope.row.username }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="mobile" :label="$t('user.mobile')" header-align="center" align="center" min-width="120"/>
                <el-table-column prop="realName" :label="$t('user.realName')" header-align="center" align="center"/>
                <el-table-column prop="state" :label="$t('user.state')" sortable="custom" header-align="center" align="center">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.state === 0" size="mini" type="danger" round :disabled="!$hasPermission('uc:user:update')" @click="changeStatusHandle(scope.row.id)">{{
                            $t('user.state0') }}
                        </el-button>
                        <el-button v-else size="mini" type="success" round :disabled="!$hasPermission('uc:user:update')" @click="changeStatusHandle(scope.row.id)">{{ $t('user.state1') }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
                    <template slot-scope="scope">
                        <el-button v-if="$hasPermission('uc:user:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{ $t('update') }}
                        </el-button>
                        <el-button v-if="$hasPermission('uc:user:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}
                        </el-button>
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
            <!-- 弹窗，修改状态 -->
            <change-state v-if="changeStateVisible" ref="changeState" @refreshDataList="getDataList"/>
            <!-- 弹窗，导入用户 -->
            <import v-if="importVisible" ref="import" @refreshDataList="getDataList"/>
        </div>
    </el-card>
</template>

<script>
import mixinListModule from '@/mixins/list-module'
import AddOrUpdate from './user-add-or-update'
import ChangeState from './user-change-state'
import Import from './user-import'
import TenantPick from '../uc/tenant-pick'

export default {
  mixins: [mixinListModule],
  components: { ChangeState, AddOrUpdate, Import, TenantPick },
  data () {
    return {
      mixinListModuleOptions: {
        activatedIsNeed: true,
        getDataListURL: '/uc/user/page',
        getDataListIsPage: true,
        deleteURL: '/uc/user/delete',
        deleteBatchURL: '/uc/user/deleteBatch',
        deleteIsBatch: true,
        exportURL: '/uc/user/export',
        importURL: '/uc/user/import'
      },
      roleSelected: null,
      roleList: [],
      searchForm: {
        username: '',
        realName: '',
        roleIds: '',
        type: '',
        tenantId: '',
        tenantName: ''
      },
      // 导入对话框
      importVisible: false
    }
  },
  methods: {
    // 导入处理
    importHandle () {
      this.importVisible = true
      this.$nextTick(() => {
        this.$refs.import.dataForm.id = null
        this.$refs.import.init()
      })
    }
  }
}
</script>
