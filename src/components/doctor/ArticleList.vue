<template>
  <div class="article-list-container">
    <div class="header-section">
      <h1 class="page-title">科普文章列表</h1>
      <p class="page-subtitle">浏览健康科普文章</p>
    </div>

    <div class="filters-section">
      <div class="search-wrapper">
        <el-input
            v-model="search"
            placeholder="搜索文章标题、作者或类型..."
            class="search-input"
            prefix-icon="Search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-select
          v-model="selectedType"
          placeholder="选择文章类型"
          class="type-select"
      >
        <el-option label="全部文章" value=""></el-option>
        <el-option
            v-for="type in articleTypes"
            :key="type"
            :label="type"
            :value="type"
        ></el-option>
      </el-select>
    </div>

    <div class="table-container">
      <el-table
          :data="paginatedArticles"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :row-class-name="tableRowClassName"
      >
        <el-table-column prop="displayId" label="序号" width="80" align="center">
          <template #default="scope">
            <span class="id-badge">{{ scope.row.displayId }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="250">
          <template #default="scope">
            <div class="title-cell">
              <span class="article-title">{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="作者" width="120">
          <template #default="scope">
            <div class="author-cell">
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="publishDate" label="发布日期" width="160">
          <template #default="scope">
            <div class="date-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ scope.row.publishDate }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="140">
          <template #default="scope">
            <el-tag
                :type="getTagType(scope.row.type)"
                effect="light"
                class="type-tag"
            >
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
                :type="scope.row.status === '已发布' ? 'success' : 'info'"
                effect="plain"
                class="status-tag"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                link
                class="action-button"
                @click="viewArticle(scope.row.articleId)"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-state">
            <el-empty
                description="暂无科普文章"
                :image-size="120"
            >
              <template #image>
                <el-icon :size="48" class="empty-icon"><Document /></el-icon>
              </template>
            </el-empty>
          </div>
        </template>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
          background
          layout="total, prev, pager, next"
          :total="filteredArticles.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElPagination, ElSelect, ElOption } from 'element-plus'
import { Calendar, View, Document } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

const articles = ref([])
const search = ref('')
const currentPage = ref(1)
const pageSize = 15
const selectedType = ref('')

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

const fetchArticles = async () => {
  try {
    const response = await axios.get('/api/api/healthArticle/getAll', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    });
    articles.value = response.data.map(article => ({
      ...article,
      publishDate: article.publishDate ? new Date(article.publishDate).toLocaleString() : 'N/A',
    }));
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  }
}

const filteredArticles = computed(() => {
  return articles.value.filter(article => 
    (selectedType.value === '' || article.type === selectedType.value) &&
    (article.title.toLowerCase().includes(search.value.toLowerCase()) ||
     article.name.toLowerCase().includes(search.value.toLowerCase()) ||
     article.type.toLowerCase().includes(search.value.toLowerCase()))
  )
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredArticles.value.slice(start, end).map((article, index) => ({
    ...article,
    displayId: start + index + 1
  }))
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const viewArticle = (id) => {
  router.push(`/article/${id}`)
}

const getTagType = (type) => {
  // 根据类型返回不同的 tag 类型
  const typeMapping = {
    '脊柱侧弯': 'warning',
    '高低肩': 'info',
    '骨盆侧倾': 'success',
    '足部健康与矫正': 'primary',
    '姿势矫正': 'danger',
    '运动与康复': 'warning',
    '青少年骨骼发育': 'info',
    '其他': 'default'
  };
  return typeMapping[type] || 'default';
}

onMounted(() => {
  fetchArticles()
})
</script>


<style scoped>
.article-list-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #64748b;
  font-size: 16px;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 280px;
}

.search-input {
  width: 100%;
}

.type-select {
  width: 200px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 24px;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  padding: 16px 12px;
}

:deep(.el-table td) {
  padding: 16px 12px;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f1f5f9;
}

/* 单元格样式 */
.id-badge {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-title {
  font-weight: 500;
  color: #1e293b;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
}

.type-tag {
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-tag {
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

/* 空状态样式 */
.empty-state {
  padding: 48px 0;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 16px;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

:deep(.el-pagination) {
  --el-pagination-button-bg-color: white;
  --el-pagination-hover-color: #3b82f6;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .article-list-container {
    padding: 16px;
  }

  .filters-section {
    flex-direction: column;
  }

  .search-wrapper,
  .type-select {
    width: 100%;
  }

  .table-container {
    padding: 8px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 12px 8px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .article-list-container {
    background-color: #1a1a1a;
  }

  .page-title {
    color: #e5e7eb;
  }

  .page-subtitle {
    color: #9ca3af;
  }

  .table-container {
    background: #262626;
  }

  :deep(.el-table) {
    --el-table-border-color: #374151;
    --el-table-header-bg-color: #1f2937;
    background-color: #262626;
  }

  :deep(.el-table th) {
    background: #1f2937;
    color: #e5e7eb;
  }

  :deep(.el-table td) {
    border-bottom-color: #374151;
  }

  :deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
    background-color: #374151;
  }

  .article-title {
    color: #e5e7eb;
  }

  .id-badge {
    background: #374151;
    color: #d1d5db;
  }

  .date-cell {
    color: #9ca3af;
  }
}

/* 动画效果 */
.el-table-column {
  transition: all 0.3s ease;
}

:deep(.el-table__body tr) {
  transition: transform 0.2s ease;
}

:deep(.el-table__body tr:hover) {
  transform: translateY(-1px);
}

/* 自定义滚动条 */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}
</style>