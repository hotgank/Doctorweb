<template>
    <el-container class="min-h-screen bg-gray-100">
      <el-header class="bg-white shadow-md">
        <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h3 class="text-2xl font-bold text-gray-900">用户管理</h3>
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchTerm"
              placeholder="搜索用户ID或账号"
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
        <!-- 用户表格 -->
        <el-table 
          :data="filteredUsers" 
          style="width: 100%"
          :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
          :row-class-name="tableRowClassName"
        >
          <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
          <el-table-column prop="username" label="姓名" width="120"></el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="170"></el-table-column>
          <el-table-column prop="lastLogin" label="上次登录时间" width="150"></el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" effect="dark">
                {{ scope.row.status === 'active' ? '活跃' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="editUser(scope.row)">编辑</el-button>
              <el-button 
                :type="scope.row.status === 'active' ? 'danger' : 'success'" 
                size="small" 
                @click="toggleUserStatus(scope.row)"
              >
                {{ scope.row.status === 'active' ? '停用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 空数据提示 -->
        <el-empty v-if="filteredUsers.length === 0" description="没有用户数据"></el-empty>
      </el-main>
  
      <!-- 编辑用户对话框 -->
      <el-dialog v-model="editDialogVisible" title="编辑用户" width="30%">
        <el-form :model="editingUser" label-width="100px">
          <el-form-item label="账号">
            <el-input v-model="editingUser.account" disabled></el-input>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="editingUser.name"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveUserEdit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-container>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  
  // 模拟用户数据
  const allUsers = ref([
    { id: 1, username: '张三', email: 'user1@example.com', lastLogin: '2024-05-10 14:30', status: 'active' },
    { id: 2, username: '李四', email: 'user2@example.com', lastLogin: '2024-05-09 10:15', status: 'active' },
    { id: 3, username: '王五', email: 'user3@example.com', lastLogin: '2024-05-08 16:45', status: 'inactive' },
    { id: 4, username: '赵六', email: 'user4@example.com', lastLogin: '2024-05-07 09:20', status: 'active' },
    { id: 5, username: '钱七', email: 'user5@example.com', lastLogin: '2024-05-06 11:30', status: 'active' },
  ])
  
  // 搜索关键词
  const searchTerm = ref('')
  
  // 过滤后的用户列表
  const filteredUsers = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (term === '') {
      return allUsers.value
    } else {
      return allUsers.value.filter(user => 
        user.id.toString().includes(term) || 
        user.account.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term)
      )
    }
  })
  
  // 搜索功能
  const onSearch = () => {
    // 触发计算属性更新
  }
  
  // 清空搜索
  const clearSearch = () => {
    searchTerm.value = ''
  }
  
  // 表格行的样式
  const tableRowClassName = ({ row, rowIndex }) => {
    if (rowIndex % 2 === 0) {
      return 'bg-gray-50'
    }
    return ''
  }
  
  // 编辑用户
  const editDialogVisible = ref(false)
  const editingUser = ref({})
  
  const editUser = (user) => {
    editingUser.value = { ...user }
    editDialogVisible.value = true
  }
  
  const saveUserEdit = () => {
    const index = allUsers.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      allUsers.value[index] = { ...editingUser.value }
      ElMessage.success('用户信息已更新')
    }
    editDialogVisible.value = false
  }
  
  // 切换用户状态
  const toggleUserStatus = (user) => {
    user.status = user.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`用户 ${user.name} 已${user.status === 'active' ? '启用' : '停用'}`)
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