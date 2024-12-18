<template>
  <div class="account-management">
    <h1 class="mb-4">账户管理</h1>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="账户信息" name="info">
        <el-form :model="accountInfo" label-width="120px">
          <el-form-item label="用户名">
            <el-input v-model="accountInfo.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="accountInfo.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号">
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
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axiosInstance from "../../axios/index";

const store = useStore()
const router = useRouter()

const activeTab = ref('info')

const accountInfo = reactive({
  username: '',
  email: '',
  phone: ''
})

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
