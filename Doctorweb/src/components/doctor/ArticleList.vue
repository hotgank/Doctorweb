<template>
  <div class="article-list">
    <h1 class="mb-4">科普文章列表</h1>
    <el-input
      v-model="search"
      placeholder="搜索文章"
      class="mb-4"
    ></el-input>
    <el-table :data="filteredArticles" style="width: 100%">
      <el-table-column prop="title" label="标题" width="250"></el-table-column>
      <el-table-column prop="doctorName" label="作者" width="120"></el-table-column>
      <el-table-column prop="publishDate" label="发布日期" width="180"></el-table-column>
      <el-table-column prop="type" label="类型" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="viewArticle(scope.row.articleId)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'

const router = useRouter()
const store = useStore()

const articles = ref([])
const search = ref('')

const fetchArticles = async () => {
  try {
    const response = await axios.post('/api/api/healthArticle/getAll', {}, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    articles.value = response.data.map(article => ({
      ...article,
      publishDate: article.publishDate ? new Date(article.publishDate).toLocaleString() : 'N/A',
      doctorName: 'Loading...'
    }))
    fetchDoctorNames()
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  }
}

const fetchDoctorNames = async () => {
  for (let article of articles.value) {
    if (article.doctorId) {
      try {
        const response = await axios.post('/api/api/healthArticle/getDoctorByArticleId', 
          { articleId: article.articleId },
          {
            headers: {
              Authorization: `Bearer ${store.state.token}`
            }
          }
        )
        article.doctorName = response.data.name
      } catch (error) {
        console.error(`Failed to fetch doctor name for article ${article.articleId}:`, error)
        article.doctorName = 'Unknown'
      }
    } else {
      article.doctorName = 'N/A'
    }
  }
}

const filteredArticles = computed(() => {
  return articles.value.filter(article => 
    article.title.toLowerCase().includes(search.value.toLowerCase()) ||
    article.doctorName.toLowerCase().includes(search.value.toLowerCase()) ||
    article.type.toLowerCase().includes(search.value.toLowerCase())
  )
})

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
</style>