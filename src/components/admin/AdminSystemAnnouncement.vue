<template>
    <el-container class="min-h-screen bg-gray-100">
      <el-header class="bg-white shadow-md">
        <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h3 class="text-2xl font-bold text-gray-900">系统公告</h3>
          <el-button type="primary" @click="showNewAnnouncementForm">
            发布新公告
            <el-icon class="el-icon--right"><Plus /></el-icon>
          </el-button>
        </div>
      </el-header>
      
      <el-main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <el-timeline>
          <el-timeline-item
            v-for="(announcement, index) in announcements"
            :key="index"
            :timestamp="announcement.date"
            placement="top"
          >
            <el-card class="mb-4">
              <template #header>
                <div class="flex justify-between items-center">
                  <h4 class="text-lg font-medium">{{ announcement.title }}</h4>
                </div>
              </template>
              <p>{{ announcement.content }}</p>
              <el-button type="info" link @click="editAnnouncement(index)">
                    编辑
              </el-button>
            </el-card>
          </el-timeline-item>
        </el-timeline>
  
        <el-empty v-if="announcements.length === 0" description="暂无系统公告"></el-empty>
      </el-main>
  
      <!-- 新公告表单对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEditing ? '编辑公告' : '发布新公告'"
        width="50%"
        :close-on-click-modal="false"
      >
        <el-form :model="announcementForm" label-width="100px">
          <el-form-item label="标题">
            <el-input v-model="announcementForm.title" placeholder="请输入公告标题"></el-input>
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="announcementForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入公告内容"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitAnnouncement">
              {{ isEditing ? '保存修改' : '发布公告' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  
  const announcements = ref([
    {
      title: '系统维护通知',
      content: '我们将于2024年5月15日凌晨2:00-4:00进行系统维护，期间系统将暂时无法使用。给您带来的不便敬请谅解。',
      date: '2024-05-10 10:00'
    },
    {
      title: '新功能上线',
      content: '我们很高兴地宣布，新的在线预约功能已经上线。现在您可以更方便地预约医生咨询了。',
      date: '2024-05-05 14:30'
    },
    {
      title: '隐私政策更新',
      content: '我们更新了隐私政策，以更好地保护您的个人信息。请您在使用我们的服务之前仔细阅读更新后的隐私政策。',
      date: '2024-04-28 09:15'
    }
  ])
  
  const dialogVisible = ref(false)
  const isEditing = ref(false)
  const editingIndex = ref(-1)
  const announcementForm = ref({
    title: '',
    content: ''
  })
  
  const showNewAnnouncementForm = () => {
    isEditing.value = false
    editingIndex.value = -1
    announcementForm.value = { title: '', content: '' }
    dialogVisible.value = true
  }
  
  const editAnnouncement = (index) => {
    isEditing.value = true
    editingIndex.value = index
    announcementForm.value = { ...announcements.value[index] }
    dialogVisible.value = true
  }
  
  const submitAnnouncement = () => {
    if (!announcementForm.value.title || !announcementForm.value.content) {
      ElMessage.warning('请填写完整的公告信息')
      return
    }
  
    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
    if (isEditing.value) {
      announcements.value[editingIndex.value] = {
        ...announcementForm.value,
        date: formattedDate
      }
      ElMessage.success('公告已更新')
    } else {
      announcements.value.unshift({
        ...announcementForm.value,
        date: formattedDate
      })
      ElMessage.success('新公告已发布')
    }
  
    dialogVisible.value = false
  }
  </script>
  
  <style scoped>
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  /* 自定义 Element Plus 样式 */
  :deep(.el-button--primary) {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  
  :deep(.el-button--primary:hover) {
    background-color: #2563eb;
    border-color: #2563eb;
  }
  
  :deep(.el-timeline-item__node--normal) {
    left: -2px;
    width: 12px;
    height: 12px;
  }
  
  :deep(.el-timeline-item__wrapper) {
    padding-left: 28px;
  }
  </style>