<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form :model="loginForm" @submit.prevent="handleLogin" label-position="top">
        <el-form-item label="登录方式">
          <el-radio-group v-model="loginForm.loginType">
            <el-radio label="email">邮箱登录</el-radio>
            <el-radio label="username">用户名登录</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="loginForm.loginType === 'email' ? '邮箱' : '用户名'">
          <el-input v-model="loginForm.identifier" :placeholder="loginForm.loginType === 'email' ? '请输入邮箱' : '请输入用户名'"></el-input>
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
  identifier: '',
  password: '',
  role: localStorage.getItem('role') || 'doctor',
  loginType: 'email',
});

const showPassword = ref(false);

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
  const { identifier, password, role, loginType } = loginForm.value;

  if (!identifier || !password) {
    ElMessage.error(`请填写${loginType === 'email' ? '邮箱' : '用户名'}和密码`);
    return;
  }

  if (loginType === 'email' && !validateEmail(identifier)) {
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
  }
};

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
