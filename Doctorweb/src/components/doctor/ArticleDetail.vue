<template>
  <div class="article-detail" v-if="article">
    <h1 class="mb-4">{{ article.title }}</h1>
    <div class="article-meta mb-4">
      <span>作者：{{ article.author }}</span>
      <span class="mx-4">发布日期：{{ article.publishDate }}</span>
      <span>
        评分：
        <el-rate
          v-model="article.rating"
          disabled
          show-score
          text-color="#ff9900"
        ></el-rate>
      </span>
    </div>
    <div class="article-content mb-4">
      {{ article.content }}
    </div>
    <div class="article-rating">
      <h3 class="mb-2">评价文章</h3>
      <el-rate
        v-model="userRating"
        show-score
        @change="submitRating"
      ></el-rate>
    </div>
    <div class="article-comments mt-4">
      <h3 class="mb-2">评论</h3>
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="3"
        placeholder="请输入您的评论"
      ></el-input>
      <el-button type="primary" @click="submitComment" class="mt-2">提交评论</el-button>
      <div class="comments-list mt-4">
        <div v-for="comment in article.comments" :key="comment.id" class="comment mb-2">
          <strong>{{ comment.author }}：</strong>
          <span>{{ comment.content }}</span>
          <div class="text-gray-500 text-sm">{{ comment.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const article = ref(null)
const userRating = ref(0)
const newComment = ref('')

onMounted(() => {
  // 模拟从API获取文章数据
  setTimeout(() => {
    article.value = {
      id: route.params.id,
      title: '儿童常见疾病预防指南',
      author: '张医生',
      publishDate: '2023-05-01',
      rating: 4.5,
      content: '这里是文章的详细内容。包括儿童常见疾病的预防措施、注意事项等。',
      comments: [
        { id: 1, author: '李医生', content: '非常实用的文章，谢谢分享！', date: '2023-05-02' },
        { id: 2, author: '王医生', content: '建议可以多加一些具体案例。', date: '2023-05-03' },
      ]
    }
  }, 1000)
})

const submitRating = (value) => {
  // 这里应该是一个API调用来提交评分
  console.log('提交评分:', value)
  ElMessage({
    message: '评分提交成功！',
    type: 'success',
  })
}

const submitComment = () => {
  if (newComment.value.trim()) {
    // 这里应该是一个API调用来提交评论
    article.value.comments.push({
      id: article.value.comments.length + 1,
      author: '当前用户',
      content: newComment.value,
      date: new Date().toLocaleDateString()
    })
    newComment.value = ''
    ElMessage({
      message: '评论提交成功！',
      type: 'success',
    })
  }
}
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
}
.article-content {
  line-height: 1.6;
}
</style>