<template>
    <div class="forgot-password-container">
      <el-card class="forgot-password-card">
        <h2 class="forgot-password-title">忘记密码</h2>
        <el-form :model="form" :rules="rules" ref="forgotPasswordForm" label-position="top">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="verificationCode">
            <el-input v-model="form.verificationCode" placeholder="请输入验证码" class="w-3/5"></el-input>
            <el-button type="primary" class="ml-2" @click="sendVerificationCode" :disabled="isCodeSent">
              {{ codeBtnText }}
            </el-button>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请确认新密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm">重置密码</el-button>
          </el-form-item>
        </el-form>
        <div class="mt-4 text-center">
          <router-link to="/login" class="back-to-login">返回登录</router-link>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  
  const router = useRouter()
  const forgotPasswordForm = ref(null)
  
  const form = reactive({
    email: '',
    username: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const isCodeSent = ref(false)
  const countdown = ref(60)
  
  const codeBtnText = computed(() => {
    if (isCodeSent.value) {
      return `重新发送 (${countdown.value}s)`
    }
    return '发送验证码'
  })
  
  const rules = {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { validator: (rule, value, callback) => {
        if (new Blob([value]).size > 20) {
          callback(new Error('用户名不能超过20字节'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
    ],
    verificationCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { validator: (rule, value, callback) => {
        if (value.length < 10 || value.length > 16) {
          callback(new Error('密码长度应为10-16位'))
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/.test(value)) {
          callback(new Error('密码必须包含大小写字母和数字，不能包含特殊字符'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      { validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
    ]
  }
  
  const sendVerificationCode = async () => {
    if (!form.email || !form.username) {
      ElMessage.error('请先输入邮箱和用户名')
      return
    }
  
    if (isCodeSent.value) return
  
    try {
      const response = await axios.post('/api/api/DoctorLogin/sendChangePasswdCode', {
        email: form.email,
        username: form.username
      })
      ElMessage.success(response.data)
      isCodeSent.value = true
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value === 0) {
          clearInterval(timer)
          isCodeSent.value = false
        }
      }, 1000)
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            ElMessage.error(error.response.data)
            break
          case 501:
            ElMessage.error('发送邮件失败')
            break
          default:
            ElMessage.error('发送验证码失败，请稍后重试')
        }
      } else {
        console.error('发送验证码失败:', error)
        ElMessage.error('发送验证码失败，请稍后重试')
      }
    }
  }
  
  const submitForm = async () => {
    await forgotPasswordForm.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await axios.post('/api/api/DoctorLogin/ChangePasswd', {
            email: form.email,
            changeCode: form.verificationCode,
            newPassword: form.newPassword
          })
          ElMessage.success('密码重置成功！')
          router.push('/login')
        } catch (error) {
          if (error.response) {
            switch (error.response.status) {
              case 400:
                ElMessage.error(error.response.data)
                break
              case 500:
                ElMessage.error('更新密码失败')
                break
              default:
                ElMessage.error('重置密码失败，请稍后重试')
            }
          } else {
            console.error('重置密码失败:', error)
            ElMessage.error('重置密码失败，请稍后重试')
          }
        }
      } else {
        console.log('表单验证失败')
        return false
      }
    })
  }
  </script>
  
  <style scoped>
  .forgot-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .forgot-password-card {
    width: 400px;
    padding: 20px;
  }
  
  .forgot-password-title {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .back-to-login {
    color: #6b7280;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .back-to-login:hover {
    color: #3b82f6;
  }
  </style>