<template>
  <div class="dashboard-container">
    <!-- 头部区域 -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">AI检测接口管理</h1>
          <p class="sub-title">查看和管理AI检测接口的使用情况</p>
        </div>
        <div class="search-section">
          <el-input
              v-model="searchTerm"
              placeholder="搜索接口ID或类型"
              clearable
              @clear="clearSearch"
              class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="onSearch" class="search-button">
            搜索
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="dashboard-main">
      <!-- 数据概览卡片 -->
      <div class="stats-grid">
        <el-card class="stats-card total-apis" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stats-info">
              <h3>总接口数</h3>
              <p class="stats-number">{{ allAPIs.length }}</p>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card enabled-apis" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stats-info">
              <h3>启用接口</h3>
              <p class="stats-number">{{ enabledAPIsCount }}</p>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card total-calls" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stats-info">
              <h3>总调用次数</h3>
              <p class="stats-number">{{ totalCalls }}</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 表格区域 -->
      <el-card class="data-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">接口列表</span>
          </div>
        </template>

        <el-table
            :data="filteredAPIs"
            style="width: 100%"
            :header-cell-style="tableHeaderStyle"
            v-loading="loading"
            class="custom-table"
        >
          <el-table-column prop="apiId" label="ID" min-width="120" align="center">
            <template #default="scope">
              <span class="id-cell">{{ scope.row.apiId }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="apiType" label="接口类型" min-width="180">
            <template #default="scope">
              <el-tag
                  :type="getApiTypeStyle(scope.row.apiType)"
                  effect="light"
                  class="type-tag"
              >
                {{ scope.row.apiType }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="number" label="调用次数" min-width="120" align="center">
            <template #default="scope">
              <span class="calls-number">{{ scope.row.number }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="state" label="状态" min-width="120" align="center">
            <template #default="scope">
              <el-tag
                  :type="scope.row.state === '启用' ? 'success' : 'danger'"
                  class="status-tag"
              >
                {{ scope.row.state }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">接口调用分布</span>
            </div>
          </template>
          <div ref="pieChart" class="chart-container"></div>
        </el-card>

        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">接口调用趋势</span>
            </div>
          </template>
          <div ref="barChart" class="chart-container"></div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, Connection, Check, DataAnalysis } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axiosInstance from "../../axios/index"
import { ElMessage } from 'element-plus'

// 数据相关
const allAPIs = ref([])
const filteredAPIs = ref([])
const searchTerm = ref('')
const loading = ref(false)

// echarts实例
const pieChart = ref(null)
const barChart = ref(null)
let pieChartInstance = null
let barChartInstance = null

// 获取启用的接口数量
const enabledAPIsCount = computed(() => {
  return allAPIs.value.filter(api => api.state === '启用').length
})

// 获取总调用次数
const totalCalls = computed(() => {
  return allAPIs.value.reduce((sum, api) => sum + api.number, 0)
})

// 获取API数据
const fetchAPIs = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get('/api/detectionAPI/getAll')
    allAPIs.value = response.data
    filteredAPIs.value = [...allAPIs.value]
    initCharts()
  } catch (error) {
    console.error('获取AI检测接口数据失败:', error)
    ElMessage.error('获取AI检测接口数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索功能
const onSearch = () => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term === '') {
    filteredAPIs.value = [...allAPIs.value]
  } else {
    filteredAPIs.value = allAPIs.value.filter(api => {
      return api.apiId.toLowerCase().includes(term) ||
          api.apiType.toLowerCase().includes(term)
    })
  }
}

// 清空搜索
const clearSearch = () => {
  searchTerm.value = ''
  filteredAPIs.value = [...allAPIs.value]
}

// 表格样式
const tableHeaderStyle = {
  background: '#f8fafc',
  color: '#1e293b',
  fontWeight: '600',
  fontSize: '14px'
}

// 获取API类型对应的样式
const getApiTypeStyle = (type) => {
  const styles = {
    '脊柱异常': 'warning',
    '高低肩': 'success',
    '骨盆侧倾': 'primary',
    '足部问题': 'danger'
  }
  return styles[type] || 'info'
}

// 初始化图表
const initCharts = () => {
  // 初始化饼图
  if (pieChart.value) {
    pieChartInstance = echarts.init(pieChart.value)
    const pieOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [{
        name: '接口调用分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: allAPIs.value.map(api => ({
          name: api.apiType,
          value: api.number
        }))
      }]
    }
    pieChartInstance.setOption(pieOption)
  }

  // 初始化柱状图
  if (barChart.value) {
    barChartInstance = echarts.init(barChart.value)
    const barOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: allAPIs.value.map(api => api.apiType),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: allAPIs.value.map(api => api.number),
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    }
    barChartInstance.setOption(barOption)
  }
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  pieChartInstance?.resize()
  barChartInstance?.resize()
}

onMounted(() => {
  fetchAPIs()
  window.addEventListener('resize', handleResize)
})

</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f1f5f9, #e2e8f0);
  padding: 1rem;
}

.dashboard-header {
  background: white;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.sub-title {
  color: #64748b;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.search-section {
  display: flex;
  gap: 0.5rem;
  min-width: 300px;
}

.search-input {
  flex: 1;
}

.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
}

.total-apis .stats-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.enabled-apis .stats-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.total-calls .stats-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stats-info h3 {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.stats-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.data-card {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  min-height: 400px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.custom-table {
  --el-table-border-color: #e5e7eb;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f1f5f9;
}

.id-cell {
  font-family: monospace;
  color: #475569;
}

.type-tag {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
}

.calls-number {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border-radius: 9999px;
  font-weight: 500;
  color: #475569;
}

.status-tag {
  min-width: 64px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    flex-direction: column;
    min-width: 100%;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}

/* 动画效果 */
.stats-card,
.data-card,
.chart-card {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Element Plus 样式优化 */
:deep(.el-card) {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.el-button--primary) {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  border: none;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1),
  0 2px 4px -1px rgba(59, 130, 246, 0.06);
}

:deep(.el-table th) {
  font-weight: 600;
  background: #f8fafc !important;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f1f5f9;
}
</style>