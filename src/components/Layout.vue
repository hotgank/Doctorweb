<template>
  <el-container class="layout-container">
    <el-aside
        v-if="isAuthenticated"
        :class="{ 'aside-hidden': !isSidebarVisible }"
        :style="{ width: isSidebarVisible ? '140px' : '0' }"
        class="custom-aside"
    >
      <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          @select="handleSelect"
          router
      >
        <template v-if="userRole === 'doctor'">
          <el-menu-item index="/doctor-dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>主页</span>
          </el-menu-item>
          <el-menu-item index="/patient-index">
            <el-icon><User /></el-icon>
            <span>家长列表</span>
          </el-menu-item>
          <el-menu-item index="/consultation">
            <el-icon><ChatDotRound /></el-icon>
            <span>在线咨询</span>
          </el-menu-item>
          <el-menu-item index="/articles">
            <el-icon><Reading /></el-icon>
            <span>科普文章</span>
          </el-menu-item>
          <el-menu-item index="/publish-article">
            <el-icon><EditPen /></el-icon>
            <span>发布文章</span>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><Memo /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="/doctor-account">
            <el-icon><Setting /></el-icon>
            <span>账户管理</span>
          </el-menu-item>
        </template>
        <template v-if="userRole === 'admin'">
          <el-menu-item index="/admin-dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>主页</span>
          </el-menu-item>
          <el-menu-item v-if="isSuperAdmin" index="/superadmin">
            <el-icon><Avatar /></el-icon>
            <span>超级管理员</span>
          </el-menu-item>
          <el-menu-item index="/verify">
            <el-icon><Loading /></el-icon>
            <span>医生审核</span>
          </el-menu-item>
          <el-menu-item index="/verify-articles">
            <el-icon><Reading /></el-icon>
            <span>文章审核</span>
          </el-menu-item>
          <el-menu-item v-if="!isSecondAdmin" index="/user-index">
            <el-icon><User /></el-icon>
            <span>用户列表</span>
          </el-menu-item>
          <el-menu-item index="/doctor-index">
            <el-icon><Service /></el-icon>
            <span>医生列表</span>
          </el-menu-item>
          <el-menu-item index="/ranking">
            <el-icon><TrophyBase /></el-icon>
            <span>医生排行</span>
          </el-menu-item>
          <el-menu-item v-if="!isSecondAdmin" index="/hospital-management">
            <el-icon><OfficeBuilding /></el-icon>
            <span>医院管理</span>
          </el-menu-item>
          <el-menu-item v-if="!isSecondAdmin" index="/api-management">
            <el-icon><Open /></el-icon>
            <span>API接口管理</span>
          </el-menu-item>
          <el-menu-item v-if="isFirstAdmin" index="/admin-index">
            <el-icon><Coordinate /></el-icon>
            <span>管理员列表</span>
          </el-menu-item>
          <el-menu-item index="/admin-account">
            <el-icon><Setting /></el-icon>
            <span>账户管理</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 小箭头控制 -->
    <div class="toggle-button" @click="toggleSidebar">
      <font-awesome-icon :icon="isSidebarVisible ? ['fas', 'arrow-left'] : ['fas', 'arrow-right']" />
    </div>

    <el-container>
      <el-header v-if="isAuthenticated" class="custom-header">
        <div class="header-content">
          <el-button @click="goBack">
            <el-icon style="margin-right: 10px"><ArrowLeft /></el-icon>
            返回</el-button>
          <el-button @click="goHome">
            <el-icon style="margin-right: 10px"><HomeFilled /></el-icon>
            主页</el-button>
          <el-popover
              placement="bottom-end"
              width="200"
              trigger="hover"
              v-if="userRole === 'doctor'"
          >
            <template #reference>
              <div class="user-info">
                <el-avatar size="default" :src="avatarUrl" @error="handleAvatarError">
                  {{ doctorInfo?.name ? doctorInfo.name.charAt(0).toUpperCase() : 'U' }}
                </el-avatar>
                <span class="username">{{ doctorInfo?.name || '请重新登录' }}</span>
              </div>
            </template>
            <div class="user-details">
              <p><strong>姓名:</strong> {{ doctorInfo?.name }}</p>
              <p><strong>用户名:</strong> {{ doctorInfo?.username }}</p>
              <el-button @click="showAvatarDialog" size="small">更改头像</el-button>
              <el-button @click="handleCommand('logout')" size="small" type="danger">登出</el-button>
            </div>
          </el-popover>

          <el-popover
              placement="bottom-end"
              width="200"
              trigger="hover"
              v-if="userRole === 'admin'"
          >
            <template #reference>
              <div class="user-info">
                <el-avatar size="default" :src="avatarUrl" @error="handleAvatarError">
                  {{ adminInfo?.name ? adminInfo.name.charAt(0).toUpperCase() : 'U' }}
                </el-avatar>
                <span class="username">{{ adminInfo?.username || '请重新登录' }}</span>
              </div>
            </template>
            <div class="user-details">
              <p><strong>用户名:</strong> {{ adminInfo?.username }}</p>
              <el-button @click="showAvatarDialog" size="small">更改头像</el-button>
              <el-button @click="handleCommand('logout')" size="small" type="danger">登出</el-button>
            </div>
          </el-popover>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
    <el-dialog
        v-model="avatarDialogVisible"
        title="更改头像"
        width="30%"
    >
      <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          @change="handleAvatarChange"
          :before-upload="beforeAvatarUpload"
          :auto-upload="false"
      >
        <el-image v-if="uploadedAvatarUrl || avatarUrl" :src="uploadedAvatarUrl || avatarUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
      <div class="size-limit">* 图片大小不能超过 500KB</div> <!-- 添加提示信息 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadAvatar">确认上传</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElButton } from 'element-plus'
