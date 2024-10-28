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
          <el-popover
            v-if="item.title === '评分'"
            :width="200"
            trigger="hover"
            placement="top"
          >
            <template #reference>
              <div class="absolute inset-0"></div>
            </template>
            <div>
              <p class="mb-2"><strong>总咨询数：</strong>{{ totalConsultations }}</p>
              <p><strong>评分：</strong>{{ rating }}</p>
            </div>
          </el-popover>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mt-6">
      <el-tab-pane label="即将进行的咨询" name="upcoming">
        <el-table :data="upcomingConsultations" style="width: 100%">
          <el-table-column prop="patientName" label="患者姓名" width="180" />
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column fixed="right" label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewReport(scope.row)">查看报告</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="最近的患者" name="recent">
        <el-table :data="recentPatients" style="width: 100%">
          <el-table-column prop="patientName" label="患者姓名" width="180" />
          <el-table-column prop="date" label="日期" width="180" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewReport(scope.row)">查看报告</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="患者管理" name="management">
        <el-tabs v-model="managementActiveTab">
          <el-tab-pane label="加入请求" name="join">
            <el-table :data="joinRequests" style="width: 100%">
              <el-table-column prop="patientName" label="患者姓名" width="180" />
              <el-table-column prop="requestDate" label="请求日期" width="180" />
              <el-table-column fixed="right" label="操作" width="200">
                <template #default="scope">
                  <el-button type="success" size="small" @click="handleJoinRequest(scope.row, true)">同意</el-button>
                  <el-button type="danger" size="small" @click="handleJoinRequest(scope.row, false)">拒绝</el-button>
                  <el-button link type="primary" size="small" @click="viewReport(scope.row)">查看报告</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="退出请求" name="leave">
            <el-table :data="leaveRequests" style="width: 100%">
              <el-table-column prop="patientName" label="患者姓名" width="180" />
              <el-table-column prop="requestDate" label="请求日期" width="180" />
              <el-table-column fixed="right" label="操作" width="200">
                <template #default="scope">
                  <el-button type="success" size="small" @click="handleLeaveRequest(scope.row, true)">同意</el-button>
                  <el-button type="danger" size="small" @click="handleLeaveRequest(scope.row, false)">拒绝</el-button>
                  <el-button link type="primary" size="small" @click="viewReport(scope.row)">查看报告</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>

    <!-- 查看报告对话框 -->
    <el-dialog v-model="showReport" title="检测报告" width="70%" :before-close="handleCloseReport">
      <el-form :model="reportForm" label-width="120px">
        <!-- 姓名和年龄 -->
        <el-row :gutter="20" class="mb-4">
          <el-col :span="12">
            <el-form-item label="姓名:">
              <span>{{ reportForm.name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄:">
              <span>{{ reportForm.age }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 基础信息 -->
        <el-form-item label="基础信息">
          <el-row :gutter="20" class="bordered-section" style="margin-left: 0px; margin-right: 0px;">
            <el-col :span="12" style="margin-left: -50px;">
              <el-form-item label="身高:">
                <span>{{ reportForm.height }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="腰围:">
                <span>{{ reportForm.waist }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" style="margin-left: -50px;">
              <el-form-item label="体重:">
                <span>{{ reportForm.weight }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="臀围:">
                <span>{{ reportForm.hip }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 评测结果和方案分析 -->
        <el-form-item label="评测结果">
          <el-input
            type="textarea"
            v-model="reportForm.assessmentResults"
            :readonly="!isEditing"
            rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="方案分析">
          <el-input
            type="textarea"
            v-model="reportForm.planAnalysis"
            :readonly="!isEditing"
            rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="医生留言">
          <el-input
            type="textarea"
            v-model="reportForm.doctorMessage"
            :readonly="!isEditing"
            rows="4"
          ></el-input>
        </el-form-item>

        <!-- 照片部分 -->
        <el-form-item label="照片">
          <div class="photo-row">
            <div class="photo-item">
              <div class="photo-frame">
                <img :src="reportForm.frontPhoto" alt="正面照" class="photo" />
              </div>
              <p class="photo-label">正面照</p>
            </div>
            <div class="photo-item">
              <div class="photo-frame">
                <img :src="reportForm.leftPhoto" alt="左侧照" class="photo" />
              </div>
              <p class="photo-label">左侧照</p>
            </div>
          </div>
          <div class="photo-row" style="margin-left: 15px">
            <div class="photo-item">
              <div class="photo-frame">
                <img :src="reportForm.backPhoto" alt="背面照" class="photo" />
              </div>
              <p class="photo-label">背面照</p>
            </div>
            <div class="photo-item">
              <div class="photo-frame">
                <img :src="reportForm.rightPhoto" alt="右侧照" class="photo" />
              </div>
              <p class="photo-label">右侧照</p>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="!isEditing" @click="startEdit">开始编辑</el-button>
          <el-button v-else @click="cancelEdit">取消编辑</el-button>
          <el-button type="primary" @click="saveReport" :disabled="!isEditing">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, ChatDotRound, Document, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const stats = [
  { 
    title: '总患者数', 
    value: '1,234', 
    description: '较上月增长20%', 
    icon: User,
    route: '/patient-index'
  },
  { 
    title: '今日咨询', 
    value: '12', 
    description: '比昨天多3个', 
    icon: ChatDotRound,
    route: '/consultation'
  },
  { 
    title: '已发布文章', 
    value: '24', 
    description: '本周新增2篇', 
    icon: Document,
    route: '/articles'
  },
  { 
    title: '评分', 
    value: '4.9', 
    description: '较上月提高0.1', 
    icon: Star
  },
]

const activeTab = ref('upcoming')
const managementActiveTab = ref('join')

const upcomingConsultations = [
  { 
    patientName: '张三', 
    time: '2023-10-05 10:00',
    id: 'c1'
  },
  {
    patientName: '李四',
    time: '2023-10-06 14:30',
    id: 'c2'
  }
]

const recentPatients = [
  {
    patientName: '王五',
    date: '2023-09-30'
  },
  {
    patientName: '赵六',
    date: '2023-09-29'
  }
]

const joinRequests = [
  {
    patientName: '刘七',
    requestDate: '2023-10-01'
  },
  {
    patientName: '孙八',
    requestDate: '2023-10-02'
  }
]

const leaveRequests = [
  {
    patientName: '周九',
    requestDate: '2023-10-03'
  },
  {
    patientName: '吴十',
    requestDate: '2023-10-04'
  }
]

const showReport = ref(false)
const isEditing = ref(false)

const totalConsultations = ref(1500)
const rating = ref(4.9)

const reportForm = ref({
  name: '',
  age: '',
  height: '',
  waist: '',
  weight: '',
  hip: '',
  frontPhoto: '',
  leftPhoto: '',
  backPhoto: '',
  rightPhoto: '',
  assessmentResults: '',
  planAnalysis: '',
  doctorMessage: ''
})

const fillReportForm = (patient) => {
  reportForm.value = {
    name: patient.patientName,
    age: '30岁',
    height: '175cm',
    waist: '75cm',
    weight: '65kg',
    hip: '90cm',
    frontPhoto: 'https://example.com/front.jpg',
    leftPhoto: 'https://example.com/left.jpg',
    backPhoto: 'https://example.com/back.jpg',
    rightPhoto: 'https://example.com/right.jpg',
    assessmentResults: '患者身体状况良好...',
    planAnalysis: '建议继续保持...',
    doctorMessage: '祝您健康！'
  }
}

const handleCardClick = (item) => {
  if (item.route) {
    router.push(item.route)
  }
}

const viewReport = (row) => {
  fillReportForm(row)
  showReport.value = true
}

const handleCloseReport = () => {
  showReport.value = false
  isEditing.value = false
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveReport = () => {
  ElMessage.success('报告已保存')
  isEditing.value = false
}

const handleJoinRequest = (row, isApproved) => {
  const action = isApproved ? '同意' : '拒绝'
  ElMessage.success(`已${action}${row.patientName}的加入请求`)
  joinRequests.value = joinRequests.value.filter(request => request.patientName !== row.patientName)
}

const handleLeaveRequest = (row, isApproved) => {
  const action = isApproved ? '同意' : '拒绝'
  ElMessage.success(`已${action}${row.patientName}的退出请求`)
  leaveRequests.value = leaveRequests.value.filter(request => request.patientName !== row.patientName)
}
</script>

<style scoped>

.dashboard {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
  position: relative;
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

.bordered-section {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.photo-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.photo-item {
  width: 48%;
}

.photo-frame {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1;
}

.photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-label {
  text-align: center;
  margin-top: 5px;
}

.rating-card {
  cursor: default;
}
</style>