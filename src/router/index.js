import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 登录和注册页面，不使用 Layout
  { path: '/login', name: 'Login', component: () => import('../components/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../components/Register.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../components/ForgotPassword.vue') },

  // 受保护的路由，使用懒加载的 Layout
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: () => {
      const role = localStorage.getItem('role');
      return role === 'doctor' ? { name: 'DoctorDashboard' } : { name: 'AdminDashboard' };
    },
    children: [
      { path: 'doctor-dashboard', name: 'DoctorDashboard', component: () => import('../components/doctor/DoctorDashboard.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/profile', name: 'DoctorProfile', component: () => import('../components/doctor/DoctorProfile.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/consultation', name: 'OnlineConsultation', component: () => import('../components/doctor/OnlineConsultation.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/publish-article', name: 'ArticlePublish', component: () => import('../components/doctor/ArticlePublish.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/community', name: 'CommunityForum', component: () => import('../components/doctor/CommunityForum.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/patient-index', name: 'PatientIndex', component: () => import('../components/doctor/PatientIndex.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/articles', name: 'ArticleList', component: () => import('../components/doctor/ArticleList.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/article/:id', name: 'ArticleDetail', component: () => import('../components/doctor/ArticleDetail.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/user-announcement', name: 'UserSystemAnnouncement', component: () => import('../components/doctor/UserSystemAnnouncement.vue'), meta: { requiresAuth: true, role: 'doctor' } },
      { path: '/doctor-account', name: 'DoctorAccountManagement', component: () => import('../components/doctor/DoctorAccountManagement.vue'), meta: { requiresAuth: true, role: 'doctor' } },

      { path: 'admin-dashboard', name: 'AdminDashboard', component: () => import('../components/admin/AdminDashboard.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/verify', name: 'VerifyDoctors', component: () => import('../components/admin/VerifyDoctors.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/user-index', name: 'UserIndex', component: () => import('../components/admin/UserIndex.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/doctor-index', name: 'DoctorIndex', component: () => import('../components/admin/DoctorIndex.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/admin-index', name: 'AdminIndex', component: () => import('../components/admin/AdminIndex.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/admin-announcement', name: 'AdminSystemAnnouncement', component: () => import('../components/admin/AdminSystemAnnouncement.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/admin-account', name: 'AdminAccountManagement', component: () => import('../components/admin/AdminAccountManagement.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/ranking', name: 'DoctorRanking', component: () => import('../components/admin/DoctorRanking.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/verify-articles', name: 'VerifyArticles', component: () => import('../components/admin/ArticleList.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/verify-articles/:id', name: 'VerifyArticlesDetails', component: () => import('../components/admin/ArticleDetail.vue'), meta: { requiresAuth: true, role: 'admin' } },

      { path: '/superadmin', name: 'SuperAdmin', component: () => import('../components/admin/SuperAdmin.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/hospital-management', name: 'HospitalManagement', component: () => import('../components/admin/HospitalManagement.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: '/api-management', name: 'APIManagement', component: () => import('../components/admin/APIManagement.vue'), meta: { requiresAuth: true, role: 'admin' } },
    ],
  },

  // 404页面
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../components/NotFound.vue')  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const role = to.meta.role;
  const token = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role'); // 获取存储的角色

  if (requiresAuth && !token) {
    // 需要认证但未登录
    next({ name: 'Login' });
  } else if (requiresAuth && role && storedRole !== role) {
    // 用户登录但角色不匹配
    next({ name: storedRole === 'doctor' ? 'DoctorDashboard' : 'AdminDashboard' });
  } else {
    // 已登录且角色匹配，或不需要认证
    next();
  }
});

export default router;
