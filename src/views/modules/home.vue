<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-home">
      <!-- 全局数量 -->
      <data-rotate :option="tmsCountData" v-loading="tmsFormLoading" v-if="$hasRole('tms-admin')"/>
      <data-rotate :option="shopCountData" v-loading="shopFormLoading" v-if="$hasRole('shop-admin')"/>
      <data-rotate :option="crmCountData" v-loading="crmFormLoading" v-if="$hasRole('crm-admin')"/>
      <!-- 图表 -->
      <el-row :gutter="32">
        <el-col :md="8" :xs="24" :sm="12">
          <div id="chart1"/>
        </el-col>
        <el-col :md="8" :xs="24" :sm="12">
          <div id="chart2"/>
        </el-col>
        <el-col :md="8" :xs="24" :sm="12">
          <div id="chart3"/>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import mixinFormModule from '@/mixins/form-module'
import DataRotate from '@/components/data-rotate'

export default {
  mixins: [mixinFormModule],
  components: { DataRotate },
  data () {
    return {
      // shop统计数据
      shopFormLoading: true,
      shopCountData: {
        span: 8,
        data: [
          {
            count: '0',
            title: '订单数',
            icon: 'el-icon-news',
            color: '#F56C6C'
          }, {
            count: '0',
            title: '商品数',
            icon: 'el-icon-goods',
            color: '#E6A23C'
          }, {
            count: '0',
            title: '用户数',
            icon: 'el-icon-user',
            color: '#67C23A'
          }
        ]
      },
      // tms统计数据
      tmsFormLoading: true,
      tmsCountData: {
        span: 8,
        data: [
          {
            count: '0',
            title: '运单数',
            icon: 'el-icon-ship',
            color: '#F56C6C'
          }, {
            count: '0',
            title: '订货单数',
            icon: 'el-icon-document-checked',
            color: '#E6A23C'
          }, {
            count: '0',
            title: '未装船订单数',
            icon: 'el-icon-tickets',
            color: '#67C23A'
          }
        ]
      },
      // crm统计数据
      crmFormLoading: true,
      crmCountData: {
        span: 8,
        data: [
          {
            count: '0',
            title: '客户数',
            icon: 'el-icon-s-custom',
            color: '#F56C6C'
          }, {
            count: '0',
            title: '商机数',
            icon: 'el-icon-s-finance',
            color: '#E6A23C'
          }, {
            count: '0',
            title: '当年合同数',
            icon: 'el-icon-document-checked',
            color: '#67C23A'
          }
        ]
      }
    }
  },
  created () {
    if (this.$hasRole('crm-admin')) {
      this.getCrmCount()
    }
    if (this.$hasRole('shop-admin')) {
      this.getShopCount()
    }
    if (this.$hasRole('tms-admin')) {
      this.getTmsCount()
    }
  },
  methods: {
    // 获取crm统计数据
    getCrmCount () {
      this.$http.get('/crm/index/count?contractYear=' + new Date().getFullYear()).then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        }
        this.crmCountData.data[0].count = res.data.customerCount
        this.crmCountData.data[0].click = () => {
          this.$router.push({ name: 'crm-customer' })
        }
        this.crmCountData.data[1].count = res.data.businessCount
        this.crmCountData.data[1].click = () => {
          this.$router.push({ name: 'crm-business' })
        }
        this.crmCountData.data[2].count = res.data.contractCount
        this.crmCountData.data[2].click = () => {
          this.$router.push({ name: 'crm-contract' })
        }
      }).catch(() => {}).finally(() => {
        this.crmFormLoading = false
      })
    },
    // 获取shop统计数据
    getShopCount () {
      this.$http.get('/shop/index/count').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        }
        this.shopCountData.data[0].count = res.data.orderCount
        this.shopCountData.data[0].click = () => {
          this.$router.push({ name: 'shop-order' })
        }
        this.shopCountData.data[1].count = res.data.goodsCount
        this.shopCountData.data[1].click = () => {
          this.$router.push({ name: 'shop-goods' })
        }
        this.shopCountData.data[2].count = res.data.userCount
        this.shopCountData.data[2].click = () => {
          this.$router.push({ name: 'uc-member' })
        }
      }).catch(() => {}).finally(() => {
        this.shopFormLoading = false
      })
    },
    // 获取tms统计数据
    getTmsCount () {
      this.$http.get('/tms/index/count').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        }
        this.tmsCountData.data[0].count = res.data.waybillCount
        this.tmsCountData.data[0].click = () => {
          this.$router.push({ name: 'tms-waybill' })
        }
        this.tmsCountData.data[1].count = res.data.waybillItemCount
        this.tmsCountData.data[1].click = () => {
          this.$router.push({ name: 'tms-waybill-item' })
        }
        this.tmsCountData.data[2].count = res.data.waybillItemNotBoardCount
        this.tmsCountData.data[2].click = () => {
          this.$router.push({ name: 'tms-waybill-item' })
        }
      }).catch(() => {}).finally(() => {
        this.tmsFormLoading = false
      })
    }
  }
}
</script>