import { HomeFilled, User, Memo, ChatDotRound, Reading, EditPen, Setting, Avatar, Loading, Service,
  TrophyBase, Coordinate, Plus, ArrowLeft, OfficeBuilding, Open} from '@element-plus/icons-vue'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const router = useRouter()
const store = useStore()
const route = useRoute()

const doctorInfo = ref(null)
const adminInfo = ref(null)
const uploadedAvatarUrl = ref('')
const avatarDialogVisible = ref(false)
const newAvatarFile = ref(null)
const isSidebarVisible = ref(true)

const avatarUrl = computed(() => store.state.avatar)
const isAuthenticated = computed(() => store.getters.isLoggedIn)
const userRole = computed(() => localStorage.getItem('role'))
const isSuperAdmin = computed(() => store.state.user && store.state.user.adminType === 'super')
const isFirstAdmin = computed(() => store.state.user && store.state.user.adminType === 'first')
const isSecondAdmin = computed(() => store.state.user && store.state.user.adminType === 'second')
const activeMenu = computed(() => {
  return route.path === '/' ? '/' : route.path.split('/')[1] ? `/${route.path.split('/')[1]}` : '/'
})

onMounted(async () => {
  if (isAuthenticated.value) {
    if(userRole.value === 'doctor'){
      await fetchDoctorInfo()
      await fetchDoctorAvatar()
    }else{
      await fetchAdminInfo()
      await fetchAdminAvatar()
    }
  }
})

const fetchDoctorInfo = async () => {
  try {
    const info = await store.dispatch('fetchDoctorInfo')
    doctorInfo.value = info
  } catch (error) {
    console.error('Failed to fetch doctor info:', error)
    ElMessage.error('获取医生信息失败')
  }
}

const fetchAdminInfo = async () => {
  try {
    const info = await store.dispatch('fetchAdminInfo')
    adminInfo.value = info
  } catch (error) {
    console.error('Failed to fetch admin info:', error)
    ElMessage.error('获取管理员信息失败')
  }
}

