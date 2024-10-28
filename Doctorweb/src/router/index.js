import { createRouter, createWebHistory } from 'vue-router'
import DoctorDashboard from '../components/doctor/DoctorDashboard.vue'
import DoctorProfile from '../components/doctor/DoctorProfile.vue'
import OnlineConsultation from '../components/doctor/OnlineConsultation.vue'
import ArticlePublish from '../components/doctor/ArticlePublish.vue'
import CommunityForum from '../components/doctor/CommunityForum.vue'
import DoctorRanking from '../components/admin/DoctorRanking.vue'
import Register from '../components/Register.vue'
import Login from '../components/Login.vue'
import PatientIndex from '../components/doctor/PatientIndex.vue'
import ArticleList from '../components/doctor/ArticleList.vue'
import ArticleDetail from '../components/doctor/ArticleDetail.vue'
import UserSystemAnnouncement from '../components/doctor/UserSystemAnnouncement.vue'
import DoctorAccountManagement from '../components/doctor/DoctorAccountManagement.vue'
import NotFound from '../components/NotFound.vue' // 404页面
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import UserIndex from '../components/admin/UserIndex.vue'
import DoctorIndex from '../components/admin/DoctorIndex.vue'
import AdminIndex from '../components/admin/AdminIndex.vue'
import AdminAccountManagement from '../components/admin/AdminAccountManagement.vue'
import VerifyDoctors from '../components/admin/VerifyDoctors.vue'
import AdminSystemAnnouncement from '../components/admin/AdminSystemAnnouncement.vue'
import SuperAdmin from '../components/admin/SuperAdmin.vue'
import Layout from '../components/Layout.vue'

const routes = [
  // 登录和注册页面，不使用 Layout
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  // 受保护的路由，使用 Layout
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      { path: 'doctor-dashboard', name: 'DoctorDashboard', component: DoctorDashboard, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/profile', name: 'DoctorProfile', component: DoctorProfile, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/consultation', name: 'OnlineConsultation', component: OnlineConsultation, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/publish-article', name: 'ArticlePublish', component: ArticlePublish, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/community', name: 'CommunityForum', component: CommunityForum, meta: { requiresAuth: true, role: 'doctor' } },
      
      { path: '/patient-index', name: 'PatientIndex', component: PatientIndex, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/articles', name: 'ArticleList', component: ArticleList, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/article/:id', name: 'ArticleDetail', component: ArticleDetail, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/user-announcement', name: 'UserSystemAnnouncement', component: UserSystemAnnouncement, meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/doctor-account', name: 'DoctorAccountManagement', component: DoctorAccountManagement, meta: { requiresAuth: true, role: 'doctor' } },

      { path: 'admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
      { path: '/verify', name: 'VerifyDoctors', component: VerifyDoctors, meta: { requiresAuth: true, role: 'admin' } },
      { path: '/user-index', name: 'UserIndex', component: UserIndex, meta: { requiresAuth: true, role: 'admin' } },
      { path: '/doctor-index', name: 'DoctorIndex', component: DoctorIndex, meta: { requiresAuth: true, role: 'admin' } },
      { path: '/admin-index', name: 'AdminIndex', component: AdminIndex, meta: { requiresAuth: true, role: 'admin' } },
      { path: '/admin-announcement', name: 'AdminSystemAnnouncement', component: AdminSystemAnnouncement, meta: { requiresAuth: true, role: 'admin' } },
      { path: '/admin-account', name: 'AdminAccountManagement', component: AdminAccountManagement, meta: { requiresAuth: true, role: 'admin' } },
      { path: '/ranking', name: 'DoctorRanking', component: DoctorRanking, meta: { requiresAuth: true, role: 'admin' } },

      { path: '/superadmin', name: 'SuperAdmin', component: SuperAdmin, meta: { requiresAuth: true, role: 'admin' } },
    ],
  },

  // 404页面
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const role = to.meta.role
  const user = JSON.parse(localStorage.getItem('user')) // 假设用户信息存储在localStorage

  if (requiresAuth) {
    if (!user) {
      // 未登录，重定向到登录页面
      next({ name: 'Login' })
    } else if (role && user.role !== role) {
      // 登录用户角色不匹配，重定向到登录页面或其他页面
      next({ name: 'Login' })
    } else {
      // 已登录且角色匹配
      next()
    }
  } else {
    // 不需要认证，允许访问
    next()
  }
})

export default router
