<template>
  <el-submenu v-if="menu.children && menu.children.length >= 1" :index="menu.id" :popper-append-to-body="false">
    <template slot="title">
      <i :class="`aui-sidebar__menu-icon ${menu.icon}`"></i>
      <span>{{ menu.name }}</span>
      <el-badge v-for="item in $store.state.sidebarMenuNotifyList" v-if="item && item.count > 0 && menu.id === item.id" :key="item.id" :value="item.count" :max="item.maxCount" style="margin-left: 10px"/>
    </template>
    <sub-menu v-for="item in menu.children" :key="item.id" :menu="item"/>
  </el-submenu>
  <el-menu-item v-else :index="menu.id" @click="gotoRouteHandle(menu)">
    <i :class="`aui-sidebar__menu-icon ${menu.icon}`"></i>
    <span>{{ menu.name }}</span>
    <el-badge v-for="item in $store.state.sidebarMenuNotifyList" v-if="item && item.count > 0 && menu.id === item.id" :key="item.id" :value="item.count" :max="item.maxCount" style="margin-left: 10px"/>
  </el-menu-item>
</template>

<script>
import SubMenu from './main-sidebar-sub-menu'

export default {
  name: 'sub-menu',
  props: {
    menu: {
      type: Object,
      required: true
    }
  },
  components: {
    SubMenu
  },
  methods: {
    /**
     * 跳转菜单
     */
    gotoRouteHandle (menu) {
      // 通过menuId与动态(菜单)路由进行匹配跳转至指定路由
      const route = window.SITE_CONFIG['dynamicMenuRoutes'].filter(item => item.meta.menuId === menu.id)[0]
      if (route) {
        if (menu.urlNewBlank === 1) {
          window.open(route['meta']['iframeURL'])
        } else {
          // 不能通过query传，否则参数会被带到路径中
          this.$router.push({ name: route.name, params: route.params })
        }
      } else {
        // 找不到对应的路由信息,参考rouer/index.js
        let URL
        if ((menu.url || '').startsWith('process.env.VUE_APP_API_URL/')) {
          URL = process.env.VUE_APP_API_URL + (menu.url || '').replace('process.env.VUE_APP_API_URL/', '')
        } else {
          // URL支持{{ window.xxx }}占位符变量
          // eslint-disable-next-line no-eval
          URL = (menu.url || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2))
        }
        window.open(URL)
      }
    }
  }
}
</script>
