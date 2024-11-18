<template>
  <div class="consultation">
    <el-row :gutter="10" class="full-height">
      <el-col :span="4" class="full-height">
        <el-card class="box-card full-height">
          <template #header>
            <div class="card-header">
              <span>患者列表</span>
            </div>
          </template>
          <div class="patient-list">
            <div v-for="patient in patients" :key="patient.userId" class="patient-item" @click="selectPatient(patient)">
              <el-avatar :size="30" :src="patient.avatarUrl" />
              <div class="patient-info">
                <span class="patient-name">{{ patient.username }}</span>
                <span class="patient-status">{{ patient.status }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="full-height">
        <el-card class="box-card full-height">
          <template #header>
            <div class="card-header">
              <span>患者详细信息</span>
            </div>
          </template>
          <div v-if="selectedPatient" class="patient-details">
            <div class="basic-info">
              <p><strong>用户名：</strong>{{ selectedPatient.username }}</p>
              <p><strong>状态：</strong>{{ selectedPatient.status }}</p>
            </div>
            <el-divider />
            <div class="reports">
              <h4>检测报告</h4>
              <el-table :data="patientReports" style="width: 100%" :max-height="400">
                <el-table-column prop="createdAt" label="日期" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column prop="reportType" label="类型" width="120"></el-table-column>
                <el-table-column prop="state" label="状态" width="120"></el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button @click="viewReport(scope.row)" type="text" size="small">查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="full-height">
        <el-card class="box-card full-height">
          <template #header>
            <div class="card-header">
              <span>在线咨询</span>
            </div>
          </template>
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessagesRef">
              <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender === 'doctor' ? 'message-right' : 'message-left']">
                <el-avatar :size="30" :src="msg.sender === 'doctor' ? doctorAvatar : selectedPatient.avatarUrl" />
                <div class="message-content">
                  {{ msg.content }}
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="newMessage"
                placeholder="输入消息..."
                @keyup.enter="handleSendMessage"
              >
                <template #append>
                  <el-button @click="handleSendMessage">发送</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showReport" title="检测报告" width="70%" :before-close="handleCloseReport">
      <el-form :model="currentReport" label-width="120px">
        <el-form-item label="报告类型">
          <span>{{ currentReport.reportType }}</span>
        </el-form-item>
        <el-form-item label="检测结果">
          <span>{{ currentReport.result }}</span>
        </el-form-item>
        <el-form-item label="分析">
          <el-input type="textarea" v-model="currentReport.analyse" :rows="4" readonly></el-input>
        </el-form-item>
        <el-form-item label="医生评论">
          <el-input type="textarea" v-model="currentReport.comment" :rows="4" :readonly="!isEditing"></el-input>
        </el-form-item>
        <el-form-item label="报告图片">
          <el-image :src="currentReport.url" :preview-src-list="[currentReport.url]"></el-image>
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
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import axios from 'axios'

const store = useStore()

const patients = ref([])
const selectedPatient = ref(null)
const patientReports = ref([])
const messages = ref([])
const newMessage = ref('')
const chatMessagesRef = ref(null)
const showReport = ref(false)
const isEditing = ref(false)
const currentReport = ref({})
const doctorAvatar = ref('')  // 这里应该设置医生的头像URL

const fetchPatients = async () => {
  try {
    const response = await axios.get('/api/api/doctor/relation/selectMyPatients', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    patients.value = response.data
  } catch (error) {
    console.error('Failed to fetch patients:', error)
    ElMessage.error('获取患者列表失败')
  }
}

const selectPatient = async (patient) => {
  selectedPatient.value = patient
  try {
    const response = await axios.post('/api/api/doctor/relation/selectReports', { userId: patient.userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    patientReports.value = response.data
    // 这里应该加载与该患者的聊天记录
    // 由于API中没有提供获取聊天记录的接口，这里暂时清空消息列表
    messages.value = []
  } catch (error) {
    console.error('Failed to fetch patient reports:', error)
    ElMessage.error('获取患者报告失败')
  }
}

const viewReport = (report) => {
  currentReport.value = report
  showReport.value = true
}

const handleCloseReport = () => {
  if (isEditing.value) {
    cancelEdit()
  }
  showReport.value = false
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
  ElMessage.success('报告评论已保存')
  isEditing.value = false
  showReport.value = false
}

const handleSendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({ sender: 'doctor', content: newMessage.value })
    // 这里应该调用API来发送消息
    // 由于API中没有提供相应的接口，这里只是模拟了发送操作
    newMessage.value = ''
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  }
}

const formatDate = (dateArray) => {
  const [year, month, day, hour, minute, second] = dateArray
  return new Date(year, month - 1, day, hour, minute, second).toLocaleString()
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.consultation {
  height: calc(100vh - 60px);
}
.full-height {
  height: 100%;
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px);
}
.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}
.message {
  display: flex;
  margin-bottom: 10px;
}
.message-left {
  justify-content: flex-start;
}
.message-right {
  justify-content: flex-end;
  flex-direction: row-reverse;
}
.message-content {
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  background-color: #f0f2f5;
  margin: 0 10px;
}
.message-right .message-content {
  background-color: #95ec69;
}
.chat-input {
  padding: 20px;
}
.patient-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.patient-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background-color 0.3s;
}
.patient-item:hover {
  background-color: #f5f7fa;
}
.patient-info {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}
.patient-name {
  font-weight: bold;
}
.patient-status {
  font-size: 0.8em;
  color: #909399;
}
</style>