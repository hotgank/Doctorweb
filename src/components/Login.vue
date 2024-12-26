<template>
  <div class="login-container">
    <!-- 左侧艺术字体标题 -->
    <div class="left-section">
      <h1 class="system-title">
        <span class="title-line">儿童</span>
        <span class="title-line">体态</span>
        <span class="title-line">评估</span>
        <span class="title-line">平台</span>
      </h1>
    </div>

    <!-- 中间登录卡片 -->
    <el-card class="login-card">
      <div class="card-header">
        <img src="/img/logo.webp" alt="系统图标" class="logo-icon" />
        <h2 class="login-title">欢迎登录</h2>
      </div>

      <el-form
          :model="loginForm"
          @submit.prevent="handleLogin"
          label-position="top"
          class="login-form"
      >
        <el-form-item label="登录方式" class="login-type-selector">
          <el-radio-group v-model="loginForm.loginType" class="custom-radio-group">
            <el-radio label="email">
              <el-icon><Message /></el-icon>
              邮箱登录
            </el-radio>
            <el-radio label="username">
              <el-icon><User /></el-icon>
              用户名登录
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="loginForm.loginType === 'email' ? '邮箱' : '用户名'">
          <el-input
              v-model="loginForm.identifier"
              :prefix-icon="loginForm.loginType === 'email' ? Message : User"
              :placeholder="loginForm.loginType === 'email' ? '请输入邮箱' : '请输入用户名'"
              class="custom-input"
          ></el-input>
        </el-form-item>

        <el-form-item label="密码">
          <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="custom-input"
              :prefix-icon="Lock"
          >
            <template #suffix>
              <el-icon
                  class="password-toggle"
                  @click="showPassword = !showPassword"
              >
                <eye v-if="showPassword" />
                <eye-off v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="登录类型" class="role-selector">
          <el-radio-group
              v-model="loginForm.role"
              @change="handleRoleChange"
              class="custom-radio-group"
          >
            <el-radio label="doctor">
              <el-icon><Service /></el-icon>
              医生登录
            </el-radio>
            <el-radio label="admin">
              <el-icon><Management /></el-icon>
              管理员登录
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <div class="form-footer">
          <el-button
              ref="loginButton"
              type="primary"
              native-type="submit"
              class="login-button"
          >
            登录
          </el-button>

          <div class="action-links">
            <router-link to="/forgot-password" class="action-link">
              <el-icon><QuestionFilled /></el-icon>
              忘记密码
            </router-link>
            <router-link to="/register" class="action-link">
              <el-icon><Plus /></el-icon>
              立即注册
            </router-link>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 右侧背景图装饰 -->
    <div class="right-section">
      <div class="decoration-image"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage, ElIcon } from 'element-plus';
import {
  View as Eye,
  Hide as EyeOff,
  Message,
  Lock,
  User,
  Plus,
  QuestionFilled,
  Management,
  Service
} from '@element-plus/icons-vue';

const loginForm = ref({
  identifier: '',
  password: '',
  role: localStorage.getItem('role') || 'doctor',
  loginType: 'email',
});

const showPassword = ref(false);
const loginButton = ref(null);

const router = useRouter();
const store = useStore();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

const validatePassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/;
  return re.test(password);
}

const handleLogin = async () => {
  if (loginButton.value) {
    loginButton.value.disabled = true;
    loginButton.value.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
  }

  const { identifier, password, role, loginType } = loginForm.value;

  if (!identifier || !password) {
    ElMessage.error(`请填写${loginType === 'email' ? '邮箱' : '用户名'}和密码`);
    resetLoginButton();
    return;
  }

  if (loginType === 'email' && !validateEmail(identifier)) {
    ElMessage.error('请输入有效的邮箱地址');
    resetLoginButton();
    return;
  }

  if (!validatePassword(password)) {
    ElMessage.error('密码必须为10~16位，包含大小写字母和数字，不包含特殊字符');
    resetLoginButton();
    return;
  }

  try {
    let success = false;

    if (role === 'doctor') {
      success = await store.dispatch('doctorLogin', { identifier, password, loginType });
    } else if (role === 'admin') {
      success = await store.dispatch('adminLogin', { identifier, password, loginType });
    }

    if (success) {
      localStorage.setItem('role', role);
      if (role === 'doctor') {
        await router.push({name: 'DoctorDashboard'});
      } else if (role === 'admin') {
        await router.push({name: 'AdminDashboard'});
      }
      ElMessage.success('登录成功');
    }
  } catch (error) {
    console.error('Login error:', error);
    ElMessage.error('登录失败，请重试');
  } finally {
    resetLoginButton();
  }
};

const resetLoginButton = () => {
  if (loginButton.value) {
    loginButton.value.disabled = false;
    loginButton.value.innerHTML = '登录';
  }
};

const handleRoleChange = () => {
  localStorage.setItem('role', loginForm.value.role);
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    const currentFocus = document.activeElement;
    if (currentFocus.tagName === 'INPUT' || currentFocus.tagName === 'TEXTAREA') {
      const nextInput = currentFocus.nextElementSibling;
      if (nextInput && (nextInput.tagName === 'INPUT' || nextInput.tagName === 'TEXTAREA')) {
        nextInput.focus();
        e.preventDefault();
      }
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.login-container {
  display: grid;
  grid-template-columns: 25% 50% 25%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  position: relative;
  overflow: hidden;
}

/* 左侧标题样式 */
.left-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.system-title {
  display: flex;
  flex-direction: column;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.title-line {
  position: relative;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.title-line:hover {
  transform: translateX(20px);
  color: #3498db;
}

.title-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 0;
  background-color: #3498db;
  transition: height 0.3s ease, top 0.3s ease;
}

.title-line:hover::before {
  height: 100%;
  top: 0;
}

/* 登录卡片样式 */
.login-card {
  width: 90%;
  max-width: 480px;
  margin: auto;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
}

.login-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

/* 表单样式 */
.login-form {
  margin-top: 2rem;
}

.custom-input :deep(.el-input__wrapper) {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  box-shadow: none;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #e2e8f0;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  background: #fff;
}

.custom-radio-group {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.custom-radio-group :deep(.el-radio) {
  margin-right: 0;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.custom-radio-group :deep(.el-radio.is-checked) {
  background: #edf2f7;
}

.password-toggle {
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #3498db;
}

/* 按钮和链接样式 */
.form-footer {
  margin-top: 2rem;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  border-radius: 8px;
  background: #3498db;
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.action-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.3s ease;
}

.action-link:hover {
  color: #3498db;
}

/* 右侧背景装饰 */
.right-section {
  position: relative;
  overflow: hidden;
}

.decoration-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-image: url('/img/loginPage.webp?height=800&width=600');
  background-size: cover;
  background-position: center;
  opacity: 0.8;
  filter: blur(1px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .login-container {
    grid-template-columns: 30% 70%;
  }

  .right-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 100%;
    padding: 1rem;
  }

  .left-section {
    display: none;
  }

  .login-card {
    width: 95%;
    margin: 1rem auto;
    padding: 1rem;
  }

  .system-title {
    font-size: 2rem;
  }

  .custom-radio-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .custom-radio-group :deep(.el-radio) {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    width: 98%;
    padding: 0.8rem;
  }

  .card-header {
    margin-bottom: 1rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .action-links {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>

