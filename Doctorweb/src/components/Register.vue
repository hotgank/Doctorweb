<template>
  <div class="register">
    <h1>医生注册</h1>
    <el-form :model="form" :rules="rules" ref="registerForm" label-width="120px">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input type="password" v-model="form.confirmPassword"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="verificationCode">
        <el-input v-model="form.verificationCode" class="w-3/5"></el-input>
        <el-button type="primary" class="ml-2" @click="sendVerificationCode" :disabled="isCodeSent">
          {{ codeBtnText }}
        </el-button>
      </el-form-item>
      <el-form-item label="医院" prop="hospital">
        <el-select v-model="form.hospital" placeholder="请选择医院" @change="handleHospitalChange">
          <el-option
            v-for="hospital in hospitals"
            :key="hospital.hospitalName"
            :label="hospital.hospitalName"
            :value="hospital.hospitalName"
          ></el-option>
        </el-select>
        <div v-if="selectedHospitalAddress" class="text-sm text-gray-500 mt-1">
          {{ selectedHospitalAddress }}
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">注册</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
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
          router.push('/login')
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
.register {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #409EFF;
  margin-bottom: 30px;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-button {
  width: 100%;
}
</style>