<template>
  <div class="hospital-management">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><OfficeBuilding /></el-icon>
          <h1 class="page-title">医院管理</h1>
          <el-tag type="info" class="hospital-count">
            共 {{ hospitalNumber }} 家医院
          </el-tag>
        </div>

        <div class="header-actions">
          <div class="search-section">
            <el-input
                v-model="searchTerm"
                placeholder="搜索医院名称"
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

          <el-button
              type="success"
              @click="showAddDialog"
              class="add-button"
          >
            <el-icon><Plus /></el-icon>
            添加医院
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="table-container">
        <!-- 医院列表表格 -->
        <el-table
            :data="currentPageHospitals"
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

          <!-- 医院名称列 -->
          <el-table-column
              prop="hospitalName"
              label="医院名称"
              min-width="200"
          >
            <template #default="scope">
              <div class="hospital-info">
                <el-icon class="hospital-icon"><School /></el-icon>
                <span class="hospital-name">{{ scope.row.hospitalName }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 地址列 -->
          <el-table-column
              prop="address"
              label="地址"
              min-width="250"
          >
            <template #default="scope">
              <div class="address-info">
                <el-icon><Location /></el-icon>
                <span>{{ scope.row.address }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 管理员列 -->
          <el-table-column
              prop="adminUsername"
              label="管理员"
              min-width="150"
          >
            <template #default="scope">
              <div class="admin-info">
                <span>{{ scope.row.adminUsername || '暂无管理员' }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column
              label="操作"
              width="220"
              fixed="right"
              align="center"
          >
            <template #default="scope">
              <div class="action-buttons">
                <el-tooltip
                    content="更新地址"
                    placement="top"
                >
                  <el-button
                      type="primary"
                      circle
                      @click="showUpdateAddressDialog(scope.row)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip
                    content="更换管理员"
                    placement="top"
                >
                  <el-button
                      type="warning"
                      circle
                      @click="showUpdateAdminDialog(scope.row)"
                  >
                    <el-icon><User /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip
                    content="取消管理员"
                    placement="top"
                >
                  <el-button
                      type="info"
                      circle
                      @click="deleteAdmin(scope.row.hospitalName)"
                      :disabled="!scope.row.adminUsername"
                  >
                    <el-icon><Remove /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip
                    content="删除医院"
                    placement="top"
                >
                  <el-button
                      type="danger"
                      circle
                      @click="deleteHospital(scope.row.hospitalName)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <!-- 空状态 -->
          <template #empty>
            <el-empty
                description="暂无医院数据"
                :image-size="200"
            >
              <template #description>
                <p class="empty-text">暂无医院数据</p>
                <p class="empty-hint">您可以点击"添加医院"来创建</p>
              </template>
              <el-button
                  type="primary"
                  @click="showAddDialog"
              >
                添加医院
              </el-button>
            </el-empty>
          </template>
        </el-table>

        <!-- 分页器 -->
        <div class="pagination-wrapper">
          <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="parseInt(hospitalNumber,10)"
              @current-change="handlePageChange"
              :pager-count="5"
              layout="total, prev, pager, next, jumper"
              background
          />
        </div>
      </div>
    </main>

    <!-- 添加医院对话框 -->
    <el-dialog
        v-model="addDialogVisible"
        title="添加医院"
        width="500px"
        class="hospital-dialog"
        destroy-on-close
    >
      <div class="dialog-content">
        <el-form
            :model="newHospital"
            label-width="100px"
            class="hospital-form"
        >
          <el-form-item label="医院名称">
            <el-input
                v-model="newHospital.hospitalName"
                placeholder="请输入医院名称"
            />
          </el-form-item>

          <el-form-item label="医院地址">
            <el-input
                v-model="newHospital.address"
                type="textarea"
                :rows="3"
                placeholder="请输入详细地址"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              @click="addHospital"
          >
            确认添加
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 更新地址对话框 -->
    <el-dialog
        v-model="updateAddressDialogVisible"
        title="更新医院地址"
        width="500px"
        class="hospital-dialog"
        destroy-on-close
    >
      <div class="dialog-content">
        <el-form
            :model="updateAddressForm"
            label-width="100px"
            class="hospital-form"
        >
          <el-form-item label="医院名称">
            <el-input
                v-model="updateAddressForm.hospitalName"
                disabled
            />
          </el-form-item>

          <el-form-item label="新地址">
            <el-input
                v-model="updateAddressForm.address"
                type="textarea"
                :rows="3"
                placeholder="请输入新地址"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="updateAddressDialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              @click="updateHospitalAddress"
          >
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 更新管理员对话框 -->
    <el-dialog
        v-model="updateAdminDialogVisible"
        title="更新医院管理员"
        width="800px"
        class="hospital-dialog"
        destroy-on-close
    >
      <div class="dialog-content">
        <div class="dialog-header">
          <el-alert
              title="选择新管理员"
              type="info"
              description="请在下方列表中选择要指派的管理员"
              :closable="false"
              class="dialog-alert"
          />

          <div class="selected-hospital">
            <span class="label">当前医院：</span>
            <el-tag size="large">{{ updateAdminForm.hospitalName }}</el-tag>
          </div>
        </div>

        <!-- 管理员表格 -->
        <div class="admin-table-wrapper">
          <el-table
              :data="allAdmins"
              style="width: 100%"
              :header-cell-style="tableHeaderStyle"
              :row-class-name="tableRowClassName"
              @row-click="selectAdmin"
              highlight-current-row
              max-height="400"
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

            <!-- 姓名列 -->
            <el-table-column
                prop="username"
                label="姓名"
                width="120"
            >
              <template #default="scope">
                <div class="admin-info">
                  <el-avatar
                      :size="32"
                      class="admin-avatar"
                  >
                    {{ scope.row.username.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <span>{{ scope.row.username }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 邮箱列 -->
            <el-table-column
                prop="email"
                label="邮箱"
                width="200"
            >
              <template #default="scope">
                <div class="email-info">
                  <el-icon><Message /></el-icon>
                  <span>{{ scope.row.email }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 电话列 -->
            <el-table-column
                prop="phone"
                label="电话"
                width="150"
            >
              <template #default="scope">
                <div class="phone-info">
                  <el-icon><Phone /></el-icon>
                  <span>{{ scope.row.phone }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 角色列 -->
            <el-table-column
                prop="role"
                label="角色"
                width="120"
                align="center"
            >
              <template #default="scope">
                <el-tag
                    :type="getTagType(scope.row.adminType)"
                    effect="light"
                    class="role-tag"
                >
                  <el-icon>
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
                    effect="light"
                    class="status-tag"
                >
                  <el-icon>
                    <component :is="scope.row.status === 'active' ? CircleCheck : CircleClose" />
                  </el-icon>
                  {{ scope.row.status === 'active' ? '活跃' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="updateAdminDialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              @click="updateHospitalAdmin"
              :disabled="!updateAdminForm.adminId"
          >
            确认指派
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
        v-model="deleteConfirmVisible"
        title="删除医院"
        width="400px"
        class="delete-dialog"
        destroy-on-close
    >
      <div class="delete-content">
        <el-icon class="delete-icon"><Warning /></el-icon>
        <p class="delete-message">确定要删除该医院吗？</p>
        <p class="delete-warning">此操作不可逆，请谨慎操作。</p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button
              type="danger"
              @click="confirmDelete"
          >
            确认删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {
  Search,
  OfficeBuilding,
  Plus,
  Location,
  Edit,
  User,
  Delete,
  Message,
  Phone,
  Warning,
  Remove,
  School,
  Star, Avatar, CircleCheck,CircleClose
} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import axiosInstance from '../../axios/index';

// 状态变量
const hospitals = ref([])
const allAdmins = ref([])
const loading = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const totalHospitals = ref(0)
const hospitalNumber = ref(0)
const addDialogVisible = ref(false)
const updateAddressDialogVisible = ref(false)
const updateAdminDialogVisible = ref(false)
const deleteConfirmVisible = ref(false)
const hospitalToDelete = ref(null)
const newHospital = ref({
  hospitalName: '',
  address: ''
})
const updateAddressForm = ref({
  hospitalName: '',
  address: ''
})
const updateAdminForm = ref({
  hospitalName: '',
  adminId: ''
})

const getRoleIcon = (adminType) => {
  switch (adminType) {
    case 'super':
      return Star;
    case 'first':
      return Avatar;
    case 'second':
      return User;
    default:
      return '';
  }
}

// 获取医院总数
const fetchHospitalCount = async () => {
  try {
    const response = await axiosInstance.get('/api/hospital/getHospitalCount')
    totalHospitals.value = response.data.count
    hospitalNumber.value = totalHospitals.value
  } catch (error) {
    console.error('获取医院总数失败:', error)
    ElMessage.error('获取医院总数失败，请稍后重试')
  }
}

// 获取医院列表
const fetchHospitals = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.post('/api/hospital/selectHospitalByCondition', {
      currentPage: currentPage.value,
      pageSize: pageSize.value
    })
    hospitals.value = response.data
    console.log('获取到的医院列表:', hospitals.value)
    hospitalNumber.value = totalHospitals.value
  } catch (error) {
    console.error('获取医院数据失败:', error)
    ElMessage.error('获取医院数据失败，请稍后重试，检查医院是否已存在')
  } finally {
    loading.value = false
  }
}

// 获取医院列表
const fetchHospitalsByCondition = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.post('/api/hospital/selectHospitalByCondition', {
      currentPage: 1,
      pageSize: totalHospitals.value,
      queryString: searchTerm.value
    })
    hospitals.value = response.data
    hospitalNumber.value = hospitals.value.length
  } catch (error) {
    console.error('获取医院数据失败:', error)
    ElMessage.error('获取医院数据失败，请稍后重试，检查医院是否已存在')
  } finally {
    loading.value = false
  }
}

// 获取所有管理员
const fetchAllAdmins = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/selectSecondAdmins');
    allAdmins.value = response.data.map((admin, index) => ({
      ...admin,
      displayId: index + 1
    }));
  } catch (error) {
    console.error('获取管理员数据失败:', error);
    ElMessage.error('获取管理员数据失败，请稍后重试');
  }
};

// 计算属性：获取当前页的医院数据
const currentPageHospitals = computed(() => {
  let filteredHospitals = hospitals.value;
  if (searchTerm.value !== '') {
    filteredHospitals = hospitals.value.filter(hospital =>
        hospital.hospitalName.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredHospitals.slice(start, end).map((hospital, index) => ({
    ...hospital,
    displayId: start + index + 1
  }));
});

// 在组件挂载时获取医院数据和管理员数据
onMounted(async () => {
  await fetchHospitalCount()
  await fetchHospitals()
  await fetchAllAdmins()
})

// 搜索功能
const onSearch = () => {
  currentPage.value = 1
  fetchHospitalsByCondition()
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
  currentPage.value = 1
  fetchHospitals()
}

// 处理页码变化
const handlePageChange = async (page) => {
  currentPage.value = page
  ElMessage.success('已切换到第' + page + '页')
  if (searchTerm.value === '') {
    await fetchHospitals()
  }
}

// 表格行的样式
const tableRowClassName = ({rowIndex}) => {
  return rowIndex % 2 === 0 ? 'bg-gray-50' : ''
}

// 显示添加医院对话框
const showAddDialog = () => {
  addDialogVisible.value = true
}

// 添加医院
const addHospital = async () => {
  try {
    await axiosInstance.post('/api/hospital/insertHospital', newHospital.value)
    ElMessage.success('医院添加成功')
    addDialogVisible.value = false
    await fetchHospitalCount()
    await fetchHospitals()
    newHospital.value = {hospitalName: '', address: ''}
  } catch (error) {
    console.error('添加医院失败:', error)
    ElMessage.error('添加医院失败，请稍后重试')
  }
}

// 取消管理员
const deleteAdmin = async (hospitalName) => {
  try {
    await axiosInstance.post('/api/hospital/deleteAdmin', {hospitalName})
    ElMessage.success('管理员取消成功')
    await fetchHospitals()
  } catch (error) {
    console.error('取消管理员失败:', error)
    ElMessage.error('取消管理员失败，请稍后重试')
  }
}

const deleteHospital = (hospitalName) => {
  hospitalToDelete.value = hospitalName
  deleteConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (hospitalToDelete.value) {
    try {
      await axiosInstance.post('/api/hospital/deleteHospital', JSON.stringify({ hospitalName: hospitalToDelete.value}), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      ElMessage.success('医院删除成功')
      deleteConfirmVisible.value = false
      hospitalToDelete.value = null
      await fetchHospitalCount()
      await fetchHospitals()
    } catch (error) {
      console.error('删除医院失败:', error)
      ElMessage.error('删除医院失败，请稍后重试')
    }
  }
}

// 显示更新地址对话框
const showUpdateAddressDialog = (hospital) => {
  updateAddressForm.value = {
    hospitalName: hospital.hospitalName,
    address: hospital.address
  }
  updateAddressDialogVisible.value = true
}

// 更新医院地址
const updateHospitalAddress = async () => {
  try {
    await axiosInstance.post('/api/hospital/updateHospital', updateAddressForm.value)
    ElMessage.success('医院地址更新成功')
    updateAddressDialogVisible.value = false
    await fetchHospitals()
  } catch (error) {
    console.error('更新医院地址失败:')
    ElMessage.error('更新医院地址更新失败，请稍后重试')
  }
}

// 显示更新管理员对话框
const showUpdateAdminDialog = (hospital) => {
  updateAdminForm.value = {
    hospitalName: hospital.hospitalName,
    adminId: ''
  }
  updateAdminDialogVisible.value = true
}

// 选择管理员
const selectAdmin = (row) => {
  updateAdminForm.value.adminId = row.adminId
  //ElMessage.success('已选择管理员'+updateAdminForm.value.adminId)
  ElMessage.success('已选择管理员' + ' '+row.displayId)
}

// 更新医院管理员
const updateHospitalAdmin = async () => {
  try {
    await axiosInstance.post('/api/hospital/updateAdminId', updateAdminForm.value)
    //ElMessage.success('医院管理员更新成功')
    updateAdminDialogVisible.value = false
    await fetchHospitals()
  } catch (error) {
    console.error('更新医院管理员失败:', error)
    ElMessage.error('更新医院管理员失败，请稍后重试')
  }
}

// 获取管理员类型对应的标签类型
const getTagType = (adminType) => {
  switch (adminType) {
    case 'super':
      return 'danger'
    case 'first':
      return 'warning'
    case 'second':
      return 'success'
    default:
      return ''
  }
}

// 获取管理员类型对应的标签名称
const getTagName = (adminType) => {
  switch (adminType) {
    case 'super':
      return '超级管理员'
    case 'first':
      return '管理员'
    case 'second':
      return '二级管理员'
    default:
      return ''
  }
}
</script>

<style scoped>
/* 页面容器 */
.hospital-management {
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

.hospital-count {
  padding: 4px 8px;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-section {
  display: flex;
  gap: 8px;
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

.hospital-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hospital-icon {
  color: var(--el-color-primary);
  font-size: 18px;
}

.hospital-name {
  font-weight: 500;
}

.address-info,
.admin-info,
.email-info,
.phone-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.admin-avatar {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
}

.role-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 分页器 */
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

/* 对话框样式 */
.dialog-content {
  padding: 0 20px;
}

.dialog-header {
  margin-bottom: 24px;
}

.dialog-alert {
  margin-bottom: 16px;
}

.selected-hospital {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.selected-hospital .label {
  color: #909399;
}

.hospital-form {
  margin-top: 20px;
}

.admin-table-wrapper {
  margin: 20px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

/* 删除对话框 */
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

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
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

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .search-section {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .add-button {
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
}
</style>