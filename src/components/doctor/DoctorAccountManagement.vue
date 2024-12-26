<template>
  <div class="account-management">
    <h1 class="mb-4">账户管理</h1>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="$refs.passwordFormRef.validate().then(valid => { if (valid) changePassword() })">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="更改邮箱" name="email">
        <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="120px">
          <el-form-item label="当前邮箱">
            <el-input :value="profile.email || '未认证'" disabled></el-input>
          </el-form-item>
          <el-form-item label="新邮箱" prop="newEmail">
            <el-input v-model="emailForm.newEmail"></el-input>
          </el-form-item>
          <el-form-item label="旧邮箱验证码" prop="oldCode">
            <el-input v-model="emailForm.oldCode">
              <template #append>
                <el-button @click="sendOldEmailCode" :disabled="oldCodeSent">
                  {{ oldCodeSent ? `重新发送 (${oldCodeCountdown}s)` : '发送验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="新邮箱验证码" prop="newCode">
            <el-input v-model="emailForm.newCode">
              <template #append>
                <el-button @click="sendNewEmailCode" :disabled="newCodeSent || !emailForm.newEmail">
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
        <el-form :model="verificationForm" label-width="120px">
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
        <h4>历史记录</h4>
        <el-table :data="licenseStatus" style="width: 100%">
          <el-table-column prop="status" label="状态" width="100"></el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="120"></el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="120"></el-table-column>
          <el-table-column prop="comment" label="管理员留言" width="300"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="注销账户" name="deactivate">
        <el-alert
            title="警告：注销账户将永久删除您的所有数据，此操作不可逆！"
            type="warning"
            :closable="false"
        >
        </el-alert>
        <el-form :model="deactivateForm" :rules="deactivateRules" ref="deactivateFormRef" label-width="120px" class="mt-4">
          <el-form-item label="密码" prop="password">
            <el-input v-model="deactivateForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="deleteCode">
            <el-input v-model="deactivateForm.deleteCode">
              <template #append>
                <el-button @click="sendDeleteCode" :disabled="deleteCodeSent">
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
  max-width: 700px;
  margin: 0 auto;
}


:deep(.el-table th) {
  font-weight: bold;
  font-size: 16px;
  color: #111827;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
}

:deep(.el-table tbody tr:hover) {
  background-color: #f9fafb;
  cursor: pointer;
}

:deep(.el-dialog__footer button) {
  padding: 10px 20px;
  transition: all 0.2s ease;
}
:deep(.el-dialog__footer button:hover) {
  transform: scale(1.05);
}

:deep(.el-input__inner::-webkit-input-placeholder) {
  color: #a1a1aa;
}
:deep(.el-input__inner:focus::-webkit-input-placeholder) {
  color: transparent;
}
:deep(.el-button--primary.create-button) {
  background-color: #10b981;
  border-color: #10b981;
  shape-outside: circle();
}

/* 自定义 Element Plus 样式 */
:deep(.el-button--primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

:deep(.el-button--primary:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

:deep(.el-tabs__item.is-active) {
  color: #3b82f6;
}

:deep(.el-tabs__active-bar) {
  background-color: #3b82f6;
}
</style>
