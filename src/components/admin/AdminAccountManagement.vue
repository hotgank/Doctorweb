<template>
  <div class="account-management">
    <h1 class="mb-4">账户管理</h1>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="账户信息" name="info">
        <el-form :model="accountInfo" label-width="120px" :rules="phoneRules">
          <el-form-item label="用户名">
            <el-input v-model="accountInfo.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="accountInfo.email" disabled></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="accountInfo.phone"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateAccountInfo">更新信息</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input v-model="passwordForm.currentPassword" type="password"></el-input>
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
    </el-tabs>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
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
.account-management {
  max-width: 600px;
  margin: 0 auto;
}
</style>
