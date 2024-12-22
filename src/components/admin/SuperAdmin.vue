<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">超级管理员控制台</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchTerm"
            placeholder="搜索管理员ID或用户名"
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
          <el-button @click="showCreateAdminForm" type="primary" class="ml-2">
            创建新管理员
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
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="170"></el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.adminType)">
              {{ getTagName(scope.row.adminType) }}
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
        <el-table-column label="操作" min-width="250" align="center">
          <template #default="scope">
            <el-button 
              :type="scope.row.status === 'active' ? 'danger' : 'success'" 
              size="small" 
              @click="toggleAdminStatus(scope.row)"
              :disabled="scope.row.role === 'super_admin'"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteAdmin(scope.row)"
              :disabled="scope.row.role === 'super_admin' || scope.row.adminId === currentAdmin.adminId"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据提示 -->
      <el-empty v-if="filteredAdmins.length === 0" description="没有管理员数据"></el-empty>
    </el-main>

    <!-- 编辑/创建管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑管理员' : '创建新管理员'"
      width="30%"
    >
      <el-form :model="adminForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="adminForm.username" placeholder="请填写用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="adminForm.email" placeholder="请填写邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="!isEditing">
          <el-input v-model="adminForm.password" type="password" placeholder="请填写10-16位密码"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="adminForm.adminType" placeholder="请选择管理员类型">
            <el-option label="管理员" value="first"></el-option>
            <el-option label="超级管理员" value="super"></el-option>
            <el-option label="二级管理员" value="second"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdminForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="确认删除"
      width="30%"
    >
      <p>您确定要删除这个管理员账号吗？此操作不可逆。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index'

const allAdmins = ref([])
const filteredAdmins = ref([])
const currentAdmin = ref({ adminId: 1, username: 'superadmin', role: 'super_admin' })
const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const adminForm = ref({
  username: '',
  email: '',
  password: '',
  adminType: ''
})
const deleteConfirmVisible = ref(false)
const adminToDelete = ref(null)
const searchTerm = ref('')

const fetchAdmins = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get('/api/admin/selectAll')
    allAdmins.value = response.data.map((admin, index) => ({
      ...admin,
      displayId: index + 1
    }));
    filteredAdmins.value = [...allAdmins.value];
  } catch (error) {
    console.error('获取管理员数据失败:', error)
    ElMessage.error('获取管理员数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAdmins)

const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'bg-gray-50' : ''
}

const showCreateAdminForm = () => {
  isEditing.value = false
  adminForm.value = { username: '', email: '', password: '', adminType: '' }
  dialogVisible.value = true
}

const editAdmin = (admin) => {
  isEditing.value = true
  adminForm.value = { ...admin }
  dialogVisible.value = true
}

const submitAdminForm = async () => {
  if (!adminForm.value.username || (!isEditing.value && !adminForm.value.password) || !adminForm.value.adminType) {
    ElMessage.error('请填写所有必填字段')
    return
  }

// 密码校验：长度为10-16位，包含大小写字母和数字
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/;
  if (!isEditing.value && !passwordRegex.test(adminForm.value.password)) {
    ElMessage.error('密码长度为10-16位，必须包含大小写字母和数字')
    return
  }

  // 邮箱校验：使用正则表达式验证邮箱格式
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(adminForm.value.email)) {
    ElMessage.error('请输入有效的邮箱地址')
    return
  }

// adminType 校验：必须为“超级管理员”、“管理员”或“二级管理员”
  const validAdminTypes = ['first', 'super', 'second'];
  if (!validAdminTypes.includes(adminForm.value.adminType)) {
    ElMessage.error('adminType 必须为超级管理员、管理员或二级管理员之一')
    return
  }

  try {
    if (isEditing.value) {
      await axiosInstance.post('/api/admin/edit', JSON.stringify(adminForm.value), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      ElMessage.success('管理员信息已更新')
    } else {
      await axiosInstance.post('/api/admin/create', JSON.stringify(adminForm.value), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      ElMessage.success('新管理员已创建')
    }
    dialogVisible.value = false
    fetchAdmins()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

const toggleAdminStatus = async (admin) => {
  try {
    const url = admin.status === 'active' ? '/api/admin/ban' : '/api/admin/activate'
    await axiosInstance.post(url, JSON.stringify({ adminId: admin.adminId }), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    admin.status = admin.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`管理员 ${admin.username} 已${admin.status === 'active' ? '启用' : '停用'}`)
  } catch (error) {
    console.error('状态切换失败:', error)
    ElMessage.error('状态切换失败，请稍后重试')
  }
}

const deleteAdmin = (admin) => {
  adminToDelete.value = admin
  deleteConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (adminToDelete.value) {
    try {
      await axiosInstance.post('/api/admin/delete', JSON.stringify({ adminId: adminToDelete.value.adminId }), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      ElMessage.success(`管理员 ${adminToDelete.value.username} 已删除`)
      deleteConfirmVisible.value = false
      adminToDelete.value = null
      await fetchAdmins()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const onSearch = () => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term === '') {
    filteredAdmins.value = [...allAdmins.value]
  } else {
    filteredAdmins.value = allAdmins.value.filter(admin => 
      admin.displayId.toString() === term || 
      admin.username.toLowerCase().includes(term)
    )
  }
}

const clearSearch = () => {
  searchTerm.value = ''
  filteredAdmins.value = [...allAdmins.value]
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