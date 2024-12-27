<template>
  <div class="article-details" v-if="article">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button link @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <!-- 文章主体内容 -->
    <div class="content-wrapper">
      <!-- 文章信息卡片 -->
      <el-card class="article-card">
        <div class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>

          <div class="article-meta">
            <div class="meta-left">
              <el-avatar
                  :size="48"
                  :src="article.avatarUrl"
                  class="author-avatar"
              >
                {{ article.name?.charAt(0) }}
              </el-avatar>
              <div class="author-info">
                <span class="author-name">{{ article.name }}</span>
                <span class="publish-date">
                  发布于 {{ article.publishDate }}
                </span>
              </div>
            </div>

            <div class="meta-right">
              <el-tag
                  type="info"
                  class="article-tag"
                  effect="plain"
              >
                <el-icon><Collection /></el-icon>
                {{ article.type }}
              </el-tag>
              <el-tag
                  :type="article.status === '已发布' ? 'success' : article.status === '已打回' ? 'danger' : 'warning'"
                  class="article-tag"
                  effect="plain"
              >
                <el-icon><InfoFilled /></el-icon>
                {{ article.status }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-divider>
          <el-icon><Document /></el-icon>
          文章内容
        </el-divider>

        <div class="article-content">
          {{ article.content }}
        </div>
      </el-card>

      <!-- 作者信息卡片 -->
      <el-card class="author-card">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>作者信息</span>
          </div>
        </template>

        <div class="author-profile">
          <div class="profile-header">
            <el-avatar
                :size="64"
                :src="article.avatarUrl"
                class="profile-avatar"
            >
              {{ article.name?.charAt(0) }}
            </el-avatar>
            <div class="profile-title">
              <h3>{{ article.name }}</h3>
              <p>{{ article.position || '暂无职位信息' }}</p>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-item">
              <el-icon><User /></el-icon>
              <span class="label">用户名：</span>
              <span class="value">{{ article.username }}</span>
            </div>

            <div class="detail-item">
              <el-icon><Male /></el-icon>
              <span class="label">性别：</span>
              <span class="value">{{ article.gender }}</span>
            </div>

            <div class="detail-item">
              <el-icon><OfficeBuilding /></el-icon>
              <span class="label">工作单位：</span>
              <span class="value">{{ article.workplace || '暂无' }}</span>
            </div>

            <div class="detail-item">
              <el-icon><Medal /></el-icon>
              <span class="label">资格：</span>
              <span class="value">{{ article.qualification || '暂无' }}</span>
            </div>

            <div class="detail-item">
              <el-icon><Memo /></el-icon>
              <span class="label">工作经验：</span>
              <span class="value">{{ article.experience || '暂无' }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { Calendar, Collection, InfoFilled, Document, User, Male, OfficeBuilding, Medal, Memo, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const store = useStore()
const article = ref(null)

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
      publishDate: new Date(response.data.publishDate).toLocaleString(),
      birthdate: new Date(response.data.birthdate).toLocaleDateString()
    }
  } catch (error) {
    console.error('Failed to fetch article:', error)
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-details {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
}

.back-button {
  margin-bottom: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 350px;
}

/* 文章卡片样式 */
.article-card {
  grid-column: 1;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  margin-bottom: 24px;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.publish-date {
  font-size: 14px;
  color: #606266;
}

.meta-right {
  display: flex;
  gap: 8px;
}

.article-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-wrap;
}

/* 作者信息卡片样式 */
.author-card {
  grid-column: 2;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.profile-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.profile-avatar {
  margin-bottom: 16px;
}

.profile-title h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.profile-title p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.detail-item:hover {
  background-color: #f5f7fa;
}

.detail-item .label {
  color: #909399;
  font-size: 14px;
}

.detail-item .value {
  color: #2c3e50;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .author-card {
    grid-column: 1;
    position: static;
  }
}

@media (max-width: 768px) {
  .article-details {
    padding: 16px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta-right {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .article-details {
    padding: 12px;
  }

  .article-title {
    font-size: 20px;
  }

  .profile-header {
    padding: 16px 0;
  }
}

/* Element Plus 样式优化 */
:deep(.el-card) {
  --el-card-border-color: transparent;
  transition: transform 0.3s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-2px);
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-button--link) {
  font-size: 16px;
}

:deep(.el-button--link:hover) {
  opacity: 0.8;
}
</style>