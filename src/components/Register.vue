<template>
  <div class="register-container">
    <!-- 左侧艺术字体标题 -->
    <div class="left-section">
      <h1 class="system-title">
        <span class="title-line">儿童</span>
        <span class="title-line">体态</span>
        <span class="title-line">评估</span>
        <span class="title-line">平台</span>
      </h1>
    </div>

    <!-- 中间注册卡片 -->
    <el-card class="register-card">
      <div class="card-header">
        <img src="/img/logo.webp" alt="系统图标" class="logo-icon" />
        <h2 class="page-title">医生注册</h2>
        <p class="subtitle">请填写以下信息完成注册</p>
      </div>

      <el-form
          :model="form"
          :rules="rules"
          ref="registerForm"
          label-position="top"
          class="register-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              class="custom-input"
              :prefix-icon="User"
          ></el-input>
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input
              v-model="form.name"
              placeholder="请输入姓名"
              class="custom-input"
              :prefix-icon="UserFilled"
          ></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              type="password"
              v-model="form.password"
              placeholder="请输入密码"
              class="custom-input"
              :prefix-icon="Lock"
          ></el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              type="password"
              v-model="form.confirmPassword"
              placeholder="请确认密码"
              class="custom-input"
              :prefix-icon="Lock"
          ></el-input>
        </el-form-item>


        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              class="custom-input"
              :prefix-icon="Message"
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

        <el-form-item label="医院" prop="hospital">
          <el-select
              v-model="form.hospital"
              placeholder="请选择医院"
              @change="handleHospitalChange"
              class="custom-select"
              :prefix-icon="OfficeBuilding"
          >
            <el-option
                v-for="hospital in hospitals"
                :key="hospital.hospitalName"
                :label="hospital.hospitalName"
                :value="hospital.hospitalName"
            ></el-option>
          </el-select>
          <div v-if="selectedHospitalAddress" class="hospital-address">
            <el-icon><Location /></el-icon>
            {{ selectedHospitalAddress }}
          </div>
        </el-form-item>

        <div class="form-footer">
          <el-button
              type="primary"
              class="submit-button"
              @click="submitForm"
          >
            注册
          </el-button>
          <el-button
              class="reset-button"
              @click="resetForm"
          >
            重置
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
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import {
  Message,
  Lock,
  User,
  UserFilled,
  Key,
  Location,
  OfficeBuilding,
  ArrowLeft
} from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  name: '',
  verificationCode: '',
  hospital: '',
})

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 10 || value.length > 16) {
    callback(new Error('密码长度应为10-16位'))
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/.test(value)) {
    callback(new Error('密码必须包含大小写字母和数字，不能包含特殊字符'))
  } else {
    callback()
  }
}

const validateName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入姓名'))
  } else if (new Blob([value]).size > 20) {
    callback(new Error('姓名不能超过20字节'))
  } else {
    callback()
  }
}

const validateUsername = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入用户名'))
  } else if (new Blob([value]).size > 20) {
    callback(new Error('用户名不能超过20字节'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { validator: validateName, trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
  hospital: [
    { required: true, message: '请选择医院', trigger: 'change' }
  ]
}

const registerForm = ref(null)
const isCodeSent = ref(false)
const countdown = ref(30)
const hospitals = ref([])
const selectedHospitalAddress = ref('')

const codeBtnText = computed(() => {
  if (isCodeSent.value) {
    return `重新发送 (${countdown.value}s)`
  }
  return '发送验证码'
})

const sendVerificationCode = async () => {
  if (!form.email) {
    ElMessage.error('请先输入邮箱')
    return
  }

  if (isCodeSent.value) return

  try {
    const response = await axios.post('/api/api/DoctorRegister/sendRegisterCode', {
      email: form.email
    })
    ElMessage.success('验证码已发送，请注意查收')
    isCodeSent.value = true
    countdown.value = 30
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

const fetchHospitals = async () => {
  try {
    const response = await axios.get('/api/api/DoctorRegister/selectAllHospitals')
    hospitals.value = response.data
    console.log('获取到的医院列表:', hospitals.value)
  } catch (error) {
    console.error('获取医院列表失败:', error)
    ElMessage.error('获取医院列表失败，请稍后重试')
  }
}

const handleHospitalChange = (value) => {
  const selectedHospital = hospitals.value.find(h => h.hospitalName === value)
  if (selectedHospital) {
    selectedHospitalAddress.value = selectedHospital.address
  }
}

const submitForm = async () => {
  await registerForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/api/api/DoctorRegister/register', {
          email: form.email,
          registerCode: form.verificationCode,
          name: form.name,
          username: form.username,
          password: form.password,
          workplace: form.hospital
        })
        if (response.status === 200) {
          ElMessage.success('注册成功！')
          await router.push('/login')
        } else {
          ElMessage.error(response.data)
        }
      } catch (error) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              ElMessage.error(error.response.data)
              break
            case 500:
              ElMessage.error('注册失败，请稍后重试')
              break
            default:
              ElMessage.error('注册失败，请稍后重试')
          }
        } else {
          console.error('注册失败:', error)
          ElMessage.error('注册失败，请稍后重试')
        }
      }
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

const resetForm = () => {
  registerForm.value.resetFields()
}

onMounted(() => {
  fetchHospitals()
})
</script>

<style scoped>
.register-container {
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

/* 注册卡片样式 */
.register-card {
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
.register-form {
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

.custom-select {
  width: 100%;
}

.custom-select :deep(.el-input__wrapper) {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  box-shadow: none;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.verification-code-group {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.hospital-address {
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 按钮和链接样式 */
.form-footer {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
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

.reset-button {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  color: #64748b;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.back-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 1rem;
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
  .register-container {
    grid-template-columns: 30% 70%;
  }

  .right-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 100%;
    padding: 1rem;
  }

  .left-section {
    display: none;
  }

  .register-card {
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
  .register-card {
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

