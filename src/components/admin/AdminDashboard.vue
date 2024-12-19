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
          <el-table-column prop="name" label="医生姓名" width="180" />
          <el-table-column prop="gender" label="性别" width="180" />
          <el-table-column prop="workplace" label="单位" width="180" />
          <el-table-column fixed="right" label="操作" width="240">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewDoctorDetails(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="没有待审核的医生"></el-empty>
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
            <el-input
                v-model="selectedDoctor.position"
                placeholder="请输入职位"
                clearable>
            </el-input>
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

    <!-- 活动详情对话框 -->
    <el-dialog
        v-model="activityDetailsVisible"
        title="活动详情"
        width="30%"
    >
      <div v-if="selectedActivity">
        <p><strong>活动：</strong> {{ selectedActivity.action }}</p>
        <p><strong>用户：</strong> {{ selectedActivity.user }}</p>
        <p><strong>日期：</strong> {{ selectedActivity.date }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { User, Document, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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
    icon: Document,
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
    title: '系统公告',
    value: '0',
    description: '',
    icon: Document,
    route: '/admin-announcement'
  },
]);

const activeTab = ref('pendingDoctors')

const pendingDoctors = ref([])
const doctorDetailsVisible = ref(false)
const activityDetailsVisible = ref(false)
const selectedDoctor = ref(null)
const selectedActivity = ref(null)
const doctorImage = ref(null)
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const rejectForm = ref({
  comment: ''
})

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
    const pendingCountResponse = await axiosInstance.get('/api/verifyDoctor/selectPendingCount');
    stats.value[2].value = pendingCountResponse.data.pendingCount || '0';
  } catch (error) {
    console.error('获取待审核医生数失败:', error);
    stats.value[2].value = '0';
  }

  try {
    const systemInfoResponse = await axiosInstance.get('/api/getSystemInfo');
    stats.value[3].value = systemInfoResponse.data.systemInfoCount || '0';
  } catch (error) {
    console.error('获取系统公告数失败:', error);
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

onMounted(() => {
  fetchStats()
  fetchPendingDoctors()
})

const handleCardClick = (item) => {
  if (item.route) {
    router.push(item.route)
  }
}

const viewDoctorDetails = async (doctor) => {
  selectedDoctor.value = doctor
  doctorDetailsVisible.value = true
  doctorImage.value = null

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

const viewActivityDetails = (activity) => {
  selectedActivity.value = activity
  activityDetailsVisible.value = true
}

const approveDoctor = async () => {
  if (!selectedDoctor.value.position.trim()) {
    ElMessage.warning('职位不能为空，请填写职位后再提交');
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
    await fetchPendingDoctors(); // 刷新医生列表
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.clickable-card {
  cursor: pointer;
  transition: box-shadow 0.3s;
}
.clickable-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>