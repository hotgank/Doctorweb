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
      <el-table-column prop="author" label="作者" width="120"></el-table-column>
      <el-table-column prop="publishDate" label="发布日期" width="120"></el-table-column>
      <el-table-column prop="rating" label="评分" width="100">
        <template #default="scope">
          <el-rate
            v-model="scope.row.rating"
            disabled
            show-score
            text-color="#ff9900"
          ></el-rate>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="viewArticle(scope.row.id)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const articles = ref([
  { id: 1, title: '儿童常见疾病预防指南', author: '张医生', publishDate: '2023-05-01', rating: 4.5 },
  { id: 2, title: '健康饮食习惯养成', author: '李医生', publishDate: '2023-05-03', rating: 4.8 },
  { id: 3, title: '运动对心脏健康的影响', author: '王医生', publishDate: '2023-05-05', rating: 4.2 },
])

const search = ref('')

const filteredArticles = computed(() => {
  return articles.value.filter(article => 
    article.title.toLowerCase().includes(search.value.toLowerCase()) ||
    article.author.toLowerCase().includes(search.value.toLowerCase())
  )
})

const viewArticle = (id) => {
  router.push(`/article/${id}`)
}
</script>

<style scoped>
.article-list {
  max-width: 1000px;
  margin: 0 auto;
}
</style>