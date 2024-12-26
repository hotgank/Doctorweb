<template>
  <div class="forgot-password-container">
    <!-- 左侧艺术字体标题 -->
    <div class="left-section">
      <h1 class="system-title">
        <span class="title-line">儿童</span>
        <span class="title-line">体态</span>
        <span class="title-line">评估</span>
        <span class="title-line">平台</span>
      </h1>
    </div>

    <!-- 中间重置密码卡片 -->
    <el-card class="forgot-password-card">
      <div class="card-header">
        <img src="/img/logo.webp" alt="系统图标" class="logo-icon" />
        <h2 class="page-title">重置密码</h2>
        <p class="subtitle">请填写以下信息以重置您的密码</p>
      </div>

      <el-form
          :model="form"
          :rules="rules"
          ref="forgotPasswordForm"
          label-position="top"
          class="reset-form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              class="custom-input"
              :prefix-icon="Message"
          ></el-input>
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              class="custom-input"
              :prefix-icon="User"
          ></el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="verificationCode">
          <div class="verification-code-group">
            <el-input
                v-model="form.verificationCode"
                placeholder="请输入验证码"
                class="custom-input code-input"
                :prefix-icon="Key"
            ></el-input>
            <el-button
                type="primary"
                class="send-code-button"
                @click="sendVerificationCode"
                :disabled="isCodeSent"
            >
              {{ codeBtnText }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="请输入新密码"
              class="custom-input"
              :prefix-icon="Lock"
          ></el-input>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              class="custom-input"
              :prefix-icon="Lock"
          ></el-input>
        </el-form-item>

        <div class="form-footer">
          <el-button
              type="primary"
              class="submit-button"
              @click="submitForm"
          >
            重置密码
          </el-button>

          <router-link to="/login" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            返回登录
          </router-link>
        </div>
      </el-form>
    </el-card>

    <!-- 右侧背景图装饰 -->
    <div class="right-section">
      <div class="decoration-image"></div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import {
  Message,
  Lock,
  User,
  Key,
  ArrowLeft
} from '@element-plus/icons-vue'

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
        await router.push('/login')
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
  display: grid;
  grid-template-columns: 25% 50% 25%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  position: relative;
  overflow: hidden;
}

/* 左侧标题样式 */
.left-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.system-title {
  display: flex;
  flex-direction: column;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.title-line {
  position: relative;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.title-line:hover {
  transform: translateX(20px);
  color: #3498db;
}

.title-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 0;
  background-color: #3498db;
  transition: height 0.3s ease, top 0.3s ease;
}

.title-line:hover::before {
  height: 100%;
  top: 0;
}

/* 卡片样式 */
.forgot-password-card {
  width: 90%;
  max-width: 480px;
  margin: auto;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.subtitle {
  color: #64748b;
  margin-top: 0.5rem;
}

/* 表单样式 */
.reset-form {
  margin-top: 2rem;
}

.custom-input :deep(.el-input__wrapper) {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  box-shadow: none;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #e2e8f0;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  background: #fff;
}

.verification-code-group {
  display: flex;
  gap: 1rem;
  place-items: center;
}

.code-input {
  flex: 1;
}

.send-code-button {
  width: 120px;
  border-radius: 8px;
  background: #3498db;
  border: none;
  transition: all 0.3s ease;
}

.send-code-button:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.send-code-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* 按钮和链接样式 */
.form-footer {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.submit-button {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  border-radius: 8px;
  background: #3498db;
  border: none;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #3498db;
}

/* 右侧背景装饰 */
.right-section {
  position: relative;
  overflow: hidden;
}

.decoration-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-image: url('/img/loginPage.webp?height=800&width=600');
  background-size: cover;
  background-position: center;
  opacity: 0.8;
  filter: blur(1px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .forgot-password-container {
    grid-template-columns: 30% 70%;
  }

  .right-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .forgot-password-container {
    grid-template-columns: 100%;
    padding: 1rem;
  }

  .left-section {
    display: none;
  }

  .forgot-password-card {
    width: 95%;
    margin: 1rem auto;
    padding: 1rem;
  }

  .system-title {
    font-size: 2rem;
  }

  .verification-code-group {
    flex-direction: column;
  }

  .send-code-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .forgot-password-card {
    width: 98%;
    padding: 0.8rem;
  }

  .card-header {
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>

