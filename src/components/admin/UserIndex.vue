<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">用户管理</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
              v-model="searchTerm"
              placeholder="搜索用户UID或账号"
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
          :data="paginatedUsers"
          style="width: 100%"
          :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
          :row-class-name="tableRowClassName"
          v-loading="loading"
      >
        <el-table-column prop="displayId" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" width="200"></el-table-column>
        <!-- 修改后 -->
        <el-table-column prop="lastLogin" label="上次登录时间" width="160">
          <template #default="scope">
            {{ formatDate2(scope.row.lastLogin) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" effect="dark">
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" align="center">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewUserDetails(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
                :type="scope.row.status === 'active' ? 'danger' : 'success'"
                size="small"
                @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="没有用户数据"></el-empty>
        </template>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="frontendCurrentPage"
            :page-size="frontendPageSize"
            :total="parseInt(userNumber, 10)"
            @current-change="handleFrontendPageChange"
            :pager-count="5"
            layout="prev, pager, next"
        />
      </div>
    </el-main>

    <!-- 用户详情对话框 -->
    <el-dialog
        v-model="detailsDialogVisible"
        title="用户详情"
        width="50%"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
        <el-descriptions-item label="UID">{{ selectedUser.userId }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">{{ selectedUser.status === 'active' ? '活跃' : '停用' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate2(selectedUser.registrationDate) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index'

const allUsers = ref([])
const loading = ref(false)
const filteredUsers = ref([])

// 新增：数据库中总用户数量
const totalUsers = ref(0)

// 新增：分页显示的数量
const userNumber = ref(0)

// 新增：后端分页相关变量
const backendCurrentPage = ref(1)
const backendPageSize = ref(50)

// 新增：前端分页相关变量
const frontendCurrentPage = ref(1)
const frontendPageSize = ref(5)

// 新增：获取总用户数量
const fetchTotalUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/user/selectUserCount');
    totalUsers.value = response.data.userCount || 0;
    userNumber.value = totalUsers.value;
    console.log('Total users:', totalUsers.value);
  } catch (error) {
    console.error('获取用户总数失败:', error);
    ElMessage.error('获取用户总数失败，请稍后重试');
    totalUsers.value = 0;
  }
};

// 修改：获取分页用户数据
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.post('/api/user/selectPage', {
      currentPage: backendCurrentPage.value,
      pageSize: backendPageSize.value
    })
    allUsers.value = response.data.map((user, idx) => ({
      ...user,
      displayId: (backendCurrentPage.value - 1) * backendPageSize.value + idx + 1
    }))
    // 更新userNumber, 用于分页
    userNumber.value = totalUsers.value;
    // 更新显示的用户数据
    filteredUsers.value = allUsers.value;
    console.log(allUsers);
  } catch (error) {
    console.error('获取用户数据失败:', error)
    ElMessage.error('获取用户数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 在组件挂载时获取总用户数量和第一页用户数据
onMounted(async () => {
  await fetchTotalUsers()
  await fetchUsers()
})

// 搜索关键词
const searchTerm = ref('')

// 搜索用户
const fetchFilteredUsers = async (queryString) => {
  loading.value = true;
  try {
    const response = await axiosInstance.post('/api/user/selectPage', {
      currentPage: 1,
      pageSize: totalUsers.value,
      queryString: queryString
    });
    filteredUsers.value = response.data.map((user, idx) => ({
      ...user,
      displayId: (backendCurrentPage.value - 1) * backendPageSize.value + idx + 1
    }));
    // 更新userNumber，用于分页
    userNumber.value = filteredUsers.value.length;
    console.log(filteredUsers);
  } catch (error) {
    console.error('获取用户数据失败:', error);
    ElMessage.error('获取用户数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 计算属性：获取当前页的用户数据
const paginatedUsers = computed(() => {
  const start = (frontendCurrentPage.value - 1) * frontendPageSize.value % backendPageSize.value;
  const end = start + frontendPageSize.value;
  if (end > filteredUsers.value.length) {
    return filteredUsers.value.slice(start);
  }
  return filteredUsers.value.slice(start, end);
});

// 新增：处理前端页码变化
const handleFrontendPageChange = async (page) => {
  frontendCurrentPage.value = page;
  const requiredBackendPage = Math.ceil((page * frontendPageSize.value) / backendPageSize.value);

  if (requiredBackendPage !== backendCurrentPage.value) {
    backendCurrentPage.value = requiredBackendPage;
    await fetchUsers();
  }
};

// 搜索功能
const onSearch = () => {
  const term = searchTerm.value.trim().toLowerCase();
  fetchFilteredUsers(term);
  frontendCurrentPage.value = 1; // 重置前端页码到第一页
  backendCurrentPage.value = 1; // 重置后端页码到第一页
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
  frontendCurrentPage.value = 1; // 重置前端页码到第一页
  backendCurrentPage.value = 1; // 重置后端页码到第一页
  userNumber.value = totalUsers.value;
  fetchUsers(); // 重新获取第一页数据
}

// 表格行的样式
const tableRowClassName = ({rowIndex }) => {
  if (rowIndex % 2 === 0) {
    return 'bg-gray-50'
  }
  return ''
}

const detailsDialogVisible = ref(false)
const selectedUser = ref(null)

// 查看用户详情
const viewUserDetails= (user) => {
  selectedUser.value = user
  detailsDialogVisible.value = true
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  const url = user.status === 'active' ? '/api/user/ban' : '/api/user/active';
  try {
    // 向后端发送 POST 请求
    const response = await axiosInstance.post(url, {
      userId: user.userId
    });

    if (response.status === 200) {
      // 更新前端状态
      user.status = newStatus;
      ElMessage.success(`用户 ${user.username} 已${newStatus === 'active' ? '启用' : '停用'}`);
    } else {
      ElMessage.error('更新用户状态失败，请稍后重试');
    }
  } catch (error) {
    console.error('更新用户状态请求失败:', error);
    ElMessage.error('更新用户状态失败，请稍后重试');
  }
}
// 新增：监听搜索词变化，重置分页
watch(searchTerm, () => {
  frontendCurrentPage.value = 1;
});

// 添加时间格式化函数
const formatDate2 = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并补零
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

