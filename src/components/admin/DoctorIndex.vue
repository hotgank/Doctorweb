<template>
  <div class="doctor-management">
    <!-- 页面头部区域 -->
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><Service /></el-icon>
          <h1 class="page-title">医生列表</h1>
          <el-tag type="info" class="doctor-count">
            共 {{ DoctorNumber }} 位医生
          </el-tag>
        </div>

        <div class="header-actions">
          <div class="search-section">
            <el-input
                v-model="searchTerm"
                placeholder="搜索医生UID或姓名"
                clearable
                @clear="clearSearch"
                class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-button
                @click="onSearch"
                type="primary"
                class="search-button"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>

          <el-button
              @click="showImportDialog"
              type="success"
              class="import-button"
          >
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="table-container">
        <!-- 数据表格 -->
        <el-table
            :data="paginatedDoctors"
            style="width: 100%"
            :header-cell-style="tableHeaderStyle"
            :row-class-name="tableRowClassName"
            v-loading="loading"
            border
        >
          <!-- ID列 -->
          <el-table-column
              prop="index"
              label="ID"
              width="80"
              align="center"
          >
            <template #default="scope">
              <span class="id-badge">{{ scope.row.index }}</span>
            </template>
          </el-table-column>

          <!-- 姓名列 -->
          <el-table-column
              prop="name"
              label="姓名"
              min-width="120"
          >
            <template #default="scope">
              <div class="doctor-info">
                <span class="doctor-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 单位列 -->
          <el-table-column
              prop="workplace"
              label="单位"
              min-width="200"
          >
            <template #default="scope">
              <div class="workplace-info">
                <el-icon><OfficeBuilding /></el-icon>
                <span>{{ scope.row.workplace }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 职位列 -->
          <el-table-column
              prop="position"
              label="职位"
              min-width="150"
          >
            <template #default="scope">
              <div class="position-info">
                <el-icon><UserFilled /></el-icon>
                <span>{{ scope.row.position }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 认证状态列 -->
          <el-table-column
              prop="qualification"
              label="认证状态"
              width="120"
              align="center"
          >
            <template #default="scope">
              <el-tag
                  :type="scope.row.qualification === '已认证' ? 'success' : 'warning'"
                  class="status-tag"
              >
                <el-icon>
                  <component :is="scope.row.qualification === '已认证' ? CircleCheck : Warning" />
                </el-icon>
                {{ scope.row.qualification === '已认证' ? '已认证' : '未认证' }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 账号状态列 -->
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
              width="130"
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
                      @click="viewDoctorDetails(scope.row)"
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
                      @click="toggleDoctorStatus(scope.row)"
                  >
                    <el-icon>
                      <component :is="scope.row.status === 'active' ? VideoPause : VideoPlay" />
                    </el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <!-- 空状态 -->
          <template #empty>
            <el-empty
                description="暂无医生数据"
                :image-size="200"
            >
              <template #description>
                <p class="empty-text">暂无医生数据</p>
                <p class="empty-hint">您可以通过搜索或导入添加医生信息</p>
              </template>
              <el-button
                  type="primary"
                  @click="showImportDialog"
              >
                立即导入
              </el-button>
            </el-empty>
          </template>
        </el-table>

        <!-- 分页器 -->
        <div class="pagination-wrapper">
          <el-pagination
              v-model:current-page="frontendCurrentPage"
              :page-size="frontendPageSize"
              :total="parseInt(DoctorNumber,10)"
              @current-change="handleFrontendPageChange"
              :pager-count="5"
              layout="total, prev, pager, next, jumper"
              background
          />
        </div>
      </div>
    </main>

    <!-- 医生详情对话框 -->
    <el-dialog
        v-model="detailsDialogVisible"
        title="医生详细信息"
        width="600px"
        class="doctor-details-dialog"
        destroy-on-close
    >
      <div class="doctor-details">
        <div class="doctor-header">
          <el-avatar
              :size="64"
              class="doctor-large-avatar"
              :src="selectedDoctor.avatarUrl"
          >
          </el-avatar>
          <h2 class="doctor-title">{{ selectedDoctor.name }}</h2>
          <p class="doctor-subtitle">{{ selectedDoctor.position }} @ {{ selectedDoctor.workplace }}</p>
        </div>

        <el-descriptions
            :column="1"
            border
            class="details-content"
        >
          <el-descriptions-item label="邮箱">
            <div class="details-item">
              <el-icon><Message /></el-icon>
              {{ selectedDoctor.email }}
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="电话号码">
            <div class="details-item">
              <el-icon><Phone /></el-icon>
              {{ selectedDoctor.phone }}
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="UID">
            <div class="details-item">
              <el-icon><Key /></el-icon>
              {{ selectedDoctor.doctorId }}
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="认证状态">
            <el-tag
                :type="selectedDoctor.qualification === '已认证' ? 'success' : 'warning'"
                class="details-tag"
            >
              {{ selectedDoctor.qualification === '已认证' ? '已认证' : '未认证' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="账号状态">
            <el-tag
                :type="selectedDoctor.status === 'active' ? 'success' : 'danger'"
                class="details-tag"
            >
              {{ selectedDoctor.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 导入医生对话框 -->
    <el-dialog
        v-model="importDialogVisible"
        title="批量导入医生"
        width="500px"
        class="import-dialog"
    >
      <div class="import-content">
        <el-upload
            class="upload-area"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".xlsx,.csv"
        >
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text">
            <h3>将文件拖拽到此处，或<em>点击上传</em></h3>
            <p class="upload-hint">支持 .xlsx, .csv 格式文件</p>
          </div>
        </el-upload>

        <div class="import-info">
          <div class="info-header">
            <el-icon><InfoFilled /></el-icon>
            <span>导入说明</span>
          </div>
          <ul class="info-list">
            <li>文件大小不超过 500KB</li>
            <li>请严格按照模板格式填写数据</li>
            <li>支持批量导入多条记录</li>
          </ul>
        </div>

        <div class="template-download">
          <el-button
              type="success"
              @click="downloadTemplate"
              class="download-button"
          >
            <el-icon><Download /></el-icon>
            下载导入模板
          </el-button>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              @click="importDoctorData"
          >
            确认导入
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import {Download, Search, Upload, Service, OfficeBuilding, UserFilled, View, Message, Phone, Key, InfoFilled, CircleCheck, CircleClose, Warning, VideoPause, VideoPlay } from '@element-plus/icons-vue'
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
const tableRowClassName = ({rowIndex}) => {
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

// 下载模板文件
const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/importDoctors.xlsx' // 假设模板文件放在 public 目录下
  link.download = '导入医生模板.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

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
/* 页面容器 */
.doctor-management {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 页面头部 */
.page-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
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

.doctor-count {
  font-size: 14px;
  padding: 4px 8px;
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
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doctor-avatar {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
}

.doctor-name {
  font-weight: 500;
}

.workplace-info,
.position-info {
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
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

/* 医生详情对话框 */
.doctor-details {
  padding: 20px;
}

.doctor-header {
  text-align: center;
  margin-bottom: 24px;
}

.doctor-large-avatar {
  margin-bottom: 16px;
}

.doctor-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
}

.doctor-subtitle {
  color: #909399;
  margin: 0;
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

/* 导入对话框 */
.import-content {
  padding: 20px;
}

.upload-area {
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: var(--el-color-primary);
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text h3 {
  font-size: 16px;
  color: #606266;
  margin: 0 0 8px;
}

.upload-hint {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.import-info {
  margin-top: 24px;
  padding: 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.info-list {
  margin: 0;
  padding-left: 24px;
  color: #606266;
}

.info-list li {
  margin-bottom: 8px;
}

.template-download {
  margin-top: 24px;
  text-align: center;
}

.download-button {
  width: 100%;
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
    flex-direction: column;
    width: 100%;
  }

  .search-section {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .import-button {
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
    position: static;
  }

  .header-content {
    padding: 12px;
  }

  .main-content {
    padding: 12px;
  }

  .doctor-details {
    padding: 12px;
  }
}
</style>