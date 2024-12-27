<template>
  <div class="article-management">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><Document /></el-icon>
          <h1 class="page-title">科普文章列表</h1>
          <el-tag type="info" class="article-count">
            共 {{ filteredArticles.length }} 篇文章
          </el-tag>
        </div>
      </div>
    </header>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-filters">
        <el-input
            v-model="search"
            placeholder="搜索文章标题、作者或类型"
            class="search-input"
            clearable
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>

        <div class="filter-group">
          <el-select
              v-model="selectedType"
              placeholder="选择文章类型"
              class="filter-select"
              clearable
          >
            <el-option label="全部类型" value=""></el-option>
            <el-option
                v-for="type in articleTypes"
                :key="type"
                :label="type"
                :value="type"
            >
              <div class="select-option">
                <el-icon><Collection /></el-icon>
                <span>{{ type }}</span>
              </div>
            </el-option>
          </el-select>

          <el-select
              v-model="selectedStatus"
              placeholder="选择文章状态"
              class="filter-select"
              clearable
          >
            <el-option label="全部状态" value=""></el-option>
            <el-option
                v-for="status in articleStatuses"
                :key="status"
                :label="status"
                :value="status"
            >
              <div class="select-option">
                <el-icon>
                  <component :is="getStatusIcon(status)" />
                </el-icon>
                <span>{{ status }}</span>
              </div>
            </el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 文章列表表格 -->
    <div class="table-container">
      <el-table
          :data="paginatedArticles"
          style="width: 100%"
          :header-cell-style="tableHeaderStyle"
          v-loading="!articles.length"
      >
        <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
        >
          <template #default="scope">
        <span class="index-badge">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </span>
          </template>
        </el-table-column>
        <!-- 标题列 -->
        <el-table-column prop="title" label="标题" min-width="300">
          <template #default="scope">
            <div class="article-title-cell">
              <el-icon><Document /></el-icon>
              <span class="title-text">{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 作者列 -->
        <el-table-column prop="name" label="作者" width="150">
          <template #default="scope">
            <div class="author-cell">
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 发布日期列 -->
        <el-table-column prop="publishDate" label="发布日期" width="180">
          <template #default="scope">
            <div class="date-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ scope.row.publishDate }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 类型列 -->
        <el-table-column prop="type" label="类型" width="150">
          <template #default="scope">
            <el-tag size="small" type="info" class="type-tag">
              <el-icon><Collection /></el-icon>
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag
                :type="getStatusType(scope.row.status)"
                class="status-tag"
                effect="light"
            >
              <el-icon>
                <component :is="getStatusIcon(scope.row.status)" />
              </el-icon>
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                  type="primary"
                  circle
                  @click="viewArticle(scope.row.articleId)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- 空状态 -->
        <template #empty>
          <el-empty
              description="暂无文章数据"
              :image-size="200"
          >
            <template #description>
              <p class="empty-text">暂无符合条件的文章</p>
              <p class="empty-hint">您可以尝试更换筛选条件</p>
            </template>
          </el-empty>
        </template>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredArticles.length"
            @current-change="handlePageChange"
            layout="total, prev, pager, next, jumper"
            background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElPagination, ElSelect, ElOption } from 'element-plus'
import { Calendar, Collection, Document, View, SuccessFilled, Close, Warning, InfoFilled} from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

const articles = ref([])
const search = ref('')
const currentPage = ref(1)
const pageSize = 15
const selectedType = ref('')
const selectedStatus = ref('')

const articleTypes = [
  '脊柱侧弯',
  '高低肩',
  '骨盆侧倾',
  '足部健康与矫正',
  '姿势矫正',
  '运动与康复',
  '青少年骨骼发育',
  '其他'
]

const articleStatuses = [
  '已发布',
  '未审核',
  '已打回'
]

// 定义 getStatusIcon 函数
const getStatusIcon = (status) => {
  switch (status) {
    case '已发布':
      return SuccessFilled
    case '未审核':
      return Warning
    case '已打回':
      return Close
    default:
      return InfoFilled
  }
}

// 定义 getStatusType 函数
const getStatusType = (status) => {
  switch (status) {
    case '已发布':
      return 'success'
    case '未审核':
      return 'warning'
    case '已打回':
      return 'danger'
    default:
      return 'info'
  }
}

const fetchArticles = async () => {
  try {
    const response = await axios.get('/api/api/healthArticle/getTotalAll', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    });
    articles.value = response.data.map(article => ({
      ...article,
      publishDate: article.publishDate ? new Date(article.publishDate).toLocaleString() : 'N/A',
      name: article.name || '未知'
    }));
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  }
}

const filteredArticles = computed(() => {
  return articles.value.filter(article => 
    (selectedType.value === '' || article.type === selectedType.value) &&
    (selectedStatus.value === '' || article.status === selectedStatus.value) &&
    (article.title.toLowerCase().includes(search.value.toLowerCase()) ||
     article.name.toLowerCase().includes(search.value.toLowerCase()) ||
     article.type.toLowerCase().includes(search.value.toLowerCase()))
  )
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredArticles.value.slice(start, end)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const viewArticle = (id) => {
  router.push(`/verify-articles/${id}`)
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
/* 页面容器 */
.article-management {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 页面头部 */
.page-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  margin-bottom: 24px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.index-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.article-count {
  padding: 4px 8px;
  font-size: 14px;
}

/* 搜索区域 */
.search-section {
  max-width: 1400px;
  margin: 0 auto 24px;
  padding: 0 24px;
}

.search-filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.filter-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-select {
  width: 200px;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 表格容器 */
.table-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表格单元格样式 */
.article-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-weight: 500;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.type-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}

/* 分页器 */
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 空状态 */
.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #c0c4cc;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content,
  .search-section,
  .table-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
  }

  .table-container {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 16px 0;
  }

  .header-content {
    padding: 0 16px;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>