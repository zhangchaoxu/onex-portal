<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__region">
      <el-form :inline="true" :model="searchDataForm" size="small" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="searchDataForm.name" placeholder="输入名称" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="exportHandle()">{{ $t('export') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" style="width: 100%;" row-key="id" lazy :load="load">
        <el-table-column prop="name" label="名称" header-align="center" align="left" min-width="120"/>
        <el-table-column prop="id" label="编码" header-align="center" align="center" width="120"/>
        <el-table-column prop="deep" label="级别" header-align="center" align="center" width="80"/>
        <el-table-column prop="code" label="区号" header-align="center" align="center" width="100"/>
        <el-table-column prop="postcode" label="邮编" header-align="center" align="center" width="100"/>
        <el-table-column prop="geo" label="中心点" header-align="center" align="center" width="150"/>
        <el-table-column prop="polyline" label="边界" header-align="center" align="center" show-tooltip-when-overflow/>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-button v-if="$hasPermission('sys:region:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script>
import mixinListModule from '@/mixins/list-module'

export default {
  mixins: [mixinListModule],
  components: {},
  data () {
    return {
      mixinListModuleOptions: {
        getDataListURL: '/sys/region/list',
        getDataListIsPage: false,
        exportURL: '/sys/region/export',
        deleteURL: '/sys/region/delete',
        deleteIsBatch: false
      },
      searchDataForm: {
        id: '',
        pid: 0,
        name: ''
      }
    }
  },
  methods: {
    // 获取list之前的操作
    beforeGetDataList () {
      if (this.searchDataForm.name != null && this.searchDataForm.name !== '') {
        this.searchDataForm.pid = null
      } else {
        this.searchDataForm.pid = 0
      }
      return true
    },
    // 树节点展开懒加载，通过id获取该id下一级的所有节点
    load (tree, treeNode, resolve) {
      this.$http.get('/sys/region/list?pid=' + tree.id)
        .then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.toast)
          }
          resolve(res.data)
        })
    }
  }
}
</script>
