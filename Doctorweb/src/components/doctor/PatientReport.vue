<template>
    <div class="patient-report">
      <el-descriptions title="患者信息" :column="1" border>
        <el-descriptions-item label="姓名">{{ patient.name }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ patient.age }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ patient.gender }}</el-descriptions-item>
        <el-descriptions-item label="体态">{{ patient.physique }}</el-descriptions-item>
      </el-descriptions>
  
      <div class="mt-4">
        <h3 class="text-lg font-semibold mb-2">医生建议</h3>
        <p>{{ patient.recommendation }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    patient: {
      type: Object,
      required: true
    }
  })
  </script>
  
  <style scoped>
  .patient-report {
    padding: 20px;
  }
  </style>