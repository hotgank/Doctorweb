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
      <el-tab-pane label="即将进行的咨询" name="upcoming">
        <el-table :data="upcomingConsultations" style="width: 100%">
          <el-table-column prop="patientName" label="患者姓名" width="180" />
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column fixed="right" label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewReport(scope.row.id)">查看报告</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 查看报告对话框 -->
    <el-dialog v-model="showReport" title="检测报告" width="70%" :before-close="handleCloseReport">
      <el-form :model="reportForm" label-width="120px">
        <!-- ...其他表单内容... -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="saveReport">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index'

const stats = ref([
  { title: '总患者数', value: '0', description: '较上月增长20%' },
  { title: '今日咨询', value: '0', description: '比昨天多3个' },
  { title: '已发布文章', value: '0', description: '本周新增2篇' },
  { title: '评分', value: '0', description: '较上月提高0.1' }
])

const activeTab = ref('upcoming')
const showReport = ref(false)
const reportForm = ref({})
const upcomingConsultations = ref([])

const fetchDoctorInfo = async () => {
  try {
    const response = await axiosInstance.get('/api/doctor/information')
    // const data = response.data
    // stats.value = data.stats
    // upcomingConsultations.value = data.upcomingConsultations
  } catch (error) {
    ElMessage.error('获取医生信息失败')
  }
}

const viewReport = async (id) => {
  // try {
  //   const response = await axiosInstance.get(`/api/report/${id}`)
  //   reportForm.value = response.data
  //   showReport.value = true
  // } catch (error) {
  //   ElMessage.error('获取报告失败')
  // }
}

const handleCloseReport = () => {
  showReport.value = false
}

onMounted(() => {
  fetchDoctorInfo()
  setInterval(fetchDoctorInfo, 30000) // 每30秒获取数据
})
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