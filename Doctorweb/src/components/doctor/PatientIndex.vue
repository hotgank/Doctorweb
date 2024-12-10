<template>
  <div class="patient-index">
    <h1 class="mb-4">我的患者</h1>
    <el-input
      v-model="search"
      placeholder="搜索患者"
      class="mb-4"
    ></el-input>
    <el-table :data="filteredPatients" style="width: 100%">
      <el-table-column prop="user.userId" label="用户ID" width="280"></el-table-column>
      <el-table-column prop="user.username" label="用户名" width="120"></el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          {{ scope.row.user.status === 'active' ? '活跃' : '停用' }}
        </template>
      </el-table-column>
      <el-table-column label="头像" width="100">
        <template #default="scope">
          <el-avatar :size="40" :src="scope.row.user.avatarUrl" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="viewPatientDetails(scope.row)">查看详情</el-button>
          <el-button size="small" type="primary" @click="startConsultation(scope.row)">开始咨询</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showDetails" title="患者详情" width="50%">
      <PatientDetails :patient="selectedPatient" @close="showDetails = false" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import PatientDetails from './PatientDetails.vue'

const router = useRouter()
const store = useStore()

const patients = ref([])
const search = ref('')
const showDetails = ref(false)
const selectedPatient = ref(null)

const fetchPatients = async () => {
  try {
    const response = await axios.get('/api/api/doctor/relation/selectMyPatientsAndRelationId', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    patients.value = response.data
  } catch (error) {
    console.error('Failed to fetch patients:', error)
    ElMessage.error('获取患者列表失败')
  }
}

const filteredPatients = computed(() => {
  return patients.value.filter(patient => 
    patient.user.username.toLowerCase().includes(search.value.toLowerCase()) ||
    patient.user.userId.includes(search.value)
  )
})

const viewPatientDetails = (patient) => {
  selectedPatient.value = patient
  showDetails.value = true
}

const startConsultation = (patient) => {
  router.push({ path: '/consultation', query: { relationId: patient.relationId } })
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.patient-index {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
</style>