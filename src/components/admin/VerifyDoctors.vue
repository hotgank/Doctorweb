<template>
  <div class="verify-doctors">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><Service /></el-icon>
          <h1 class="page-title">医生资格审核</h1>
          <el-tag type="info" class="doctor-count">
            待审核：{{ displayedDoctors.length }}
          </el-tag>
        </div>

        <div class="search-section">
          <el-input
              v-model="searchTerm"
              placeholder="搜索医生ID或姓名"
              clearable
              @clear="clearSearch"
              class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-button
              type="primary"
              @click="onSearch"
              class="search-button"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="table-container">
        <el-table
            :data="displayedDoctors"
            style="width: 100%"
            :header-cell-style="tableHeaderStyle"
            :row-class-name="tableRowClassName"
            v-loading="loading"
        >
          <!-- 序号列 -->
          <el-table-column
              type="index"
              label="序号"
              width="80"
              align="center"
          >
            <template #default="scope">
              <span class="index-badge">{{ scope.$index + 1 }}</span>
            </template>
          </el-table-column>

          <!-- 姓名列 -->
          <el-table-column
              prop="name"
              label="姓名"
              width="120"
          >
            <template #default="scope">
              <div class="doctor-info">
                <span class="doctor-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 性别列 -->
          <el-table-column
              prop="gender"
              label="性别"
              width="80"
              align="center"
          >
            <template #default="scope">
              <el-tag
                  :type="scope.row.gender === '男' ? 'info' : 'danger'"
                  effect="plain"
                  size="small"
              >
                {{ scope.row.gender }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 职位列 -->
          <el-table-column
              prop="position"
              label="职位"
              width="150"
          >
            <template #default="scope">
              <div class="position-info">
                <el-icon><UserFilled /></el-icon>
                <span>{{ scope.row.position || '待定' }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 工作单位列 -->
          <el-table-column
              prop="workplace"
              label="工作单位"
              min-width="200"
          >
            <template #default="scope">
              <div class="workplace-info">
                <el-icon><OfficeBuilding /></el-icon>
                <span>{{ scope.row.workplace }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column
              label="操作"
              width="120"
              align="center"
              fixed="right"
          >
            <template #default="scope">
              <el-tooltip
                  content="查看详情"
                  placement="top"
              >
                <el-button
                    type="primary"
                    circle
                    @click="openDetails(scope.row)"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>

          <!-- 空状态 -->
          <template #empty>
            <el-empty
                description="暂无待审核的医生"
                :image-size="200"
            >
              <template #description>
                <p class="empty-text">暂无待审核的医生申请</p>
                <p class="empty-hint">新的申请将在这里显示</p>
              </template>
            </el-empty>
          </template>
        </el-table>
      </div>
    </main>

    <!-- 医生详情对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="医生资格审核"
        width="700px"
        class="doctor-dialog"
        :before-close="handleClose"
        destroy-on-close
    >
      <div v-if="selectedDoctor" class="doctor-details">
        <!-- 基本信息部分 -->
        <div class="details-section">
          <h3 class="section-title">
            <el-icon><User /></el-icon>
            基本信息
          </h3>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="医生ID">
              <span class="info-text">{{ selectedDoctor.doctorId }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="姓名">
              <span class="info-text">{{ selectedDoctor.name }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="性别">
              <el-tag
                  :type="selectedDoctor.gender === '男' ? 'info' : 'danger'"
                  effect="plain"
              >
                {{ selectedDoctor.gender }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="工作单位">
              <span class="info-text">{{ selectedDoctor.workplace }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 职位选择部分 -->
        <div class="details-section">
          <h3 class="section-title">
            <el-icon><Briefcase /></el-icon>
            职位信息
          </h3>

          <div class="position-selection">
            <el-form :model="selectedDoctor" label-width="100px">
              <el-form-item label="职位类别">
                <el-select
                    v-model="selectedDoctor.positionCategory"
                    placeholder="选择职位大类"
                    class="category-select"
                    @change="updatePositionOptions"
                >
                  <el-option
                      v-for="category in positionCategories"
                      :key="category.value"
                      :label="category.label"
                      :value="category.value"
                  >
                    <div class="select-option">
                      <el-icon><UserFilled /></el-icon>
                      <span>{{ category.label }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="具体职位">
                <el-select
                    v-model="selectedDoctor.position"
                    placeholder="选择具体职位"
                    class="position-select"
                >
                  <el-option
                      v-for="position in filteredPositions"
                      :key="position"
                      :label="position"
                      :value="position"
                  >
                    <div class="select-option">
                      <el-icon><Medal /></el-icon>
                      <span>{{ position }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 资格证书部分 -->
        <div class="details-section">
          <h3 class="section-title">
            <el-icon><Document /></el-icon>
            资格证书
          </h3>

          <div class="certificate-preview">
            <el-image
                v-if="doctorImage"
                :src="doctorImage"
                fit="contain"
                :preview-src-list="[doctorImage]"
                class="cert-image"
            >
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>加载中...</span>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon><PictureRounded /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </div>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button
              type="success"
              @click="approveDoctor"
          >
            <el-icon><Check /></el-icon>
            通过审核
          </el-button>
          <el-button
              type="danger"
              @click="openRejectDialog"
          >
            <el-icon><Close /></el-icon>
            打回申请
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 打回原因对话框 -->
    <el-dialog
        v-model="rejectDialogVisible"
        title="打回申请"
        width="500px"
        class="reject-dialog"
        append-to-body
    >
      <div class="reject-content">
        <el-alert
            title="请填写打回原因"
            type="warning"
            description="详细说明打回原因，帮助申请人了解需要改进的地方。"
            show-icon
            :closable="false"
            class="reject-alert"
        />

        <el-form
            :model="rejectForm"
            class="reject-form"
        >
          <el-form-item>
            <el-input
                v-model="rejectForm.comment"
                type="textarea"
                :rows="4"
                placeholder="请输入打回原因..."
                resize="none"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button
              type="danger"
              @click="confirmReject"
          >
            确认打回
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Service, UserFilled, OfficeBuilding, View, User, Briefcase, Medal, Document, PictureRounded, Check, Close, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index'

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

// 职位大类和小类
const positionCategories = [
  { label: '执业医师', value: 'licensedDoctor' },
  { label: '助理执业医师', value: 'assistantDoctor' },
  { label: '专科医生', value: 'specialistDoctor' },
  { label: '中医执业医师', value: 'traditionalChineseDoctor' },
]

const positions = {
  licensedDoctor: [
    '内科医师', '外科医师', '儿科医师', '妇产科医师', '麻醉科医师',
    '眼科医师', '口腔科医师', '急诊科医师', '肿瘤科医师', '皮肤科医师'
  ],
  assistantDoctor: [
    '助理内科医师', '助理外科医师', '助理儿科医师', '助理妇产科医师'
  ],
  specialistDoctor: [
    '心血管专科医师', '消化专科医师', '肾脏专科医师', '神经科专科医师'
  ],
  traditionalChineseDoctor: [
    '中医内科医师', '中医外科医师', '中医针灸医师'
  ],
}

const filteredPositions = ref([])

// 获取医生列表数据
const fetchDoctors = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get('/api/verifyDoctor/selectAll')
    doctors.value = response.data.map((doctor, idx) => ({
      ...doctor,
      index: idx + 1 // 添加自定义行号
    }))
    displayedDoctors.value = [...doctors.value]
  } catch (error) {
    console.error('获取医生数据失败:', error)
    ElMessage.error('获取医生数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDoctors)

// 搜索医生
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

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
  displayedDoctors.value = [...doctors.value]
}

// 更新职位小类选项
const updatePositionOptions = (category) => {
  filteredPositions.value = positions[category] || []
}

// 打开医生详情
const openDetails = async (doctor) => {
  selectedDoctor.value = { ...doctor }
  dialogVisible.value = true
  doctorImage.value = null

  // 设置职位类别默认值
  if (selectedDoctor.value.positionCategory) {
    updatePositionOptions(selectedDoctor.value.positionCategory)
  }

  // 获取医生资格证图片
  if (selectedDoctor.value.url) {
    await getDoctorImage(selectedDoctor.value.url)
  }
}

// 审核通过
const approveDoctor = async () => {
  // 在提交之前检查并确保 selectedDoctor.position 是正确的
  if (!selectedDoctor.value.position || !selectedDoctor.value.position.trim()) {
    ElMessage.warning('职位不能为空，请填写职位后再提交')
    return
  }

  try {
    const data = {
      auditId: selectedDoctor.value.auditId,
      position: selectedDoctor.value.position, // 提交时确保使用 selectedDoctor.position
    }

    await axiosInstance.post('/api/verifyDoctor/approve', JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    ElMessage({
      message: `已认证医生 ${selectedDoctor.value.name} 的资格`,
      type: 'success',
    })

    handleClose()
    await fetchDoctors() // 刷新医生列表
  } catch (error) {
    console.error('审核通过失败:', error)
    ElMessage.error('审核通过失败，请稍后重试')
  }
}

// 打开打回认证对话框
const openRejectDialog = () => {
  rejectDialogVisible.value = true
}

// 打回认证
const confirmReject = async () => {
  if (!rejectForm.value.comment || !rejectForm.value.comment.trim()) {
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
    await fetchDoctors() // 刷新医生列表
  } catch (error) {
    console.error('审核拒绝失败:', error)
    ElMessage.error('审核拒绝失败，请稍后重试')
  }
}

// 关闭详情对话框
const handleClose = () => {
  dialogVisible.value = false
  selectedDoctor.value = null
  doctorImage.value = null
}

// 获取医生资格证图片
const getDoctorImage = async (url) => {
  try {
    const response = await axiosInstance.get(`/api/url/getLicenseImage?url=${encodeURIComponent(url)}`, {
      responseType: 'blob'  // 设置响应类型为 blob
    })

    if (response.data) {
      const blob = new Blob([response.data], { type: 'image/png' })
      const imageUrl = URL.createObjectURL(blob)
      doctorImage.value = imageUrl
      ElMessage.success('获取医生图片成功')
    }
  } catch (error) {
    console.error('获取医生图片失败:', error)
    ElMessage.error('获取医生图片失败')
  }
}

// 表格行样式
const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'bg-gray-50' : ''
}
</script>

<style scoped>
/* 页面容器 */
.verify-doctors {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 页面头部 */
.page-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.doctor-count {
  padding: 4px 8px;
  font-size: 14px;
}

.search-section {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 300px;
}

/* 主要内容区域 */
.main-content {
  max-width: 1400px;
  margin: 24px auto;
  padding: 0 24px;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
.index-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  border-radius: 12px;
  font-weight: 500;
}

.id-text {
  font-family: monospace;
  color: #606266;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doctor-avatar {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
}

.doctor-name {
  font-weight: 500;
}

.position-info,
.workplace-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

/* 医生详情对话框 */
.doctor-details {
  padding: 0 20px;
}

.details-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.info-text {
  color: #2c3e50;
  font-weight: 500;
}

.position-selection {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.category-select,
.position-select {
  width: 100%;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.certificate-preview {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.cert-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.image-placeholder,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f1f5f9;
  border-radius: 4px;
  color: #94a3b8;
  gap: 8px;
}

/* 打回原因对话框 */
.reject-content {
  padding: 0 20px;
}

.reject-alert {
  margin-bottom: 20px;
}

.reject-form {
  margin-top: 20px;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content,
  .main-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .search-section {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .table-container {
    padding: 12px;
  }

  .doctor-dialog {
    width: 90% !important;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 16px 0;
  }

  .header-content {
    padding: 0 16px;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-title {
    font-size: 20px;
  }

  .doctor-details {
    padding: 0 12px;
  }
}
</style>