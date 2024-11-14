// src/axios/index.js
import axios from 'axios';

// 创建 Axios 实例
const axiosInstance = axios.create({
  baseURL: '/api',
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从本地存储中获取 token
    const token = localStorage.getItem('token');
    
    // 如果 token 存在，则设置 Authorization 请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

export default axiosInstance;