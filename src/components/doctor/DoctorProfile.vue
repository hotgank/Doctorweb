<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1 class="page-title">编辑个人资料</h1>
      <p class="subtitle">完善您的个人信息，让患者更好地了解您</p>
    </div>

    <el-card class="profile-card">
      <el-form
          :model="profile"
          label-width="120px"
          :rules="rules"
          ref="formRef"
          class="profile-form"
      >
        <!-- 基本信息部分 -->
        <div class="form-section">
          <h2 class="section-title">
            <el-icon><User /></el-icon>
            基本信息
          </h2>

          <div class="form-grid">
            <el-form-item label="姓名" prop="name">
              <el-input
                  v-model="profile.name"
                  placeholder="未填写"
                  :prefix-icon="UserFilled"
                  class="custom-input"
              />
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input
                  v-model="profile.username"
                  disabled
                  placeholder="未填写"
                  :prefix-icon="User"
                  class="custom-input"
              />
            </el-form-item>

            <el-form-item label="电话" prop="phone">
              <el-input
                  v-model="profile.phone"
                  placeholder="未填写"
                  :prefix-icon="Phone"
                  class="custom-input"
              />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input
                  v-model="profile.email"
                  disabled
                  :placeholder="profile.email || '未认证'"
                  :prefix-icon="Message"
                  class="custom-input"
              />
            </el-form-item>

            <el-form-item label="出生日期" prop="birthdate">
              <el-date-picker
                  v-model="profile.birthdate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="x"
                  :disabled-date="disabledDate"
                  class="custom-date-picker"
              />
            </el-form-item>

            <el-form-item label="性别" prop="gender">
              <el-select
                  v-model="profile.gender"
                  placeholder="未填写"
                  class="custom-select"
              >
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 职业信息部分 -->
        <div class="form-section">
          <h2 class="section-title">
            <el-icon><Briefcase /></el-icon>
            职业信息
          </h2>

          <div class="form-grid">
            <el-form-item label="职位">
              <el-input
                  v-model="profile.position"
                  disabled
                  :placeholder="profile.position || '未认证'"
                  :prefix-icon="Medal"
                  class="custom-input"
              />
            </el-form-item>

            <el-form-item label="工作单位">
              <el-input
                  v-model="profile.workplace"
                  disabled
                  :placeholder="profile.workplace || '未认证'"
                  :prefix-icon="OfficeBuilding"
                  class="custom-input"
              />
            </el-form-item>

            <el-form-item label="资格">
              <el-input
                  v-model="profile.qualification"
                  disabled
                  :placeholder="profile.qualification || '未认证'"
                  :prefix-icon="CircleCheck"
                  class="custom-input"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 工作经验部分 -->
        <div class="form-section">
          <h2 class="section-title">
            <el-icon><Memo /></el-icon>
            工作经验
          </h2>

          <el-form-item label="工作经验" prop="experience">
            <el-input
                type="textarea"
                v-model="profile.experience"
                :rows="5"
                placeholder="请详细描述您的工作经验..."
                class="custom-textarea"
            />
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button
              type="primary"
              @click="handleSubmit"
              class="submit-button"
          >
            <el-icon><Check /></el-icon>
            保存更改
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import {
  User,
  UserFilled,
  Phone,
  Message,
  Medal,
  OfficeBuilding,
  CircleCheck,
  Briefcase,
  Memo,
  Check
} from '@element-plus/icons-vue'

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
    { pattern: /^\d{1,11}$/, message: '电话号码为不超过11位的数字', trigger: 'blur' }
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

const disabledDate = (time) => {
  return time.getTime() > Date.now()
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
    if (error.response?.status === 400 && error.response.data === "Username already exists") {
      console.error('Update failed:', error.response.data)
      ElMessage.error('用户名已存在')
    } else {
      console.error('Failed to update doctor information:', error)
      ElMessage.error('更新个人资料失败')
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

.profile-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.profile-form {
  padding: 1rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* 输入框样式 */
.custom-input :deep(.el-input__wrapper) {
  padding: 8px 12px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #94a3b8;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.custom-input :deep(.el-input__inner) {
  color: #2c3e50;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #94a3b8;
}

/* 禁用状态的输入框 */
.custom-input :deep(.el-input.is-disabled .el-input__wrapper) {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

/* 日期选择器样式 */
.custom-date-picker {
  width: 100%;
}

.custom-date-picker :deep(.el-input__wrapper) {
  padding: 8px 12px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

/* 下拉选择器样式 */
.custom-select {
  width: 100%;
}

.custom-select :deep(.el-input__wrapper) {
  padding: 8px 12px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

/* 文本域样式 */
.custom-textarea :deep(.el-textarea__inner) {
  padding: 12px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
  min-height: 120px;
}

.custom-textarea :deep(.el-textarea__inner:hover) {
  border-color: #94a3b8;
}

.custom-textarea :deep(.el-textarea__inner:focus) {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

/* 表单操作区域 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.submit-button {
  padding: 12px 32px;
  font-size: 1rem;
  border-radius: 8px;
  background: #3498db;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-button:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-container {
    margin: 1rem auto;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-card {
    border-radius: 12px;
  }

  .form-section {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 1.1rem;
  }
}
</style>

