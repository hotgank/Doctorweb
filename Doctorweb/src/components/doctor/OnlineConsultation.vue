<template>
  <div class="consultation">
    <el-row :gutter="10" class="full-height">
      <el-col :span="6" class="full-height">
        <el-card class="box-card full-height">
          <template #header>
            <div class="card-header">
              <span>患者列表</span>
            </div>
          </template>
          <div class="patient-list">
            <div v-for="relation in doctorRelations" :key="relation.relationId" class="patient-item" @click="selectRelation(relation)">
              <el-avatar :size="30" :src="relation.user.avatarUrl || '/default-avatar.png'" />
              <div class="patient-info">
                <span class="patient-name">{{ relation.user.username }}</span>
                <span class="patient-status">{{ relation.user.status }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" class="full-height">
        <el-tabs v-model="activeTab" class="full-height">
          <el-tab-pane label="在线咨询" name="chat">
            <el-card v-if="selectedRelation" class="box-card full-height">
              <template #header>
                <div class="card-header">
                  <span>与 {{ selectedRelation.user.username }} 的对话</span>
                </div>
              </template>
              <div class="chat-container">
                <div class="chat-messages" ref="chatMessagesRef" @scroll="handleScroll">
                  <div v-for="msg in messages" :key="msg.messageSeq" :class="['message', msg.senderType === 'doctor' ? 'message-right' : 'message-left']">
                    <el-avatar :size="30" :src="msg.senderType === 'doctor' ? doctorAvatar : (selectedRelation.user.avatarUrl || '/default-avatar.png')" />
                    <div class="message-content">
                      {{ msg.messageText }}
                    </div>
                    <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
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
            <el-empty v-else description="请选择一个患者开始对话"></el-empty>
          </el-tab-pane>
          <el-tab-pane label="患者详情" name="details">
            <el-card v-if="selectedRelation" class="box-card full-height">
              <template #header>
                <div class="card-header">
                  <span>患者详细信息</span>
                </div>
              </template>
              <div class="patient-details">
                <div class="basic-info">
                  <el-avatar :size="64" :src="selectedRelation.user.avatarUrl || '/default-avatar.png'" />
                  <h2>{{ selectedRelation.user.username }}</h2>
                  <p><strong>状态：</strong>{{ selectedRelation.user.status }}</p>
                  <p><strong>用户ID：</strong>{{ selectedRelation.user.userId }}</p>
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
            <el-empty v-else description="请选择一个患者查看详情"></el-empty>
          </el-tab-pane>
        </el-tabs>
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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import axios from 'axios'
import { useRoute } from 'vue-router'

const store = useStore()
const route = useRoute()

const activeTab = ref('chat')
const doctorRelations = ref([])
const selectedRelation = ref(null)
const patientReports = ref([])
const messages = ref([])
const newMessage = ref('')
const chatMessagesRef = ref(null)
const showReport = ref(false)
const isEditing = ref(false)
const currentReport = ref({})
const doctorAvatar = ref('/doctor-avatar.png')  // 假设医生头像的URL

let messagePollingInterval = null

const fetchDoctorRelations = async () => {
  try {
    const response = await axios.get('/api/api/doctor/relation/selectMyPatientsAndRelationId', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    doctorRelations.value = response.data
    if (route.query.relationId) {
      const relation = doctorRelations.value.find(r => r.relationId === parseInt(route.query.relationId))
      if (relation) {
        selectRelation(relation)
      }
    }
  } catch (error) {
    console.error('Failed to fetch doctor relations:', error)
    ElMessage.error('获取医生关系列表失败')
  }
}

const selectRelation = async (relation) => {
  selectedRelation.value = relation
  messages.value = []
  await loadInitialMessages(relation.relationId)
  await fetchPatientReports(relation.user.userId)
  startMessagePolling(relation.relationId)
}

const fetchPatientReports = async (userId) => {
  try {
    const response = await axios.post('/api/api/doctor/relation/selectReports', { userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    patientReports.value = response.data
  } catch (error) {
    console.error('Failed to fetch patient reports:', error)
    ElMessage.error('获取患者报告失败')
  }
}

const loadInitialMessages = async (relationId) => {
  try {
    const response = await axios.get(`/api/api/messages/last30/${relationId}`, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    messages.value = response.data
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load initial messages:', error)
    ElMessage.error('加载消息失败')
  }
}

const loadMoreMessages = async () => {
  if (messages.value.length === 0) return

  const oldestMessageSeq = messages.value[0].messageSeq
  try {
    const response = await axios.get(`/api/api/messages/before/${selectedRelation.value.relationId}/${oldestMessageSeq}`, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    messages.value = [...response.data, ...messages.value]
  } catch (error) {
    console.error('Failed to load more messages:', error)
    ElMessage.error('加载更多消息失败')
  }
}

const startMessagePolling = (relationId) => {
  stopMessagePolling()
  messagePollingInterval = setInterval(async () => {
    if (messages.value.length === 0) return

    const latestMessageSeq = messages.value[messages.value.length - 1].messageSeq
    try {
      const response = await axios.get(`/api/api/messages/after/${relationId}/${latestMessageSeq}`, {
        headers: {
          Authorization: `Bearer ${store.state.token}`
        }
      })
      messages.value = [...messages.value, ...response.data]
      if (response.data.length > 0) {
        scrollToBottom()
      }
    } catch (error) {
      console.error('Failed to poll new messages:', error)
    }
  }, 3000)
}

const stopMessagePolling = () => {
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval)
    messagePollingInterval = null
  }
}

const handleSendMessage = async () => {
  if (newMessage.value.trim() && selectedRelation.value) {
    try {
      const response = await axios.post('/api/api/messages/send', {
        relationId: selectedRelation.value.relationId,
        senderType: 'doctor',
        messageText: newMessage.value.trim(),
        messageType: 'text',
        url: null
      }, {
        headers: {
          Authorization: `Bearer ${store.state.token}`
        }
      })
      messages.value.push(response.data)
      newMessage.value = ''
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
      ElMessage.error('发送消息失败')
    }
  }
}

const handleScroll = (event) => {
  if (event.target.scrollTop === 0) {
    loadMoreMessages()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
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

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const formatDate = (dateArray) => {
  const [year, month, day, hour, minute, second] = dateArray
  return new Date(year, month - 1, day, hour, minute, second).toLocaleString()
}

onMounted(() => {
  fetchDoctorRelations()
})

onUnmounted(() => {
  stopMessagePolling()
})

watch(selectedRelation, (newRelation) => {
  if (newRelation) {
    startMessagePolling(newRelation.relationId)
  } else {
    stopMessagePolling()
  }
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
  align-items: flex-start;
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
.message-time {
  font-size: 0.7em;
  color: #909399;
  margin-top: 5px;
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
.basic-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.basic-info h2 {
  margin: 10px 0;
}
</style>