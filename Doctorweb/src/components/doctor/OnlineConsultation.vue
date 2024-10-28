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
            <div v-for="patient in patients" :key="patient.id" class="patient-item" @click="selectPatient(patient)">
              <el-avatar :size="30" :icon="Avatar" />
              <div class="patient-info">
                <span class="patient-name">{{ patient.name }}</span>
                <span class="patient-age-gender">{{ patient.age }}岁 {{ patient.gender }}</span>
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
              <p><strong>姓名：</strong>{{ selectedPatient.name }}</p>
              <p><strong>年龄：</strong>{{ selectedPatient.age }}</p>
              <p><strong>性别：</strong>{{ selectedPatient.gender }}</p>
            </div>
            <el-divider />
            <div class="latest-report">
              <h4>最新体态检测报告</h4>
              <p><strong>日期：</strong>{{ selectedPatient.latestReport.date }}</p>
              <p><strong>摘要：</strong>{{ selectedPatient.latestReport.summary }}</p>
              <el-button type="primary" size="small" @click="viewReport(selectedPatient.latestReport)">查看报告</el-button>
            </div>
            <el-divider />
            <div class="historical-reports">
              <h4>历史体态报告</h4>
              <el-table :data="selectedPatient.historicalReports" style="width: 100%" :max-height="200">
                <el-table-column prop="date" label="日期" width="100"></el-table-column>
                <el-table-column prop="summary" label="摘要" show-overflow-tooltip></el-table-column>
                <el-table-column label="操作" width="80">
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
                <el-avatar :size="30" :icon="msg.sender === 'doctor' ? User : Avatar" />
                <div class="message-content">
                  <template v-if="msg.type === 'text'">
                    {{ msg.content }}
                  </template>
                  <template v-else-if="msg.type === 'image'">
                    <el-image 
                      :src="msg.content" 
                      :preview-src-list="[msg.content]"
                      fit="cover"
                      class="message-image"
                    />
                  </template>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="newMessage"
                placeholder="输入消息..."
                @keyup.enter="handleSendMessage"
              >
                <template #prepend>
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :auto-upload="false"
                    :on-change="handleFileChange"
                    :show-file-list="false"
                  >
                    <el-button type="primary">
                      <el-icon><Picture /></el-icon>
                    </el-button>
                  </el-upload>
                </template>
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
      <el-form :model="reportForm" label-width="120px">
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

        <el-form-item label="基础信息">
          <el-row :gutter="20" class="bordered-section">
            <el-col :span="12">
              <el-form-item label="身高:">
                <span>{{ reportForm.height }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="腰围:">
                <span>{{ reportForm.waist }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
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
import { ref, onMounted, nextTick } from 'vue'
import { User, Avatar, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';

const messages = ref([])
const newMessage = ref('')
const selectedPatient = ref(null)
const chatMessagesRef = ref(null)
const selectedImage = ref(null)
const showReport = ref(false)
const isEditing = ref(false)
const originalReport = ref({})

const reportForm = ref({
  name: '',
  age: '',
  height: '',
  weight: '',
  waist: '',
  hip: '',
  assessmentResults: '',
  planAnalysis: '',
  doctorMessage: '',
  frontPhoto: '',
  leftPhoto: '',
  backPhoto: '',
  rightPhoto: '',
})

const patients = ref([
  { 
    id: 1, 
    name: '小明', 
    age: 8, 
    gender: '男', 
    avatar: '/placeholder.svg?height=40&width=40',
    latestReport: {
      id: 'report1',
      date: '2023-05-01',
      summary: '体态良好，建议继续保持正确的坐姿和运动习惯。',
    },
    historicalReports: [
      {
        id: 'report2',
        date: '2023-04-01',
        summary: '轻微驼背，建议增加背部肌肉锻炼。',
      },
      {
        id: 'report3',
        date: '2023-03-01',
        summary: '体态正常，继续保持。',
      }
    ],
    consultationHistory: [
      { sender: 'patient', content: '医生，小红最近检查出轻度脊柱侧弯，我们该怎么办？', type: 'text' },
      { sender: 'doctor', content: '您好，不用太过担心。轻度脊柱侧弯在小红这个年龄段是可以通过适当的运动来改善的。我们可以从以下几个方面着手：', type: 'text' },
      { sender: 'doctor', content: '1. 保持良好的坐姿和站姿\n2. 进行针对性的矫正运动，如猫狗伸展、骨盆倾斜等\n3. 游泳是很好的全身运动，特别有利于改善脊柱问题\n4. 定期复查，监测侧弯的变化', type: 'text' },
      { sender: 'patient', content: '谢谢医生，我们会严格按照您的建议执行。请问多久做一次复查比较好？', type: 'text' },
      { sender: 'doctor', content: '建议每3-6个月复查一次。如果在这期间发现明显变化或有不适，随时可以来院检查。坚持治疗和运动，相信小红的情况会逐渐改善的。', type: 'text' },
    ]
  },
  { 
    id: 3, 
    name: '小张', 
    age: 9, 
    gender: '男', 
    avatar: '/placeholder.svg?height=40&width=40',
    latestReport: {
      date: '2023-05-03',
      summary: '颈椎前倾，建议调整电子设备使用姿势，增加颈部肌肉锻炼。',
    },
    consultationHistory: [
      { sender: 'patient', content: '医生，小张最近总是说脖子酸痛，检查报告说是颈椎前倾，这是怎么回事？', type: 'text' },
      { sender: 'doctor', content: '您好，颈椎前倾通常是由于长期低头看电子设备或不良坐姿导致的。对于9岁的孩子来说，这个问题越来越常见了。', type: 'text' },
      { sender: 'doctor', content: '我的建议是：\n1. 限制使用电子设备的时间，每30分钟要休息5分钟\n2. 调整设备使用姿势，将屏幕抬高到眼睛水平\n3. 进行颈部肌肉锻炼，如颈部伸展、转动等\n4. 保持正确的坐姿，背部挺直，肩膀放松', type: 'text' },
      { sender: 'patient', content: '明白了，请问有什么简单的颈部锻炼动作可以教给小张吗？', type: 'text' },
      { sender: 'doctor', content: '当然，这里有几个简单的动作：\n1. 缓慢地将头向后仰，感受颈部前侧的拉伸，保持5秒后回正\n2. 轻轻地将头向左右两侧倾斜，每侧保持5秒\n3. 慢慢地转动头部，画一个想象中的圆\n每个动作重复5-10次，每天做2-3次。记住，动作要缓慢轻柔，如果感到疼痛要立即停止。', type: 'text' },
    ]
  },
])



const selectPatient = (patient) => {
  selectedPatient.value = patient
  messages.value = patient.consultationHistory
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

onMounted(() => {
  // 默认选择第一个患者
  if (patients.value.length > 0) {
    selectPatient(patients.value[0])
  }
})

const handleSendMessage = () => {
  if (newMessage.value.trim() || selectedImage.value) {
    if (selectedImage.value) {
      messages.value.push({ sender: 'doctor', content: selectedImage.value, type: 'image' })
      selectedPatient.value.consultationHistory.push({ sender: 'doctor', content: selectedImage.value, type: 'image' })
      selectedImage.value = null
    }
    if (newMessage.value.trim()) {
      messages.value.push({ sender: 'doctor', content: newMessage.value, type: 'text' })
      selectedPatient.value.consultationHistory.push({ sender: 'doctor', content: newMessage.value, type: 'text' })
      newMessage.value = ''
    }
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  }
}

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target.result
    handleSendMessage()
  }
  reader.readAsDataURL(file.raw)
}

/**
 * 关闭报告对话框
 */
 const handleCloseReport = () => {
  if (isEditing.value) {
    // 如果正在编辑，取消编辑并关闭对话框
    cancelEdit()
  } else {
    showReport.value = false
  }
}

const viewReport = (report) => {
  // 使用传递的报告数据填充 reportForm
  reportForm.value = {
    name: selectedPatient.value.name,
    age: selectedPatient.value.age,
    height: report.height || '170cm',
    weight: report.weight || '65kg',
    waist: report.waist || '80cm',
    hip: report.hip || '90cm',
    assessmentResults: report.assessmentResults || '评测结果将在这里显示。',
    planAnalysis: report.planAnalysis || '方案分析将在这里显示。',
    doctorMessage: report.doctorMessage || '医生留言将在这里显示。',
    frontPhoto: report.frontPhoto || 'https://via.placeholder.com/150',
    leftPhoto: report.leftPhoto || 'https://via.placeholder.com/150',
    backPhoto: report.backPhoto || 'https://via.placeholder.com/150',
    rightPhoto: report.rightPhoto || 'https://via.placeholder.com/150',
  }
  // 保存原始数据以便取消编辑时恢复
  originalReport.value = { ...reportForm.value }
  isEditing.value = false
  showReport.value = true
}


/**
 * 开始编辑报告
 */
 const startEdit = () => {
  isEditing.value = true
}

/**
 * 取消编辑报告
 */
const cancelEdit = () => {
  // 恢复原始数据
  reportForm.value = { ...originalReport.value }
  isEditing.value = false
}

/**
 * 保存报告编辑
 */
 const saveReport = () => {
  // 这里应将 reportForm 的内容保存到后端或状态管理中
  // 目前仅显示成功消息
  ElMessage.success('检测报告已保存')
  isEditing.value = false
  showReport.value = false
}


</script>

<style scoped>
.consultation {
  height: calc(100vh - 60px);
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
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
  flex-grow: 1;
  min-width: 0;
  width: 75%;
}
.patient-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.patient-age-gender {
  font-size: 0.8em;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 5px;
}
.full-report {
  margin-top: 10px;
}
</style>