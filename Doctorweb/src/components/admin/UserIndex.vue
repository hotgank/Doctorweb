<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">用户管理</h3>
        <el-button type="primary" @click="showImportDialog" class="mt-4">
          导入用户数据
        </el-button>
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
          v-loading="loading"
      >
        <el-table-column prop="index" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="姓名" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="170"></el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="150"></el-table-column>
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
          <el-input v-model="editingUser.userId" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="editingUser.username"></el-input>
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
  <!-- 导入用户数据对话框 -->
  <el-dialog
      v-model="importDialogVisible"
      title="导入用户数据"
      width="30%"
  >
    <el-alert
        title="请上传符合要求的CSV文件"
        type="info"
        description="文件应包含以下列：ID, Name, Email, Phone, Registration Date"
        :closable="false"
        show-icon
        class="mb-4"
    />
    <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          只能上传 csv 文件
        </div>
      </template>
    </el-upload>
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importUserData">
            导入
          </el-button>
        </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {Search, UploadFilled} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from "../../axios/index";
import dayjs from 'dayjs';

const allUsers = ref([])
const loading = ref(false)
const importDialogVisible = ref(false)
const uploadedFile = ref(null)

// 获取所有用户数据并处理 lastLogin 格式
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/api/user/selectAll');
    allUsers.value = response.data.map((user, idx) => ({
      ...user,
      index: idx + 1,
      lastLogin: formatDate(user.lastLogin)
    }));
  } catch (error) {
    console.error('获取用户数据失败:', error);
    ElMessage.error('获取用户数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 日期格式化函数
const formatDate = (dateArray) => {
  if (Array.isArray(dateArray) && dateArray.length === 6) {
    return dayjs(new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4], dateArray[5]))
        .format('YYYY-MM-DD HH:mm:ss');
  }
  return '未登录';
};

// 在组件挂载时获取用户数据
onMounted(() => {
  fetchUsers()
})

// 搜索关键词
const searchTerm = ref('')

// 过滤后的用户列表
const filteredUsers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term === '') {
    return allUsers.value
  } else {
    return allUsers.value.filter(user =>
        user.index.toString() === term ||
        user.username.toLowerCase().includes(term)
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

// 保存编辑后的用户信息
const saveUserEdit = async () => {
  try {
    await axiosInstance.post('/api/user/adminEdit', {
      userId: editingUser.value.userId,
      username: editingUser.value.username
    });

    // 更新用户信息到本地数据
    const index = allUsers.value.findIndex(u => u.userId === editingUser.value.userId);
    if (index !== -1) {
      allUsers.value[index] = { ...editingUser.value };
      ElMessage.success('用户信息已更新');
    }
    editDialogVisible.value = false;
  } catch (error) {
    console.error('用户信息更新失败:', error);
    ElMessage.error('用户信息更新失败，请稍后重试');
  }
};

// 编辑用户对话框打开
const editUser = (user) => {
  editingUser.value = { ...user };
  editDialogVisible.value = true;
};

// 切换用户状态（停用或启用）
const toggleUserStatus = async (user) => {
  try {
    const url = user.status === 'active' ? '/api/user/ban' : '/api/user/active';
    await axiosInstance.post(url, { userId: user.userId });

    // 更新本地状态
    user.status = user.status === 'active' ? 'inactive' : 'active';
    ElMessage.success(`用户 ${user.username} 已${user.status === 'active' ? '启用' : '停用'}`);
  } catch (error) {
    console.error(`用户状态切换失败: ${error}`);
    ElMessage.error('用户状态切换失败，请稍后重试');
  }
};

const showImportDialog = () => {
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  uploadedFile.value = file
}

const importUserData = () => {
  if (!uploadedFile.value) {
    ElMessage.error('请先选择要上传的文件')
    return
  }

  // 这里应该是一个 API 调用来处理文件上传和数据导入
  // 为了演示，我们只是模拟这个过程
  setTimeout(() => {
    ElMessage.success('用户数据导入成功')
    importDialogVisible.value = false
    uploadedFile.value = null
  }, 2000)
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