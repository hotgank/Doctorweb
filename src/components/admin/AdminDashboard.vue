<template>
  <div class="admin-dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <el-icon class="mr-2"><Monitor /></el-icon>
            管理员工作台
          </h1>
          <p class="subtitle">欢迎回来，管理员！今天是 {{ getCurrentDate() }}</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-container">
      <el-col
          :xs="24"
          :sm="12"
          :md="6"
          v-for="(item, index) in filteredStats"
          :key="index"
      >
        <el-card
            class="stats-card"
            :class="{
            'clickable-card': item.route,
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

    <!-- 主要内容区域 -->
    <el-card class="content-card">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 待审核医生标签页 -->
        <el-tab-pane name="pendingDoctors">
          <template #label>
            <div class="tab-label">
              <el-icon><UserFilled /></el-icon>
              <span>待审核医生</span>
              <el-badge
                  v-if="pendingDoctors.length"
                  :value="pendingDoctors.length"
                  class="ml-2"
              />
            </div>
          </template>

          <el-table
              :data="pendingDoctors"
              class="custom-table"
              :header-cell-style="{ background: '#f5f7fa' }"
          >
            <el-table-column prop="name" label="姓名" min-width="120">
              <template #default="{ row }">
                <div class="name-cell">
                  <span class="ml-2">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="gender" label="性别" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.gender === '男' ? 'info' : 'danger'" effect="light">
                  {{ row.gender }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="position" label="职位" width="150">
              <template #default="{ row }">
                <el-tag size="small" type="success" effect="light">
                  {{ row.position }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="workplace" label="工作单位" min-width="200" />
            <el-table-column fixed="right" label="操作" width="120">
              <template #default="scope">
                <el-button
                    type="primary"
                    link
                    @click="viewDoctorDetails(scope.row)"
                >
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 待审核文章标签页 -->
        <el-tab-pane name="pendingArticles">
          <template #label>
            <div class="tab-label">
              <el-icon><Document /></el-icon>
              <span>待审核文章</span>
              <el-badge
                  v-if="pendingArticles.length"
                  :value="pendingArticles.length"
                  class="ml-2"
              />
            </div>
          </template>

          <el-table
              :data="pendingArticles"
              class="custom-table"
              :header-cell-style="{ background: '#f5f7fa' }"
          >
            <el-table-column prop="title" label="标题" min-width="250">
              <template #default="{ row }">
                <div class="article-title">
                  <el-icon><Document /></el-icon>
                  <span class="ml-2">{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="作者" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="info" effect="plain">
                  {{ row.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="publishDate" label="发布日期" width="180">
              <template #default="{ row }">
                <div class="date-cell">
                  <el-icon><Calendar /></el-icon>
                  <span class="ml-2">{{ row.publishDate }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="success" effect="light">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag
                    size="small"
                    :type="row.status === '待审核' ? 'warning' : 'info'"
                    effect="light"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                    type="primary"
                    link
                    @click="viewArticle(scope.row.articleId)"
                >
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 医生详情对话框 -->
    <el-dialog
        v-model="doctorDetailsVisible"
        title="医生认证详情"
        width="60%"
        :before-close="handleClose"
        class="custom-dialog"
    >
      <div v-if="selectedDoctor" class="doctor-details">
        <el-descriptions :column="2" border class="mb-4">
          <el-descriptions-item label="ID" :span="1">
            {{ selectedDoctor.doctorId }}
          </el-descriptions-item>
          <el-descriptions-item label="姓名" :span="1">
            {{ selectedDoctor.name }}
          </el-descriptions-item>
          <el-descriptions-item label="性别" :span="1">
            {{ selectedDoctor.gender }}
          </el-descriptions-item>
          <el-descriptions-item label="工作单位" :span="1">
            {{ selectedDoctor.workplace }}
          </el-descriptions-item>
          <el-descriptions-item label="职位选择" :span="2">
            <div class="position-selects">
              <el-select
                  v-model="selectedPositionCategory"
                  placeholder="选择职位大类"
                  @change="updatePositionOptions"
                  class="category-select"
              >
                <el-option
                    v-for="category in positionCategories"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                />
              </el-select>
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
                />
              </el-select>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="cert-section">
          <h4 class="cert-title">
            <el-icon><Picture /></el-icon>
            医师资格证书
          </h4>
          <div class="cert-image-container">
            <el-image
                v-if="doctorImage"
                :src="doctorImage"
                :preview-src-list="[doctorImage]"
                fit="contain"
                class="cert-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><PictureRounded /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
            <div v-else class="image-placeholder">
              <el-icon><Loading /></el-icon>
              <span>正在加载图片...</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="danger" @click="openRejectDialog">
            <el-icon><CircleClose /></el-icon>
            打回认证
          </el-button>
          <el-button type="success" @click="approveDoctor">
            <el-icon><Check /></el-icon>
            认证通过
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 打回认证对话框 -->
    <el-dialog
        v-model="rejectDialogVisible"
        title="打回认证"
        width="500px"
        class="reject-dialog"
        append-to-body
    >
      <el-form :model="rejectForm" class="reject-form">
        <el-form-item
            label="打回原因"
            required
            :rules="[{ required: true, message: '请输入打回原因' }]"
        >
          <el-input
              v-model="rejectForm.comment"
              type="textarea"
              :rows="4"
              placeholder="请详细说明打回原因，以便医生进行修改..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject">
            <el-icon><Check /></el-icon>
            确认打回
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { User, Document, Loading, Service, Monitor, Check, CircleClose, Refresh, UserFilled, View, Calendar, PictureRounded} from '@element-plus/icons-vue'
import { ElMessage, ElSelect, ElOption } from 'element-plus'
import axiosInstance from '../../axios/index'

const router = useRouter()
const store = useStore()

const stats = ref([
  {
    title: '总用户数',
    value: '0',
    description: '',
    icon: User,
    route: '/user-index'
  },
  {
    title: '总医生数',
    value: '0',
    description: '',
    icon: Service,
    route: '/doctor-index'
  },
  {
    title: '待审核医生',
    value: '0',
    description: '',
    icon: Loading,
    route: '/verify'
  },
  {
    title: '待审核文章',
    value: '0',
    description: '',
    icon: Document,
    route: '/verify-articles'
  },
]);

const activeTab = ref('pendingDoctors')

const pendingDoctors = ref([])
const doctorDetailsVisible = ref(false)
const selectedDoctor = ref(null)
const doctorImage = ref(null)
const pendingArticles = ref([]);
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const rejectForm = ref({
  comment: ''
})

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

const isSecondAdmin = computed(() => store.state.user && store.state.user.adminType === 'second')
const filteredStats = computed(() => {
  return stats.value.filter(item => !(item.title === '总用户数' && isSecondAdmin.value));
});

const fetchStats = async () => {
  try {
    const userCountResponse = await axiosInstance.get('/api/user/selectUserCount');
    stats.value[0].value = userCountResponse.data.userCount || '0';
  } catch (error) {
    console.error('获取总用户数失败:', error);
    stats.value[0].value = '0';
  }

  try {
    const doctorCountResponse = await axiosInstance.get('/api/doctor/selectMyDoctorCount');
    stats.value[1].value = doctorCountResponse.data.doctorCount || '0';
  } catch (error) {
    console.error('获取总医生数失败:', error);
    stats.value[1].value = '0';
  }

  try {
    const pendingDoctorsCountResponse = await axiosInstance.get('/api/verifyDoctor/selectPendingCount');
    stats.value[2].value = pendingDoctorsCountResponse.data.pendingCount || '0';
  } catch (error) {
    console.error('获取待审核医生数失败:', error);
    stats.value[2].value = '0';
  }

  try {
    const pendingArticlesCountResponse = await axiosInstance.get('/api/healthArticle/getPendingCount');
    stats.value[3].value = pendingArticlesCountResponse.data.pendingArticlesCount || '0';
  } catch (error) {
    console.error('获取待审核文章数失败:', error);
    stats.value[3].value = '0';
  }
};


const fetchPendingDoctors = async () => {
  try {
    const response = await axiosInstance.get('/api/verifyDoctor/selectRecent')
    pendingDoctors.value = response.data
  } catch (error) {
    console.error('获取待审核医生数据失败:', error)
    pendingDoctors.value = []
  }
}

const fetchPendingArticles = async () => {
  try {
    const response = await axiosInstance.get('/api/healthArticle/getRecentPending');
    pendingArticles.value = response.data.map(article => ({
      ...article,
      publishDate: article.publishDate ? new Date(article.publishDate).toLocaleString() : 'N/A',
    }));
  } catch (error) {
    console.error('获取待审核文章数据失败:', error);
    pendingArticles.value = [];
  }
};

const viewArticle = (id) => {
  router.push(`/verify-articles/${id}`)
}

onMounted(() => {
  fetchStats()
  fetchPendingDoctors()
  fetchPendingArticles()
})

const handleCardClick = (item) => {
  if (item.route) {
    router.push(item.route)
  }
}

const selectedPositionCategory = ref('')
const filteredPositions = ref([])

const updatePositionOptions = (category) => {
  selectedPositionCategory.value = category
  filteredPositions.value = positions[category] || []
}

const viewDoctorDetails = async (doctor) => {
  selectedDoctor.value = { ...doctor }
  doctorDetailsVisible.value = true
  doctorImage.value = null

  // 初始化职位类别
  const category = positionCategories.find(cat => positions[cat.value].includes(doctor.position))
  if (category) {
    selectedPositionCategory.value = category.value
    updatePositionOptions(category.value)
  }

  try {
    // 构建完整的 URL
    const imageUrl = selectedDoctor.value.url;

    // 发送请求
    const response = await axiosInstance.get(`/api/url/getLicenseImage?url=${encodeURIComponent(imageUrl)}`, {
      responseType: 'blob'  // 设置响应类型为 blob
    });

    if (response.data) {
      // 将 Blob 数据转换为可展示的 URL
      const blob = new Blob([response.data], {type: 'image/png'});
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

const approveDoctor = async () => {
  if (!selectedDoctor.value.position) {
    ElMessage.warning('职位不能为空，请选择职位后再提交');
    return;
  }

  try {
    const data = {
      auditId: selectedDoctor.value.auditId,
      position: selectedDoctor.value.position,
    };

    await axiosInstance.post('/api/verifyDoctor/approve', JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    ElMessage({
      message: `已认证医生 ${selectedDoctor.value.name} 的资格`,
      type: 'success',
    });

    handleClose();
    await fetchPendingDoctors();
  } catch (error) {
    console.error('审核通过失败:', error);
    ElMessage.error('审核通过失败，请稍后重试');
  }
};

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
    await fetchPendingDoctors() // 刷新医生列表
  } catch (error) {
    console.error('审核拒绝失败:', error)
    ElMessage.error('审核拒绝失败，请稍后重试')
  }
}

const handleClose = () => {
  dialogVisible.value = false
  selectedDoctor.value = null
  doctorImage.value = null
  doctorDetailsVisible.value = false
}

const openRejectDialog = () => {
  rejectDialogVisible.value = true
}

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString(); // 根据需要调整日期格式
}
</script>

<style scoped>
.admin-dashboard {
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

  .subtitle {
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

.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-tabs {
  padding: 16px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-table {
  margin: 16px 0;
}

.name-cell,
.article-title,
.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doctor-details {
  padding: 20px;
}

.position-selects {
  display: flex;
  gap: 16px;

  .category-select,
  .position-select {
    width: 200px;
  }
}

.cert-section {
  margin-top: 24px;
}

.cert-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cert-image-container {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--el-fill-color-light);
}

.cert-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-error,
.image-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--el-text-color-secondary);

  .el-icon {
    font-size: 48px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}

.reject-form {
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-dashboard {
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

  .position-selects {
    flex-direction: column;
    gap: 8px;

    .category-select,
    .position-select {
      width: 100%;
    }
  }

  .cert-image-container {
    height: 200px;
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

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-tabs__item) {
  transition: all 0.3s;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-button) {
  transition: all 0.2s;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
}
</style>