<template>
    <el-card shadow="never" class="aui-card--fill">
        <div class="mod-uc__dept">
            <el-form :inline="true" :model="searchForm" size="small" @submit.native.prevent>
                <el-form-item>
                    <el-input v-model="searchForm.name" placeholder="名称" clearable maxlength="50" show-word-limit/>
                </el-form-item>
                <el-form-item>
                    <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
                </el-form-item>
                <el-form-item v-if="$hasPermission('uc:dept:edit')">
                    <el-button type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
                </el-form-item>
            </el-form>
            <el-table v-loading="dataListLoading" :data="dataList" :default-expand-all="expandTree" ref="table" border @sort-change="dataListSortChangeHandle" style="width: 100%;" row-key="code">
                <el-table-column prop="name" :label="$t('base.name')" header-align="left" align="left" min-width="150">
                  <template slot="header" slot-scope="scope">
                    <el-tooltip class="item" effect="dark" :content="expandTree ? '点击收起全部' : '点击展开全部'" placement="top-start">
                      <i :class="[{'el-icon-s-unfold':!expandTree}, {'el-icon-s-fold':expandTree}]" @click="expandTreeHandle"></i>
                    </el-tooltip>
                    {{ $t('base.name') }}
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" header-align="center" align="center" min-width="150"/>
                <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
                    <template slot-scope="scope">
                        <el-button v-if="$hasPermission('uc:dept:edit')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{ $t('update') }}</el-button>
                        <!-- 只有末级可以删除 -->
                        <el-button v-if="$hasPermission('uc:dept:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}</el-button>
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
import AddOrUpdate from './dept-add-or-update'

export default {
  mixins: [mixinBaseModule, mixinListModule],
  components: { AddOrUpdate },
  data () {
    return {
      mixinListModuleOptions: {
        getDataListURL: '/uc/dept/tree',
        getDataListIsPage: false,
        deleteURL: '/uc/dept/delete',
        deleteIsBatch: false,
        exportURL: '/uc/dept/export'
      },
      searchForm: {
        code: '',
        name: ''
      },
      // 展开树结构
      expandTree: false
    }
  },
  methods: {
    // 展开或者收起树
    expandTreeHandle () {
      this.dataList.forEach(i => {
        if (i.children && i.children.length > 0) {
          this.$refs.table.toggleRowExpansion(i, !this.expandTree)
          this.toggleTreeRow(i.children, !this.expandTree)
        }
      })
      this.expandTree = !this.expandTree
    },
    /**
     * 递归toggle列表展开收缩
     */
    toggleTreeRow (rowList, isExpand) {
      rowList.forEach(i => {
        if (i.children && i.children.length > 0) {
          this.$refs.table.toggleRowExpansion(i, isExpand)
          this.toggleTreeRow(i.children, isExpand)
        }
      })
    }
  }
}
</script>
