<template>
  <div class="user-management">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><UserFilled /></el-icon>
          <h1 class="page-title">用户管理</h1>
          <el-tag type="info" class="user-count">
            共 {{ userNumber }} 位用户
          </el-tag>
        </div>

        <div class="search-section">
          <el-input
              v-model="searchTerm"
              placeholder="搜索用户UID或账号"
              clearable
              @clear="clearSearch"
              class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-button
              type="primary"
              @click="onSearch"
              class="search-button"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="table-container">
        <!-- 用户表格 -->
        <el-table
            :data="paginatedUsers"
            style="width: 100%"
            :header-cell-style="tableHeaderStyle"
            :row-class-name="tableRowClassName"
            v-loading="loading"
        >
          <!-- ID列 -->
          <el-table-column
              prop="displayId"
              label="ID"
              width="80"
              align="center"
          >
            <template #default="scope">
              <span class="id-badge">{{ scope.row.displayId }}</span>
            </template>
          </el-table-column>

          <!-- 用户名列 -->
          <el-table-column
              prop="username"
              label="用户名"
              min-width="200"
          >
            <template #default="scope">
              <div class="user-info">
                <span class="username">{{ scope.row.username }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 上次登录时间列 -->
          <el-table-column
              prop="lastLogin"
              label="上次登录时间"
              min-width="180"
          >
            <template #default="scope">
              <div class="time-info">
                <el-icon><Timer /></el-icon>
                <span>{{ formatDate2(scope.row.lastLogin) }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column
              prop="status"
              label="状态"
              width="120"
              align="center"
          >
            <template #default="scope">
              <el-tag
                  :type="scope.row.status === 'active' ? 'success' : 'danger'"
                  class="status-tag"
                  effect="light"
              >
                <el-icon>
                  <component :is="scope.row.status === 'active' ? CircleCheck : CircleClose" />
                </el-icon>
                {{ scope.row.status === 'active' ? '活跃' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column
              label="操作"
              width="110"
              align="center"
              fixed="right"
          >
            <template #default="scope">
              <div class="action-buttons">
                <el-tooltip
                    content="查看详情"
                    placement="top"
                >
                  <el-button
                      type="primary"
                      circle
                      @click="viewUserDetails(scope.row)"
                  >
                    <el-icon><View /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip
                    :content="scope.row.status === 'active' ? '停用账号' : '启用账号'"
                    placement="top"
                >
                  <el-button
                      :type="scope.row.status === 'active' ? 'danger' : 'success'"
                      circle
                      @click="toggleUserStatus(scope.row)"
                  >
                    <el-icon>
                      <component :is="scope.row.status === 'active' ? Lock : Unlock" />
                    </el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <!-- 空状态 -->
          <template #empty>
            <el-empty
                description="暂无用户数据"
                :image-size="200"
            >
              <template #description>
                <p class="empty-text">暂无用户数据</p>
                <p class="empty-hint">您可以尝试清除搜索条件</p>
              </template>
            </el-empty>
          </template>
        </el-table>

        <!-- 分页器 -->
        <div class="pagination-wrapper">
          <el-pagination
              v-model:current-page="frontendCurrentPage"
              :page-size="frontendPageSize"
              :total="parseInt(userNumber, 10)"
              @current-change="handleFrontendPageChange"
              :pager-count="5"
              layout="total, prev, pager, next, jumper"
              background
          />
        </div>
      </div>
    </main>

    <!-- 用户详情对话框 -->
    <el-dialog
        v-model="detailsDialogVisible"
        title="用户详细信息"
        width="600px"
        class="user-dialog"
        destroy-on-close
    >
      <div class="user-details">
        <div class="user-header">
          <el-avatar
              :size="64"
              class="user-large-avatar"
              :src="selectedUser?.avatarUrl"
          >
          </el-avatar>
          <h2 class="user-title">{{ selectedUser?.username }}</h2>
        </div>

        <el-descriptions
            :column="1"
            border
            class="details-content"
        >
          <el-descriptions-item label="用户ID">
            <div class="details-item">
              <el-icon><Key /></el-icon>
              {{ selectedUser?.userId }}
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="账号状态">
            <el-tag
                :type="selectedUser?.status === 'active' ? 'success' : 'danger'"
                class="details-tag"
            >
              {{ selectedUser?.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="注册时间">
            <div class="details-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate2(selectedUser?.registrationDate) }}
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="上次登录">
            <div class="details-item">
              <el-icon><Timer /></el-icon>
              {{ formatDate2(selectedUser?.lastLogin) }}
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="dialog-footer">
          <el-button
              :type="selectedUser?.status === 'active' ? 'danger' : 'success'"
              @click="toggleUserStatus(selectedUser)"
          >
            <el-icon>
              <component :is="selectedUser?.status === 'active' ? Lock : Unlock" />
            </el-icon>
            {{ selectedUser?.status === 'active' ? '停用账号' : '启用账号' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, UserFilled, Timer, View, Key, Calendar, Lock, Unlock, CircleCheck, CircleClose } from '@element-plus/icons-vue'
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
/* 页面容器 */
.user-management {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 页面头部 */
.page-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.user-count {
  padding: 4px 8px;
  font-size: 14px;
}

.search-section {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 300px;
}

/* 主要内容区域 */
.main-content {
  max-width: 1400px;
  margin: 24px auto;
  padding: 0 24px;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
.id-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  border-radius: 12px;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
}

.username {
  font-weight: 500;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 分页器样式 */
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

/* 用户详情对话框 */
.user-details {
  padding: 20px;
}

.user-header {
  text-align: center;
  margin-bottom: 24px;
}

.user-large-avatar {
  margin-bottom: 16px;
  font-size: 24px;
  background: var(--el-color-primary);
  color: #fff;
}

.user-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.details-content {
  margin-top: 24px;
}

.details-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.details-tag {
  min-width: 80px;
  text-align: center;
}

.dialog-footer {
  margin-top: 24px;
  text-align: right;
}

/* 空状态 */
.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #c0c4cc;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content,
  .main-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .search-section {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .table-container {
    padding: 12px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 16px 0;
  }

  .header-content {
    padding: 0 16px;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-title {
    font-size: 20px;
  }

  .user-details {
    padding: 12px;
  }
}
</style>