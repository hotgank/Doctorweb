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
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="170"></el-table-column>
        <el-table-column prop="phone" label="电话" min-width="150"></el-table-column>
        <el-table-column prop="role" label="角色" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
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
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 初始化管理员数据
const allAdmins = ref([
  { 
    id: 1, 
    name: '管理员 X', 
    email: 'adminX@example.com', 
    phone: '19355555555',
    role: '超级管理员',
    status: 'active'
  },
  { 
    id: 2, 
    name: '管理员 Y', 
    email: 'adminY@example.com', 
    phone: '10086',
    role: '普通管理员',
    status: 'active'
  },
  { 
    id: 3, 
    name: '管理员 Z', 
    email: 'adminZ@example.com', 
    phone: '10010',
    role: '普通管理员',
    status: 'inactive'
  },
])

// 搜索关键词
const searchTerm = ref('')
const filteredAdmins = ref([...allAdmins.value])

// 搜索功能：点击按钮后过滤管理员列表
const onSearch = () => {
  const term = searchTerm.value.trim().toLowerCase()
  
  if (term === '') {
    filteredAdmins.value = [...allAdmins.value]
  } else {
    filteredAdmins.value = allAdmins.value.filter(admin => {
      const idMatch = admin.id.toString().includes(term)
      const nameMatch = admin.name.toLowerCase().includes(term)
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
</style>