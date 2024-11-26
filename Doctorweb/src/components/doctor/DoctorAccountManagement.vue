<template>
  <div class="account-management">
    <h1 class="mb-4">账户管理</h1>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input v-model="passwordForm.oldPassword" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePassword">修改密码</el-button>
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
                action="/api/api/doctorlicense/insert"
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
        <el-table :data="licenseStatus" style="width: 100%">
          <el-table-column prop="doctorId" label="用户ID" width="280"></el-table-column>
          <el-table-column prop="status" label="状态" width="100"></el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="120"></el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="120"></el-table-column>
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
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
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

const sendOldEmailCode = async () => {
  try {
    await axiosInstance.post('/api/doctor_manage/sendOldEmailCode', {}, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('验证码已发送到您的旧邮箱')
    oldCodeSent.value = true
    startCountdown('oldCode')
  } catch (error) {
    ElMessage.error('发送验证码失败')
  }
}

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
    ElMessage.error('发送验证码失败')
  }
}

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

const getLicenseStatus = async () => {
  try {
    const response = await axiosInstance.get('/api/doctorlicense/myLicense', {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    /**
     * if (response.data && response.data.length > 0) {
     *       licenseStatus.value = response.data[0]
     *     }
     */
    licenseStatus.value = response.data;
    //遍历，把createdAt和updatedAt转换为日期格式，只要年月日
    licenseStatus.value.forEach(item => {
      item.createdAt = new Date(item.createdAt).toLocaleDateString()
      item.updatedAt = new Date(item.updatedAt).toLocaleDateString()
    })
  } catch (error) {
    ElMessage.error('获取执照状态失败')
  }
}

const getLicenseImageUrl = (url) => {
  return `/api/api/url/getLicenseImage?url=${encodeURIComponent(url)}`
}

const handleUploadSuccess = (response, file, fileList) => {
  ElMessage.success('执照上传成功')
  getLicenseStatus()
}

const handleUploadError = (error, file, fileList) => {
  ElMessage.error('执照上传失败')
}

const changeEmail = async () => {
  try {
    await axiosInstance.post('/api/doctor_manage/changeEmail', emailForm, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('邮箱已成功更改')
  } catch (error) {
    ElMessage.error('更改邮箱失败')
  }
}

const changePassword = async () => {
  try {
    await axiosInstance.post('/api/doctor_manage/updatePassword', passwordForm, {
      headers: { Authorization: `Bearer ${store.state.token}` }
    })
    ElMessage.success('密码修改成功')
  } catch (error) {
    ElMessage.error('修改密码失败')
  }
}

const deactivateAccount = async () => {
  try {
    await axiosInstance.post('/api/doctor_manage/deactivateAccount', deactivateForm, {
      headers: { Authorization: `Bearer ${store.state.token}`}
    })
    ElMessage.success('账户已注销')
    store.dispatch('logout')
    router.push('/login')
  } catch (error) {
    ElMessage.error('账户注销失败')
  }
}

onMounted(() => {
  getLicenseStatus()
})
</script>

<style scoped>
.account-management {
  max-width: 600px;
  margin: 0 auto;
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