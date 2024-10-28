<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">超级管理员控制台</h3>
        <el-button type="primary" @click="showCreateAdminForm">
          创建新管理员
          <el-icon class="el-icon--right"><Plus /></el-icon>
        </el-button>
      </div>
    </el-header>
    
    <el-main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <el-table 
        :data="admins" 
        style="width: 100%"
        :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'super_admin' ? 'danger' : 'success'">
              {{ scope.row.role === 'super_admin' ? '超级管理员' : '管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
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
              type="primary" 
              size="small" 
              @click="editAdmin(scope.row)"
              :disabled="scope.row.role === 'super_admin' && scope.row.id !== currentAdmin.id"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteAdmin(scope.row)"
              :disabled="scope.row.role === 'super_admin' || scope.row.id === currentAdmin.id"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        v-model="dialogVisible"
        :title="isEditing ? '编辑管理员' : '创建新管理员'"
        width="30%"
        :close-on-click-modal="false"
      >
        <el-form :model="adminForm" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="adminForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="adminForm.email"></el-input>
          </el-form-item>
          <el-form-item label="密码" v-if="!isEditing">
            <el-input v-model="adminForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="adminForm.role">
              <el-option label="管理员" value="admin"></el-option>
              <el-option label="超级管理员" value="super_admin"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="isEditing && adminForm.role !== 'super_admin'">
            <el-checkbox v-model="confirmEdit">我确认要修改此管理员的权限</el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitAdminForm" :disabled="isEditing && adminForm.role !== 'super_admin' && !confirmEdit">确定</el-button>
          </span>
        </template>
      </el-dialog>

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

      <el-dialog
        v-model="secondConfirmVisible"
        title="二次确认"
        width="30%"
      >
        <p>您确定要修改此管理员的权限吗？此操作可能会影响系统安全。</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="secondConfirmVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAdminEdit">确定修改</el-button>
          </span>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const admins = ref([
  { id: 1, username: 'superadmin', email: 'superadmin@example.com', role: 'super_admin', status: 'active' },
  { id: 2, username: 'admin1', email: 'admin1@example.com', role: 'admin', status: 'active' },
  { id: 3, username: 'admin2', email: 'admin2@example.com', role: 'admin', status: 'inactive' },
])

const currentAdmin = ref({ id: 1, username: 'superadmin', role: 'super_admin' })

const dialogVisible = ref(false)
const isEditing = ref(false)
const adminForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'admin'
})

const deleteConfirmVisible = ref(false)
const adminToDelete = ref(null)

const confirmEdit = ref(false)
const secondConfirmVisible = ref(false)

const tableRowClassName = ({ row, rowIndex }) => {
  if (rowIndex % 2 === 0) {
    return 'bg-gray-50'
  }
  return ''
}

const showCreateAdminForm = () => {
  isEditing.value = false
  adminForm.value = { username: '', email: '', password: '', role: 'admin' }
  confirmEdit.value = false
  dialogVisible.value = true
}

const editAdmin = (admin) => {
  isEditing.value = true
  adminForm.value = { ...admin }
  confirmEdit.value = false
  dialogVisible.value = true
}

const submitAdminForm = () => {
  if (isEditing.value && adminForm.value.role !== 'super_admin') {
    secondConfirmVisible.value = true
  } else {
    updateOrCreateAdmin()
  }
}

const confirmAdminEdit = () => {
  updateOrCreateAdmin()
  secondConfirmVisible.value = false
}

const updateOrCreateAdmin = () => {
  if (isEditing.value) {
    // Update existing admin
    const index = admins.value.findIndex(a => a.id === adminForm.value.id)
    if (index !== -1) {
      admins.value[index] = { ...adminForm.value }
      ElMessage.success('管理员信息已更新')
    }
  } else {
    // Create new admin
    const newAdmin = {
      ...adminForm.value,
      id: admins.value.length + 1,
      status: 'active'
    }
    admins.value.push(newAdmin)
    ElMessage.success('新管理员已创建')
  }
  dialogVisible.value = false
  confirmEdit.value = false
}

const toggleAdminStatus = (admin) => {
  admin.status = admin.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`管理员 ${admin.username} 已${admin.status === 'active' ? '启用' : '停用'}`)
}

const deleteAdmin = (admin) => {
  adminToDelete.value = admin
  deleteConfirmVisible.value = true
}

const confirmDelete = () => {
  if (adminToDelete.value) {
    admins.value = admins.value.filter(a => a.id !== adminToDelete.value.id)
    ElMessage.success(`管理员 ${adminToDelete.value.username} 已删除`)
    deleteConfirmVisible.value = false
    adminToDelete.value = null
  }
}

// 特殊登录方法（示例）
const specialLogin = async (username, password, secretKey) => {
  // 这里应该是一个实际的API调用
  // const response = await api.superAdminLogin(username, password, secretKey)
  // if (response.success) {
  //   currentAdmin.value = response.adminData
  //   return true
  // }
  // return false

  // 模拟登录逻辑
  if (username === 'superadmin' && password === 'superpassword' && secretKey === 'supersecret') {
    currentAdmin.value = { id: 1, username: 'superadmin', role: 'super_admin' }
    return true
  }
  return false
}

// 在实际应用中，您需要在组件挂载时检查用户是否已经通过特殊登录
// 如果没有，则应该重定向到登录页面或显示登录表单
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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