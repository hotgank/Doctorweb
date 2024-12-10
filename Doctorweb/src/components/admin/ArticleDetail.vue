<template>
  <div class="article-detail" v-if="article">
    <h1 class="mb-4">{{ article.title }}</h1>
    <div class="article-meta mb-4">
      <el-avatar :size="50" :src="doctorInfo.avatar"></el-avatar>
      <span class="ml-2">作者：{{ doctorInfo.name }}</span>
      <span class="mx-4">发布日期：{{ article.publishDate }}</span>
      <span>类型：{{ article.type }}</span>
      <span class="mx-4">状态：{{ article.status }}</span>
    </div>
    <div class="article-content mb-4">
      {{ article.content }}
    </div>
    <div class="doctor-info mt-4">
      <h3>作者信息</h3>
      <p><strong>姓名：</strong>{{ doctorInfo.name }}</p>
      <p><strong>用户名：</strong>{{ doctorInfo.username }}</p>
      <p><strong>性别：</strong>{{ doctorInfo.gender }}</p>
      <p><strong>职位：</strong>{{ doctorInfo.position || 'N/A' }}</p>
      <p><strong>工作单位：</strong>{{ doctorInfo.workplace }}</p>
      <p><strong>资格：</strong>{{ doctorInfo.qualification || 'N/A' }}</p>
      <p><strong>经验：</strong>{{ doctorInfo.experience }}</p>
    </div>
    <div class="status-buttons mt-4">
      <el-button type="primary" @click="changeArticleStatus('已发布')" :disabled="article.status === '已发布'">设为已发布</el-button>
      <el-button type="danger" @click="changeArticleStatus('已打回')" :disabled="article.status === '已打回'">设为已打回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElMessage } from 'element-plus'

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

const changeArticleStatus = async (newStatus) => {
  try {
    const response = await axios.post('/api/api/healthArticle/changeStatus', 
      JSON.stringify({
        articleId: route.params.id,
        status: newStatus
      }),
      {
        headers: {
          Authorization: `Bearer ${store.state.token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.data === 'Successfully change status') {
      ElMessage.success('文章状态已更改')
      article.value.status = newStatus
    } else {
      ElMessage.error('更改文章状态失败')
    }
  } catch (error) {
    console.error('Failed to change article status:', error)
    ElMessage.error('更改文章状态失败')
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
}
.article-content {
  line-height: 1.6;
}
.doctor-info {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
}
.status-buttons {
  text-align: right;
}
</style>