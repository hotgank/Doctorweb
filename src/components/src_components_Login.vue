<template>
  <div class="login">
    <h1 class="mb-4">医生登录</h1>
    <el-form :model="form" :rules="rules" ref="loginForm" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">登录</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="mt-4">
      <el-link type="primary" @click="goToRegister">还没有账号？立即注册</el-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

const loginForm = ref(null)

const submitForm = () => {
  loginForm.value.validate((valid) => {
    if (valid) {
      // 这里应该是一个 API 调用来验证用户
      console.log('登录表单提交:', form)
      store.dispatch('login', { username: form.username })
      ElMessage({
        message: '登录成功！',
        type: 'success',
      })
      router.push('/')
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

const resetForm = () => {
  loginForm.value.resetFields()
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
}
</style>