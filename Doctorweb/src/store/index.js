import { createStore } from 'vuex'

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null, // 从 localStorage 初始化用户状态
    doctors: [
      { 
        id: 1, 
        name: '医生 A', 
        email: 'doctorA@example.com', 
        qualified: false,
        unit: '内科', 
        position: '主治医师', 
        certNumber: 'D123456789',
        certImage: 'https://via.placeholder.com/150', // 示例图片 URL
      },
      { 
        id: 2, 
        name: '医生 B', 
        email: 'doctorB@example.com', 
        qualified: true,
        unit: '外科', 
        position: '副主任医师', 
        certNumber: 'D987654321',
        certImage: 'https://via.placeholder.com/150', // 示例图片 URL
      },
      { 
        id: 3, 
        name: '医生 C', 
        email: 'doctorC@example.com', 
        qualified: false,
        unit: '儿科', 
        position: '住院医师', 
        certNumber: 'D112233445',
        certImage: 'https://via.placeholder.com/150', // 示例图片 URL
      },
    ],
    admins: [
      // 模拟管理员数据
      { id: 1, name: 'superadmin', email: 'adminX@example.com', isSuperAdmin: true },
      { id: 2, name: '管理员 Y', email: 'adminY@example.com', isSuperAdmin: false },
    ],
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user)) // 持久化到 localStorage
    },
    clearUser(state) {
      state.user = null
      localStorage.removeItem('user')
    },
    updateUserInfo(state, info) {
      state.user = { ...state.user, ...info }
      localStorage.setItem('user', JSON.stringify(state.user)) // 更新 localStorage
    },
    addAdmin(state, admin) {
      state.admins.push(admin)
    },
    // 其他 mutations...
  },
  actions: {
    login({ commit, state }, { username, password, role }) {
      return new Promise((resolve) => {
        // 模拟 API 调用
        setTimeout(() => {
          // 检查是否是超级管理员
          const admin = state.admins.find(a => a.name === username && a.isSuperAdmin)
          const isSuperAdmin = admin ? true : false
          
          // 创建用户对象，包含 isSuperAdmin 属性
          const user = { username, role, isSuperAdmin }
          commit('setUser', user)
          resolve(user)
        }, 500)
      })
    },
    logout({ commit }) {
      // 模拟 API 调用（如果需要）
      commit('clearUser')
    },
    updateAccountInfo({ commit }, info) {
      // 模拟 API 调用来更新用户信息
      commit('updateUserInfo', info)
    },
    changePassword({ commit }, passwords) {
      // 模拟 API 调用来更改密码
      console.log('更改密码:', passwords)
    },
    submitVerification({ commit }, verificationData) {
      // 模拟 API 调用来提交认证信息
      console.log('提交认证信息:', verificationData)
    },
    deactivateAccount({ commit }, password) {
      // 模拟 API 调用来注销账户
      console.log('使用密码注销账户:', password)
      commit('clearUser')
    },
    approveDoctor({ commit }, doctorId) {
      commit('approveDoctor', doctorId)
    },
    rejectDoctor({ commit }, doctorId) {
      commit('rejectDoctor', doctorId)
    },
    addAdmin({ commit }, admin) {
      commit('addAdmin', admin)
    },
    // 其他 actions...
  },
  getters: {
    isLoggedIn: state => !!state.user,
    currentUser: state => state.user,
    userRole: state => state.user ? state.user.role : null,
    isSuperAdmin: state => state.user ? state.user.isSuperAdmin : false,
    pendingDoctors: state => Array.isArray(state.doctors) ? state.doctors.filter(doctor => !doctor.qualified) : [],
    allDoctors: state => state.doctors,
    allAdmins: state => state.admins,
  },
})