<template>
    <div class="not-found">
      <h1>404 - 页面未找到</h1>
      <el-button type="primary" @click="goHome">返回主页</el-button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const goHome = () => {
    router.push('/')
  }
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  .not-found h1 {
    margin-bottom: 20px;
  }
  </style>
  