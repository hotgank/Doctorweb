<template>
  <el-container class="min-h-screen bg-gray-100">
    <el-header class="bg-white shadow-md">
      <div class="header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 class="text-2xl font-bold text-gray-900">检验医生资格</h3>
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
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="unit" label="单位" min-width="200"></el-table-column>
        <el-table-column prop="department" label="科室" width="120"></el-table-column>
        <el-table-column prop="position" label="职位" width="120"></el-table-column>
        <el-table-column prop="certNumber" label="医师资格证" width="150"></el-table-column>
        <el-table-column label="详情" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openDetails(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据提示 -->
      <el-empty v-if="filteredDoctors.length === 0" description="没有待审核的医生"></el-empty>
    </el-main>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="医生详情"
      width="50%"
      :before-close="handleClose"
    >
      <div v-if="selectedDoctor">
        <el-form :model="selectedDoctor" label-width="120px">
          <el-form-item label="ID">
            <span>{{ selectedDoctor.id }}</span>
          </el-form-item>
          <el-form-item label="姓名">
            <span>{{ selectedDoctor.name }}</span>
          </el-form-item>
          <el-form-item label="邮箱">
            <span>{{ selectedDoctor.email }}</span>
          </el-form-item>
          <el-form-item label="资格状态">
            <span>{{ selectedDoctor.qualified ? '已认证' : '未认证' }}</span>
          </el-form-item>
          <el-form-item label="单位">
            <el-select v-model="selectedDoctor.unit" placeholder="请选择单位">
              <el-option
                v-for="item in unitOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="科室">
            <el-input v-model="selectedDoctor.department"></el-input>
          </el-form-item>
          <el-form-item label="职位">
            <el-input v-model="selectedDoctor.position"></el-input>
          </el-form-item>
          <el-form-item label="医师资格证号">
            <span>{{ selectedDoctor.certNumber }}</span>
          </el-form-item>
        </el-form>
        <div class="cert-image mt-4">
          <h4 class="text-lg font-medium mb-2">医师资格证图片：</h4>
          <el-image
            :src="selectedDoctor.certImage"
            :preview-src-list="[selectedDoctor.certImage]"
            fit="cover"
            class="w-48 h-48 object-cover rounded"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="success" @click="approveDoctor">认证成功</el-button>
          <el-button type="danger" @click="rejectDoctor">打回认证</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/删除单位对话框 -->
    <el-dialog v-model="unitDialogVisible" title="管理单位" width="30%">
      <el-form>
        <el-form-item label="添加新单位">
          <el-input v-model="newUnit" placeholder="请输入新单位名称"></el-input>
          <el-button type="primary" @click="addUnit" class="mt-2">添加单位</el-button>
        </el-form-item>
        <el-form-item label="删除单位">
          <el-select v-model="unitToDelete" placeholder="请选择要删除的单位">
            <el-option
              v-for="item in unitOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <el-button type="danger" @click="deleteUnit" class="mt-2">删除单位</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 初始化医生数据
const pendingDoctors = ref([
  { 
    id: 1, 
    name: '医生 A', 
    email: 'doctorA@example.com', 
    qualified: false,
    unit: '宛平南路600号',
    department: '内科', 
    position: '主治医师', 
    certNumber: 'D123456789',
    certImage: 'https://via.placeholder.com/150', // 示例图片 URL
  },
  { 
    id: 2, 
    name: '医生 B', 
    email: 'doctorB@example.com', 
    qualified: false,
    unit: '宛平南路600号',
    department: '外科', 
    position: '副主任医师', 
    certNumber: 'D987654321',
    certImage: 'https://via.placeholder.com/150', // 示例图片 URL
  },
  { 
    id: 3, 
    name: '医生 C', 
    email: 'doctorC@example.com', 
    qualified: false,
    unit: '宛平南路600号',
    department: '儿科', 
    position: '住院医师', 
    certNumber: 'D112233445',
    certImage: 'https://via.placeholder.com/150', // 示例图片 URL
  },
])

// 单位选项
const unitOptions = ref(['宛平南路600号', '龙华西路190号', '乌鲁木齐中路12号'])

// 搜索关键词
const searchTerm = ref('')

// 计算属性：根据搜索关键词过滤医生列表
const filteredDoctors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term === '') {
    return pendingDoctors.value
  } else {
    return pendingDoctors.value.filter(doctor => {
      const idMatch = doctor.id.toString().includes(term)
      const nameMatch = doctor.name.toLowerCase().includes(term)
      return idMatch || nameMatch
    })
  }
})

// 搜索功能：触发计算属性已实现，无需额外操作
const onSearch = () => {
  // 触发计算属性更新
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
}

// 对话框状态和选中的医生
const dialogVisible = ref(false)
const selectedDoctor = ref(null)

// 打开详情对话框
const openDetails = (doctor) => {
  selectedDoctor.value = { ...doctor }
  dialogVisible.value = true
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  selectedDoctor.value = null
}

// 批准医生资格
const approveDoctor = () => {
  // 更新医生信息
  const index = pendingDoctors.value.findIndex(doctor => doctor.id === selectedDoctor.value.id)
  if (index !== -1) {
    pendingDoctors.value[index] = { ...selectedDoctor.value, qualified: true }
  }
  ElMessage({
    message: `已认证医生 ${selectedDoctor.value.name} 的资格`,
    type: 'success',
  })
  handleClose()
}

// 拒绝医生资格
const rejectDoctor = () => {
  ElMessage({
    message: `已打回医生 ${selectedDoctor.value.name} 的资格认证申请`,
    type: 'warning',
  })
  handleClose()
}

// 表格行的样式
const tableRowClassName = ({ row, rowIndex }) => {
  if (rowIndex % 2 === 0) {
    return 'bg-gray-50'
  }
  return ''
}

// 单位管理相关
const unitDialogVisible = ref(false)
const newUnit = ref('')
const unitToDelete = ref('')

const openUnitManagement = () => {
  unitDialogVisible.value = true
}

const addUnit = () => {
  if (newUnit.value.trim() && !unitOptions.value.includes(newUnit.value.trim())) {
    unitOptions.value.push(newUnit.value.trim())
    ElMessage({
      message: '新单位已添加',
      type: 'success',
    })
    newUnit.value = ''
  } else {
    ElMessage({
      message: '请输入有效的新单位名称',
      type: 'warning',
    })
  }
}

const deleteUnit = () => {
  if (unitToDelete.value) {
    unitOptions.value = unitOptions.value.filter(unit => unit !== unitToDelete.value)
    ElMessage({
      message: '单位已删除',
      type: 'success',
    })
    unitToDelete.value = ''
  } else {
    ElMessage({
      message: '请选择要删除的单位',
      type: 'warning',
    })
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer .el-button {
  margin-left: 10px;
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