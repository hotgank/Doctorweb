<template>
  <div class="profile">
    <h1 class="mb-4">编辑个人资料</h1>
    <el-form :model="profile" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="profile.name" placeholder="未填写" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="profile.username" placeholder="未填写" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="profile.phone" placeholder="未填写" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="profile.email" readonly :placeholder="profile.email || '未认证'" />
      </el-form-item>
      <el-form-item label="出生日期" prop="birthdate">
        <el-date-picker
          v-model="profile.birthdate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="x"
        />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="profile.gender" placeholder="未填写">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <el-form-item label="职位">
        <el-input v-model="profile.position" readonly :placeholder="profile.position || '未认证'" />
      </el-form-item>
      <el-form-item label="工作单位">
        <el-input v-model="profile.workplace" readonly :placeholder="profile.workplace || '未认证'" />
      </el-form-item>
      <el-form-item label="资格">
        <el-input v-model="profile.qualification" readonly :placeholder="profile.qualification || '未认证'" />
      </el-form-item>
      <el-form-item label="工作经验" prop="experience">
        <el-input type="textarea" v-model="profile.experience" :rows="5" placeholder="未填写" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存更改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const store = useStore()
const formRef = ref(null)

const profile = computed(() => store.state.doctor || {})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 20, message: '姓名不能超过20个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 20, message: '用户名不能超过20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^\d{1,11}$/, message: '电话号码不能超过11位数字', trigger: 'blur' }
  ],
  birthdate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  experience: [
    { max: 500, message: '工作经验不能超过500个字符', trigger: 'blur' }
  ]
}

const fetchDoctorInfo = async () => {
  try {
    await store.dispatch('fetchDoctorInfo')
  } catch (error) {
    ElMessage.error('获取医生信息失败')
  }
}

onMounted(fetchDoctorInfo)

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const updatedInfo = {
      name: profile.value.name,
      username: profile.value.username,
      phone: profile.value.phone,
      gender: profile.value.gender,
      experience: profile.value.experience,
      birthdate: profile.value.birthdate
    }
    
    const success = await store.dispatch('updateDoctorInfo', updatedInfo)
    
    if (success) {
      ElMessage.success('个人资料已更新')
      setTimeout(fetchDoctorInfo, 3000)
    } else {
      ElMessage.error('更新失败')
    }
  } catch (error) {
    if (error.response.status === 400 && error.response.data === "Username already exists") {
        console.error('Update failed:', error.response.data)
        ElMessage.error('用户名已存在')
    }else{
      console.error('Failed to update doctor information:', error)
    ElMessage.error('更新个人资料失败')
    }
    
  }
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
}
</style>