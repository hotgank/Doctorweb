<template>
  <div class="article-system">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <el-icon class="mr-2"><Document /></el-icon>
            医学科普文章管理
          </h1>
          <p class="subtitle">发布和管理您的医学科普文章，传播专业知识</p>
        </div>
        <div class="header-actions">
          <el-button type="info" plain class="action-btn" @click="restoreDraft">
            <el-icon><Timer /></el-icon>
            恢复草稿
          </el-button>
          <el-button type="info" plain class="action-btn" @click="showPreview = true">
            <el-icon><View /></el-icon>
            预览
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <el-tabs v-model="activeTab" class="custom-tabs">
      <el-tab-pane name="write">
        <template #label>
          <div class="tab-label">
            <el-icon><EditPen /></el-icon>
            <span>写作</span>
          </div>
        </template>

        <el-card class="article-card">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon><Document /></el-icon>
                发布新文章
              </h3>
              <p class="card-desc">创作新的医学科普文章，分享您的专业知识</p>
            </div>
          </template>

          <el-form :model="article" label-position="top" :rules="rules" ref="articleForm">
            <el-form-item label="文章标题" prop="title">
              <el-input
                  v-model="article.title"
                  placeholder="请输入一个吸引人的标题..."
                  :prefix-icon="Edit"
              />
            </el-form-item>

            <el-form-item label="文章类型" prop="type">
              <el-select
                  v-model="article.type"
                  placeholder="选择文章类型"
                  class="w-full"
              >
                <el-option
                    v-for="type in articleTypes"
                    :key="type"
                    :label="type"
                    :value="type"
                >
                  <div class="type-option">
                    <el-icon><Collection /></el-icon>
                    <span>{{ type }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="文章内容" prop="content">
              <el-input
                  v-model="article.content"
                  type="textarea"
                  :rows="12"
                  placeholder="请输入文章内容..."
                  resize="vertical"
                  class="content-editor"
              />
            </el-form-item>

            <div class="form-actions">
              <el-button plain @click="saveDraft">
                <el-icon><DocumentAdd /></el-icon>
                保存草稿
              </el-button>
              <el-button type="primary" @click="submitArticle">
                <el-icon><Upload /></el-icon>
                {{ isEditing ? '编辑文章' : '发布文章' }}
              </el-button>
            </div>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane name="published">
        <template #label>
          <div class="tab-label">
            <el-icon><Files /></el-icon>
            <span>已发布</span>
          </div>
        </template>

        <el-card class="article-card">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon><Management /></el-icon>
                已发布文章
              </h3>
              <p class="card-desc">管理您已发布的所有文章</p>
            </div>
          </template>

          <div class="filter-section">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-select
                    v-model="selectedType"
                    placeholder="文章类型"
                    class="w-full"
                >
                  <el-option label="全部类型" value="" />
                  <el-option
                      v-for="type in articleTypes"
                      :key="type"
                      :label="type"
                      :value="type"
                  />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-select
                    v-model="selectedStatus"
                    placeholder="文章状态"
                    class="w-full"
                >
                  <el-option label="全部状态" value="" />
                  <el-option
                      v-for="status in statuses"
                      :key="status"
                      :label="status"
                      :value="status"
                  />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" plain class="w-full">
                  <el-icon><Search /></el-icon>
                  筛选
                </el-button>
              </el-col>
            </el-row>
          </div>

          <el-table
              :data="paginatedArticles"
              style="width: 100%"
              :header-cell-style="{ background: '#f5f7fa' }"
              class="custom-table"
          >
            <el-table-column prop="displayId" label="ID" width="80" align="center">
              <template #default="{ row }">
                <span class="id-badge">#{{ row.displayId }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="250">
              <template #default="{ row }">
                <div class="article-title">
                  <el-icon><Document /></el-icon>
                  <span>{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="publishDate" label="发布日期" width="160">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">
                  <el-icon><Calendar /></el-icon>
                  {{ row.publishDate }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag
                    :type="getStatusType(row.status)"
                    size="small"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="170" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button size="small" type="primary" plain @click="editArticle(row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button size="small" type="info" plain @click="viewArticle(row.articleId)">
                    <el-icon><View /></el-icon>
                    查看详情
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-section">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="totalArticles"
                :page-sizes="[10, 15, 20, 30]"
                layout="total, sizes, prev, pager, next, jumper"
                class="custom-pagination"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="文章预览" width="80%">
      <ArticlePreview :article="article" />
    </el-dialog>
  </div>
</template>

<script setup>import {ref, reactive, computed, onMounted, watch} from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import {
  Document, Edit, Timer, View, EditPen, Upload, Files, Management, Search, Calendar,
  Collection, DocumentAdd
} from '@element-plus/icons-vue'
import axios from "axios";
import ArticlePreview from './ArticlePreview.vue'
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()
const activeTab = ref('write')
const articleForm = ref(null)
const isEditing = ref(false)
const showPreview = ref(false)

// 表单数据
const initializeArticleData = () => {
  const doctor = store.state.doctor || {};
  return reactive({
    title: '',
    content: '',
    type: '',
    name: doctor.name || '',
    username: doctor.username || '',
    gender: doctor.gender || '',
    position: doctor.position || '',
    workplace: doctor.workplace || '',
    qualification: doctor.qualification || '',
    experience: doctor.experience || '',
    avatarUrl: doctor.avatarUrl || '',
    publishDate: new Date().toLocaleString(),
    status: '未审核'
  });
}

const article = initializeArticleData();

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择文章类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 50, message: '文章内容不能少于50个字符', trigger: 'blur' }
  ]
}

