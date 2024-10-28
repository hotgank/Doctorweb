<!-- src/components/PatientIndex.vue -->
<template>
  <div class="patient-index">
    <h1 class="mb-4">我的患者</h1>
    <el-input
      v-model="search"
      placeholder="搜索患者"
      class="mb-4"
    ></el-input>
    <el-table :data="filteredPatients" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="age" label="年龄" width="80"></el-table-column>
      <el-table-column prop="gender" label="性别" width="80"></el-table-column>
      <el-table-column prop="lastVisit" label="上次就诊" width="180"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="viewPatientDetails(scope.row)">查看详情</el-button>
          <el-button size="small" type="primary" @click="startConsultation(scope.row)">开始咨询</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 引入的患者详情组件 -->
    <PatientDetails ref="patientDetails" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PatientDetails from './PatientDetails.vue'  // 引入新组件

const router = useRouter()

const patients = ref([
  { id: 1, name: '张三', age: 30, gender: '男', lastVisit: '2023-05-01', medicalHistory: [
    { date: '2023-05-01', description: '在线咨询' },
    { date: '2023-03-15', description: '常规检测' },
  ]},
  { id: 2, name: '李四', age: 25, gender: '女', lastVisit: '2023-04-28', medicalHistory: [
    { date: '2023-04-28', description: '在线咨询' },
    { date: '2023-02-10', description: '常规检测' },
  ]},
  { id: 3, name: '王五', age: 45, gender: '男', lastVisit: '2023-05-03', medicalHistory: [
    { date: '2023-05-03', description: '在线咨询' },
    { date: '2023-04-01', description: '常规检测' },
  ]},
])

const search = ref('')

const filteredPatients = computed(() => {
  return patients.value.filter(patient => 
    patient.name.toLowerCase().includes(search.value.toLowerCase()) ||
    patient.id.toString().includes(search.value)
  )
})

// 获取对子组件的引用
const patientDetails = ref(null)

// 调用患者详情组件的方法
const viewPatientDetails = (patient) => {
  if (patientDetails.value) {
    patientDetails.value.openDialog(patient)
  }
}

const startConsultation = (patient) => {
  // 这里应该是一个 API 调用来开始咨询
  console.log('开始与患者咨询:', patient)
  router.push({ path: '/consultation', query: { patientId: patient.id } })
}
</script>

<style scoped>
.patient-index {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
