<template>
  <div class="patient-list-container">
    <div class="header-section">
      <h1 class="page-title">家长列表</h1>
      <p class="page-subtitle">查看您的患者家长信息</p>
    </div>

    <div class="search-section">
      <div class="search-wrapper">
        <el-input
            v-model="search"
            placeholder="搜索家长姓名或ID..."
            class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="table-container">
      <el-table
          :data="filteredPatients"
          style="width: 100%"
          :header-cell-style="{
          background: '#f8fafc',
          color: '#1e293b',
          fontWeight: '600',
          fontSize: '14px'
        }"
      >
        <el-table-column prop="displayId" label="序号" width="80" align="center" header-align="center">
          <template #default="scope">
            <span class="id-badge">{{ scope.row.displayId }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="user.username" label="头像" width="200" align="center" header-align="center">
          <template #default="scope">
            <el-avatar
                :size="40"
                :src="scope.row.user.avatarUrl"
                class="user-avatar"
            />
          </template>
        </el-table-column>

        <el-table-column prop="user.username" label="用户名" min-width="200" align="center" header-align="center">
          <template #default="scope">
            <div class="user-info">
              <span class="username">{{ scope.row.user.username }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="user.username" label="状态" width="100" align="center" header-align="center">
          <template #default="scope">
            <div class="user-info">
              <el-tag
                  :type="scope.row.user.status === 'active' ? 'success' : 'info'"
                  size="small"
                  effect="light"
                  class="status-tag"
              >
                {{ scope.row.user.status === 'active' ? '活跃' : '停用' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="250" fixed="right" align="center" header-align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                  type="primary"
                  link
                  class="action-button"
                  @click="viewPatientDetails(scope.row)"
              >
                <el-icon><Document /></el-icon>
                查看详情
              </el-button>
              <el-button
                  type="success"
                  link
                  class="action-button"
                  @click="startConsultation(scope.row)"
              >
                <el-icon><Message /></el-icon>
                开始咨询
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-state">
            <el-empty
                description="暂无家长信息"
                :image-size="120"
            >
              <template #image>
                <el-icon :size="48" class="empty-icon"><UserFilled /></el-icon>
              </template>
            </el-empty>
          </div>
        </template>
      </el-table>
    </div>

    <el-dialog
        v-model="showDetails"
        title="家长详细信息"
        width="65%"
        class="patient-details-dialog"
        destroy-on-close
    >
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
import { Document, Message, UserFilled } from '@element-plus/icons-vue'

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
    });

    // 处理响应数据，替换 avatarUrl
    patients.value = response.data.map(patient => {
      const newAvatarUrl = patient.user.avatarUrl.replace('http://localhost:8080/UserAvatar/', 'https://zeropw.cn:8081/UserAvatar/');
      return {
        ...patient,
        user: {
          ...patient.user,
          avatarUrl: newAvatarUrl
        }
      };
    });
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    ElMessage.error('获取家长列表失败');
  }
};

const filteredPatients = computed(() => {
  return patients.value
      .filter(patient =>
          patient.user.username.toLowerCase().includes(search.value.toLowerCase()) ||
          patient.user.userId.includes(search.value)
      )
      .map((patient, index) => ({
        ...patient,
        displayId: index + 1
      }))
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
.patient-list-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #64748b;
  font-size: 16px;
}

.search-section {
  margin-bottom: 24px;
}

.search-wrapper {
  max-width: 480px;
  margin: 0 auto;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.search-input :deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 24px;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table td) {
  padding: 16px;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f1f5f9;
}

.id-badge {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.user-avatar {
  border: 2px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 500;
  color: #1e293b;
}

.status-tag {
  width: fit-content;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

/* 空状态样式 */
.empty-state {
  padding: 48px 0;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 16px;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .patient-list-container {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .table-container {
    padding: 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  :deep(.el-dialog) {
    width: 90% !important;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .patient-list-container {
    background-color: #1a1a1a;
  }

  .page-title {
    color: #e5e7eb;
  }

  .page-subtitle {
    color: #9ca3af;
  }

  .table-container {
    background: #262626;
  }

  :deep(.el-table) {
    --el-table-border-color: #374151;
    --el-table-header-bg-color: #1f2937;
    background-color: #262626;
  }

  :deep(.el-table th) {
    background: #1f2937;
    color: #e5e7eb;
  }

  :deep(.el-table td) {
    border-bottom-color: #374151;
  }

  .username {
    color: #e5e7eb;
  }

  .id-badge {
    background: #e2e8f0;
    color: #475569;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    display: inline-block;
    text-align: center;
  }
}

/* 动画效果 */
.el-table-column {
  transition: all 0.3s ease;
}

:deep(.el-table__body tr) {
  transition: transform 0.2s ease;
}

:deep(.el-table__body tr:hover) {
  transform: translateY(-1px);
}

/* 自定义滚动条 */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}
</style>