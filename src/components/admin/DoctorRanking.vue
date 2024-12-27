<template>
  <div class="ranking-container">
    <el-card class="ranking-card">
      <!-- 页面头部 -->
      <div class="ranking-header">
        <div class="header-content">
          <h1 class="title">
            <el-icon class="trophy-icon"><Trophy /></el-icon>
            医生排行榜
          </h1>
          <div class="stats">
            <el-tag type="info" effect="plain">共 {{ doctors.length }} 位医生</el-tag>
          </div>
        </div>
      </div>

      <!-- 数据概览卡片 -->
      <div class="overview-cards">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon gold">
                  <el-icon><Medal /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-label">最高评分</div>
                  <div class="stat-value">{{ highestRating }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon blue">
                  <el-icon><DataLine /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-label">平均评分</div>
                  <div class="stat-value">{{ averageRating.toFixed(2) }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon green">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-label">参与医生</div>
                  <div class="stat-value">{{ doctors.length }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 前三名展示区 -->
      <div class="podium-section">
        <div class="podium-container">
          <!-- 第二名 -->
          <div class="podium-item second" v-if="doctors[1]">
            <div class="podium-content">
              <div class="medal silver">
                <el-icon><Medal /></el-icon>
                <span>2</span>
              </div>
              <el-avatar :size="60" class="doctor-avatar">
                {{ doctors[1].name.charAt(0) }}
              </el-avatar>
              <h3 class="doctor-name">{{ doctors[1].name }}</h3>
              <div class="doctor-info">
                <div class="doctor-hospital">{{ doctors[1].workplace }}</div>
                <div class="doctor-position">{{ doctors[1].position ? doctors[1].position : '暂无职位' }}</div>
              </div>
              <div class="score">
                <span class="rating-number">{{ doctors[1].rating >= 0 ? doctors[1].rating.toFixed(1) : '暂无评分' }}</span>
                <el-rate
                    v-model="doctors[1].rating"
                    disabled
                    text-color="#ff9900"
                />
              </div>
            </div>
          </div>

          <!-- 第一名 -->
          <div class="podium-item first" v-if="doctors[0]">
            <div class="podium-content">
              <div class="medal gold">
                <el-icon><Trophy /></el-icon>
                <span>1</span>
              </div>
              <el-avatar :size="80" class="doctor-avatar" :src="doctors[0].avatarUrl"></el-avatar>
              <h3 class="doctor-name">{{ doctors[0].name }}</h3>
              <div class="doctor-info">
                <div class="doctor-hospital">{{ doctors[0].workplace }}</div>
                <div class="doctor-position">{{ doctors[0].position ? doctors[0].position : '暂无职位' }}</div>
              </div>
              <div class="score">
                <span class="rating-number">{{ doctors[0].rating >= 0 ? doctors[0].rating.toFixed(1) : '暂无评分' }}</span>
                <el-rate
                    v-model="doctors[0].rating"
                    disabled
                    text-color="#ff9900"
                />
              </div>
            </div>
          </div>

          <!-- 第三名 -->
          <div class="podium-item third" v-if="doctors[2]">
            <div class="podium-content">
              <div class="medal bronze">
                <el-icon><Medal /></el-icon>
                <span>3</span>
              </div>
              <el-avatar :size="60" class="doctor-avatar">
                {{ doctors[2].name.charAt(0) }}
              </el-avatar>
              <h3 class="doctor-name">{{ doctors[2].name }}</h3>
              <div class="doctor-info">
                <div class="doctor-hospital">{{ doctors[2].workplace }}</div>
                <div class="doctor-position">{{ doctors[2].position ? doctors[2].position : '暂无职位' }}</div>
              </div>
              <div class="score">
                <span class="rating-number">{{ doctors[2].rating >= 0 ? doctors[2].rating.toFixed(1) : '暂无评分' }}</span>
                <el-rate
                    v-model="doctors[2].rating"
                    disabled
                    text-color="#ff9900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他排名列表 -->
      <div class="ranking-list">
        <el-card shadow="hover" class="list-card">
          <template #header>
            <div class="card-header">
              <h3 class="section-title">其他排名</h3>
              <el-tag type="info" effect="plain">
                第 4-{{ doctors.length }} 名
              </el-tag>
            </div>
          </template>

          <el-table
              :data="doctors.slice(3)"
              style="width: 100%"
              :header-cell-style="tableHeaderStyle"
              :row-class-name="tableRowClassName"
              v-loading="loading"
          >
            <el-table-column label="排名" width="100" align="center">
              <template #default="scope">
                <div class="rank-number">
                  <span class="rank-badge">{{ scope.$index + 4 }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="医生信息" min-width="300">
              <template #default="scope">
                <div class="doctor-cell">
                  <el-avatar :size="40" class="doctor-avatar">
                    {{ scope.row.name.charAt(0) }}
                  </el-avatar>
                  <div class="doctor-details">
                    <div class="doctor-name">{{ scope.row.name }}</div>
                    <div class="doctor-meta">
                      <el-tag size="small" effect="plain">{{ scope.row.position ? scope.row.position : '暂无职位' }}</el-tag>
                      <span class="hospital-name">{{ scope.row.workplace }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="评分" width="250" align="center">
              <template #default="scope">
                <div class="rating-cell">
                  <span class="rating-number">{{ scope.row.rating >= 0 ? scope.row.rating.toFixed(1) : '暂无评分' }}</span>
                  <el-rate
                      v-model="scope.row.rating"
                      disabled
                      text-color="#ff9900"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {DataLine, Medal, Trophy, User} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import axiosInstance from '../../axios/index'

const doctors = ref([])
const loading = ref(false)

const highestRating = computed(() => {
  return getHighestRating(doctors.value)
})

const averageRating = computed(() => {
  return getAverageRating(doctors.value)
})

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

const getHighestRating = (doctors) => {
  if (!Array.isArray(doctors) || doctors.length === 0) {
    return "暂无评分"; // 如果医生数组为空或不是数组，返回"暂无评分"
  }

  // 提取每个医生的评分，并过滤掉评分小于0的记录
  const validRatings = doctors
      .map(doctor => doctor.rating) // 提取每个医生的评分
      .filter(rating => rating >= 0); // 过滤掉评分小于0的记录

  if (validRatings.length < 0) {
    return "暂无评分"; // 如果没有有效的评分，返回"暂无评分"
  }

  // 找到最高的评分
  const highestRating = Math.max(...validRatings);

  // 格式化评分到一位小数
  return highestRating.toFixed(1);
};

const getAverageRating = (doctors) => {
  if (!Array.isArray(doctors) || doctors.length === 0) {
    return 0; // 如果医生数组为空或不是数组，返回0
  }

  // 过滤掉评分小于0的医生
  const validRatings = doctors
      .map(doctor => doctor.rating) // 提取每个医生的评分
      .filter(rating => rating >= 0); // 过滤掉评分小于0的记录

  if (validRatings.length < 0) {
    return "暂无评分"; // 如果没有有效的评分，返回"暂无评分"
  }

  // 计算平均评分
  const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
  return totalRating / validRatings.length;
};

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
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.ranking-card {
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 头部样式 */
.ranking-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.trophy-icon {
  font-size: 28px;
  color: #f59e0b;
}

/* 数据概览卡片 */
.overview-cards {
  margin-bottom: 32px;
}

.stat-card {
  height: 100%;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.gold { background-color: #f59e0b; }
.blue { background-color: #3b82f6; }
.green { background-color: #10b981; }

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

/* 领奖台样式 */
.podium-section {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-radius: 16px;
}

.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 24px;
  padding: 20px 0;
}

.podium-item {
  flex: 1;
  max-width: 280px;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s ease;
}

.podium-item:hover {
  transform: translateY(-8px);
}

.first {
  background: linear-gradient(135deg, #fef3c7, #fcd34d);
  margin-bottom: -20px;
}

.second {
  background: linear-gradient(135deg, #f1f5f9, #cbd5e1);
}

.third {
  background: linear-gradient(135deg, #fff7ed, #fdba74);
}

.medal {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.gold { background-color: #f59e0b; }
.silver { background-color: #64748b; }
.bronze { background-color: #d97706; }

.doctor-avatar {
  margin-bottom: 12px;
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.doctor-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.doctor-info {
  margin-bottom: 16px;
}

.doctor-hospital {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
}

.doctor-position {
  font-size: 12px;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 4px;
}

.score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rating-number {
  font-size: 24px;
  font-weight: 600;
  color: #f59e0b;
}

.rating-number:empty::before{
  font-size: 16px;
  color: #94a3b8;
  font-weight: normal;
  font-style: italic;
}

/* 排名列表样式 */
.list-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #f3f4f6;
  border-radius: 50%;
  font-weight: 600;
  color: #4b5563;
}

.doctor-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doctor-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doctor-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hospital-name {
  font-size: 13px;
  color: #6b7280;
}

.rating-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .ranking-container {
    padding: 0 16px;
  }

  .podium-container {
    gap: 16px;
  }

  .podium-item {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .podium-container {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .podium-item {
    width: 100%;
    max-width: 320px;
    margin-bottom: 0 !important;
  }

  .first {
    order: -1;
  }
}

@media (max-width: 640px) {
  .overview-cards :deep(.el-row) {
    margin: 0 !important;
  }

  .overview-cards :deep(.el-col) {
    padding: 0 0 16px 0 !important;
  }

  .doctor-cell {
    flex-direction: column;
    text-align: center;
  }

  .doctor-details {
    align-items: center;
  }

  .doctor-meta {
    flex-direction: column;
    gap: 4px;
  }
}

/* 修复半星显示问题 */
:deep(.el-rate__item) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-rate__icon) {
  margin-right: 4px;
}

:deep(.el-rate__decimal) {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  overflow: hidden;
}

/* 确保评分组件容器有足够空间 */
.score .el-rate {
  min-height: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}
</style>