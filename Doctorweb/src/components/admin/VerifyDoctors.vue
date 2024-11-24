<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">检验医生资格</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchTerm"
            placeholder="搜索医生ID或姓名"
            clearable
            @clear="clearSearch"
            class="w-64 sm:w-80"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
          <!-- 搜索按钮 -->
          <el-button @click="onSearch" type="primary" class="ml-2">
            搜索
          </el-button>
        </div>
      </div>
    </el-header>
    
    <el-main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 医生表格 -->
      <el-table 
        :data="displayedDoctors" 
        style="width: 100%"
        :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
        :row-class-name="tableRowClassName"
        v-loading="loading"
      >
        <el-table-column prop="index" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="gender" label="性别" width="80"></el-table-column>
        <el-table-column prop="position" label="职位" width="120"></el-table-column>
        <el-table-column prop="workplace" label="工作单位" min-width="200"></el-table-column>
        <el-table-column label="详情" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openDetails(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据提示 -->
      <el-empty v-if="displayedDoctors.length === 0" description="没有待审核的医生"></el-empty>
    </el-main>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="医生详情"
      width="50%"
      :before-close="handleClose"
    >
      <div v-if="selectedDoctor">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="医生ID">{{ selectedDoctor.doctorId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedDoctor.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ selectedDoctor.gender }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ selectedDoctor.position }}</el-descriptions-item>
          <el-descriptions-item label="工作单位">{{ selectedDoctor.workplace }}</el-descriptions-item>
        </el-descriptions>
        <div class="cert-image mt-4">
          <h4 class="text-lg font-medium mb-2">医师资格证图片：</h4>
          <el-image
            v-if="doctorImage"
            :src="doctorImage"
            fit="cover"
            class="w-48 h-48 object-cover rounded"
          />
          <div v-else class="w-48 h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            图片加载错误或不存在
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="success" @click="approveDoctor">认证成功</el-button>
          <el-button type="danger" @click="openRejectDialog">打回认证</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 打回认证对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="打回认证"
      width="30%"
    >
      <el-form :model="rejectForm">
        <el-form-item label="打回原因">
          <el-input
            v-model="rejectForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入打回原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject">确认打回</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index';

const doctors = ref([])
const displayedDoctors = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const selectedDoctor = ref(null)
const searchTerm = ref('')
const doctorImage = ref(null)
const rejectForm = ref({
  comment: ''
})

const fetchDoctors = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get('/api/verifyDoctor/selectAll')
    doctors.value = response.data.map((doctor, idx) => ({
      ...doctor,
      index: idx + 1 // 添加自定义行号
    }));
    displayedDoctors.value = [...doctors.value]
  } catch (error) {
    console.error('获取医生数据失败:', error)
    ElMessage.error('获取医生数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDoctors)

const onSearch = () => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term === '') {
    displayedDoctors.value = [...doctors.value]
  } else {
    displayedDoctors.value = doctors.value.filter(doctor => {
      const idMatch = doctor.index.toString().includes(term)
      const nameMatch = doctor.name.toLowerCase().includes(term)
      return idMatch || nameMatch
    })
  }
}

const clearSearch = () => {
  searchTerm.value = ''
  displayedDoctors.value = [...doctors.value]
}

const openDetails = async (doctor) => {
  selectedDoctor.value = { ...doctor }
  dialogVisible.value = true
  doctorImage.value = null

  try {
  // 构建完整的 URL
  const imageUrl = `http://localhost:8080/LicenseImage/${doctor.doctorId}.png`;

  // 发送请求
  const response = await axiosInstance.get(`/api/url/getLicenseImage?url=${encodeURIComponent(imageUrl)}`, {
    responseType: 'blob'  // 设置响应类型为 blob
  });

  if (response.data) {
    // 将 Blob 数据转换为可展示的 URL
    const blob = new Blob([response.data], { type: 'image/png' });
    const imageUrl = URL.createObjectURL(blob);

    // 将生成的 URL 赋值给 imageSrc 用于显示图片
    doctorImage.value = imageUrl;
    console.log('Image URL:', imageUrl);
    ElMessage.success('获取医生图片成功');
  }
} catch (error) {
  console.error('获取医生图片失败:', error);
  ElMessage.error('获取医生图片失败');
}
}


const handleClose = () => {
  dialogVisible.value = false
  selectedDoctor.value = null
  doctorImage.value = null
}

const approveDoctor = async () => {
  try {
    await axiosInstance.post('/api/verifyDoctor/approve', { auditId: selectedDoctor.value.auditId })
    ElMessage({
      message: `已认证医生 ${selectedDoctor.value.name} 的资格`,
      type: 'success',
    })
    handleClose()
    fetchDoctors() // 刷新医生列表
  } catch (error) {
    console.error('审核通过失败:', error)
    ElMessage.error('审核通过失败，请稍后重试')
  }
}

const openRejectDialog = () => {
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.value.comment.trim()) {
    ElMessage.warning('请输入打回原因')
    return
  }

  try {
    await axiosInstance.post('/api/verifyDoctor/reject', {
      auditId: selectedDoctor.value.auditId,
      comment: rejectForm.value.comment
    })
    ElMessage({
      message: `已打回医生 ${selectedDoctor.value.name} 的资格认证申请`,
      type: 'warning',
    })
    rejectDialogVisible.value = false
    handleClose()
    fetchDoctors() // 刷新医生列表
  } catch (error) {
    console.error('审核拒绝失败:', error)
    ElMessage.error('审核拒绝失败，请稍后重试')
  }
}

const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'bg-gray-50' : ''
}
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
}

.el-table {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer .el-button {
  margin-left: 10px;
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

:deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>