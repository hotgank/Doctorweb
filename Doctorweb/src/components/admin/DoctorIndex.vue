<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">医生列表</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
              v-model="searchTerm"
              placeholder="搜索医生UID或姓名"
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
          <el-button @click="showImportDialog" type="primary" class="ml-2">
            导入
          </el-button>
        </div>
      </div>
    </el-header>

    <el-main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 医生表格 -->
      <el-table
          :data="paginatedDoctors"
          style="width: 100%"
          :header-cell-style="{ background: '#f3f4f6', color: '#374151' }"
          :row-class-name="tableRowClassName"
          v-loading="loading"
      >
        <el-table-column prop="index" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="workplace" label="单位" width="150"></el-table-column>
        <el-table-column prop="position" label="职位" width="120"></el-table-column>
        <el-table-column prop="qualification" label="已认证" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.qualification != null ? 'success' : 'danger'" effect="dark">
              {{ scope.row.qualification != null ? '是' : '否' }}
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
        <el-table-column label="操作" min-width="200" align="center">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewDoctorDetails(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
                :type="scope.row.status === 'active' ? 'danger' : 'success'"
                size="small"
                @click="toggleDoctorStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="没有医生数据"></el-empty>
        </template>
      </el-table>


      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="frontendCurrentPage"
            :page-size="frontendPageSize"
            :total="parseInt(DoctorNumber,10)"
            @current-change="handleFrontendPageChange"
            :pager-count="5"
            layout="prev, pager, next"
        />
      </div>
    </el-main>

    <!-- 医生详情对话框 -->
    <el-dialog
        v-model="detailsDialogVisible"
        title="医生详情"
        width="50%"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="姓名">{{ selectedDoctor.name }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ selectedDoctor.email }}</el-descriptions-item>
        <el-descriptions-item label="电话号码">{{ selectedDoctor.phone }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ selectedDoctor.workplace }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ selectedDoctor.position }}</el-descriptions-item>
        <el-descriptions-item label="UID">{{ selectedDoctor.doctorId }}</el-descriptions-item>
        <el-descriptions-item label="认证状态">{{ selectedDoctor.qualification != null ? '已认证' : '未认证' }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">{{ selectedDoctor.status === 'active' ? '活跃' : '停用' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 导入用户对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入用户" width="30%">
      <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".xlsx,.csv"
      >
        <el-icon><upload /></el-icon>
        <div class="el-upload__text">将文件拖拽到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">请上传小于 500KB 的 XLSX/CSV 文件</div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importDoctorData">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import {Search} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import axiosInstance from '../../axios/index';

const allDoctors = ref([])
const loading = ref(false)
const uploadedFile = ref(null);
const importDialogVisible = ref(false);

// 新增：数据库中总医生数量
const totalDoctors = ref(0)

// 新增：分页显示的数量
const DoctorNumber = ref(0)

// 修改：后端分页相关变量
const backendCurrentPage = ref(1)
const backendPageSize = ref(50)

// 新增：前端分页相关变量
const frontendCurrentPage = ref(1)
const frontendPageSize = ref(5)

// 新增：获取总医生数量
const fetchTotalDoctors = async () => {
  try {
    const response = await axiosInstance.get('/api/doctor/selectMyDoctorCount');
    totalDoctors.value = response.data.doctorCount || 0; // 确保设置默认值
    DoctorNumber.value = totalDoctors.value;
    console.log('Total doctors:', totalDoctors.value); // 添加日志以便调试
  } catch (error) {
    console.error('获取医生总数失败:', error);
    ElMessage.error('获取医生总数失败，请稍后重试');
    totalDoctors.value = 0; // 发生错误时设置为0
  }
};

// 修改：获取分页医生数据
const fetchDoctors = async () => {
  loading.value = true;
  try {
    const response = await axiosInstance.post('/api/doctor/selectPage', {
      currentPage: backendCurrentPage.value,
        pageSize: backendPageSize.value
    });
    allDoctors.value = response.data.map((doctor, idx) => ({
      ...doctor,
      index: (backendCurrentPage.value - 1) * backendPageSize.value + idx + 1
    }));
    // 更新DoctorNumber, 用于分页
    DoctorNumber.value = totalDoctors.value;
    // 更新显示的医生数据
    filteredDoctors.value = allDoctors.value;
    console.log(allDoctors);
  } catch (error) {
    console.error('获取医生数据失败:', error);
    ElMessage.error('获取医生数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 在组件挂载时获取总医生数量和第一页医生数据
onMounted(async () => {
  await fetchTotalDoctors()
  await fetchDoctors()
})

// 搜索关键词
const searchTerm = ref('')

//根据搜索关键词过滤医生列表
const filteredDoctors = ref([]);

// 搜索医生
const fetchFilteredDoctors = async (queryString) => {
  loading.value = true;
  try {
    const response = await axiosInstance.post('/api/doctor/selectPage', {
      currentPage: 1,
      pageSize: totalDoctors.value,
      queryString: queryString
    });
    filteredDoctors.value = response.data.map((doctor, idx) => ({
      ...doctor,
      index: (backendCurrentPage.value - 1) * backendPageSize.value + idx + 1
    }));
    // 更新DoctorNumber，用于分页
    DoctorNumber.value = filteredDoctors.value.length;
    console.log(filteredDoctors);
  } catch (error) {
    console.error('获取医生数据失败:', error);
    ElMessage.error('获取医生数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 计算属性：获取当前页的医生数据
const paginatedDoctors = computed(() => {
  const start = (frontendCurrentPage.value - 1) * frontendPageSize.value % backendPageSize.value;
  const end = start + frontendPageSize.value;
  if (end > filteredDoctors.value.length){
    return filteredDoctors.value.slice(start);
  }
  return filteredDoctors.value.slice(start, end);
});

// 新增：处理前端页码变化
const handleFrontendPageChange = async (page) => {
  frontendCurrentPage.value = page;
  const requiredBackendPage = Math.ceil((page * frontendPageSize.value) / backendPageSize.value);

  if (requiredBackendPage !== backendCurrentPage.value) {
    backendCurrentPage.value = requiredBackendPage;
    await fetchDoctors();
  }
};

// 搜索功能
const onSearch = () => {
  // 触发更新
  const term = searchTerm.value.trim().toLowerCase();
  fetchFilteredDoctors(term);
  frontendCurrentPage.value = 1; // 重置前端页码到第一页
  backendCurrentPage.value = 1; // 重置后端页码到第一页
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
  frontendCurrentPage.value = 1; // 重置前端页码到第一页
  backendCurrentPage.value = 1; // 重置后端页码到第一页
  DoctorNumber.value = totalDoctors.value;
  fetchDoctors(); // 重新获取第一页数据
}

// 表格行的样式
const tableRowClassName = ({row, rowIndex}) => {
  return rowIndex % 2 === 0 ? 'bg-gray-50' : ''
}

// 医生详情对话框状态和选中的医生
const detailsDialogVisible = ref(false)
const selectedDoctor = ref({})

// 查看医生详情
const viewDoctorDetails = (doctor) => {
  selectedDoctor.value = doctor
  detailsDialogVisible.value = true
}

// 切换医生状态
const toggleDoctorStatus = async (doctor) => {
  const newStatus = doctor.status === 'active' ? 'disabled' : 'active'
  const url = doctor.status === 'active' ? '/api/doctor/ban' : '/api/doctor/active';
  try {
    // 向后端发送 POST 请求
    const response = await axiosInstance.post(url, {
      doctorId: doctor.doctorId
    });

    if (response.status === 200) {
      // 更新前端状态
      doctor.status = newStatus;
      ElMessage.success(`医生 ${doctor.name} 已${newStatus === 'active' ? '启用' : '停用'}`);
    } else {
      ElMessage.error('更新医生状态失败，请稍后重试');
    }
  } catch (error) {
    console.error('更新医生状态请求失败:', error);
    ElMessage.error('更新医生状态失败，请稍后重试');
  }
}

const handleFileChange = (file) => {
  uploadedFile.value = file;
};

const showImportDialog = () => {
  importDialogVisible.value = true;
};

const importDoctorData = async () => {
  if (!uploadedFile.value) {
    ElMessage.error('请先选择要上传的文件');
    return;
  }

  const file = uploadedFile.value.raw;
  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension !== 'xlsx' && fileExtension !== 'csv') {
    ElMessage.error('文件类型不符合要求，请上传 .xlsx 或 .csv 文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('urlJson', JSON.stringify({url: 'doctorList/'}));

  try {
    await axiosInstance.post('/api/import/doctor', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    ElMessage.success('医生数据导入成功');
    importDialogVisible.value = false;
    uploadedFile.value = null;
    // 刷新用户列表
    await fetchTotalDoctors();
    await fetchDoctors();
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败，请稍后重试');
  }
};

// 新增：监听搜索词变化，重置分页
watch(searchTerm, () => {
  frontendCurrentPage.value = 1;
});
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

