<template>
  <el-container class="layout-container">
    <el-aside width="200px" v-if="isAuthenticated">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleSelect"
        :router="true"
      >
        <!-- 医生菜单项 -->
        <template v-if="userRole === 'doctor'">
          <el-menu-item index="/doctor-dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>主页</span>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="/patient-index">
            <el-icon><List /></el-icon>
            <span>患者索引</span>
          </el-menu-item>
          <el-menu-item index="/consultation">
            <el-icon><ChatDotRound /></el-icon>
            <span>在线咨询</span>
          </el-menu-item>
          <el-menu-item index="/articles">
            <el-icon><Reading /></el-icon>
            <span>科普文章</span>
          </el-menu-item>
          <el-menu-item index="/publish-article">
            <el-icon><EditPen /></el-icon>
            <span>发布文章</span>
          </el-menu-item>
          <el-menu-item index="/community">
            <el-icon><Service /></el-icon>
            <span>社区交流</span>
          </el-menu-item>

          <el-menu-item index="/user-announcement">
            <el-icon><Document /></el-icon>
            <span>系统公告</span>
          </el-menu-item>
          <el-menu-item index="/doctor-account">
            <el-icon><Setting /></el-icon>
            <span>账户管理</span>
          </el-menu-item>
        </template>

        <!-- 管理员菜单项 -->
        <template v-if="userRole === 'admin'">
          <el-menu-item index="/admin-dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>主页</span>
          </el-menu-item>
          <el-menu-item v-if="isSuperAdmin" index="/superadmin">
            <el-icon><Avatar /></el-icon>
            <span>超级管理员</span>
          </el-menu-item>
          <el-menu-item index="/verify">
            <el-icon><Loading /></el-icon>
            <span>人工审核</span>
          </el-menu-item>
          <el-menu-item index="/user-index">
            <el-icon><User /></el-icon>
            <span>用户列表</span>
          </el-menu-item>
          <el-menu-item index="/doctor-index">
            <el-icon><Service /></el-icon>
            <span>医生列表</span>
          </el-menu-item>
          <el-menu-item index="/admin-index">
            <el-icon><Coordinate /></el-icon>
            <span>管理员列表</span>
          </el-menu-item>
          <el-menu-item index="/ranking">
            <el-icon><TrendCharts /></el-icon>
            <span>医生排行</span>
          </el-menu-item>
          <el-menu-item index="/admin-announcement">
            <el-icon><Document /></el-icon>
            <span>系统公告</span>
          </el-menu-item>
          <el-menu-item index="/admin-account">
            <el-icon><Setting /></el-icon>
            <span>账户管理</span>
          </el-menu-item>
        </template>
        
      
      </el-menu>
    </el-aside>

    <el-container>
      <el-header v-if="isAuthenticated">
        <div class="header-content">
          <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
          <el-button @click="goHome" :icon="HomeFilled">主页</el-button>
          <el-dropdown @command="handleCommand">
            <el-button>
              {{ username }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="account">账户管理</el-dropdown-item>
                <el-dropdown-item command="logout">登出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import {
  HomeFilled,
  User,
  ChatDotRound,
  EditPen,
  Service,
  ArrowLeft,
  List,
  ArrowDown,
  Reading,
  Setting,
  TrendCharts,
  Loading,
  Document,
  Coordinate,
  Avatar,
} from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()
const route = useRoute()

const username = computed(() => store.state.user ? store.state.user.username : '未登录')
const userRole = computed(() => store.state.user ? store.state.user.role : null)
const isAuthenticated = computed(() => store.getters.isLoggedIn)
const isSuperAdmin = computed(() => store.state.user && store.state.user.isSuperAdmin)

const activeMenu = computed(() => {
  return route.path === '/' ? '/' : route.path.split('/')[1] ? `/${route.path.split('/')[1]}` : '/'
})

const handleSelect = (key) => {
  router.push(key)
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  const role = store.getters.userRole
  if (role === 'doctor') {
    router.push('/doctor-dashboard')
  } else if (role === 'admin') {
    router.push('/admin-dashboard')
  } else {
    ElMessage.error('未知的用户角色')
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    store.dispatch('logout')
    router.push('/login')
  } else if (command === 'account') {
    const role = store.getters.userRole
    if (role === 'doctor') {
    router.push('/doctor-account')
  } else if (role === 'admin') {
    router.push('/admin-account')
  } else {
    ElMessage.error('未知的用户角色')
  }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.el-header {
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>