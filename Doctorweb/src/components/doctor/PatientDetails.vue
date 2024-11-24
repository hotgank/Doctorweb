<template>
  <div class="patient-details">
    <el-descriptions title="患者信息" :column="2" border>
      <el-descriptions-item label="用户ID">{{ patient.user.userId }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ patient.user.username }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ patient.user.status }}</el-descriptions-item>
      <el-descriptions-item label="头像">
        <el-avatar :size="50" :src="patient.user.avatarUrl" />
      </el-descriptions-item>
    </el-descriptions>

    <h2 class="mt-4 mb-2">检测报告</h2>
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
          <el-button @click="viewReport(scope.row)" type="text" size="small">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showReport" title="报告详情" width="70%">
      <el-form :model="currentReport" label-width="120px">
        <el-form-item label="姓名">
          <span>{{ currentReport.name}}</span>
        </el-form-item>
        <el-form-item label="性别">
          <span>{{ currentReport.gender }}</span>
        </el-form-item>
        <el-form-item label="出生日期">
          <span>{{formatDate2(currentReport.birthdate)}}</span>
        </el-form-item>
        <el-form-item label="身高">
          <span>{{ currentReport.height }}</span>
        </el-form-item>
        <el-form-item label="体重">
          <span>{{ currentReport.weight }}</span>
        </el-form-item>
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
          <el-input type="textarea" v-model="currentReport.comment" :rows="4" :readonly="!isEditing"></el-input>
        </el-form-item>
        <el-form-item label="报告图片">
          <el-image :src="imageSrc" :preview-src-list="[imageSrc]"></el-image>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="!isEditing" @click="startEdit">编辑评论</el-button>
          <el-button v-else @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveReport" :disabled="!isEditing">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useStore } from 'vuex'

const props = defineProps({
  patient: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const store = useStore()

const patientReports = ref([])
const showReport = ref(false)
const currentReport = ref({})
const isEditing = ref(false)
const imageSrc = ref('') // 用于存储报告图片的 URL

const fetchPatientReports = async () => {
  try {
    const response = await axios.post('/api/api/doctor/relation/selectReports',
      { userId: props.patient.user.userId },
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

const viewReport = (report) => {
  currentReport.value = { ...report }
  showReport.value = true
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
  // 这里应该实现保存报告评论的逻辑
  // 由于API中没有提供相应的接口，这里只是模拟了保存操作
  //发送POST请求，data为currentReport的id和comment
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
  } catch (error) {
    console.error('Failed to save report comment:', error)
    ElMessage.error('保存报告评论失败')
  }
  ElMessage.success('报告评论已保存')
  isEditing.value = false
  showReport.value = false
}

const formatDate = (dateArray) => {
  const [year, month, day, hour, minute, second] = dateArray
  return new Date(year, month - 1, day, hour, minute, second).toLocaleString()
}

const formatDate2 = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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
.patient-details {
  padding: 20px;
}
</style>