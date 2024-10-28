<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">医生列表</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchTerm"
            placeholder="搜索医生ID或姓名"
            clearable
            @clear="clearSearch"
            class="w-64 sm:w-80"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
          <!-- 搜索按钮 -->
          <el-button @click="onSearch" type="primary" class="ml-2">
            搜索
          </el-button>
        </div>
      </div>
    </el-header>
    
    <el-main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 医生表格 -->
      <el-table 
        :data="filteredDoctors" 
        style="width: 100%"
        :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="hospital" label="单位" width="150"></el-table-column>
        <el-table-column prop="department" label="科室" width="120"></el-table-column>
        <el-table-column prop="position" label="职位" width="120"></el-table-column>
        <el-table-column prop="qualified" label="已认证" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.qualified ? 'success' : 'danger'" effect="dark">
              {{ scope.row.qualified ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" effect="dark">
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button 
              type="primary"
              size="small" 
              @click="viewDoctorDetails(scope.row)"
            >
              查看详情
            </el-button>
            <el-button 
              :type="scope.row.status === 'active' ? 'danger' : 'success'" 
              size="small" 
              @click="toggleDoctorStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据提示 -->
      <el-empty v-if="filteredDoctors.length === 0" description="没有医生数据"></el-empty>
    </el-main>

    <!-- 医生详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="医生详情"
      width="50%"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ selectedDoctor.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ selectedDoctor.name }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ selectedDoctor.email }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ selectedDoctor.hospital }}</el-descriptions-item>
        <el-descriptions-item label="科室">{{ selectedDoctor.department }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ selectedDoctor.position }}</el-descriptions-item>
        <el-descriptions-item label="认证状态">{{ selectedDoctor.qualified ? '已认证' : '未认证' }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">{{ selectedDoctor.status === 'active' ? '活跃' : '停用' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 初始化医生数据，新增 hospital 字段，将 unit 改为 department
const allDoctors = ref([
  { 
    id: 1, 
    name: '医生 A', 
    email: 'doctorA@example.com', 
    qualified: true,
    status: 'active',
    hospital: '第一人民医院',
    department: '内科', 
    position: '主治医师', 
    certNumber: 'D123456789',
    certImage: 'https://via.placeholder.com/150',
  },
  { 
    id: 2, 
    name: '医生 B', 
    email: 'doctorB@example.com', 
    qualified: true,
    status: 'active',
    hospital: '第二人民医院',
    department: '外科', 
    position: '副主任医师', 
    certNumber: 'D987654321',
    certImage: 'https://via.placeholder.com/150',
  },
  { 
    id: 3, 
    name: '医生 C', 
    email: 'doctorC@example.com', 
    qualified: false,
    status: 'inactive',
    hospital: '儿童医院',
    department: '儿科', 
    position: '住院医师', 
    certNumber: 'D112233445',
    certImage: 'https://via.placeholder.com/150',
  },
])

// 搜索关键词
const searchTerm = ref('')

// 计算属性：根据搜索关键词过滤医生列表
const filteredDoctors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term === '') {
    return allDoctors.value
  } else {
    return allDoctors.value.filter(doctor => 
      doctor.id.toString().includes(term) || 
      doctor.name.toLowerCase().includes(term)
    )
  }
})

// 搜索功能：由于使用了计算属性，这里不需要额外操作
const onSearch = () => {
  // 计算属性会自动更新
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
}

// 表格行的样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'bg-gray-50' : ''
}

// 医生详情对话框状态和选中的医生
const detailsDialogVisible = ref(false)
const selectedDoctor = ref({})

// 查看医生详情
const viewDoctorDetails = (doctor) => {
  selectedDoctor.value = doctor
  detailsDialogVisible.value = true
}

// 切换医生状态
const toggleDoctorStatus = (doctor) => {
  const newStatus = doctor.status === 'active' ? 'inactive' : 'active'
  doctor.status = newStatus
  ElMessage.success(`医生 ${doctor.name} 已${newStatus === 'active' ? '启用' : '停用'}`)
}
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
}

.el-table {
  margin-top: 20px;
}

/* 自定义 Element Plus 样式 */
:deep(.el-button--primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

:deep(.el-button--primary:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 自定义对话框底部按钮对齐 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.dialog-footer .el-button + .el-button {
  margin-left: 10px;
}
</style>