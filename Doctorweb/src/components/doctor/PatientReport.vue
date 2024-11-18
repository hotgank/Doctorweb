<template>
  <div class="patient-report">
    <el-descriptions title="患者信息" :column="2" border>
      <el-descriptions-item label="用户ID">{{ patient.userId }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ patient.username }}</el-descriptions-item>
      <el-descriptions-item label="年龄">{{ patient.age }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ patient.gender }}</el-descriptions-item>
      <el-descriptions-item label="体态">{{ patient.physique }}</el-descriptions-item>
      <el-descriptions-item label="头像">
        <el-avatar :size="50" :src="patient.avatarUrl" />
      </el-descriptions-item>
    </el-descriptions>

    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-2">医生建议</h3>
      <p>{{ patient.recommendation }}</p>
    </div>

    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-2">检测报告</h3>
      <el-table :data="patientReports" style="width: 100%">
        <el-table-column prop="createdAt" label="日期" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reportType" label="类型" width="120"></el-table-column>
        <el-table-column prop="state" label="状态" width="120"></el-table-column>
        <el-table-column prop="result" label="结果" width="120"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button @click="viewReportDetails(scope.row)" type="text" size="small">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useStore } from 'vuex'

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

const fetchPatientReports = async () => {
  try {
    const response = await axios.post('/api/api/doctor/relation/selectReports', 
      { userId: props.patient.userId },
      {
        headers: {
          Authorization: `Bearer ${store.state.token}`
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

onMounted(() => {
  fetchPatientReports()
})
</script>

<style scoped>
.patient-report {
  padding: 20px;
}
</style>