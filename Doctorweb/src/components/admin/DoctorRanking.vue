<template>
  <div class="ranking-container">
    <el-card class="ranking-card">
      <div class="ranking-header">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <el-icon><Trophy /></el-icon>
          医生排行榜
        </h1>
      </div>

      <!-- 前三名展示区 -->
      <div class="top-three">
        <!-- 第二名 -->
        <div class="top-item second" v-if="doctors[1]">
          <div class="crown silver">2</div>
          <div class="doctor-ID ">{{ doctors[1].doctorId }}</div>
          <h3 class="doctor-name">{{ doctors[1].name }}</h3>
          <div class="doctor-hospital">{{ doctors[1].workplace }}</div>
          <div class="score">
            {{ doctors[1].rating }}
            <el-rate
                v-model="doctors[1].rating"
                disabled
                text-color="#ff9900"
                score-template="{value}"
            />
          </div>
        </div>

        <!-- 第一名 -->
        <div class="top-item first" v-if="doctors[0]">
          <div class="crown gold">1</div>
          <div class="doctor-ID ">{{ doctors[0].doctorId }}</div>
          <h3 class="doctor-name">{{ doctors[0].name }}</h3>
          <div class="doctor-hospital">{{ doctors[0].workplace }}</div>
          <div class="score">
            {{ doctors[0].rating }}
            <el-rate
                v-model="doctors[0].rating"
                disabled
                text-color="#ff9900"
                score-template="{value}"
            />
          </div>
        </div>

        <!-- 第三名 -->
        <div class="top-item third" v-if="doctors[2]">
          <div class="crown bronze">3</div>
          <div class="doctor-ID ">{{ doctors[2].doctorId }}</div>
          <h3 class="doctor-name">{{ doctors[2].name }}</h3>
          <div class="doctor-hospital">{{ doctors[2].workplace }}</div>
          <div class="score">
            {{ doctors[2].rating }}
            <el-rate
                v-model="doctors[2].rating"
                disabled
                text-color="#ff9900"
                score-template="{value}"
            />
          </div>
        </div>
      </div>

      <!-- 其他排名列表 -->
      <div class="ranking-list">
        <el-table
            :data="doctors.slice(3)"
            style="width: 100%"
            :show-header="true"
            :row-class-name="tableRowClassName"
        >
          <el-table-column
              label="排名"
              width="80"
              align="center"
          >
            <template #default="scope">
              <span class="rank-number">{{ scope.$index + 4 }}</span>
            </template>
          </el-table-column>

          <!--医生ID-->
          <el-table-column
              label="医生ID"
              width="350"
              align="center"
          >
            <template #default="scope">
              <div class="doctor-ID-b">{{ scope.row.doctorId }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="医生"
              min-width="200"
          >
            <template #default="scope">
              <div class="doctor-info">
                <div class="doctor-details">
                  <div class="doctor-name">{{ scope.row.name }}</div>
                  <div class="doctor-hospital text-gray-500 text-sm">{{ scope.row.workplace }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              label="评分"
              width="200"
              align="center"
          >
            <template #default="scope">
              <div class="score-display">
                <span class="score-number">{{ scope.row.rating }}</span>
                <el-rate
                    v-model="scope.row.rating"
                    disabled
                    text-color="#ff9900"
                    score-template="{value}"
                />
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="没有医生数据"></el-empty>
          </template>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Trophy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axiosInstance from '../../axios/index'

const doctors = ref([])
const loading = ref(false)

// 获取医生排行榜数据
const fetchDoctors = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.post('/api/doctor/selectPage', {
      currentPage: 1,
      pageSize: 999,
      queryString: ''
    })
    doctors.value = response.data
  } catch (error) {
    console.error('获取医生排行榜数据失败:', error)
    ElMessage.error('获取医生排行榜数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 表格行的样式
const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'bg-gray-50' : ''
}

onMounted(() => {
  fetchDoctors()
})
</script>

<style scoped>
.ranking-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.ranking-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.ranking-header {
  text-align: center;
  margin-bottom: 40px;
}

.top-three {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 40px;
  padding: 20px;
}

.top-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.top-item:hover {
  transform: translateY(-5px);
}

.first {
  background: linear-gradient(135deg, #fef9c3, #fef08a);
}

.second {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
}

.third {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
}

.crown {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.gold {
  background: #fbbf24;
  color: white;
}

.silver {
  background: #94a3b8;
  color: white;
}

.bronze {
  background: #d97706;
  color: white;
}

.doctor-name {
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0 5px;
  color: #1f2937;
}

.doctor-hospital {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 5px;
}
.doctor-ID {
  font-size: 10px;
  color: #6b7280;
  margin-bottom: 5px;
}

.doctor-ID-b {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 5px;
}


.score {
  font-size: 18px;
  font-weight: 600;
  color: #ff9900;
  display: flex;
  align-items: center;
  gap: 5px;
}

.ranking-list {
  margin-top: 20px;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doctor-details {
  display: flex;
  flex-direction: column;
}

.rank-number {
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.score-number {
  font-size: 16px;
  font-weight: 600;
  color: #ff9900;
}

:deep(.el-table) {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #4b5563;
}

:deep(.el-table th.el-table__cell) {
  font-weight: 600;
}

:deep(.el-rate) {
  display: inline-flex;
}

@media (max-width: 768px) {
  .top-three {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .top-item {
    width: 100%;
    max-width: 300px;
  }
}
</style>