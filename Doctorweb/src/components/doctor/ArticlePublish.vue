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
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">发布文章</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const article = reactive({
  title: '',
  content: '',
})

const handleSubmit = () => {
  console.log('Article submitted:', article)
  // 这里添加发布文章的逻辑
  ElMessage({
    message: '文章已发布',
    type: 'success',
  })
  // 清空表单
  article.title = ''
  article.content = ''
}
</script>

<style scoped>
.article-publish {
  max-width: 800px;
  margin: 0 auto;
}
</style>