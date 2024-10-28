<template>
  <div class="admin-dashboard">
    <h1 class="mb-4">管理员仪表板</h1>
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in stats" :key="index">
        <el-card 
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

    <el-button type="primary" @click="showImportDialog" class="mt-4">
      导入用户数据
    </el-button>

    <el-tabs v-model="activeTab" class="mt-4">
      <el-tab-pane label="待审核医生" name="pendingDoctors">
        <el-table :data="pendingDoctors" style="width: 100%">
          <el-table-column prop="name" label="医生姓名" width="180" />
          <el-table-column prop="unit" label="单位" width="180" />
          <el-table-column prop="applicationDate" label="申请日期" width="180" />
          <el-table-column fixed="right" label="操作" width="240">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewDoctorDetails(scope.row)">查看详情</el-button>
              <el-button link type="success" size="small" @click="reviewDoctor(scope.row, 'approve')">批准</el-button>
              <el-button link type="danger" size="small" @click="reviewDoctor(scope.row, 'reject')">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="最近活动" name="recentActivities">
        <el-table :data="recentActivities" style="width: 100%">
          <el-table-column prop="action" label="活动" width="180" />
          <el-table-column prop="user" label="用户" width="180" />
          <el-table-column prop="date" label="日期" width="180" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewActivityDetails(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 医生详情对话框 -->
    <el-dialog
      v-model="doctorDetailsVisible"
      title="医生详情"
      width="50%"
      :before-close="handleCloseDoctorDetails"
    >
      <div v-if="selectedDoctor">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ selectedDoctor.id }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedDoctor.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedDoctor.email }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ selectedDoctor.unit }}</el-descriptions-item>
          <el-descriptions-item label="科室">{{ selectedDoctor.department }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ selectedDoctor.position }}</el-descriptions-item>
          <el-descriptions-item label="医师资格证号">{{ selectedDoctor.certNumber }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ selectedDoctor.applicationDate }}</el-descriptions-item>
        </el-descriptions>
        <div class="cert-image mt-4" v-if="selectedDoctor.certImage">
          <h4 class="text-lg font-medium mb-2">医师资格证图片：</h4>
          <el-image
            :src="selectedDoctor.certImage"
            :preview-src-list="[selectedDoctor.certImage]"
            fit="cover"
            class="w-48 h-48 object-cover rounded"
          />
        </div>
      </div>
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

    <!-- 导入用户数据对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入用户数据"
      width="30%"
    >
      <el-alert
        title="请上传符合要求的CSV文件"
        type="info"
        description="文件应包含以下列：ID, Name, Email, Phone, Registration Date"
        :closable="false"
        show-icon
        class="mb-4"
      />
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 csv 文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importUserData">
            导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Document, Loading, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const stats = [
  { 
    title: '总用户数', 
    value: '10,234', 
    description: '较上月增长5%', 
    icon: User,
    route: '/user-index'
  },
  { 
    title: '待审核医生', 
    value: '15', 
    description: '较昨天增加3位', 
    icon: Loading,
    route: '/verify'
  },
  { 
    title: '系统公告', 
    value: '8', 
    description: '本周新增2条', 
    icon: Document,
    route: '/admin-announcement'
  },
]

const activeTab = ref('pendingDoctors')

const pendingDoctors = ref([
  { id: 1, name: '张医生', department: '内科', position:'主治医师', unit:'宛平南路600号', certNumber:'D123456789',  applicationDate: '2024-05-08', email: 'zhang@example.com', certImage: 'https://via.placeholder.com/150' },
  { id: 2, name: '李医生', department: '外科', position:'副主任医师', unit:'宛平南路600号', certNumber:'D987654321',  applicationDate: '2024-05-09', email: 'li@example.com', certImage: 'https://via.placeholder.com/150' },
  { id: 3, name: '王医生', department: '儿科', position:'住院医师', unit:'宛平南路600号', certNumber:'D112233445', applicationDate: '2024-05-10', email: 'wang@example.com', certImage: 'https://via.placeholder.com/150' },
])

const recentActivities = [
  { action: '新用户注册', user: '用户A', date: '2024-05-10 14:30' },
  { action: '医生资格审核', user: '管理员B', date: '2024-05-10 15:00' },
  { action: '系统设置更新', user: '管理员C', date: '2024-05-10 16:15' },
]

const doctorDetailsVisible = ref(false)
const activityDetailsVisible = ref(false)
const importDialogVisible = ref(false)
const selectedDoctor = ref(null)
const selectedActivity = ref(null)
const uploadedFile = ref(null)

const handleCardClick = (item) => {
  if (item.route) {
    router.push(item.route)
  }
}

const viewDoctorDetails = (doctor) => {
  selectedDoctor.value = doctor
  doctorDetailsVisible.value = true
}

const handleCloseDoctorDetails = () => {
  doctorDetailsVisible.value = false
  selectedDoctor.value = null
}

const reviewDoctor = (doctor, action) => {
  if (action === 'approve') {
    ElMessage({
      message: `已批准医生 ${doctor.name} 的资格`,
      type: 'success',
    })
  } else if (action === 'reject') {
    ElMessage({
      message: `已拒绝医生 ${doctor.name} 的资格申请`,
      type: 'warning',
    })
  }
  // 从待审核列表中移除该医生
  pendingDoctors.value = pendingDoctors.value.filter(d => d.id !== doctor.id)
}

const viewActivityDetails = (activity) => {
  selectedActivity.value = activity
  activityDetailsVisible.value = true
}

const showImportDialog = () => {
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  uploadedFile.value = file
}

const importUserData = () => {
  if (!uploadedFile.value) {
    ElMessage.error('请先选择要上传的文件')
    return
  }

  // 这里应该是一个 API 调用来处理文件上传和数据导入
  // 为了演示，我们只是模拟这个过程
  setTimeout(() => {
    ElMessage.success('用户数据导入成功')
    importDialogVisible.value = false
    uploadedFile.value = null
  }, 2000)
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