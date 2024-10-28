<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form :model="loginForm" @submit.native.prevent="handleLogin" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="登录类型">
          <el-radio-group v-model="loginForm.role">
            <el-radio label="doctor">医生登录</el-radio>
            <el-radio label="admin">管理员登录</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <div class="flex justify-between items-center">
            <el-button type="primary" native-type="submit">登录</el-button>
            <router-link to="/register" class="register-link">
              没有账号？立即注册
            </router-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

// 登录表单数据
const loginForm = ref({
  username: '',
  password: '',
  role: 'doctor', // 默认选中医生登录
})

// 引用 Vue Router 和 Vuex Store
const router = useRouter()
const store = useStore()

// 登录处理函数
const handleLogin = async () => {
  const { username, password, role } = loginForm.value

  // 简单的表单验证
  if (!username || !password) {
    ElMessage.error('请填写用户名和密码')
    return
  }

  try {
    // 调用 Vuex 的 login action 进行登录
    await store.dispatch('login', { username, password, role })

    // 根据角色导航到不同的页面
    if (role === 'doctor') {
      router.push('/doctor-dashboard')
    } else if (role === 'admin') {
      router.push('/admin-dashboard')
    }
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
}

.el-form-item {
  display: flex;
  flex-direction: column;
}

.el-input {
  width: 100%;
}

.el-radio-group {
  display: flex;
  justify-content: space-between;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.register-link {
  color: #6b7280; /* 默认灰色 */
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 50px;
}

.register-link:hover {
  color: #3b82f6; /* 鼠标悬停时变为蓝色 */
}
</style>
