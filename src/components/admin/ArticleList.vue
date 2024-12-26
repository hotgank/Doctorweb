<template>
  <div class="article-list">
    <h1 class="mb-4">科普文章列表</h1>
    <el-input
      v-model="search"
      placeholder="搜索文章"
      class="mb-4"
    ></el-input>
    <el-select v-model="selectedType" placeholder="选择文章类型" class="mb-4" style="width: 200px; margin-top: 20px;">
      <el-option label="全部" value=""></el-option>
      <el-option
        v-for="type in articleTypes"
        :key="type"
        :label="type"
        :value="type"
      ></el-option>
    </el-select>
    <el-select v-model="selectedStatus" placeholder="选择文章状态" class="mb-4" style="width: 200px; margin-top: 20px; margin-left: 10px;">
      <el-option label="全部" value=""></el-option>
      <el-option
        v-for="status in articleStatuses"
        :key="status"
        :label="status"
        :value="status"
      ></el-option>
    </el-select>
    <el-table :data="paginatedArticles" style="width: 100%">
      <el-table-column prop="title" label="标题" width="250"></el-table-column>
      <el-table-column prop="name" label="作者" width="120"></el-table-column>
      <el-table-column prop="publishDate" label="发布日期" width="180"></el-table-column>
      <el-table-column prop="type" label="类型" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100"></el-table-column>
      <el-table-column label="操作" min-width="100">
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
.article-list {
  max-width: 1000px;
  margin: 0 auto;
}
</style>