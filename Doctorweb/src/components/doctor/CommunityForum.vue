<template>
  <div class="community-forum">
    <h1 class="mb-4">社区交流</h1>
    <div class="posts">
      <el-card v-for="post in posts" :key="post.id" class="mb-4">
        <template #header>
          <div class="post-header">
            <span>{{ post.author }}</span>
            <span class="time">{{ post.timestamp }}</span>
          </div>
        </template>
        <div class="post-content">
          {{ post.content }}
        </div>
      </el-card>
    </div>
    <el-form :model="newPost" @submit.prevent="handlePostSubmit">
      <el-form-item>
        <el-input
          v-model="newPost.content"
          type="textarea"
          :rows="3"
          placeholder="分享你的想法..."
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">发布</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const posts = ref([])
const newPost = ref({
  content: '',
})

onMounted(() => {
  // 模拟从API获取帖子
  posts.value = [
    { id: 1, author: '张医生', content: '大家好，我是新来的儿科医生。', timestamp: '2023-05-01 10:00' },
    { id: 2, author: '李医生', content: '欢迎欢迎！我们一起为儿童健康努力。', timestamp: '2023-05-01 10:05' },
  ]
})

const handlePostSubmit = () => {
  if (newPost.value.content.trim()) {
    const post = {
      id: posts.value.length + 1,
      author: '当前医生', // 这里应该使用实际的登录用户名
      content: newPost.value.content,
      timestamp: new Date().toLocaleString(),
    }
    posts.value.unshift(post)
    newPost.value.content = ''
    ElMessage({
      message: '帖子已发布',
      type: 'success',
    })
    // 这里添加发送帖子到后端的逻辑
  }
}
</script>

<style scoped>
.community-forum {
  max-width: 800px;
  margin: 0 auto;
}
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.time {
  font-size: 0.8em;
  color: #999;
}
</style>