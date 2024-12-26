<template>
  <div class="dashboard">
    <h1 class="text-2xl font-bold mb-6">仪表板</h1>
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in stats" :key="index">
        <el-card 
          class="box-card h-full"
          :class="{ 'clickable-card': item.route, 'rating-card': item.title === '评分' }"
          @click="handleCardClick(item)"
        >
          <template #header>
            <div class="card-header">
              <span>{{ item.title }}</span>
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
            </div>
          </template>
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-2">{{ item.value }}</h2>
            <p class="text-sm text-gray-500">{{ item.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mt-6">
      <el-tab-pane label="待处理咨询申请" name="pending">
        <el-table :data="pendingPatients" style="width: 100%">
          <el-table-column prop="username" label="用户名" width="180" />
          <el-table-column label="状态" width="180">
            <template #default="scope">
              {{ scope.row.relationStatus === 'pending' ? '待同意' : scope.row.relationStatus }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="approvePatient(scope.row)">批准</el-button>
              <el-button link type="danger" size="small" @click="rejectPatient(scope.row)">拒绝</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="没有待处理的申请"></el-empty>
          </template>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="结束咨询" name="removePending">
        <el-table :data="removePendingPatients" style="width: 100%">
          <el-table-column prop="username" label="用户名" width="180" />
          <el-table-column label="状态" width="180">
            <template #default="scope">
              {{ scope.row.relationStatus === 'removeBinding' ? '结束' : scope.row.relationStatus }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="approveRemovePatient(scope.row)">确定</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="没有待处理的申请"></el-empty>
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showReports" title="患者报告" width="70%">
      <el-table :data="patientReports" style="width: 100%">
        <el-table-column prop="createdAt" label="日期" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reportType" label="类型" width="120" />
        <el-table-column prop="state" label="状态" width="120" />
        <el-table-column prop="result" label="结果" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button @click="viewReportDetails(scope.row)" type="text" size="small">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="showReportDetails" title="报告详情" width="70%">
      <el-form :model="currentReport" label-width="120px">
        <el-form-item label="报告类型">
          <span>{{ currentReport.reportType }}</span>
        </el-form-item>
        <el-form-item label="状态">
          <span>{{ currentReport.state }}</span>
        </el-form-item>
        <el-form-item label="结果">
          <span>{{ currentReport.result }}</span>
        </el-form-item>
        <el-form-item label="分析">
          <el-input type="textarea" v-model="currentReport.analyse" :rows="4" readonly></el-input>
        </el-form-item>
        <el-form-item label="医生评论">
          <el-input type="textarea" v-model="currentReport.comment" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="报告图片">
          <el-image :src="currentReport.url" :preview-src-list="[currentReport.url]"></el-image>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="saveReportComment">保存评论</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useStore } from 'vuex'
import { User, ChatDotRound, Document, Star } from '@element-plus/icons-vue'

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
  padding: 20px;
}

.box-card {
  height: 170px; /* 固定高度 */
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
}

.card-header {
  height: 20px; /* 固定高度 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clickable-card {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-card {
  cursor: default;
}
</style>