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
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="120px">
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
        <el-tab-pane label="账户认证" name="verification">
          <el-form :model="verificationForm" label-width="120px">
            <el-form-item label="医师执照号">
              <el-input v-model="verificationForm.licenseNumber"></el-input>
            </el-form-item>
            <el-form-item label="执照图片">
              <el-upload
                class="upload-demo"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :limit="1"
                :on-exceed="handleExceed"
                :file-list="fileList"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <template #tip>
                  <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitVerification">提交认证</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      <el-tab-pane label="注销账户" name="deactivate">
        <el-alert
          title="警告：注销账户将永久删除您的所有数据，此操作不可逆！"
          type="warning"
          :closable="false"
        >
        </el-alert>
        <el-form :model="deactivateForm" :rules="deactivateRules" ref="deactivateForm" label-width="120px" class="mt-4">
          <el-form-item label="密码确认" prop="password">
            <el-input v-model="deactivateForm.password" type="password"></el-input>
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const activeTab = ref('info')

const accountInfo = reactive({
  username: 'doctor_zhang',
  email: 'doctor_zhang@example.com',
  phone: '13800138000'
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

const verificationForm = reactive({
  licenseNumber: ''
})

const fileList = ref([])

const deactivateForm = reactive({
  password: '',
  confirm: false
})

const deactivateRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
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

const updateAccountInfo = () => {
  // 这里应该是一个API调用来更新账户信息
  ElMessage({
    message: '账户信息已更新',
    type: 'success'
  })
}

const changePassword = () => {
  // 这里应该是一个API调用来更改密码
  ElMessage({
    message: '密码已修改',
    type: 'success'
  })
}

const submitVerification = () => {
  // 这里应该是一个API调用来提交认证信息
  ElMessage({
    message: '认证信息已提交，请等待审核',
    type: 'success'
  })
}

const deactivateAccount = () => {
  ElMessageBox.confirm(
    '您确定要注销您的账户吗？此操作将永久删除您的所有数据，且不可逆！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 这里应该是一个API调用来注销账户
      store.dispatch('logout')
      router.push('/login')
      ElMessage({
        type: 'success',
        message: '账户已注销',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消注销',
      })
    })
}

const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

const handlePreview = (file) => {
  console.log(file)
}

const handleExceed = (files, fileList) => {
  ElMessage.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
}

const beforeRemove = (file, fileList) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}
</script>

<style scoped>
.account-management {
  max-width: 600px;
  margin: 0 auto;
}
</style>