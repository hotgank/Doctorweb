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
        <el-select v-model="article.type" placeholder="请选择文章类型" style="width: 200px;">
          <el-option
            v-for="type in articleTypes"
            :key="type"
            :label="type"
            :value="type"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">{{ isEditing ? '更新文章' : '发布文章' }}</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <h2 class="mt-8 mb-4">我的文章</h2>

    <!-- 筛选条件 -->
    <el-form :inline="true" class="filter-form">
      <el-form-item label="文章类型">
        <el-select v-model="selectedType" placeholder="请选择文章类型" @change="currentPage = 1" style="width: 200px;">
          <el-option label="全部" value="" />
          <el-option
            v-for="type in articleTypes"
            :key="type"
            :label="type"
            :value="type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文章状态">
        <el-select v-model="selectedStatus" placeholder="请选择文章状态" @change="currentPage = 1" style="width: 200px;">
          <el-option label="全部" value="" />
          <el-option
            v-for="status in statuses"
            :key="status"
            :label="status"
            :value="status"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="paginatedArticles" style="width: 100%">
      <el-table-column prop="displayId" label="ID" width="80" align="center"></el-table-column>
      <el-table-column prop="title" label="标题" width="250"></el-table-column>
      <el-table-column prop="publishDate" label="发布日期" width="160"></el-table-column>
      <el-table-column prop="type" label="类型" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editArticle(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有发布文章"></el-empty>
      </template>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalArticles"
      layout="prev, pager, next, jumper, ->, total"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import axios from 'axios'

const store = useStore()

const article = reactive({
  title: '',
  content: '',
  type: '其他', // 设置默认值为“其他”
})

const myArticles = ref([])
const isEditing = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
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

const statuses = [
  '已发布',
  '未审核',
  '已打回'
]

const filteredArticles = computed(() => {
  return myArticles.value
    .filter(article => !selectedType.value || article.type === selectedType.value)
    .filter(article => !selectedStatus.value || article.status === selectedStatus.value)
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredArticles.value.slice(start, end).map((article, index) => ({
    ...article,
    displayId: start + index + 1
  }))
})

const totalArticles = computed(() => filteredArticles.value.length)

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
  article.type = '其他' // 重置时设置默认值为“其他”
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

.filter-form {
  margin-bottom: 20px;
}
</style>