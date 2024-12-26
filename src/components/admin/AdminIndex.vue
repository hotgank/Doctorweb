<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">管理员列表</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
              v-model="searchTerm"
              placeholder="搜索管理员ID或姓名"
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
      <!-- 管理员表格 -->
      <el-table
          :data="filteredAdmins"
          style="width: 100%"
          :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
          :row-class-name="tableRowClassName"
          v-loading="loading"
      >
        <el-table-column prop="displayId" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="姓名" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.adminType)">
              {{ getTagName(scope.row.adminType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" effect="dark">
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据提示 -->
      <el-empty v-if="filteredAdmins.length === 0" description="没有管理员数据"></el-empty>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import axiosInstance from "../../axios/index";
import { ElMessage } from 'element-plus'

const allAdmins = ref([])
const filteredAdmins = ref([])
const searchTerm = ref('')
const loading = ref(false)

// 获取管理员数据
const fetchAdmins = async () => {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/api/admin/selectAll');
    allAdmins.value = response.data.map((admin, index) => ({
      ...admin,
      displayId: index + 1
    }));
    filteredAdmins.value = [...allAdmins.value];
  } catch (error) {
    console.error('获取管理员数据失败:', error);
    ElMessage.error('获取管理员数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 在组件挂载时获取管理员数据
onMounted(() => {
  fetchAdmins()
})

// 搜索功能：点击按钮后过滤管理员列表
const onSearch = () => {
  const term = searchTerm.value.trim().toLowerCase()

  if (term === '') {
    filteredAdmins.value = [...allAdmins.value]
  } else {
    filteredAdmins.value = allAdmins.value.filter(admin => {
      const idMatch = admin.displayId.toString() === term
      const nameMatch = admin.username.toLowerCase().includes(term)
      return idMatch || nameMatch
    })
  }
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
  filteredAdmins.value = [...allAdmins.value]
}

// 表格行的样式
const tableRowClassName = ({ row, rowIndex }) => {
  if (rowIndex % 2 === 0) {
    return 'bg-gray-50'
  }
  return ''
}

const getTagType = (adminType) => {
  switch (adminType) {
    case 'super':
      return 'danger';
    case 'first':
      return 'warning';
    case 'second':
      return 'success';
    default:
      return '';
  }
}

const getTagName = (adminType) => {
  switch (adminType) {
    case 'super':
      return '超级管理员';
    case 'first':
      return '管理员';
    case 'second':
      return '二级管理员';
    default:
      return '';
  }
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


:deep(.el-table th) {
  font-weight: bold;
  font-size: 16px;
  color: #111827;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
}

:deep(.el-table tbody tr:hover) {
  background-color: #f9fafb;
  cursor: pointer;
}

:deep(.el-dialog__footer button) {
  padding: 10px 20px;
  transition: all 0.2s ease;
}
:deep(.el-dialog__footer button:hover) {
  transform: scale(1.05);
}

:deep(.el-input__inner::-webkit-input-placeholder) {
  color: #a1a1aa;
}
:deep(.el-input__inner:focus::-webkit-input-placeholder) {
  color: transparent;
}
:deep(.el-button--primary.create-button) {
  background-color: #10b981;
  border-color: #10b981;
  shape-outside: circle();
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
</style>