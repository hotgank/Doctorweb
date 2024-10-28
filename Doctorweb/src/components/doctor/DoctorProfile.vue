<template>
  <div class="profile">
    <h1 class="mb-4">编辑个人资料</h1>
    <el-form :model="profile" label-width="120px">
      <el-form-item label="姓名">
        <el-input v-model="profile.name" />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="profile.gender">
          <el-option label="男" value="male" />
          <el-option label="女" value="female" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄">
        <el-input-number v-model="profile.age" :min="0" :max="120" />
      </el-form-item>
      <!-- 修改职位输入框为只读 -->
      <el-form-item label="职位">
        <el-input v-model="profile.position" readonly />
      </el-form-item>
      <!-- 修改工作单位输入框为只读 -->
      <el-form-item label="工作单位">
        <el-input v-model="profile.workplace" readonly />
      </el-form-item>
      <el-form-item label="相关证明">
        <el-input type="textarea" v-model="profile.certification" readonly />
      </el-form-item>
      <el-form-item label="优秀工作经历">
        <el-input type="textarea" v-model="profile.experience" :rows="5" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存更改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const profile = ref({
  name: '',
  gender: '',
  age: 0,
  position: '',
  workplace: '',
  certification: '',
  experience: '',
})

onMounted(() => {
  // 这里添加获取医生个人资料的逻辑
  // 模拟从API获取数据
  setTimeout(() => {
    profile.value = {
      name: '张医生',
      gender: 'male',
      age: 35,
      position: '儿科主任', // 示例数据
      workplace: '儿童医院', // 示例数据
      certification: '儿科医师资格证',
      experience: '10年儿科诊疗经验',
    }
  }, 1000)
})

const handleSubmit = () => {
  console.log('Profile updated:', profile.value)
  // 这里添加更新个人资料的逻辑
  ElMessage({
    message: '个人资料已更新',
    type: 'success',
  })
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
}
</style>