const fetchDoctorAvatar = async () => {
  try {
    await store.dispatch('fetchDoctorAvatar');
  } catch (error) {
    console.error('Failed to fetch avatar:', error);
  }
}

const fetchAdminAvatar = async () => {
  try {
    await store.dispatch('fetchAdminAvatar');
  } catch (error) {
    console.error('Failed to fetch avatar:', error);
  }
}

const handleAvatarError = () => {
  avatarUrl.value = ''
}

const showAvatarDialog = () => {
  avatarDialogVisible.value = true
}

const handleAvatarChange = (file) => {
  newAvatarFile.value = file.raw;
  // 将文件转换为base64格式并赋值给avatarUrl，以便预览
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedAvatarUrl.value = e.target.result;
  };
  reader.readAsDataURL(file.raw);
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt500K = file.size / 1024 < 500;

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt500K) {
    ElMessage.error('头像大小不能超过 500KB!');
    return false;
  }
  return true;
}

const uploadAvatar = async () => {
  if (!newAvatarFile.value) {
    ElMessage.warning('请先选择一个新的头像文件');
    return;
  }

  try {
    const base64 = await convertToBase64(newAvatarFile.value);
    const url = `/api/api/${userRole.value}/upload_avatar_base64`; // 使用模板字符串
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.state.token}`
      },
      body: JSON.stringify({ base64Image: base64 })
    });

    if (response.ok) {
      ElMessage.success('头像上传成功');
      avatarUrl.value = base64;
      uploadedAvatarUrl.value = '';
      avatarDialogVisible.value = false;
      if (userRole.value === 'doctor') {
        await fetchDoctorAvatar(); // Fetch the updated avatar
      } else {
        await fetchAdminAvatar(); // Fetch the updated avatar
      }
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    ElMessage.error('头像上传失败');
  }
}

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const handleSelect = (key) => {
  router.push(key)
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  const role = userRole.value
  if (role === 'doctor') {
    router.push('/doctor-dashboard')
  } else if (role === 'admin') {
    router.push('/admin-dashboard')
  } else {
    ElMessage.error('未知的用户角色')
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    store.dispatch('logout')
    router.push('/login')
  } else if (command === 'account') {
    const role = userRole.value
    if (role === 'doctor') {
      router.push('/doctor-account')
    } else if (role === 'admin') {
      router.push('/admin-account')
    } else {
      ElMessage.error('未知的用户角色')
    }
  }
}

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
}
</script>

<style scoped>

.layout-container {
  height: 100vh;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
}

.username {
  margin-left: 8px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

/* 侧边栏动画 */
.el-aside {
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #f0f2f5;
}

/* 隐藏侧边栏时的样式 */
.aside-hidden {
  width: 0!important;
  opacity: 0;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

/* 小箭头按钮样式 */
.toggle-button {
  position: absolute;
  top: 50%;
  left: 140px;
  transform: translateY(-50%);
  cursor: pointer;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: left 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-button.arrow-left::before {
  content: '\f060'; /* Font Awesome的左箭头图标代码 */
  font-family: 'Font Awesome 5 Free', sans-serif;
  font-weight: 900;
  color: #333333;
}

.toggle-button.arrow-right::before {
  content: '\f061'; /* Font Awesome的右箭头图标代码 */
  font-family: 'Font Awesome 5 Free', sans-serif;
  font-weight: 900;
  color: #333333;
}

/* 动态调整箭头位置 */
.aside-hidden ~ .toggle-button {
  left: 0; /* 隐藏时箭头移动到最左侧 */
}

.el-header {
  background: linear-gradient(to bottom, #ffffff, #f5f5f5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-menu {
  background-color: transparent;
}

.el-menu-item {
  transition: all 0.2s ease;
}

.el-menu-item.el-icon {
  font-size: 18px;
  color: #333333;
}

.el-menu-item:hover {
  transform: scale(1.05);
}

.el-menu-item:hover,.el-menu-item.is-active {
  background-color: #e6e8eb;
  font-weight: 500;
}
</style>

