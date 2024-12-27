<template>
  <div class="consultation">
    <el-row :gutter="10">
      <!-- 左侧家长列表部分 -->
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>家长列表</span>
            </div>
          </template>
          <div class="patient-list">
            <div v-for="relation in doctorRelations" :key="relation.relationId" class="patient-item" @click="selectRelation(relation)">
              <div class="avatar-wrapper" :class="{ 'has-unread': relation.doctorUnread > 0 }">
                <el-avatar :size="30" :src="relation.user.avatarUrl || '/default-avatar.png'" />
                <span v-if="relation.doctorUnread > 0" class="unread-dot">{{ relation.doctorUnread }}</span>
              </div>
              <div class="patient-info">
                <span class="patient-name">{{ relation.user.username }}</span>
                <span class="patient-status">{{ relation.user.status === 'active'? '活跃' : '停用' }}</span>
                <span v-if="relation.userUnread > 0" class="unread-tip">用户未读：{{ relation.userUnread }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- 右侧聊天区域 -->
      <el-col :span="18">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="在线咨询" name="chat">
            <el-card v-if="selectedRelation" class="box-card">
              <div class="chat-container">
                <!-- 聊天消息区域 -->
                <el-row>
                  <div class="chat-messages" ref="chatMessagesRef" @scroll="handleScroll">
                    <el-row v-for="msg in messages" :key="msg.messageSeq">
                      <div v-if="msg.senderType !== 'doctor'" class="message message-left">
                        <el-avatar :size="30" class="message-avatar message-avatar-left" :src="msg.senderType === 'doctor'? doctorAvatar : (selectedRelation.user.avatarUrl || '/default-avatar.png')" />
                        <div class="message-content message-left">
                          <!-- 文本消息 -->
                          <div v-if="!msg.url" class="message-text">{{ msg.messageText }}</div>
                          <!-- 图片消息 -->
                          <div v-else-if="msg.messageType === 'image'">
                            <el-image
                                v-if="msg.imageUrl"
                                :src="msg.imageUrl"
                                fit="cover"
                                class="message-image"
                            />
                            <el-skeleton v-else :rows="3" animated />
                          </div>
                          <!-- 其他类型附件 -->
                          <div v-else class="attachment-container">
                            <div class="attachment-info">
                              <el-icon><Document /></el-icon>
                            </div>
                            <el-button
                                type="primary"
                                link
                                @click="downloadAttachment(msg.url)"
                            >
                              下载附件
                            </el-button>
                          </div>
                        </div>
                        <span class="message-time message-left">{{ formatTime(msg.timestamp) }}</span>
                      </div>
                      <div v-else class="message message-right">
                        <span class="message-time message-right">{{ formatTime(msg.timestamp) }}</span>
                        <div class="message-content message-right">
                          <!-- 文本消息 -->
                          <div v-if="!msg.url" class="message-text">{{ msg.messageText }}</div>
                          <!-- 图片消息 -->
                          <div v-else-if="msg.messageType === 'image'">
                            <el-image
                                v-if="msg.imageUrl"
                                :src="msg.imageUrl"
                                fit="cover"
                                class="message-image"
                            />
                            <el-skeleton v-else :rows="3" animated />
                          </div>
                          <!-- 其他类型附件 -->
                          <div v-else class="attachment-container">
                            <div class="attachment-info">
                              <el-icon><Document /></el-icon>
                            </div>
                            <el-button
                                type="primary"
                                link
                                @click="downloadAttachment(msg.url)"
                            >
                              下载附件
                            </el-button>
                            </div>
                        </div>
                        <el-avatar :size="30" c :src="msg.senderType === 'doctor'? doctorAvatar : (selectedRelation.user.avatarUrl || '/default-avatar.png')" />
                      </div>
                    </el-row>
                  </div>
                </el-row>

                <!-- 输入区域 -->
                <el-row :align="'bottom'" :gutter="10">
                  <div class="input-container">
                    <el-upload
                        class="upload-attachment"
                        action="/api/api/messages/sendFile"
                        :headers="uploadHeaders"
                        :before-upload="beforeUpload"
                        :on-success="handleUploadSuccess"
                        :on-error="handleUploadError"
                        :limit="1"
                        :auto-upload="true"
                        :show-file-list="false"
                    >

                    </el-upload>
                    <el-upload
                        class="upload-image"
                        action="/api/api/messages/sendFile"
                        :headers="uploadHeaders"
                        :before-upload="beforeImageUpload"
                        :on-success="handleImageUploadSuccess"
                        :on-error="handleUploadError"
                        :limit="1"
                        :auto-upload="true"
                        :show-file-list="false"
                        accept="image/*"
                    >
                      <el-button type="primary" link>
                        <el-icon><Picture /></el-icon>
                      </el-button>
                    </el-upload>
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
                </el-row>
              </div>
            </el-card>
            <el-empty v-else description="请选择一个家长开始对话"></el-empty>
          </el-tab-pane>

          <!-- 家长详情标签页 -->
          <el-tab-pane label="家长详情" name="details">
            <el-scrollbar class="details-scrollbar">
              <el-card v-if="selectedRelation" class="box-card">
                <template #header>
                  <div class="card-header">
                    <span>家长详细信息</span>
                  </div>
                </template>
                <div class="patient-details">
                  <div class="basic-info">
                    <el-avatar :size="64" :src="selectedRelation.user.avatarUrl || '/default-avatar.png'" />
                    <h2>{{ selectedRelation.user.username }}</h2>
                    <p><strong>状态：</strong>{{ selectedRelation.user.status === 'active'? '活跃' : '停用' }}</p>
                  </div>
                  <el-divider />
                  <div class="reports">
                    <h4>检测报告</h4>
                    <el-input
                        v-model="reportSearchQuery"
                        placeholder="输入姓名"
                        prefix-icon="el-icon-search"
                        clearable
                        @input="filterReports"
                        style="margin-bottom: 15px; width: 300px;"
                    />
                    <el-table :data="filteredReports" style="width: 100%">
                      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
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
              <el-empty v-else description="请选择一个家长查看详情"></el-empty>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <el-dialog v-model="showReport" title="检测报告" width="70%" :before-close="handleCloseReport">
      <div id="report-content" class="report-container">
        <div class="report-header">
          <img src="/img/logo.webp" alt="Logo" class="report-logo">
          <h2>检测报告</h2>
        </div>
        <div class="report-body">
          <el-form :model="currentReport" label-width="120px">
            <el-form-item label="姓名">
              <span>{{ currentReport.name }}</span>
            </el-form-item>
            <el-form-item label="性别">
              <span>{{ currentReport.gender }}</span>
            </el-form-item>
            <el-form-item label="出生日期">
              <span>{{ formatDate2(currentReport.birthdate) }}</span>
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
        </div>
        <div class="report-footer">
          <p>报告生成日期：{{ formatDate2(new Date()) }}</p>
        </div>
        <div class="report-watermark"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="!isEditing" @click="startEdit">编辑评论</el-button>
          <el-button v-else @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveReport" :disabled="!isEditing">保存</el-button>
          <el-button type="primary" @click="generatePDF">下载PDF</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {Document, Picture} from '@element-plus/icons-vue'
import {useStore} from 'vuex'
import {useRoute} from 'vue-router'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useStore()
const route = useRoute()

const activeTab = ref('chat')
const doctorRelations = ref([])
const selectedRelation = ref(null)
const patientReports = ref([])
const messages = ref([])
const newMessage = ref('')
const chatMessagesRef = ref(null)
const doctorAvatar = ref(store.state.avatar)
const currentAttachment = ref(null)
const minSeq = ref(5)
const maxSeq = ref(10)

let messagePollingInterval = null
let doctorRelationsPollingInterval = null

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${store.state.token}`
}))

// Add these new refs
const reportSearchQuery = ref('')
const filteredReports = ref([])


const fetchDoctorRelations = async () => {
  try {
    const response = await axios.get('/api/api/doctor/relation/selectMyPatientsAndRelationIdAndUnread', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    });

    // 处理响应数据，替换 avatarUrl
    doctorRelations.value = response.data.map(relation => {
      const newAvatarUrl = relation.user.avatarUrl.replace('http://localhost:8080/UserAvatar/', 'https://zeropw.cn:8081/UserAvatar/');
      return {
        ...relation,
        user: {
          ...relation.user,
          avatarUrl: newAvatarUrl
        }
      };
    });

    if (route.query.relationId) {
      const relation = doctorRelations.value.find(r => r.relationId === parseInt(route.query.relationId));
      if (relation) {
        selectRelation(relation);
      }
    }
  } catch (error) {
    console.error('Failed to fetch doctor relations:', error);
    ElMessage.error('获取医生关系列表失败');
  }
};

const selectRelation = async (relation) => {
  selectedRelation.value = relation
  messages.value = []
  await loadInitialMessages(relation.relationId)
  await fetchPatientReports(relation.user.userId)
  startMessagePolling()
}

const fetchPatientReports = async (userId) => {
  try {
    const response = await axios.post('/api/api/doctor/relation/selectReports', { userId }, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    patientReports.value = response.data
    filteredReports.value = response.data // Initialize filteredReports
  } catch (error) {
    console.error('Failed to fetch patient reports:', error)
    ElMessage.error('获取患者报告失败')
  }
}

// 修改 loadInitialMessages 函数
const loadInitialMessages = async (relationId) => {
  try {
    const response = await axios.get(`/api/api/messages/last30/${relationId}`, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    messages.value = response.data
    if (messages.value.length > 0) {
      minSeq.value = messages.value[0].messageSeq
      maxSeq.value = messages.value[messages.value.length - 1].messageSeq
    }
    await loadImageUrls() // 加载图片 URL
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load initial messages:', error)
    ElMessage.error('加载消息失败')
  }
}

const loadMoreMessages = async () => {
  if (messages.value.length === 0 || minSeq.value <= 1) return

  try {
    const response = await axios.get(`/api/api/messages/before/${selectedRelation.value.relationId}/${minSeq.value}`, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    if (response.data.length > 0) {
      const newMessages = response.data.filter(msg =>
          !messages.value.some(existing => existing.messageSeq === msg.messageSeq)
      )
      messages.value = [...newMessages, ...messages.value]
      minSeq.value = newMessages[0].messageSeq
    }
  } catch (error) {
    console.error('Failed to load more messages:', error)
    ElMessage.error('加载更多消息失败')
  }
}

// 修改 pollNewMessages 函数
const pollNewMessages = async () => {
  if (!selectedRelation.value || messages.value.length === 0) return

  try {
    const response = await axios.get(`/api/api/messages/after/${selectedRelation.value.relationId}/${maxSeq.value}`, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    if (response.data.length > 0) {
      const newMessages = response.data.filter(msg =>
          !messages.value.some(existing => existing.messageSeq === msg.messageSeq)
      )
      messages.value = [...messages.value, ...newMessages]
      maxSeq.value = newMessages[newMessages.length - 1].messageSeq
      await loadImageUrls() // 加载新消息的图片 URL
      scrollToBottom()
    }
  } catch (error) {
    console.error('Failed to poll new messages:', error)
  }
}
// 修改 generatePDF 函数
const generatePDF = async () => {
  try {
    const element = document.getElementById('report-content')
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    let position = 0
    
    while (position < imgHeight) {
      pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight)
      position += pdfHeight
      if (position < imgHeight) {
        pdf.addPage()
      }
    }
    
    pdf.save(`患者报告_${currentReport.value.name}.pdf`)
    
    ElMessage.success('PDF报告已生成并开始下载')
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    ElMessage.error('生成PDF报告失败')
  }
}
const handleSendMessage = async () => {
  if ((!newMessage.value.trim() && !currentAttachment.value) || !selectedRelation.value) return

  try {
    const messageData = {
      relationId: selectedRelation.value.relationId,
      senderType: 'doctor',
      messageText: newMessage.value.trim(),
      messageType: currentAttachment.value ? currentAttachment.value.type : 'text',
      url: currentAttachment.value ? currentAttachment.value.url : null
    }

    const response = await axios.post('/api/api/messages/send', messageData, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })

    messages.value.push(response.data)
    maxSeq.value = response.data.messageSeq
    newMessage.value = ''
    currentAttachment.value = null  // 确保在这里清除当前附件
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    ElMessage.error('发送消息失败')
  }
}

const beforeUpload = (file) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过5MB')
    return false
  }
  const formData = new FormData();
  formData.append('relationId', selectedRelation.value.relationId);
  formData.append('messageText', newMessage.value.trim());
  formData.append('file', file);

  axios.post(`/api/api/messages/sendFile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${store.state.token}`
    }
  }).then(response => {
    console.log(response.data);
    // 处理成功响应
    ElMessage.success('上传成功');
    // 更新当前附件信息
    currentAttachment.value = {
      url: response.data.url,
      type: 'file',
      name: file.name
    };
    currentAttachment.value = null;  // 发送后立即清除当前附件
  }).catch(error => {
    console.error(error);
    ElMessage.error('上传失败');
  });

  // 返回 false 阻止默认上传行为
  return false;
}

const handleUploadSuccess = (response, file) => {
  const formData = new FormData();
  formData.append('relationId', selectedRelation.value.relationId);
  formData.append('messageText', newMessage.value.trim());
  formData.append('file', file);

  axios.post('/api/api/messages/sendFile', formData, {
    headers: {
      ...uploadHeaders.value,
      'Content-Type': 'multipart/form-data'
    }
  }).then((response) => {
    currentAttachment.value = {
      url: response.data.url,
      type: response.data.type,
      name: response.data.name
    };
    ElMessage.success('附件上传成功');
    handleSendMessage();
  }).catch((error) => {
    console.error('Failed to send file:', error);
    ElMessage.error('附件上传失败');
  });
}

const handleUploadError = () => {
  ElMessage.error('附件上传失败')
}

const downloadAttachment = async (url) => {
  try {
    const response = await axios.get(`/api/api/url/getMessageAttachment?url=${encodeURIComponent(url)}`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = url.split('/').pop() // 使用URL最后一部分作为文件名
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Failed to download attachment:', error)
    ElMessage.error('下载附件失败')
  }
}

const handleScroll = (event) => {
  const { scrollTop } = event.target
  if (scrollTop === 0) {
    loadMoreMessages()
  }
}

const startMessagePolling = () => {
  stopMessagePolling()
  messagePollingInterval = setInterval(pollNewMessages, 3000)
}

const stopMessagePolling = () => {
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval)
    messagePollingInterval = null
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchDoctorRelations()
  store.dispatch('fetchDoctorAvatar').then(() => {
    doctorAvatar.value = store.state.avatar
  })
})

onUnmounted(() => {
  stopMessagePolling()
})

watch(selectedRelation, (newRelation) => {
  if (newRelation) {
    startMessagePolling()
  } else {
    stopMessagePolling()
  }
})


const showReport = ref(false)
const isEditing = ref(false)
const currentReport = ref({})
const imageSrc = ref('') // 用于存储报告图片的 URL



const viewReport = (report) => {
  currentReport.value = report
  showReport.value = true
  fetchReportImage(report.url) // 获取报告图片
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

watch(messages, async () => {
  await loadImageUrls()
}, { deep: true })

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

const formatDate2 = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }

  const formData = new FormData();
  formData.append('relationId', selectedRelation.value.relationId);
  formData.append('messageText', newMessage.value.trim());
  formData.append('file', file);

  axios.post(`/api/api/messages/sendFile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${store.state.token}`
    }
  }).then(response => {
    console.log(response.data);
    // 处理成功响应
    ElMessage.success('图片上传成功');
    // 更新当前附件信息并立即发送消息
    currentAttachment.value = {
      url: response.data.url,
      type: 'image',
      name: file.name
    };
    currentAttachment.value = null;  // 发送后立即清除当前附件
  }).catch(error => {
    console.error(error);
    ElMessage.error('图片上传失败');
  });

  // 返回 false 阻止默认上传行为
  return false;
}

const handleImageUploadSuccess = (response) => {
  currentAttachment.value = {
    url: response.url,
    type: 'image',
    name: response.name
  }
  ElMessage.success('图片上传成功')
  handleSendMessage()  // 直接调用handleSendMessage来发送图片消息
  currentAttachment.value = null  // 发送后立即清除当前附件
}

const loadImageUrls = async () => {
  for (const msg of messages.value) {
    if (msg.messageType === 'image' && msg.url && !msg.imageUrl) {
      msg.imageUrl = await imageUrl(msg.url)
    }
  }
}

const imageUrl = async (url) => {
  try {
    const response = await axios.get(`/api/api/url/getMessageAttachment?url=${url}`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    });
    const blob = new Blob([response.data]);
    return window.URL.createObjectURL(blob); // 返回字符串
  } catch (error) {
    console.error('Failed to fetch image:', error)
    return null
  }
}

// Add this new function
const filterReports = () => {
  if (reportSearchQuery.value) {
    filteredReports.value = patientReports.value.filter(report =>
        report.name.toLowerCase().includes(reportSearchQuery.value.toLowerCase())
    )
  } else {
    filteredReports.value = patientReports.value
  }
}

onMounted(() => {
  fetchDoctorRelations();
  //store.dispatch('fetchDoctorAvatar').then(() => {
  //  doctorAvatar.value = store.state.avatar;
  //});

  // 启动定时器，每7秒调用一次 fetchDoctorRelations
  doctorRelationsPollingInterval = setInterval(fetchDoctorRelations, 7000);
});

onUnmounted(() => {
  stopMessagePolling();
  // 清除定时器
  clearInterval(doctorRelationsPollingInterval);
});
</script>

<style scoped>
.consultation {
  height: calc(100% - 60px);
  resize: vertical; /* 允许垂直调整大小 */
  min-height: 20%; /* 设置最小高度 */
  max-height: 70%; /* 设置最大高度 */
}

.box-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: white;
  height: 100%;
  transition: all 0.3s ease;
}

.card-header {
  box-sizing: border-box;
}

.full-height {
  height: calc(50% - 100px);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.chat-messages {
  flex-grow: 1;
  min-height: 1200px;
  max-height: 1200px; /* 默认高度 */
  overflow-y: auto;
}

.message {
  display: flex;
  margin-bottom: 10px;
}

.upload-attachment,
.upload-image {
  display: flex;
  align-items: center;
}

.message-content {
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  margin: 0 10px;
  white-space: normal;
}

.message-left {
  text-align: left;
  margin-left: 0;
  margin-right: auto;
}

.message-right {
  text-align: right;
  margin-left: auto;
  margin-right: 0;
}

.message-left .message-content {
  background-color: #f0f2f5;
  margin-left: 5px;
}

.message-right .message-content {
  text-align: left; /* 内容保持左对齐 */
  margin-right: 5px;
  background-color: #95ec69;
}

.message-text {
  word-break: break-all;
  white-space: pre-wrap;
}

/* 右侧对齐的消息时间样式 */
.message-right .message-time {
  float: right;
  margin-right: 10px;
}

/* 右侧对齐的消息头像样式 */
.message-right .message-avatar {
  float: right;
  margin-right: 5px;
}

/* 左侧对齐的消息时间样式 */
.message-left .message-time {
  margin-left: 10px;
}

/* 左侧对齐的消息头像样式 */
.message-left .message-avatar {
  margin-left: 5px;
}

.message-time {
  font-size: 0.7em;
  color: #909399;
  margin-top: 5px;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 5px;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.upload-attachment {
  flex-shrink: 0;
}

.attachment-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.attachment-info {
  display: flex;
}
.consultation {
  height: calc(100vh - 60px);
}

.patient-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto; /* 添加垂直滑动条 */
  height: calc(100% - 60px); /* 确保有足够的高度来显示垂直滑动条 */
  max-height: 1200px; /* 默认高度 */
}

.patient-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background-color 0.3s;
  width: 95%;
}

.patient-item:hover {
  background-color: #f5f7fa;
}

.patient-info {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  white-space: nowrap;
}

.patient-name {
  font-weight: bold;
}

.patient-status {
  font-size: 0.8em;
  color: #909399;
}

.details-scrollbar {
  height: calc(100vh - 120px); /* 调整高度以适应页面布局 */
}

.patient-details {
  padding: 20px;
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

.reports {
  margin-top: 20px;
}

.reports h4 {
  margin-bottom: 10px;
}
.has-unread {
    position: relative;
  }
 .unread-dot {
    position: absolute;
    right: 0;
    top: 0;
    background-color: red;
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
  }
 .unread-tip {
    font-size: 12px;
    color: gray;
  }
/* 确保表格不会超出容器 */
.el-table {
  width: 100% !important;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 16px;
}

:deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item:hover) {
  color: #10b981;
}

:deep(.el-tabs__active-bar) {
  background-color: #10b981;
  height: 3px;
}

:deep(.el-table th) {
  font-weight: bold;
  font-size: 16px;
  color: #111827;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
}

:deep(.el-table tbody tr:hover) {
  background-color: #f9fafb;
  cursor: pointer;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

:deep(.el-dialog__footer button) {
  padding: 10px 20px;
  transition: all 0.2s ease;
}
:deep(.el-dialog__footer button:hover) {
  transform: scale(1.05);
}

:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-empty__description) {
  margin-top: 16px;
  color: #64748b;
}

:deep(.el-input__inner::-webkit-input-placeholder) {
  color: #a1a1aa;
}
:deep(.el-input__inner:focus::-webkit-input-placeholder) {
  color: transparent;
}
:deep(.el-button--primary.create-button) {
  background-color: #10b981;
  border-color: #10b981;
  shape-outside: circle();
}

.chat-messages::-webkit-scrollbar,
.patient-list::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb,
.patient-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-track,
.patient-list::-webkit-scrollbar-track {
  background: transparent;
}

.report-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.report-header {
  margin-bottom: 24px;
  text-align: center;
}

.report-body {
  margin-bottom: 24px;
}

.report-footer {
  text-align: right;
  color: #64748b;
  font-size: 14px;
}

.report-logo {
  width: 100px;
  height: auto;
}

.report-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 100px;
  opacity: 0.1;
  color: #1989fa;
  white-space: nowrap;
  pointer-events: none;
}

.report-watermark::after {
  content: '医疗报告 仅供参考';
}

/* 确保表单内容在水印之上 */
.el-form-item {
  position: relative;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 5px;
}

.el-form-item__label {
  font-weight: bold;
  color: #1989fa;
}

.el-form-item__content {
  color: #333;
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

/* 添加一些装饰元素 */
.report-container::before,
.report-container::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 50px;
  border: 2px solid #1989fa;
}

.report-container::before {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
}

.report-container::after {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
}

@media (max-height: 1500px) {
  .chat-messages {
    min-height: 1200px;
    max-height: 1200px; /* 在屏幕高度小于1500px时调整高度 */
  }
  .patient-list {
    max-height: 1200px;
  }
}

@media (max-height: 1200px) {
  .chat-messages {
    min-height: 900px;
    max-height: 900px; /* 在屏幕高度小于1200px时调整高度 */
  }
  .patient-list {
    max-height:900px;
  }
}

@media (max-height: 1000px) {
  .chat-messages {
    min-height: 700px;
    max-height: 700px; /* 在屏幕高度小于1000px时调整高度 */
  }
  .patient-list {
    max-height: 700px;
  }
}

@media (max-height: 900px) {
  .chat-messages {
    min-height: 600px;
    max-height: 600px; /* 在屏幕高度小于900px时调整高度 */
  }
  .patient-list {
    max-height: 600px;
  }
}

@media (max-height: 800px) {
  .chat-messages {
    min-height: 500px;
    max-height: 500px; /* 在屏幕高度小于1200px时调整高度 */
  }
  .patient-list {
    max-height: 500px;
  }
}

@media (max-height: 700px) {
  .chat-messages {
    min-height: 400px;
    max-height: 400px; /* 在屏幕高度小于700px时调整高度 */
  }
  .patient-list {
    max-height: 400px;
  }
}

@media (max-height: 600px) {
  .chat-messages {
    min-height: 300px;
    max-height: 300px; /* 在屏幕高度小于600px时调整高度 */
  }
  .patient-list {
    max-height: 300px;
  }
}

@media (max-height: 500px) {
  .chat-messages {
    min-height: 200px;
    max-height: 200px; /* 在屏幕高度小于500px时调整高度 */
  }
  .patient-list {
    max-height: 200px;
  }
}

</style>