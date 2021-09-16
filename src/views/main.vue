<template>
    <div v-loading.fullscreen.lock="loading" :element-loading-text="$t('loading')" :class="['aui-wrapper', { 'aui-sidebar--fold': $store.state.sidebarFold }]">
        <template v-if="!loading">
            <main-navbar/>
            <main-sidebar/>
            <div class="aui-content__wrapper">
                <main-content v-if="!$store.state.contentIsNeedRefresh"/>
            </div>
        </template>
    </div>
</template>

<script>
import MainNavbar from './main-navbar'
import MainSidebar from './main-sidebar'
import MainContent from './main-content'
import debounce from 'lodash/debounce'
import axios from 'axios'

export default {
  components: { MainNavbar, MainSidebar, MainContent },
  data () {
    return {
      loading: true
    }
  },
  watch: {
    $route: 'routeHandle'
  },
  provide () {
    return {
      // 刷新
      refresh () {
        this.$store.state.contentIsNeedRefresh = true
        this.$nextTick(() => {
          this.$store.state.contentIsNeedRefresh = false
        })
      }
    }
  },
  created () {
    this.windowResizeHandle()
    this.routeHandle(this.$route)
    this.getSysConfig()
    Promise.all([
      this.getUserInfo()
      // this.getPermissions()
    ]).finally(() => {
      this.loading = false
    })
    // 在合适的地方定时刷新获取菜单通知
    setInterval(this.getMenuNotifyList, 3000)
  },
  methods: {
    // 获得带有数字的菜单
    getMenuNotifyList () {
      // todo 接口获取
      this.$store.state.sidebarMenuNotifyList = [{ id: '000', maxCount: 99, count: Math.ceil(Math.random() * 10) }]
    },
    // 窗口改变大小
    windowResizeHandle () {
      this.$store.state.sidebarFold = document.documentElement['clientWidth'] <= 992 || false
      window.addEventListener('resize', debounce(() => { this.$store.state.sidebarFold = document.documentElement['clientWidth'] <= 992 || false }, 150))
    },
    // 路由, 监听
    routeHandle (route) {
      if (!route.meta.isTab) {
        return false
      }
      let tab = this.$store.state.contentTabs.filter(item => item.name === route.name)[0]
      if (!tab) {
        // 未在tabs列表中
        if (route.path !== route.fullPath) {
          // 注意部分，在菜单中有定义，并且加了参数的页面，比如/shop/order?state=1的页面，会自动匹配到/shop/order
          // 先在dynamicMenuRoutes中找
          tab = window.SITE_CONFIG['dynamicMenuRoutes'].filter(item => '/' + item.name === route.fullPath)[0]
          if (tab) {
            // 能找到,则使用找到的菜单
            tab.title = tab.meta.title
            tab.menuId = tab.meta.menuId
          }
        }
        // 找不到，启动默认项
        if (!tab) {
          tab = {
            ...window.SITE_CONFIG['contentTabDefault'],
            ...route.meta,
            'name': route.name,
            'params': { ...route.params },
            'query': { ...route.query }
          }
        }
        this.$store.state.contentTabs = this.$store.state.contentTabs.concat(tab)
      } else {
        // tab中已存在
        if (tab.query !== route.query) {
          // query参数发生变化需要修改
          tab.query = route.query
        }
      }
      // 设置菜单当前项
      this.$store.state.sidebarMenuActiveName = tab.menuId
      this.$store.state.contentTabsActiveName = tab.name
    },
    // 获取当前用户信息
    getUserInfo () {
      return this.$http.get('/uc/user/userInfo').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        }
        this.$store.state.user = res.data
      })
    },
    // 获取系统配置
    getSysConfig () {
      // 先从本地读取
      const localConfig = localStorage.getItem('sysConfig')
      if (localConfig) {
        document.title = JSON.parse(localConfig).title
      }
      // 再从线上读取
      axios.get(`/json/sysConfig.json`).then(({ data: res }) => {
        localStorage.setItem('sysConfig', JSON.stringify(res))
        document.title = res.title
      })
    }
    // 获取按钮权限
    /* getPermissions () {
          return this.$http.get('/uc/menu/permissions').then(({ data: res }) => {
            if (res.code !== 0) {
              return this.$message.error(res.toast)
            }
            window.SITE_CONFIG['permissions'] = res.data
          }).catch(() => {})
        } */
  }
}
</script>
