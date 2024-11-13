<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form :model="loginForm" @submit.prevent="handleLogin" label-position="top">
        <el-form-item label="邮箱账号">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱账号"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
          >
            <template #suffix>
              <el-icon class="el-input__icon" @click="showPassword = !showPassword">
                <eye v-if="showPassword" />
                <eye-off v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="showPassword">显示密码</el-checkbox>
        </el-form-item>
        <el-form-item label="登录类型">
          <el-radio-group v-model="loginForm.role" @change="handleRoleChange">
            <el-radio label="doctor">医生登录</el-radio>
            <el-radio label="admin">管理员登录</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <div class="flex justify-between items-center">
            <el-button type="primary" native-type="submit">登录</el-button>
            <router-link to="/register" class="register-link">
              没有账号？立即注册
            </router-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';

const loginForm = ref({
  email: '',
  password: '',
  role: localStorage.getItem('role') || 'doctor', // 从本地存储获取角色，默认为 doctor
});

const showPassword = ref(false);

const router = useRouter();
const store = useStore();

// 邮箱格式验证函数
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 密码格式验证函数
const validatePassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/;
  return re.test(password);
}

// 登录处理函数
const handleLogin = async () => {
  const { email, password, role } = loginForm.value;

  if (!email || !password) {
    ElMessage.error('请填写邮箱账号和密码');
    return;
  }

  if (!validateEmail(email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }

  if (!validatePassword(password)) {
    ElMessage.error('密码必须为10~16位，包含大小写字母和数字，不包含特殊字符');
    return;
  }

  try {
    let success = false;

    if (role === 'doctor') {
      success = await store.dispatch('doctorlogin', { email, password });
    } else if (role === 'admin') {
      success = await store.dispatch('adminlogin', { email, password });
    }
    if (success) {
      localStorage.setItem('role', role);  // 设置本地存储角色
      if (role === 'doctor') {
        router.push({ name: 'DoctorDashboard' });  // 根据角色跳转
      } else if (role === 'admin') {
        router.push({ name: 'AdminDashboard' });
      }
      ElMessage.success('登录成功');
    } else {
      ElMessage.error('登录失败，请检查您的凭据并重试。');
    }
  } catch (error) {
    ElMessage.error(error.response?.data || '登录失败');
  }
};

// 处理角色切换并更新本地存储
const handleRoleChange = () => {
  localStorage.setItem('role', loginForm.value.role);
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
}

.el-form-item {
  display: flex;
  flex-direction: column;
}

.el-input {
  width: 100%;
}

.el-radio-group {
  display: flex;
  justify-content: space-between;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.register-link {
  color: #6b7280;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 50px;
}

.register-link:hover {
  color: #3b82f6;
}
</style>
