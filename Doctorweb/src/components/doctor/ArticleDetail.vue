<template>
  <div class="article-detail" v-if="article">
    <!-- 文章主体卡片 -->
    <el-card class="main-card">
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div class="author-info">
            <el-avatar :size="50" :src="doctorInfo.avatar"></el-avatar>
            <span class="author-name">{{ doctorInfo.name }}</span>
          </div>
          <div class="meta-details">
            <el-tag size="small" type="info">
              <el-icon><Calendar /></el-icon>
              {{ article.publishDate }}
            </el-tag>
            <el-tag size="small" type="success">
              <el-icon><Collection /></el-icon>
              {{ article.type }}
            </el-tag>
            <el-tag
                size="small"
                :type="article.status === '已发布' ? 'success' : article.status === '已打回' ? 'danger' : 'warning'"
            >
              <el-icon><InfoFilled /></el-icon>
              {{ article.status }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <el-divider>正文内容</el-divider>
        {{ article.content }}
      </div>
    </el-card>

    <!-- 作者信息卡片 -->
    <el-card class="doctor-card">
      <template #header>
        <div class="doctor-header">
          <el-icon><User /></el-icon>
          <span>作者信息</span>
        </div>
      </template>
      <div class="doctor-grid">
        <div class="info-item">
          <span class="label">姓名</span>
          <span class="value">{{ doctorInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户名</span>
          <span class="value">{{ doctorInfo.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">性别</span>
          <span class="value">{{ doctorInfo.gender }}</span>
        </div>
        <div class="info-item">
          <span class="label">职位</span>
          <span class="value">{{ doctorInfo.position || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="label">工作单位</span>
          <span class="value">{{ doctorInfo.workplace }}</span>
        </div>
        <div class="info-item">
          <span class="label">资格</span>
          <span class="value">{{ doctorInfo.qualification || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="label">经验</span>
          <span class="value">{{ doctorInfo.experience }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'

const route = useRoute()
const store = useStore()
const article = ref(null)
const doctorInfo = ref({})

const fetchArticle = async () => {
  try {
    const response = await axios.post('/api/api/healthArticle/details', 
      { articleId: route.params.id },
      {
        headers: {
          Authorization: `Bearer ${store.state.token}`
        }
      }
    )
    article.value = {
      ...response.data,
      publishDate: new Date(response.data.publishDate).toLocaleString()
    }
    fetchDoctorInfo()
  } catch (error) {
    console.error('Failed to fetch article:', error)
  }
}

const fetchDoctorInfo = async () => {
  try {
    const response = await axios.post('/api/api/healthArticle/getDoctorByArticleId', 
      { articleId: route.params.id },
      {
        headers: {
          Authorization: `Bearer ${store.state.token}`
        }
      }
    )
    doctorInfo.value = {
      ...response.data,
      birthdate: new Date(response.data.birthdate).toLocaleDateString()
    }
  } catch (error) {
    console.error('Failed to fetch doctor info:', error)
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.main-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.article-header {
  padding: 20px 0;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.meta-details {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.article-content {
  padding: 24px 0;
  font-size: 16px;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-wrap;
}

.doctor-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.doctor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 16px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 14px;
  color: #909399;
}

.value {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}


:deep(.el-tag) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta-details {
    width: 100%;
  }


  .article-title {
    font-size: 24px;
  }
}
</style>