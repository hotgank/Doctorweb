<template>
  <div class="register">
    <h1 class="mb-4">医生注册</h1>
    <el-form :model="form" :rules="rules" ref="registerForm" label-width="120px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input type="password" v-model="form.confirmPassword"></el-input>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="verificationCode">
        <el-input v-model="form.verificationCode" class="w-3/5"></el-input>
        <el-button type="primary" class="ml-2" @click="sendVerificationCode" :disabled="isCodeSent">
          {{ codeBtnText }}
        </el-button>
      </el-form-item>
      <el-form-item label="医院" prop="hospital">
        <el-select v-model="form.hospital" placeholder="请选择医院">
          <el-option
            v-for="option in hospitalOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">注册</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  verificationCode: '',
  hospital: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
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
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为 6 位', trigger: 'blur' }
  ],
  hospital: [
    { required: true, message: '请选择医院', trigger: 'blur' }
  ]
}

const hospitalOptions = [
  { label: '儿童医院', value: '儿童医院' },
  { label: '第一人民医院', value: '第一人民医院' },
  { label: '第二人民医院', value: '第二人民医院' },
  { label: '第三人民医院', value: '第三人民医院' },
]

const registerForm = ref(null)
const isCodeSent = ref(false)
const countdown = ref(60)

const codeBtnText = computed(() => {
  if (isCodeSent.value) {
    return `重新发送 (${countdown.value}s)`
  }
  return '发送验证码'
})

const sendVerificationCode = () => {
  if (!form.phone) {
    ElMessage.error('请先输入手机号码')
    return
  }

  // 这里应该是一个 API 调用来发送验证码
  console.log('发送验证码到:', form.phone)
  ElMessage.success('验证码已发送，请注意查收')

  isCodeSent.value = true
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
      isCodeSent.value = false
      countdown.value = 60
    }
  }, 1000)
}

const submitForm = () => {
  registerForm.value.validate((valid) => {
    if (valid) {
      // 这里应该是一个 API 调用来注册用户
      console.log('注册表单提交:', form)
      ElMessage({
        message: '注册成功！',
        type: 'success',
      })
      router.push('/login')
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

const resetForm = () => {
  registerForm.value.resetFields()
}
</script>

<style scoped>
.register {
  max-width: 500px;
  margin: 0 auto;
}
</style>