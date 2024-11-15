import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    doctor: JSON.parse(localStorage.getItem('doctor')) || null,
    token: localStorage.getItem('token') || '',
    role: localStorage.getItem('role') || '',
    doctors: [],
    admins: [],
  },

  mutations: {
    setDoctor(state, doctor) {
      state.doctor = doctor;
      localStorage.setItem('doctor', JSON.stringify(doctor));
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
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
      state.token = '';
      state.role = '';
      localStorage.removeItem('user');
      localStorage.removeItem('doctor');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },
    setDoctors(state, doctors) {
      state.doctors = doctors;
    },
    setAdmins(state, admins) {
      state.admins = admins;
    },
  },

  actions: {
    async doctorlogin({ commit, dispatch }, { email, password }) {
      try {
        const response = await axios.post('/api/api/DoctorLogin/loginByEmail', { email, password });

        if (response && response.data) {
          const { token, doctor } = response.data;

          commit('setToken', token);
          commit('setDoctor', doctor);
          commit('setRole', 'doctor');

          localStorage.setItem('token', token);
          localStorage.setItem('doctor', JSON.stringify(doctor));
          localStorage.setItem('role', 'doctor');

          // await dispatch('fetchDoctors');
          // await dispatch('fetchAdmins');
          return true;
        } else {
          throw new Error('响应数据不包含 token 或 doctor 对象');
        }
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },

    async adminlogin({ commit, dispatch }, { email, password }) {
      try {
        const response = await axios.post('/api/api/AdminLogin/login', { email, password });

        if (response && response.data) {
          const { token, admin } = response.data;

          commit('setToken', token);
          commit('setUser', admin);
          commit('setRole', 'admin');

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(admin));
          localStorage.setItem('role', 'admin');

          // await dispatch('fetchDoctors');
          // await dispatch('fetchAdmins');
          return true;
        } else {
          throw new Error('响应数据不包含 token 或 admin 对象');
        }
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },

    logout({ commit }) {
      commit('clearUser');
    },

    async fetchDoctors({ commit }) {
      try {
        const response = await axios.get('/api/doctors');
        const doctors = response.data;
        commit('setDoctors', doctors);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    },

    async fetchAdmins({ commit }) {
      try {
        const response = await axios.get('/api/admins');
        const admins = response.data;
        commit('setAdmins', admins);
      } catch (error) {
        console.error('Failed to fetch admins:', error);
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
