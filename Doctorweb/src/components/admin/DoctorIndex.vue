<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">医生列表</h3>
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
              v-model="searchTerm"
              placeholder="搜索医生ID或姓名"
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
          :data="filteredDoctors"
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
      </el-table>

      <!-- 空数据提示 -->
      <el-empty v-if="filteredDoctors.length === 0" description="没有医生数据"></el-empty>
    </el-main>

    <!-- 医生详情对话框 -->
    <el-dialog
        v-model="detailsDialogVisible"
        title="医生详情"
        width="50%"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ selectedDoctor.doctorId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ selectedDoctor.name }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ selectedDoctor.email }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ selectedDoctor.workplace }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ selectedDoctor.position }}</el-descriptions-item>
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
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index';

const allDoctors = ref([])
const loading = ref(false)
const uploadedFile = ref(null);
const importDialogVisible = ref(false);

// 获取所有医生数据
const fetchDoctors = async () => {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/api/doctor/selectAll');
    allDoctors.value = response.data.map((doctor, idx) => ({
      ...doctor,
      index: idx + 1 // 添加自定义行号
    }));
  } catch (error) {
    console.error('获取医生数据失败:', error);
    ElMessage.error('获取医生数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};


// 在组件挂载时获取医生数据
onMounted(() => {
  fetchDoctors()
})

// 搜索关键词
const searchTerm = ref('')

// 计算属性：根据搜索关键词过滤医生列表
const filteredDoctors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (term === '') {
    return allDoctors.value;
  } else {
    return allDoctors.value.filter(doctor =>
        doctor.index.toString() === term || // 精确匹配自定义ID
        doctor.name.toLowerCase().includes(term) // 模糊匹配姓名
    );
  }
});


// 搜索功能：由于使用了计算属性，这里不需要额外操作
const onSearch = () => {
  // 计算属性会自动更新
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
}

// 表格行的样式
const tableRowClassName = ({ row, rowIndex }) => {
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
  formData.append('urlJson', JSON.stringify({ url: 'doctorList/' }));

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
    await fetchDoctors();
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败，请稍后重试');
  }
};
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
</style>