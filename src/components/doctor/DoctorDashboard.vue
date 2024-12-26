<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <el-icon class="mr-2"><Monitor /></el-icon>
            医生工作台
          </h1>
          <p class="dashboard-subtitle">欢迎回来，医生！今天是 {{ getCurrentDate() }}</p>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="stats-container">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in stats" :key="index">
        <el-card
            class="stats-card"
            :class="{
            'clickable-card': item.route,
            'rating-card': item.title === '评分',
            [`stats-card-${index + 1}`]: true
          }"
            @click="handleCardClick(item)"
            shadow="hover"
        >
          <div class="stats-card-content">
            <div class="stats-icon-wrapper">
              <el-icon :size="24"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stats-info">
              <h3 class="stats-title">{{ item.title }}</h3>
              <div class="stats-value">{{ item.value }}</div>
              <p class="stats-description">{{ item.description }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="consultation-card">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane name="pending">
          <template #label>
            <div class="tab-label">
              <el-icon><Bell /></el-icon>
              <span>待处理咨询申请</span>
              <el-badge
                  v-if="pendingPatients.length"
                  :value="pendingPatients.length"
                  :max="99"
                  type="danger"
                  class="custom-badge"
              />
            </div>
          </template>

          <el-table
              :data="pendingPatients"
              class="custom-table"
              :header-cell-style="{
              background: '#f5f7fa',
              color: '#333',
              fontWeight: '600'
            }"
          >
            <el-table-column prop="username" label="用户名" min-width="180">
              <template #default="{ row }">
                <div class="user-cell">
                  <span class="ml-2">{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="180">
              <template #default="scope">
                <el-tag
                    :type="scope.row.relationStatus === 'pending' ? 'warning' : 'info'"
                    effect="light"
                    size="small"
                    class="status-tag"
                >
                  {{ scope.row.relationStatus === 'pending' ? '待同意' : scope.row.relationStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button
                      type="primary"
                      size="small"
                      plain
                      @click="approvePatient(scope.row)"
                  >
                    <el-icon><Check /></el-icon>
                    批准
                  </el-button>
                  <el-button
                      type="danger"
                      size="small"
                      plain
                      @click="rejectPatient(scope.row)"
                  >
                    <el-icon><Close /></el-icon>
                    拒绝
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane name="removePending">
          <template #label>
            <div class="tab-label">
              <el-icon><CircleClose /></el-icon>
              <span>结束咨询</span>
              <el-badge
                  v-if="removePendingPatients.length"
                  :value="removePendingPatients.length"
                  :max="99"
                  type="danger"
                  class="custom-badge"
              />
            </div>
          </template>

          <el-table
              :data="removePendingPatients"
              class="custom-table"
              :header-cell-style="{
              background: '#f5f7fa',
              color: '#333',
              fontWeight: '600'
            }"
          >
            <el-table-column prop="username" label="用户名" min-width="180">
              <template #default="{ row }">
                <div class="user-cell">
                  <span class="ml-2">{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="180">
              <template #default="scope">
                <el-tag
                    type="info"
                    effect="light"
                    size="small"
                    class="status-tag"
                >
                  {{ scope.row.relationStatus === 'removeBinding' ? '申请结束' : scope.row.relationStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180">
              <template #default="scope">
                <el-button
                    type="primary"
                    size="small"
                    plain
                    @click="approveRemovePatient(scope.row)"
                >
                  <el-icon><Check /></el-icon>
                  确认结束
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useStore } from 'vuex'
import { User, ChatDotRound, Document, Star, Monitor, Check, Bell, Close, Box, CircleClose } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

const stats = ref([
  { title: '总患者数', value: '0', description: '', icon: User, route: '/patient-index' },
  { title: '今日咨询', value: '0', description: '', icon: ChatDotRound, route: '/consultation' },
  { title: '已发布文章', value: '0', description: '', icon: Document, route: '/articles' },
  { title: '评分', value: '0', description: '', icon: Star }
])

const activeTab = ref('pending')
const pendingPatients = ref([])
const myPatients = ref([])
const patientReports = ref([])
const showReports = ref(false)
const showReportDetails = ref(false)
const currentReport = ref({})
const removePendingPatients = ref([])
const doctorArticles = ref([])
const publishedArticlesCount = ref(0)
const todayConsultations = ref(0)

const fetchPendingPatients = async () => {
  try {
    const response = await axios.get('/api/api/doctor/relation/selectPending', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    pendingPatients.value = response.data
  } catch (error) {
    console.error('Failed to fetch pending patients:', error)
    ElMessage.error('获取待处理咨询失败')
  }
}

const fetchRemovePendingPatients = async () => {
  try {
    const response = await axios.get('/api/api/doctor/relation/selectRemoveBinding', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    removePendingPatients.value = response.data
  } catch (error) {
    console.error('Failed to fetch remove pending patients:', error)
    ElMessage.error('获取待处理的结束咨询申请失败')
  }
}

const fetchMyPatients = async () => {
  try {
    const response = await axios.get('/api/api/doctor/relation/selectMyPatients', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    myPatients.value = response.data
    stats.value[0].value = myPatients.value.length
  } catch (error) {
    console.error('Failed to fetch my patients:', error)
    ElMessage.error('获取我的患者列表失败')
  }
}

const approvePatient = async (patient) => {
  try {
    await axios.post('/api/api/doctor/relation/approve', { userId: patient.userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    ElMessage.success('已批准患者咨询')
    await fetchPendingPatients()
    await fetchMyPatients()
  } catch (error) {
    console.error('Failed to approve patient:', error)
    ElMessage.error('批准患者咨询失败')
  }
}

const rejectPatient = async (patient) => {
  try {
    await axios.post('/api/api/doctor/relation/reject', { userId: patient.userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    ElMessage.success('已拒绝患者咨询')
    await fetchPendingPatients()
  } catch (error) {
    console.error('Failed to reject patient:', error)
    ElMessage.error('拒绝患者咨询失败')
  }
}

const approveRemovePatient = async (patient) => {
  try {
    await axios.post('/api/api/doctor/relation/agreeRemoveBinding', { userId: patient.userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    ElMessage.success('已确定结束咨询申请')
    await fetchRemovePendingPatients()
    await fetchMyPatients()
  } catch (error) {
    console.error('Failed to approve removePatient:', error)
  }
}

const rejectRemovePatient = async (patient) => {
  try {
    await axios.post('/api/api/doctor/relation/rejectRemoveBinding', { userId: patient.userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    ElMessage.success('已拒绝结束咨询申请')
    await fetchRemovePendingPatients()
    await fetchMyPatients()
  } catch (error) {
    console.error('Failed to reject removePatient:', error)
  }
}

const fetchArticles = async () => {
  try {
    const response = await axios.get('/api/api/healthArticle/myArticles', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    doctorArticles.value = response.data
    stats.value[3].value = doctorArticles.value.length
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    ElMessage.error('获取医生文章失败')
  }
}

const viewPatientReports = async (patient) => {
  try {
    const response = await axios.post('/api/api/doctor/relation/selectReports', { userId: patient.userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    patientReports.value = response.data
    showReports.value = true
  } catch (error) {
    console.error('Failed to fetch patient reports:', error)
    ElMessage.error('获取患者报告失败')
  }
}

const viewReportDetails = (report) => {
  currentReport.value = report
  showReportDetails.value = true
}

const saveReportComment = async () => {
  // 这里应该实现保存医生评论的逻辑
  // 由于API文档中没有提供相应的接口，这里只是模拟了保存操作
  ElMessage.success('评论已保存')
  showReportDetails.value = false
}

const formatDate = (dateArray) => {
  const [year, month, day, hour, minute, second] = dateArray
  return new Date(year, month - 1, day, hour, minute, second).toLocaleString()
}

const handleCardClick = (item) => {
  if (item.route) {
    router.push(item.route)
    console.log('Navigate to:', item.route)
  }
}

const fetchPublishedArticlesCount = async () => {
  try {
    const response = await axios.get('/api/api/healthArticle/myPublished', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    publishedArticlesCount.value = response.data
    stats.value[2].value = publishedArticlesCount.value
  } catch (error) {
    console.error('Failed to fetch published articles count:', error)
    ElMessage.error('获取已发布文章数量失败')
  }
}

const fetchTodayConsultations = async () => {
  try {
    const response = await axios.get('/api/api/messages/todayCousultationDoctorCount', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    });
    todayConsultations.value = response.data;
    stats.value[1].value = todayConsultations.value; // 更新 stats 数组中的今日咨询人数
  } catch (error) {
    console.error('Failed to fetch today consultations:', error);
    ElMessage.error('获取今日咨询人数失败');
  }
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString(); // 根据需要调整日期格式
}

onMounted(() => {
  fetchPendingPatients();
  fetchMyPatients();
  fetchRemovePendingPatients();
  fetchPublishedArticlesCount();
  fetchTodayConsultations();

  const doctor = JSON.parse(localStorage.getItem('doctor'));
  if (doctor && doctor.rating !== undefined) {
    let rating = parseFloat(doctor.rating);

    if (rating === -1) {
      rating = 0; // 默认未有人评分
    } else if (rating < 0 || rating > 5) {
      console.error('评分必须在0到5之间');
      return;
    }

    stats.value[3].value = rating.toString();
  }
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  min-height: 100vh;
  background-color: #f6f8fa;
}

.dashboard-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  .main-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }

  .dashboard-subtitle {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.stats-container {
  margin-bottom: 24px;
}

.stats-card {
  height: 140px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: linear-gradient(135deg, var(--card-bg-start) 0%, var(--card-bg-end) 100%);
  position: relative;
}

.stats-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stats-card:hover::after {
  opacity: 1;
}

.stats-card-1 {
  --card-bg-start: #3498db;
  --card-bg-end: #2980b9;
}

.stats-card-2 {
  --card-bg-start: #2ecc71;
  --card-bg-end: #27ae60;
}

.stats-card-3 {
  --card-bg-start: #e74c3c;
  --card-bg-end: #c0392b;
}

.stats-card-4 {
  --card-bg-start: #f1c40f;
  --card-bg-end: #f39c12;
}

.stats-card-content {
  height: 100%;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-info {
  flex: 1;
}

.stats-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  opacity: 0.9;
}

.stats-title {
  font-size: 16px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.stats-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stats-description {
  font-size: 13px;
  opacity: 0.8;
}

.consultation-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.custom-tabs {
  padding: 16px;
}

.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--el-border-color-light);
}

.tab-label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}

:deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 20px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
  transform: translateY(-1px);
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

.custom-badge {
  margin-left: 8px;
}

:deep(.el-badge__content) {
  background-color: var(--el-color-danger);
  border: none;
  box-shadow: 0 0 0 1px var(--el-color-danger);
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
  border-radius: 9px;
  font-weight: 500;
}

.custom-table {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.custom-table :deep(.el-table__header-wrapper) {
  background-color: var(--el-fill-color-light);
}

.custom-table :deep(.el-table__header th) {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 12px 0;
}

.custom-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}

.custom-table :deep(.el-table__row:hover) {
  background-color: var(--el-fill-color-lighter);
  transform: translateY(-1px);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}

.action-buttons .el-button {
  transition: all 0.2s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
}

.empty-state {
  padding: 48px 0;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  margin: 20px 0;
}

.empty-icon {
  font-size: 48px;
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
}

:deep(.el-empty__description) {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .stats-card {
    height: 120px;
    margin-bottom: 16px;
  }

  .stats-card-content {
    flex-direction: column;
    text-align: center;
    padding: 12px;
  }

  .stats-icon-wrapper {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }

  .stats-value {
    font-size: 28px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .tab-label {
    font-size: 14px;
  }

  .custom-table {
    margin: 12px 0;
  }
}

/* 动画效果 */
.clickable-card {
  cursor: pointer;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

:deep(.el-card__body) {
  height: 100%;
  padding: 20px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>