// 文章类型和状态
const articleTypes = [
  '脊柱侧弯', '高低肩', '骨盆侧倾', '足部健康与矫正',
  '姿势矫正', '运动与康复', '青少年骨骼发育', '其他'
]

const statuses = ['已发布', '未审核', '已打回']

// 筛选和分页
const selectedType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const myArticles = ref([])

// 计算属性
const filteredArticles = computed(() => {
  return myArticles.value
      .filter(article => !selectedType.value || article.type === selectedType.value)
      .filter(article => !selectedStatus.value || article.status === selectedStatus.value)
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredArticles.value.slice(start, end).map((article, index) => ({
    ...article,
    displayId: start + index + 1
  }))
})

const totalArticles = computed(() => filteredArticles.value.length)

const fetchMyArticles = async () => {
  try {
    const response = await axios.get('/api/api/healthArticle/myArticles', {
      headers: {
        Authorization: `Bearer ${store.state.token}`
      }
    })
    myArticles.value = response.data.map(article => ({
      ...article,
      publishDate: article.publishDate ? new Date(article.publishDate).toLocaleString() : 'N/A'
    }))
  } catch (error) {
    console.error('Failed to fetch my articles:', error)
    ElMessage.error('获取文章列表失败')
  }
}

const submitArticle = async () => {
  if (!articleForm.value) return

  await articleForm.value.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        if (isEditing.value) {
          response = await axios.post('/api/api/healthArticle/update', article, {
            headers: { Authorization: `Bearer ${store.state.token}` }
          })
        } else {
          response = await axios.post('/api/api/healthArticle/add', article, {
            headers: { Authorization: `Bearer ${store.state.token}` }
          })
        }

        if (response.status === 200) {
          ElMessage({
            message: isEditing.value ? '文章编辑成功！' : '文章发布成功！',
            type: 'success',
          })
          resetForm()
          await fetchMyArticles()
        }
      } catch (error) {
        ElMessage.error(isEditing.value ? '编辑文章失败，请重试' : '发布文章失败，请重试')
      }
    }
  })
}

const saveDraft = () => {
  localStorage.setItem('draftArticle', JSON.stringify(article));
  ElMessage({
    message: '草稿已保存到本地！',
    type: 'success'
  })
}

const editArticle = (row) => {
  activeTab.value = 'write';
  Object.assign(article, row); // 直接使用 row 参数
  if (articleForm.value) {
    articleForm.value.clearValidate(); // 清除表单验证
  }
  isEditing.value = true; // 设置编辑标志
}

const viewArticle = (id) => {
  router.push(`/article/${id}`)
}

const resetForm = () => {
  if (articleForm.value) {
    articleForm.value.resetFields()
  }
  isEditing.value = false; // 重置编辑标志
}

const getStatusType = (status) => {
  const statusMap = {
    '已发布': 'success',
    '未审核': 'warning',
    '已打回': 'danger'
  };
  return statusMap[status] || 'info';
}

const restoreDraft = () => {
  const savedDraft = localStorage.getItem('draftArticle');
  if (savedDraft) {
    Object.assign(article, JSON.parse(savedDraft));
    isEditing.value = false;
    ElMessage({
      message: '已恢复之前的草稿',
      type: 'info'
    });
  } else {
    ElMessage({
      message: '没有找到草稿',
      type: 'warning'
    });
  }
}

const fetchDoctorInfo = async () => {
  try {
    await store.dispatch('fetchDoctorInfo')
  } catch (error) {
    ElMessage.error('获取医生信息失败')
  }
}

// 生命周期
onMounted(() => {
  fetchMyArticles();
  fetchDoctorInfo();
  const savedDraft = localStorage.getItem('draftArticle');
  if (savedDraft) {
    Object.assign(article, JSON.parse(savedDraft));
    ElMessage({
      message: '已恢复之前的草稿',
      type: 'info'
    });
  }
})

watch(() => store.state.doctor, (newDoctor) => {
  if (newDoctor) {
    Object.assign(article, {
      name: newDoctor.name || '',
      username: newDoctor.username || '',
      gender: newDoctor.gender || '',
      position: newDoctor.position || '',
      workplace: newDoctor.workplace || '',
      qualification: newDoctor.qualification || '',
      experience: newDoctor.experience || '',
      avatarUrl: newDoctor.avatarUrl || ''
    });
  }
}, { immediate: true });

</script>

<style scoped>
.article-system {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  .main-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .subtitle {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.header-actions {
  display: flex;
  gap: 12px;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.article-card {
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-desc {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-editor {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.filter-section {
  margin-bottom: 24px;
}

.custom-table {
  margin: 16px 0;

  :deep(.el-table__header) {
    th {
      background-color: var(--el-bg-color-page);
      font-weight: 600;
    }
  }
}

.article-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.id-badge {
  background: var(--el-color-info-light-9);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-section {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 动画效果 */
.el-tabs__item {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.el-button {
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .article-system {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .el-form-item {
    margin-bottom: 16px;
  }
}
</style>