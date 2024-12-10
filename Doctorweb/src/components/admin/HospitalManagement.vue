<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">医院列表</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
              v-model="searchTerm"
              placeholder="搜索医院名称"
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
          <el-button @click="showAddDialog" type="primary" class="ml-2">
            添加医院
          </el-button>
        </div>
      </div>
    </el-header>

    <el-main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 医院表格 -->
      <el-table
          :data="currentPageHospitals"
          style="width: 100%"
          :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
          :row-class-name="tableRowClassName"
          v-loading="loading"
      >
        <el-table-column prop="hospitalName" label="医院名称" width="200"></el-table-column>
        <el-table-column prop="address" label="地址" width="250"></el-table-column>
        <el-table-column prop="adminId" label="管理员ID" width="120"></el-table-column>
        <el-table-column prop="adminUsername" label="管理员用户名" width="150"></el-table-column>
        <el-table-column label="操作" min-width="300" align="center">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="showUpdateAddressDialog(scope.row)"
            >
              更新地址
            </el-button>
            <el-button
                type="warning"
                size="small"
                @click="showUpdateAdminDialog(scope.row)"
            >
              更新管理员
            </el-button>
            <el-button
                type="danger"
                size="small"
                @click="deleteHospital(scope.row.hospitalName)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="没有医院数据"></el-empty>
        </template>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="parseInt(hospitalNumber,10)"
            @current-change="handlePageChange"
            :pager-count="5"
            layout="prev, pager, next"
        />
      </div>
    </el-main>

    <!-- 添加医院对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加医院" width="30%">
      <el-form :model="newHospital" label-width="100px">
        <el-form-item label="医院名称">
          <el-input v-model="newHospital.hospitalName"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="newHospital.address"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addHospital">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 更新医院地址对话框 -->
    <el-dialog v-model="updateAddressDialogVisible" title="更新医院地址" width="30%">
      <el-form :model="updateAddressForm" label-width="100px">
        <el-form-item label="医院名称">
          <el-input v-model="updateAddressForm.hospitalName" disabled></el-input>
        </el-form-item>
        <el-form-item label="新地址">
          <el-input v-model="updateAddressForm.address"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateAddressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateHospitalAddress">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 更新医院管理员对话框 -->
    <el-dialog v-model="updateAdminDialogVisible" title="更新医院管理员" width="30%">
      <el-form :model="updateAdminForm" label-width="100px">
        <el-form-item label="医院名称">
          <el-input v-model="updateAdminForm.hospitalName" disabled></el-input>
        </el-form-item>
        <el-form-item label="新管理员ID">
          <el-input v-model="updateAdminForm.adminId"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateAdminDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateHospitalAdmin">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import axiosInstance from '../../axios/index';

// 状态变量
const hospitals = ref([])
const loading = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const totalHospitals = ref(0)
const hospitalNumber = ref(0)
const addDialogVisible = ref(false)
const updateAddressDialogVisible = ref(false)
const updateAdminDialogVisible = ref(false)
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

// 计算属性：获取当前页的医院数据
const currentPageHospitals = computed(() => {
  if (searchTerm.value === '') {
    const start = (currentPage.value - 1) * pageSize.value % pageSize.value
    const end = start + pageSize.value
    if (end > hospitals.value.length) {
      return hospitals.value.slice(start)
    }
    return hospitals.value.slice(start, end)
  } else {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    if (end > hospitals.value.length) {
      return hospitals.value.slice(start)
    }
    return hospitals.value.slice(start, end)
  }
})


// 在组件挂载时获取医院数据
onMounted(async () => {
  await fetchHospitalCount()
  await fetchHospitals()
})

// 搜索功能
const onSearch = () => {
  currentPage.value = 1
  //fetchHospitals()
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

// 删除医院
const deleteHospital = async (hospitalName) => {
  try {
    await axiosInstance.post('/api/hospital/deleteHospital', {hospitalName})
    ElMessage.success('医院删除成功')
    await fetchHospitalCount()
    await fetchHospitals()
  } catch (error) {
    console.error('删除医院失败:', error)
    ElMessage.error('删除医院失败，请稍后重试')
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
    console.error('更新医院地址失败:', error)
    ElMessage.error('更新医院地址失败，请稍后重试')
  }
}

// 显示更新管理员对话框
const showUpdateAdminDialog = (hospital) => {
  updateAdminForm.value = {
    hospitalName: hospital.hospitalName,
    adminId: hospital.adminId
  }
  updateAdminDialogVisible.value = true
}

// 更新医院管理员
const updateHospitalAdmin = async () => {
  try {
    await axiosInstance.post('/api/hospital/updateAdminId', updateAdminForm.value)
    ElMessage.success('医院管理员更新成功')
    updateAdminDialogVisible.value = false
    await fetchHospitals()
  } catch (error) {
    console.error('更新医院管理员失败:', error)
    ElMessage.error('更新医院管理员失败，请稍后重试')
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