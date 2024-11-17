<template>
  <div class="article-publish">
    <h1 class="mb-4">发布科普文章</h1>
    <el-form :model="article" label-width="120px">
      <el-form-item label="标题">
        <el-input v-model="article.title" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input type="textarea" v-model="article.content" :rows="10" />
      </el-form-item>
      <el-form-item label="类型">
        <el-input v-model="article.type" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">{{ isEditing ? '更新文章' : '发布文章' }}</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <h2 class="mt-8 mb-4">我的文章</h2>
    <el-table :data="myArticles" style="width: 100%">
      <el-table-column prop="title" label="标题" width="250"></el-table-column>
      <el-table-column prop="publishDate" label="发布日期" width="180"></el-table-column>
      <el-table-column prop="type" label="类型" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editArticle(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import axios from 'axios'

const store = useStore()

const article = reactive({
  title: '',
  content: '',
  type: '',
})

const myArticles = ref([])
const isEditing = ref(false)

const fetchMyArticles = async () => {
  try {
    const response = await axios.get('/api/api/healthArticle/myArticles', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    myArticles.value = response.data.map(article => ({
      ...article,
      publishDate: article.publishDate ? new Date(article.publishDate).toLocaleString() : 'N/A'
    }))
  } catch (error) {
    console.error('Failed to fetch my articles:', error)
    ElMessage.error('获取文章列表失败')
  }
}

const handleSubmit = async () => {
  try {
    const endpoint = isEditing.value ? '/api/api/healthArticle/update' : '/api/api/healthArticle/add'
    const response = await axios.post(endpoint, article, {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    if (response.data === 'Successfully commit health article' || response.data === 'Successfully updated health article') {
      ElMessage({
        message: isEditing.value ? '文章已更新' : '文章已发布',
        type: 'success',
      })
      resetForm()
      fetchMyArticles()
    } else {
      throw new Error('Failed to publish/update article')
    }
  } catch (error) {
    console.error('Failed to publish/update article:', error)
    ElMessage({
      message: isEditing.value ? '更新文章失败' : '发布文章失败',
      type: 'error',
    })
  }
}

const editArticle = (articleToEdit) => {
  isEditing.value = true
  Object.assign(article, articleToEdit)
}

const resetForm = () => {
  article.title = ''
  article.content = ''
  article.type = ''
  isEditing.value = false
}

onMounted(() => {
  fetchMyArticles()
})
</script>

<style scoped>
.article-publish {
  max-width: 800px;
  margin: 0 auto;
}
</style>