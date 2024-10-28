<!-- src/components/PatientDetails.vue -->
<template>
  <el-dialog v-model="dialogVisible" title="患者详情" width="50%">
    <div v-if="patient">
      <h2>{{ patient.name }}</h2>
      <p><strong>年龄：</strong>{{ patient.age }}</p>
      <p><strong>性别：</strong>{{ patient.gender }}</p>
      <p><strong>上次检测：</strong>{{ patient.lastVisit }}</p>
      <h3 class="mt-4">检测历史</h3>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in patient.medicalHistory"
          :key="index"
          :timestamp="activity.date"
        >
          {{ activity.description }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialogVisible = ref(false)
const patient = ref(null)

/**
 * 打开对话框并显示患者详情
 * @param {Object} selectedPatient - 选中的患者对象
 */
const openDialog = (selectedPatient) => {
  patient.value = selectedPatient
  dialogVisible.value = true
}

// 使用 defineExpose 暴露 openDialog 方法给父组件
defineExpose({
  openDialog
})
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>
