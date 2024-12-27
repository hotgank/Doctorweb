<template>
  <el-container class="admin-container">
    <!-- 页面头部 -->
    <el-header class="admin-header">
      <div class="header-content">
        <div class="header-title">
          <el-icon class="header-icon"><Platform /></el-icon>
          <h1>超级管理员控制台</h1>
        </div>

        <div class="header-actions">
          <div class="search-wrapper">
            <el-input
                v-model="searchTerm"
                placeholder="搜索管理员ID或用户名"
                clearable
                @clear="clearSearch"
                class="search-input"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
            <el-button
                @click="onSearch"
                type="primary"
                class="search-button"
            >
              搜索
            </el-button>
          </div>

          <el-button
              @click="showCreateAdminForm"
              type="success"
              class="create-button"
          >
            <el-icon><Plus /></el-icon>
            创建新管理员
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <el-main class="admin-main">
      <div class="table-container">
        <el-table
            :data="filteredAdmins"
            style="width: 100%"
            :header-cell-style="{
            background: 'var(--el-color-primary-light-9)',
            color: 'var(--el-color-primary)'
          }"
            :row-class-name="tableRowClassName"
            v-loading="loading"
            border
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
              min-width="120"
          >
            <template #default="scope">
              <div class="username-cell">
                <span>{{ scope.row.username }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 邮箱列 -->
          <el-table-column
              prop="email"
              label="邮箱"
              min-width="200"
          >
            <template #default="scope">
              <div class="email-cell">
                <el-icon><Message /></el-icon>
                <span>{{ scope.row.email }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 角色列 -->
          <el-table-column
              prop="role"
              label="角色"
              width="140"
              align="center"
          >
            <template #default="scope">
              <el-tag
                  :type="getTagType(scope.row.adminType)"
                  effect="dark"
                  class="role-tag"
              >
                <el-icon class="role-icon">
                  <component :is="getRoleIcon(scope.row.adminType)" />
                </el-icon>
                {{ getTagName(scope.row.adminType) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column
              prop="status"
              label="状态"
              width="100"
              align="center"
          >
            <template #default="scope">
              <el-tag
                  :type="scope.row.status === 'active' ? 'success' : 'danger'"
                  class="status-tag"
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
              min-width="170"
              align="center"
              fixed="right"
          >
            <template #default="scope">
              <div class="action-buttons">
                <el-tooltip
                    content="编辑管理员信息"
                    placement="top"
                >
                  <el-button
                      type="primary"
                      circle
                      @click="editAdmin(scope.row)"
                      :disabled="scope.row.adminId === rootAdmin.adminId"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip
                    :content="scope.row.status === 'active' ? '停用账号' : '启用账号'"
                    placement="top"
                >
                  <el-button
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      circle
                      @click="toggleAdminStatus(scope.row)"
                      :disabled="scope.row.adminType === 'super' || scope.row.username === rootAdmin.username"
                  >
                    <el-icon>
                      <component :is="scope.row.status === 'active' ? VideoPause : VideoPlay" />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip
                    content="删除管理员"
                    placement="top"
                >
                  <el-button
                      type="danger"
                      circle
                      @click="deleteAdmin(scope.row)"
                      :disabled="scope.row.adminType === 'super' || scope.row.username === rootAdmin.username"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态展示 -->
        <el-empty
            v-if="filteredAdmins.length === 0"
            description="没有找到管理员数据"
            :image-size="200"
        >
          <template #description>
            <p class="empty-text">没有找到符合条件的管理员数据</p>
            <p class="empty-hint">您可以尝试清除搜索条件或创建新的管理员</p>
          </template>
          <el-button
              type="primary"
              @click="showCreateAdminForm"
          >
            创建新管理员
          </el-button>
        </el-empty>
      </div>
    </el-main>

    <!-- 编辑/创建管理员对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEditing ? '编辑管理员' : '创建新管理员'"
        width="500px"
        class="admin-dialog"
        destroy-on-close
    >
      <el-form
          :model="adminForm"
          label-width="100px"
          class="admin-form"
      >
        <el-form-item label="用户名">
          <el-input
              v-model="adminForm.username"
              placeholder="请填写用户名"
              :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input
              v-model="adminForm.email"
              placeholder="请填写邮箱"
              :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="密码" v-if="!isEditing">
          <el-input
              v-model="adminForm.password"
              type="password"
              placeholder="请填写10-16位密码"
              :prefix-icon="Lock"
              show-password
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select
              v-model="adminForm.adminType"
              placeholder="请选择管理员类型"
              class="role-select"
          >
            <el-option
                v-for="(label, value) in adminTypes"
                :key="value"
                :label="label"
                :value="value"
            >
              <div class="select-option">
                <el-icon class="option-icon">
                  <component :is="getRoleIcon(value)" />
                </el-icon>
                <span>{{ label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              @click="submitAdminForm"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
        v-model="deleteConfirmVisible"
        title="确认删除"
        width="400px"
        class="delete-dialog"
    >
      <div class="delete-content">
        <el-icon class="delete-icon"><Warning /></el-icon>
        <p class="delete-message">您确定要删除这个管理员账号吗？</p>
        <p class="delete-warning">此操作不可逆，请谨慎操作。</p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button
              type="danger"
              @click="confirmDelete"
          >
            确定删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Search,
  Platform,
  Plus,
  Message,
  Warning,
  CircleCheck,
  CircleClose,
  User,
  Edit,
  Delete,
  Lock,
  VideoPause,
  VideoPlay,
  Star,
  UserFilled,
  Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index'

const allAdmins = ref([])
const filteredAdmins = ref([])
const rootAdmin = ref({ username: 'superadmin', adminType: 'super' })
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

const adminTypes = {
  first: '管理员',
  super: '超级管理员',
  second: '二级管理员'
}

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

  // 添加逻辑限制adminType的修改
  if (isEditing.value) {
    const originalAdmin = allAdmins.value.find(admin => admin.adminId === adminForm.value.adminId);
    if (originalAdmin) {
      if (originalAdmin.adminType === 'second' && adminForm.value.adminType !== 'second') {
        ElMessage.error('不能将二级管理员修改为其他角色')
        return
      }
      if ((originalAdmin.adminType === 'first' || originalAdmin.adminType === 'super') && adminForm.value.adminType === 'second') {
        ElMessage.error('不能将此管理员修改为二级管理员')
        return
      }
    }
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
    await fetchAdmins()
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
      return 'warning';
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

const getRoleIcon = (value) => {
  switch (value) {
    case 'super':
      return Star; // 根据实际图标库调整
    case 'first':
      return UserFilled; // 根据实际图标库调整
    case 'second':
      return User; // 根据实际图标库调整
    default:
      return '';
  }
}

</script>

<style scoped>
/* 容器样式 */
.admin-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 头部样式 */
.admin-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.header-title h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-wrapper {
  display: flex;
  gap: 8px;
}

.search-input {
  width: 300px;
}

.search-icon {
  color: #909399;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 主要内容区样式 */
.admin-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
.id-badge {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.username-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
}

.email-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.role-icon {
  font-size: 14px;
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

/* 空状态样式 */
.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #c0c4cc;
}

/* 对话框样式 */
.admin-dialog {
  border-radius: 8px;
}

.admin-form {
  padding: 20px 0;
}

.role-select {
  width: 100%;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

/* 删除对话框样式 */
.delete-content {
  text-align: center;
  padding: 20px 0;
}

.delete-icon {
  font-size: 48px;
  color: var(--el-color-danger);
  margin-bottom: 16px;
}

.delete-message {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.delete-warning {
  font-size: 14px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content,
  .admin-main {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .search-wrapper {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .create-button {
    width: 100%;
  }

  .table-container {
    padding: 12px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .admin-header {
    position: static;
  }

  .header-content {
    padding: 12px;
  }

  .admin-main {
    padding: 12px;
  }
}
</style>