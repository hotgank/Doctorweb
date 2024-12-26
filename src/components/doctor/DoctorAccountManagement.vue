<template>
  <div class="account-management">
    <div class="header-section">
      <h1 class="page-title">账户管理</h1>
      <p class="page-subtitle">管理您的个人账户信息和安全设置</p>
    </div>

    <el-card class="main-card">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane label="修改密码" name="password">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px" class="custom-form">
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="$refs.passwordFormRef.validate().then(valid => { if (valid) changePassword() })">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="更改邮箱" name="email">
          <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="120px" class="custom-form">
            <el-form-item label="当前邮箱">
              <el-input :value="profile.email || '未认证'" disabled></el-input>
            </el-form-item>
            <el-form-item label="新邮箱" prop="newEmail">
              <el-input v-model="emailForm.newEmail"></el-input>
            </el-form-item>
            <el-form-item label="旧邮箱验证码" prop="oldCode">
              <el-input v-model="emailForm.oldCode">
                <template #append>
                  <el-button @click="sendOldEmailCode" :disabled="oldCodeSent" class="code-button">
                    {{ oldCodeSent ? `重新发送 (${oldCodeCountdown}s)` : '发送验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="新邮箱验证码" prop="newCode">
              <el-input v-model="emailForm.newCode">
                <template #append>
                  <el-button @click="sendNewEmailCode" :disabled="newCodeSent || !emailForm.newEmail" class="code-button">
                    {{ newCodeSent ? `重新发送 (${newCodeCountdown}s)` : '发送验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changeEmail">更改邮箱</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="账户认证" name="verification">
          <el-form :model="verificationForm" label-width="120px" class="custom-form">
            <el-form-item label="电子医生执照">
              <el-upload
                  class="upload-demo"
                  action="/api/api/doctorLicense/insert"
                  :headers="uploadHeaders"
                  :on-success="handleUploadSuccess"
                  :on-error="handleUploadError"
                  :before-upload="beforeUpload"
                  :file-list="fileList"
                  name="multipartFile"
              >
                <el-button size="small" type="primary">上传电子医生执照</el-button>
                <template #tip>
                  <div class="el-upload__tip">请上传您的电子医生执照（仅支持jpg/png格式，不超过5MB）</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>
          <div class="license-history">
            <h4 class="section-title">历史记录</h4>
            <el-table :data="licenseStatus" style="width: 100%" class="custom-table">
              <el-table-column prop="status" label="状态" width="100"></el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
              <el-table-column prop="updatedAt" label="更新时间" width="180"></el-table-column>
              <el-table-column prop="comment" label="管理员留言"></el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="注销账户" name="deactivate">
          <el-alert
              title="警告：注销账户将永久删除您的所有数据，此操作不可逆！"
              type="warning"
              :closable="false"
              class="deactivate-alert"
          >
          </el-alert>
          <el-form :model="deactivateForm" :rules="deactivateRules" ref="deactivateFormRef" label-width="120px" class="custom-form mt-4">
            <el-form-item label="密码" prop="password">
              <el-input v-model="deactivateForm.password" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="验证码" prop="deleteCode">
              <el-input v-model="deactivateForm.deleteCode">
                <template #append>
                  <el-button @click="sendDeleteCode" :disabled="deleteCodeSent" class="code-button">
                    {{ deleteCodeSent ? `重新发送 (${deleteCodeCountdown}s)` : '发送验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="确认注销" prop="confirm">
              <el-checkbox v-model="deactivateForm.confirm">我确认要注销我的账户</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="deactivateAccount">注销账户</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axiosInstance from '../../axios/index'

const store = useStore()
const router = useRouter()

const activeTab = ref('password')
const profile = computed(() => store.state.doctor || {})

const emailForm = reactive({
  newEmail: '',
  oldCode: '',
  newCode: ''
})

const emailRules = {
  newEmail: [
    { required: true, message: '请输入新邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  oldCode: [
    { required: true, message: '请输入旧邮箱验证码', trigger: 'blur' }
  ],
  newCode: [
    { required: true, message: '请输入新邮箱验证码', trigger: 'blur' }
  ]
}

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/,
      message: '密码必须包含大小写字母和数字，长度为10-16位，不能包含特殊字符',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const verificationForm = reactive({})

const fileList = ref([])

const deactivateForm = reactive({
  password: '',
  deleteCode: '',
  confirm: false
})

const deactivateRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
  deleteCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
  confirm: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请确认您要注销账户'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const oldCodeSent = ref(false)
const newCodeSent = ref(false)
const deleteCodeSent = ref(false)
const oldCodeCountdown = ref(60)
const newCodeCountdown = ref(60)
const deleteCodeCountdown = ref(60)
const licenseStatus = ref(null)

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${store.state.token}`
}))

// 发送旧邮箱验证码
const sendOldEmailCode = async () => {
  try {
    await axiosInstance.post('/api/doctor_manage/sendOldEmailCode', {}, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('验证码已发送到您的旧邮箱')
    oldCodeSent.value = true
    startCountdown('oldCode')
  } catch (error) {
    console.error(error)
    ElMessage.error('发送验证码失败')
  }
}

// 发送新邮箱验证码
const sendNewEmailCode = async () => {
  if (!emailForm.newEmail) {
    ElMessage.error('请先填写新邮箱地址')
    return
  }
  try {
    await axiosInstance.post('/api/doctor_manage/sendNewEmailCode', { newEmail: emailForm.newEmail }, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('验证码已发送到您的新邮箱')
    newCodeSent.value = true
    startCountdown('newCode')
  } catch (error) {
    console.error(error)
    ElMessage.error('发送验证码失败')
  }
}

// 开始倒计时
const startCountdown = (type) => {
  let countdown = type === 'oldCode' ? oldCodeCountdown : type === 'newCode' ? newCodeCountdown : deleteCodeCountdown
  let interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
      if (type === 'oldCode') oldCodeSent.value = false
      if (type === 'newCode') newCodeSent.value = false
      if (type === 'deleteCode') deleteCodeSent.value = false
    }
  }, 1000)
}

// 获取执照状态
const getLicenseStatus = async () => {
  try {
    const response = await axiosInstance.get('/api/doctorLicense/myLicense', {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    licenseStatus.value = response.data
    // 格式化时间
    licenseStatus.value.forEach(item => {
      item.createdAt = new Date(item.createdAt).toLocaleString()
      item.updatedAt = new Date(item.updatedAt).toLocaleString()
    })
  } catch (error) {
    console.error(error)
    ElMessage.error('获取执照状态失败')
  }
}

// 上传执照成功处理
const handleUploadSuccess = (response, file, fileList) => {
  ElMessage.success('执照上传成功')
  getLicenseStatus()
}

// 上传执照失败处理
const handleUploadError = (error, file, fileList) => {
  ElMessage.error('执照上传失败')
}

// 更改邮箱
const changeEmail = async () => {
  try {
    await axiosInstance.post('/api/doctor_manage/changeEmail', emailForm, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('邮箱已成功更改')
  } catch (error) {
    console.error(error)
    ElMessage.error('更改邮箱失败')
  }
}

// 更改密码
const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  try {
    await axiosInstance.post('/api/doctor_manage/updatePassword', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error(error)
    ElMessage.error('修改密码失败')
  }
}

// 发送注销验证码
const sendDeleteCode = async () => {
  try {
    const response = await axiosInstance.post('/api/doctor_manage/sendDeleteCode', {}, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    if (response.status === 200) {
      ElMessage.success('注销验证码已发送到您的邮箱')
      deleteCodeSent.value = true
      startCountdown('deleteCode')
    } else {
      ElMessage.error(response.data)
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('发送注销验证码失败')
  }
}

// 注销账户
const deactivateAccount = async () => {
  if (!deactivateForm.confirm) {
    ElMessage.warning('请确认您要注销账户')
    return
  }

  try {
    const response = await axiosInstance.post('/api/doctor_manage/deleteDoctor', deactivateForm, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    if (response.status === 200) {
      ElMessage.success('账户已注销')
      await store.dispatch('logout')
      await router.push('/login')
    } else {
      ElMessage.error(response.data)
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('账户注销失败')
  }
}

onMounted(() => {
  getLicenseStatus()
})
</script>

<style scoped>
.account-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.header-section {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: #64748b;
}

.main-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.custom-tabs {
  padding: 20px;
}

.custom-form {
  max-width: 500px;
  margin: 0 auto;
}

.code-button {
  width: 120px;
}

.license-history {
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.custom-table {
  margin-top: 16px;
}

.deactivate-alert {
  margin-bottom: 24px;
}

/* Element Plus 样式覆盖 */
:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

:deep(.el-tabs__item.is-active) {
  color: #3b82f6;
}

:deep(.el-tabs__active-bar) {
  background-color: #3b82f6;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-button--primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

:deep(.el-button--primary:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  color: #1e293b;
  font-weight: 600;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f1f5f9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .account-management {
    padding: 16px;
  }

  .custom-form {
    padding: 0 16px;
  }

  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 8px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

/* 动画效果 */
.custom-tabs {
  transition: all 0.3s ease;
}

:deep(.el-tab-pane) {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
