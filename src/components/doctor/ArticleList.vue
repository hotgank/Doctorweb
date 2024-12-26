<template>
  <div class="article-list">
    <h1 class="mb-4">科普文章列表</h1>
    <el-input
      v-model="search"
      placeholder="搜索文章"
      class="mb-4"
    ></el-input>
    <el-select v-model="selectedType" placeholder="选择文章类型" class="mb-4" style="width: 200px; margin-top: 10px; margin-bottom:10px;">
      <el-option label="全部" value=""></el-option>
      <el-option
        v-for="type in articleTypes"
        :key="type"
        :label="type"
        :value="type"
      ></el-option>
    </el-select>
    <el-table :data="paginatedArticles" style="width: 100%">
      <el-table-column prop="displayId" label="ID" width="80" align="center"></el-table-column>
      <el-table-column prop="title" label="标题" width="250"></el-table-column>
      <el-table-column prop="name" label="作者" width="120"></el-table-column>
      <el-table-column prop="publishDate" label="发布日期" width="160"></el-table-column>
      <el-table-column prop="type" label="类型" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="viewArticle(scope.row.articleId)">查看详情</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有科普文章"></el-empty>
      </template>
    </el-table>
    <el-pagination
      class="mt-4"
      background
      layout="prev, pager, next"
      :total="filteredArticles.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    ></el-pagination>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElPagination, ElSelect, ElOption } from 'element-plus'

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

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-list {
  max-width: 1000px;
  margin: 0 auto;
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

:deep(.el-dialog__footer button) {
  padding: 10px 20px;
  transition: all 0.2s ease;
}
:deep(.el-dialog__footer button:hover) {
  transform: scale(1.05);
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
</style>