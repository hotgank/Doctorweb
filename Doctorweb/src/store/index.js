import { createStore } from 'vuex';
import axios from 'axios';
import {ElMessage} from "element-plus";

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    doctor: JSON.parse(localStorage.getItem('doctor')) || null,
    admin: JSON.parse(localStorage.getItem('admin')) || null,
    token: localStorage.getItem('token') || '',
    role: localStorage.getItem('role') || '',
    doctors: [],
    admins: [],
    avatar: '',
  },

  mutations: {
    setDoctor(state, doctor) {
      state.doctor = doctor;
      localStorage.setItem('doctor', JSON.stringify(doctor));
    },
    updateDoctor(state, updatedInfo) {
      state.doctor = { ...state.doctor, ...updatedInfo };
      localStorage.setItem('doctor', JSON.stringify(state.doctor));
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    setAdmin(state, admin) {
      state.admin = admin;
      localStorage.setItem('admin', JSON.stringify(admin));
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    setRole(state, role) {
      state.role = role;
      localStorage.setItem('role', role);
    },
    clearUser(state) {
      state.user = null;
      state.doctor = null;
      state.admin = null;
      state.token = '';
      state.role = '';
      localStorage.removeItem('user');
      localStorage.removeItem('doctor');
      localStorage.removeItem('admin');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },
    setDoctors(state, doctors) {
      state.doctors = doctors;
    },
    setAdmins(state, admins) {
      state.admins = admins;
    },
    setAvatar(state, avatar) {
      state.avatar = avatar;
      localStorage.setItem('avatar', avatar);
    },
  },

  actions: {
    async doctorLogin({ commit }, { identifier, password, loginType }) {
      try {
        const endpoint = loginType === 'email' ? '/api/api/DoctorLogin/loginByEmail' : '/api/api/DoctorLogin/loginByUsername';
        const payload = loginType === 'email' ? { email: identifier, password } : { username: identifier, password };
        
        const response = await axios.post(endpoint, payload);

        if (response && response.data) {
          const { token, doctor } = response.data;

          commit('setToken', token);
          commit('setDoctor', doctor);
          commit('setRole', 'doctor');

          // Set up periodic data fetching
          this.dispatch('startPeriodicDataFetch');

          return true;
        } else {
          throw new Error('响应数据不包含 token 或 doctor 对象');
        }
      } catch (error) {
        console.error('Login failed:', error);
        // 检查错误响应中的状态码和消息
        if (error.response && error.response.status === 400) {
          ElMessage.error(error.response.data); // 显示后端返回的具体错误消息
        } else {
          ElMessage.error('登录失败，请稍后重试');
        }
        return false;
      }
    },

    async adminLogin({ commit }, { identifier, password, loginType}) {
      try {
        const endpoint = loginType === 'email' ? '/api/api/AdminLogin/loginByEmail' : '/api/api/AdminLogin/loginByUsername';
        const payload = loginType === 'email' ? { email: identifier, password } : { username: identifier, password };

        const response = await axios.post(endpoint, payload);
        if (response && response.data) {
          const { token, admin } = response.data;

          commit('setToken', token);
          commit('setUser', admin);
          commit('setRole', 'admin');

          // Set up periodic data fetching
          this.dispatch('startPeriodicDataFetch');

          return true;
        } else {
          throw new Error('响应数据不包含 token 或 admin 对象');
        }
      } catch (error) {
        console.error('Login failed:', error);
        // 检查错误响应中的状态码和消息
        if (error.response && error.response.status === 400) {
          ElMessage.error(error.response.data); // 显示后端返回的具体错误消息
        } else {
          ElMessage.error('登录失败，请稍后重试');
        }
        return false;
      }
    },

    logout({ commit }) {
      commit('clearUser');
      this.dispatch('stopPeriodicDataFetch');
    },

    startPeriodicDataFetch({ dispatch }) {
      const fetchInterval = setInterval(() => {
        dispatch('fetchDoctors');
        dispatch('fetchAdmins');
      }, 60000); // Fetch every 60 seconds

      // Store the interval ID
      this.state.fetchIntervalId = fetchInterval;
    },

    stopPeriodicDataFetch({ state }) {
      if (state.fetchIntervalId) {
        clearInterval(state.fetchIntervalId);
        state.fetchIntervalId = null;
      }
    },

    async fetchDoctors({ commit }) {
      // try {
      //   const response = await axios.get('/api/doctors');
      //   const doctors = response.data;
      //   commit('setDoctors', doctors);
      // } catch (error) {
      //   console.error('Failed to fetch doctors:', error);
      // }
    },

    async fetchAdmins({ commit }) {
      // try {
      //   const response = await axios.get('/api/admins');
      //   const admins = response.data;
      //   commit('setAdmins', admins);
      // } catch (error) {
      //   console.error('Failed to fetch admins:', error);
      // }
    },

    async fetchDoctorInfo({ commit, state }) {
      try {
        const response = await axios.get('/api/api/doctor/information', {
          headers: {
            Authorization: `Bearer ${state.token}`
          }
        });
        const doctorInfo = response.data;
        commit('setDoctor', doctorInfo);
        return doctorInfo;
      } catch (error) {
        // console.error('Failed to fetch doctor information:', error);
        throw error;
      }
    },

    async fetchAdminInfo({ commit, state }) {
      try {
        const response = await axios.get('/api/api/admin/information', {
          headers: {
            Authorization: `Bearer ${state.token}`
          }
        });
        const adminInfo = response.data;
        commit('setAdmin', adminInfo);
        return adminInfo;
      } catch (error) {
        // console.error('Failed to fetch admin information:', error);
        throw error;
      }
    },

    async updateDoctorInfo({ commit, state }, updatedInfo) {
      try {
        const response = await axios.post('/api/api/doctor/updateData', updatedInfo, {
          headers: {
            Authorization: `Bearer ${state.token}`
          }
        });
        if (response.data === 'Data updated successfully') {
          commit('updateDoctor', updatedInfo);
          return true;
        } else {
          throw new Error('Failed to update doctor information');
        }
      } catch (error) {
        console.error('Failed to update doctor information:', error);
        throw error;
      }
    },

    async fetchDoctorAvatar({ commit, state }) {
      try {
        const response = await axios.get('/api/api/doctor/get_avatar_base64', {
          headers: {
            Authorization: `Bearer ${state.token}`
          }
        });
        const data = response.data; // 直接使用 response.data
        commit('setAvatar', data.base64Image);
      } catch (error) {
        console.error('Failed to fetch avatar:', error);
      }
    },

    async fetchAdminAvatar({ commit, state }) {
      try {
        const response = await axios.get('/api/api/admin/get_avatar_base64', {
          headers: {
            Authorization: `Bearer ${state.token}`
          }
        });
        const data = response.data; // 直接使用 response.data
        commit('setAvatar', data.base64Image);
      } catch (error) {
        console.error('Failed to fetch avatar:', error);
      }
    },
  },

  getters: {
    isLoggedIn: state => !!state.user || !!state.doctor,
    currentUser: state => state.user || state.doctor,
    token: state => state.token,
    role: state => state.role,
    doctors: state => state.doctors,
    admins: state => state.admins,
  },
});