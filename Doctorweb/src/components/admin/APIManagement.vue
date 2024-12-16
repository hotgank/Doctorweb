<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">AI检测接口管理</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
              v-model="searchTerm"
              placeholder="搜索接口ID或类型"
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
      <!-- AI检测接口表格 -->
      <el-table
          :data="filteredAPIs"
          style="width: 100%"
          :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
          :row-class-name="tableRowClassName"
          v-loading="loading"
      >
        <el-table-column prop="apiId" label="ID" width="200" align="center"></el-table-column>
        <el-table-column prop="apiType" label="接口类型" min-width="200"></el-table-column>
        <el-table-column prop="number" label="调用次数" min-width="120" align="center"></el-table-column>
        <el-table-column prop="state" label="状态" width="200" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.state === '启用' ? 'success' : 'danger'" effect="dark">
              {{ scope.row.state }}
            </el-tag>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="没有检测接口数据"></el-empty>
        </template>
      </el-table>

    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import axiosInstance from "../../axios/index";
import { ElMessage } from 'element-plus'

const allAPIs = ref([])
const filteredAPIs = ref([])
const searchTerm = ref('')
const loading = ref(false)

// 获取AI检测接口数据
const fetchAPIs = async () => {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/api/detectionAPI/getAll');
    allAPIs.value = response.data;
    filteredAPIs.value = [...allAPIs.value];
  } catch (error) {
    console.error('获取AI检测接口数据失败:', error);
    ElMessage.error('获取AI检测接口数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 在组件挂载时获取AI检测接口数据
onMounted(() => {
  fetchAPIs()
})

// 搜索功能：点击按钮后过滤AI检测接口列表
const onSearch = () => {
  const term = searchTerm.value.trim().toLowerCase()

  if (term === '') {
    filteredAPIs.value = [...allAPIs.value]
  } else {
    filteredAPIs.value = allAPIs.value.filter(api => {
      const idMatch = api.apiId.toLowerCase().includes(term)
      const typeMatch = api.apiType.toLowerCase().includes(term)
      return idMatch || typeMatch
    })
  }
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
  filteredAPIs.value = [...allAPIs.value]
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