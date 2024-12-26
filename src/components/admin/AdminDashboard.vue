<template>
  <div class="admin-dashboard">
    <h1 class="mb-4">管理员仪表板</h1>
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in filteredStats" :key="index">
        <el-card
            v-if="!(item.title === '总用户数' && isSecondAdmin)"
            class="box-card clickable-card"
            @click="handleCardClick(item)"
        >
          <template #header>
            <div class="card-header">
              <span>{{ item.title }}</span>
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
            </div>
          </template>
          <div class="text-center">
            <h2 class="text-2xl font-bold">{{ item.value }}</h2>
            <p class="text-sm text-gray-500">{{ item.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mt-4">
      <el-tab-pane label="待审核医生" name="pendingDoctors">
        <el-table :data="pendingDoctors" style="width: 100%">
          <el-table-column prop="name" label="姓名" width="120"></el-table-column>
          <el-table-column prop="gender" label="性别" width="80"></el-table-column>
          <el-table-column prop="position" label="职位" width="120"></el-table-column>
          <el-table-column prop="workplace" label="工作单位" min-width="200"></el-table-column>
          <el-table-column fixed="right" label="操作" width="100">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewDoctorDetails(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="没有待审核的医生"></el-empty>
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="待审核文章" name="pendingArticles">
        <el-table :data="pendingArticles" style="width: 100%">
          <el-table-column prop="title" label="标题" width="250"></el-table-column>
          <el-table-column prop="name" label="作者" width="120"></el-table-column>
          <el-table-column prop="publishDate" label="发布日期" width="160"></el-table-column>
          <el-table-column prop="type" label="类型" width="100"></el-table-column>
          <el-table-column prop="status" label="状态" width="100"></el-table-column>
          <el-table-column label="操作" min-width="100">
            <template #default="scope">
              <el-button size="small" @click="viewArticle(scope.row.articleId)">查看详情</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="没有科普文章"></el-empty>
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 医生详情对话框 -->
    <el-dialog
        v-model="doctorDetailsVisible"
        title="医生详情"
        width="50%"
        :before-close="handleClose"
    >
      <div v-if="selectedDoctor">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ selectedDoctor.doctorId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedDoctor.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ selectedDoctor.gender }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ selectedDoctor.workplace }}</el-descriptions-item>
          <el-descriptions-item label="职位">
            <el-select v-model="selectedPositionCategory" placeholder="选择职位大类" @change="updatePositionOptions" style="width: 150px; margin-right: 10px;">
              <el-option v-for="category in positionCategories" :key="category.value" :label="category.label" :value="category.value"></el-option>
            </el-select>
            <el-select v-model="selectedDoctor.position" placeholder="选择职位" style="width: 150px;">
              <el-option v-for="position in filteredPositions" :key="position" :label="position" :value="position"></el-option>
            </el-select>
          </el-descriptions-item>
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

  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { User, Document, Loading, Service } from '@element-plus/icons-vue'
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
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  margin-top: -20px;
}
.card-header {
  height: 20px; /* 固定高度 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  height: 170px; /* 固定高度 */
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
}

.clickable-card {
  cursor: pointer;
  transition: box-shadow 0.3s;
}
.clickable-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
