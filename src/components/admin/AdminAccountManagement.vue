<template>
  <div class="account-management-container">
    <div class="account-header">
      <h1 class="page-title">账户管理</h1>
      <p class="page-subtitle">管理您的个人账户信息和安全设置</p>
    </div>

    <el-card class="account-card" shadow="hover">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 账户信息标签页 -->
        <el-tab-pane label="账户信息" name="info">
          <div class="tab-header">
            <div class="tab-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="tab-info">
              <h3>基本信息</h3>
              <p>查看和更新您的个人信息</p>
            </div>
          </div>

          <el-form :model="accountInfo" label-width="120px" :rules="phoneRules" class="custom-form">
            <el-form-item label="用户名">
              <el-input
                  v-model="accountInfo.username"
                  disabled
                  class="custom-input"
              >
                <template #prefix>
                  <el-icon><UserFilled /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input
                  v-model="accountInfo.email"
                  disabled
                  class="custom-input"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input
                  v-model="accountInfo.phone"
                  class="custom-input"
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item class="form-actions">
              <el-button type="primary" @click="updateAccountInfo" class="submit-button">
                <el-icon><Check /></el-icon>
                更新信息
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码标签页 -->
        <el-tab-pane label="修改密码" name="password">
          <div class="tab-header">
            <div class="tab-icon warning">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="tab-info">
              <h3>密码设置</h3>
              <p>更改您的账户密码</p>
            </div>
          </div>

          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px" class="custom-form">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="custom-input"
                  show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="custom-input"
                  show-password
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="custom-input"
                  show-password
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item class="form-actions">
              <el-button type="warning" @click="changePassword" class="submit-button">
                <el-icon><RefreshRight /></el-icon>
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 更改邮箱标签页 -->
        <el-tab-pane label="更改邮箱" name="email">
          <div class="tab-header">
            <div class="tab-icon info">
              <el-icon><Message /></el-icon>
            </div>
            <div class="tab-info">
              <h3>邮箱设置</h3>
              <p>更改您的账户关联邮箱</p>
            </div>
          </div>

          <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="120px" class="custom-form">
            <el-form-item label="当前邮箱">
              <el-input
                  :value="profile.email || '未认证'"
                  disabled
                  class="custom-input"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="新邮箱" prop="newEmail">
              <el-input
                  v-model="emailForm.newEmail"
                  class="custom-input"
              >
                <template #prefix>
                  <el-icon><EditPen /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="旧邮箱验证码" prop="oldCode">
              <el-input
                  v-model="emailForm.oldCode"
                  class="custom-input"
              >
                <template #prefix>
                  <el-icon><Stamp /></el-icon>
                </template>
                <template #append>
                  <el-button
                      @click="sendOldEmailCode"
                      :disabled="oldCodeSent"
                      class="code-button"
                  >
                    {{ oldCodeSent ? `重新发送 (${oldCodeCountdown}s)` : '发送验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="新邮箱验证码" prop="newCode">
              <el-input
                  v-model="emailForm.newCode"
                  class="custom-input"
              >
                <template #prefix>
                  <el-icon><Stamp /></el-icon>
                </template>
                <template #append>
                  <el-button
                      @click="sendNewEmailCode"
                      :disabled="newCodeSent || !emailForm.newEmail"
                      class="code-button"
                  >
                    {{ newCodeSent ? `重新发送 (${newCodeCountdown}s)` : '发送验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item class="form-actions">
              <el-button type="primary" @click="changeEmail" class="submit-button">
                <el-icon><Check /></el-icon>
                更改邮箱
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import { User, Check, UserFilled, Message, Lock, Key, Phone, RefreshRight, EditPen, Stamp} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axiosInstance from "../../axios/index";

const store = useStore()
const router = useRouter()

const oldCodeSent = ref(false)
const newCodeSent = ref(false)
const oldCodeCountdown = ref(60)
const newCodeCountdown = ref(60)
const activeTab = ref('info')

const accountInfo = reactive({
  username: '',
  email: '',
  phone: ''
})

const phoneRules = {
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^\d{1,11}$/, message: '电话号码为不超过11位的数字', trigger: 'blur' }
  ]
}

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [
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

const profile = computed(() => store.state.admin || {})

// 获取用户信息
const fetchAccountInfo = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/selectMyInfo')
    accountInfo.username = response.data.username
    accountInfo.email = response.data.email
    accountInfo.phone = response.data.phone
  } catch (error) {
    ElMessage({
      message: '获取用户信息失败',
      type: 'error'
    })
  }
}

// 更新用户信息
const updateAccountInfo = async () => {
  //检验手机号是否合法
  if (!/^1[3456789]\d{9}$/.test(accountInfo.phone)) {
    ElMessage({
      message: '手机号不合法',
      type: 'error'
    })
    return
  }
  try {
    await axiosInstance.post('/api/admin/updateMyEmailAndPhone', {
      email: accountInfo.email,
      phone: accountInfo.phone
    })
    ElMessage({
      message: '账户信息已更新',
      type: 'success'
    })
  } catch (error) {
    ElMessage({
      message: '更新账户信息失败',
      type: 'error'
    })
  }
}

// 修改密码
const passwordFormRef = ref(null);

const changePassword = () => {
  passwordFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await axiosInstance.post('/api/admin/updateMyPassword', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        });
        ElMessage({
          message: '密码已修改',
          type: 'success'
        });
      } catch (error) {
        ElMessage({
          message: '修改密码失败',
          type: 'error'
        });
      }
    }
  });
};

// 发送旧邮箱验证码
const sendOldEmailCode = async () => {
  try {
    await axiosInstance.post('/api/admin_manage/sendOldEmailCode', {}, {
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
    await axiosInstance.post('/api/admin_manage/sendNewEmailCode', { newEmail: emailForm.newEmail }, {
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

// 更改邮箱
const changeEmail = async () => {
  try {
    await axiosInstance.post('/api/admin_manage/changeEmail', emailForm, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('邮箱已成功更改')
  } catch (error) {
    console.error(error)
    ElMessage.error('更改邮箱失败')
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

// 在组件挂载时获取用户信息
onMounted(() => {
  fetchAccountInfo()
})
</script>

<style scoped>
.account-management-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.account-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 1rem;
}

.account-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.custom-tabs {
  padding: 1rem;
}

.tab-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  margin-right: 1rem;
}

.tab-icon.warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.tab-icon.info {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.tab-info h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--el-text-color-primary);
}

.tab-info p {
  margin: 0.25rem 0 0;
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
}

.custom-form {
  max-width: 600px;
  margin: 0 auto;
}

.custom-input {
  --el-input-hover-border-color: var(--el-color-primary);
  --el-input-focus-border-color: var(--el-color-primary);
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.submit-button {
  min-width: 120px;
  padding: 12px 24px;
  font-size: 1rem;
}

.submit-button :deep(.el-icon) {
  margin-right: 4px;
}

.code-button {
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .account-management-container {
    margin: 1rem auto;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .custom-form {
    padding: 0 1rem;
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

  .tab-header {
    flex-direction: column;
    text-align: center;
  }

  .tab-icon {
    margin: 0 0 1rem 0;
  }
}

/* Element Plus 样式优化 */
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--el-border-color-light);
}

:deep(.el-tabs__item) {
  font-size: 1rem;
  padding: 0 1.5rem;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

/* 动画效果 */
.account-card {
  transition: transform 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
}

.tab-header {
  animation: fadeIn 0.5s ease-out;
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