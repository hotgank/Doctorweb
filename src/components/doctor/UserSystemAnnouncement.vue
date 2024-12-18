<template>
    <el-container class="min-h-screen bg-gray-100">
      <el-header class="bg-white shadow-md">
        <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h3 class="text-2xl font-bold text-gray-900">系统公告</h3>
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
                  <el-tag :type="getAnnouncementType(announcement.type)" effect="dark">
                    {{ announcement.type }}
                  </el-tag>
                </div>
              </template>
              <p class="whitespace-pre-wrap">{{ announcement.content }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
  
        <el-empty v-if="announcements.length === 0" description="暂无系统公告"></el-empty>
  
        <div class="flex justify-center mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
            layout="prev, pager, next"
          >
          </el-pagination>
        </div>
      </el-main>
    </el-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  
  const announcements = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  
  const fetchAnnouncements = async (page = 1) => {
    try {
      // 这里应该是一个实际的 API 调用
      // const response = await api.getAnnouncements(page, pageSize.value)
      // announcements.value = response.data
      // total.value = response.total
  
      // 模拟 API 响应
      announcements.value = [
        {
          title: '系统维护通知',
          content: '我们将于2024年5月15日凌晨2:00-4:00进行系统维护，期间系统将暂时无法使用。给您带来的不便敬请谅解。',
          date: '2024-05-10 10:00',
          type: '维护'
        },
        {
          title: '新功能上线',
          content: '我们很高兴地宣布，新的在线预约功能已经上线。现在您可以更方便地预约医生咨询了。\n\n主要更新：\n1. 在线预约界面优化\n2. 增加快速预约功能\n3. 添加预约提醒服务',
          date: '2024-05-05 14:30',
          type: '更新'
        },
        {
          title: '隐私政策更新',
          content: '我们更新了隐私政策，以更好地保护您的个人信息。请您在使用我们的服务之前仔细阅读更新后的隐私政策。',
          date: '2024-04-28 09:15',
          type: '政策'
        }
      ]
      total.value = 30 // 假设总共有30条公告
    } catch (error) {
      console.error('获取公告失败:', error)
      ElMessage.error('获取公告失败，请稍后重试')
    }
  }
  
  const handlePageChange = (page) => {
    currentPage.value = page
    fetchAnnouncements(page)
  }
  
  const getAnnouncementType = (type) => {
    switch (type) {
      case '维护':
        return 'warning'
      case '更新':
        return 'success'
      case '政策':
        return 'info'
      default:
        return 'default'
    }
  }
  
  onMounted(() => {
    fetchAnnouncements()
  })
  </script>
  
  <style scoped>
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  /* 自定义 Element Plus 样式 */
  :deep(.el-timeline-item__node--normal) {
    left: -2px;
    width: 12px;
    height: 12px;
  }
  
  :deep(.el-timeline-item__wrapper) {
    padding-left: 28px;
  }
  
  :deep(.el-card__header) {
    padding: 12px 20px;
  }
  
  :deep(.el-card__body) {
    padding: 16px 20px;
  }
  
  :deep(.el-pagination) {
    justify-content: center;
  }
  </style>