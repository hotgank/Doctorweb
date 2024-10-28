<template>
  <div class="doctor-ranking">
    <h1 class="mb-4">医生排行榜</h1>
    <el-table :data="rankings" style="width: 100%">
      <el-table-column prop="rank" label="排名" width="80" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="score" label="评分" width="120" />
      <el-table-column prop="consultations" label="咨询次数" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const rankings = ref([])

onMounted(() => {
  // 模拟从API获取排名数据
  rankings.value = [
    { rank: 1, name: '张医生', score: 4.9, consultations: 120 },
    { rank: 2, name: '李医生', score: 4.8, consultations: 110 },
    { rank: 3, name: '王医生', score: 4.7, consultations: 100 },
    { rank: 4, name: '赵医生', score: 4.6, consultations: 90 },
    { rank: 5, name: '刘医生', score: 4.5, consultations: 80 },
  ]
})
</script>

<style scoped>
.doctor-ranking {
  max-width: 800px;
  margin: 0 auto;
}
</style>