<template>
  <div class="patient-report-container">
    <div class="info-section">
      <el-descriptions
          title="患者基本信息"
          :column="2"
          border
          class="info-card"
      >
        <template #extra>
          <el-tag
              :type="getPhysiqueTag(patient.physique)"
              effect="light"
              class="physique-tag"
          >
            {{ patient.physique }}
          </el-tag>
        </template>

        <el-descriptions-item label="用户ID" label-class-name="label-bold">
          <span class="user-id">{{ patient.userId }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="姓名" label-class-name="label-bold">
          <div class="name-wrapper">
            <el-avatar
                :size="40"
                :src="patient.avatarUrl"
                class="user-avatar"
            />
            <span class="user-name">{{ patient.username }}</span>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="年龄" label-class-name="label-bold">
          {{ patient.age }} 岁
        </el-descriptions-item>

        <el-descriptions-item label="性别" label-class-name="label-bold">
          <el-tag
              :type="patient.gender === '男' ? 'info' : 'danger'"
              effect="plain"
              size="small"
          >
            {{ patient.gender }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="recommendation-section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><ChatDots /></el-icon>
          医生建议
        </h3>
      </div>
      <div class="recommendation-content">
        <p>{{ patient.recommendation || '暂无医生建议' }}</p>
      </div>
    </div>

    <div class="reports-section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><ClipboardText /></el-icon>
          检测报告
        </h3>
      </div>

      <div class="table-container">
        <el-table
            :data="patientReports"
            style="width: 100%"
            :header-cell-style="{
            background: '#f8fafc',
            color: '#1e293b',
            fontWeight: '600'
          }"
        >
          <el-table-column prop="createdAt" label="日期" width="180">
            <template #default="scope">
              <div class="date-cell">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(scope.row.createdAt) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="reportType" label="类型" width="140">
            <template #default="scope">
              <el-tag
                  :type="getReportTypeTag(scope.row.reportType)"
                  effect="light"
                  class="type-tag"
              >
                {{ scope.row.reportType }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="state" label="状态" width="120">
            <template #default="scope">
              <el-tag
                  :type="getStateTag(scope.row.state)"
                  effect="plain"
                  class="state-tag"
              >
                {{ scope.row.state }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="result" label="结果" min-width="120">
            <template #default="scope">
              <span class="result-text">{{ scope.row.result }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button
                  type="primary"
                  link
                  class="action-button"
                  @click="viewReportDetails(scope.row)"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
        v-model="showReportDetails"
        title="报告详情"
        width="70%"
        class="report-dialog"
        destroy-on-close
    >
      <div class="report-container">
        <div class="report-header">
          <img src="/img/logo.webp" alt="Logo" class="report-logo">
          <h2 class="report-title">检测报告详情</h2>
        </div>

        <el-form :model="currentReport" label-width="120px" class="report-form">
          <div class="form-grid">
            <el-form-item label="姓名">
              <span class="form-text">{{ currentReport.name }}</span>
            </el-form-item>

              <el-form-item label="性别">
                <span class="form-text">{{ currentReport.gender }}</span>
              </el-form-item>

              <el-form-item label="出生日期">
                <span class="form-text">{{ formatDate2(currentReport.birthdate) }}</span>
              </el-form-item>

              <el-form-item label="身高(cm)">
                <span class="form-text">{{ currentReport.height }}</span>
              </el-form-item>

              <el-form-item label="体重(kg)">
                <span class="form-text">{{ currentReport.weight }}</span>
              </el-form-item>

              <el-form-item label="报告类型">
                <el-tag
                    :type="getReportTypeTag(currentReport.reportType)"
                    effect="light"
                >
                  {{ currentReport.reportType }}
                </el-tag>
              </el-form-item>

              <el-form-item label="状态">
                <el-tag
                    :type="getStateTag(currentReport.state)"
                    effect="plain"
                >
                  {{ currentReport.state }}
                </el-tag>
              </el-form-item>

              <el-form-item label="结果">
                <span class="form-text">{{ currentReport.result }}</span>
              </el-form-item>
          </div>

          <el-form-item label="分析" class="full-width">
            <el-input
                type="textarea"
                v-model="currentReport.analyse"
                :rows="4"
                :disabled
                class="analysis-input"
            ></el-input>
          </el-form-item>

          <el-form-item label="医生评论" class="full-width">
            <el-input
                type="textarea"
                v-model="currentReport.comment"
                :rows="4"
                :readonly="!isEditing"
                class="comment-input"
            ></el-input>
          </el-form-item>

          <el-form-item label="报告图片" class="full-width">
            <div class="image-container">
              <el-image
                  :src="imageSrc"
                  :preview-src-list="[imageSrc]"
                  class="report-image"
              />
            </div>
          </el-form-item>
        </el-form>

        <div class="report-footer">
          <p class="footer-text">报告生成日期：{{ formatDate2(new Date()) }}</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="!isEditing" @click="startEdit" type="primary" plain>
            <el-icon><Edit /></el-icon>
            编辑评论
          </el-button>
          <el-button v-else @click="cancelEdit">取消</el-button>
          <el-button
              type="primary"
              @click="saveReport"
              :disabled="!isEditing"
              :loading="isSaving"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useStore } from 'vuex'
import { ChatDots, ClipboardText, Calendar, View, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  patient: {
    type: Object,
    required: true
  }
})

const store = useStore()

const patientReports = ref([])
const showReportDetails = ref(false)
const currentReport = ref({})
const isEditing = ref(false)
const isSaving = ref(false) // Add loading state
const imageSrc = ref('') // 用于存储报告图片的 URL

const fetchPatientReports = async () => {
  try {
    const response = await axios.post('/api/api/doctor/relation/selectReports',
        { userId: props.patient.userId },
        {
          headers: {
            Authorization: `Bearer ${store.state.token}`  // 携带token
          }
        }
    )
    patientReports.value = response.data
  } catch (error) {
    console.error('Failed to fetch patient reports:', error)
    ElMessage.error('获取患者报告失败')
  }
}

const viewReportDetails = (report) => {
  currentReport.value = report
  showReportDetails.value = true
  fetchReportImage(report.url) // 获取报告图片
}

const fetchReportImage = async (url) => {
  try {
    // 使用 POST 请求获取图片
    const response = await axios.post('api/api/url/getReportImage', { url: url }, {
      responseType: 'blob',  // 获取二进制数据
      headers: {
        Authorization: `Bearer ${store.state.token}`  // 携带 token
      }
    })
    // 将 Blob 数据转换为可展示的 URL
    const blob = response.data
    const imageUrl = URL.createObjectURL(blob)

    // 将生成的 URL 赋值给 imageSrc 用于显示图片
    imageSrc.value = imageUrl
    console.log('Image URL:', imageUrl)
    ElMessage.success('获取报告图片成功')
  } catch (error) {
    console.error('Failed to fetch report image:', error)
    ElMessage.error('获取报告图片失败')
  }
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  currentReport.value = { ...currentReport.value }
}

const saveReport = async () => {
  isSaving.value = true // Set loading state to true
  try {
    const response = await axios.post('/api/api/doctorReport/comment',
        { reportId: currentReport.value.reportId, comment: currentReport.value.comment },
        {
          headers: {
            Authorization: `Bearer ${store.state.token}`
          }
        }
    )
    console.log('Report comment saved successfully:', response.data)
    ElMessage.success('报告评论已保存')
  } catch (error) {
    console.error('Failed to save report comment:', error)
    ElMessage.error('保存报告评论失败')
  } finally {
    isSaving.value = false // Set loading state to false regardless of success or failure
    isEditing.value = false
    showReportDetails.value = false
  }
}

const formatDate = (dateArray) => {
  const [year, month, day, hour, minute, second] = dateArray
  return new Date(year, month - 1, day, hour, minute, second).toLocaleString()
}

const formatDate2 = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const getPhysiqueTag = (physique) => {
  switch (physique) {
    case '偏瘦':
      return 'warning';
    case '标准':
      return 'success';
    case '偏胖':
      return 'danger';
    default:
      return '';
  }
}

const getReportTypeTag = (reportType) => {
  switch (reportType) {
    case '血液检测':
      return 'info';
    case '尿液检测':
      return 'warning';
    case '影像学检查':
      return 'success';
    default:
      return '';
  }
}

const getStateTag = (state) => {
  switch (state) {
    case '已完成':
      return 'success';
    case '进行中':
      return 'info';
    case '异常':
      return 'danger';
    default:
      return '';
  }
}


watch(() => props.patient, (newPatient) => {
  if (newPatient) {
    fetchPatientReports()
  }
}, { immediate: true })

onMounted(() => {
  if (props.patient) {
    fetchPatientReports()
  }
})
</script>


<style scoped>
.patient-report-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: calc(100vh - 48px);
}

.info-section {
  margin-bottom: 32px;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

:deep(.el-descriptions__header) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.label-bold {
  font-weight: 600 !important;
}

.user-id {
  font-family: monospace;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
}

.name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  border: 2px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-name {
  font-weight: 500;
  color: #1e293b;
}

.physique-tag {
  font-size: 13px;
}

.recommendation-section,
.reports-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendation-content {
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

/* 表格样式 */
.table-container {
  margin-bottom: 24px;
}

:deep(.el-table) {
  --el-table-border-color: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
}

.type-tag,
.state-tag {
  font-size: 13px;
}

.result-text {
  color: #1e293b;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 报告对话框样式 */
.report-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.report-container {
  padding: 32px;
  background: white;
}

.report-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.report-logo {
  height: 48px;
  margin-bottom: 16px;
}

.report-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.report-form {
  margin-top: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-text {
  color: #1e293b;
}

.analysis-input,
.comment-input {
  font-size: 14px;
}

.image-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.report-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-footer {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  text-align: right;
}

.footer-text {
  color: #64748b;
  font-size: 14px;
  font-style: italic;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .patient-report-container {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .name-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .patient-report-container {
    background-color: #1a1a1a;
  }

  .info-card,
  .recommendation-section,
  .reports-section {
    background: #262626;
  }

  :deep(.el-descriptions__title) {
    color: #e5e7eb;
  }

  .user-id {
    background: #374151;
    color: #e5e7eb;
  }

  .user-name {
    color: #e5e7eb;
  }

  .section-title {
    color: #e5e7eb;
  }

  .recommendation-content {
    color: #9ca3af;
  }

  .form-text {
    color: #e5e7eb;
  }

  .report-container {
    background: #262626;
  }

  .report-title {
    color: #e5e7eb;
  }
}

/* 动画效果 */
.el-button {
  transition: all 0.2s ease;
}

.el-button:hover {
  transform: translateY(-1px);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>