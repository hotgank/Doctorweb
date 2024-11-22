import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  server: {
    host: '0.0.0.0', // 绑定到所有网络接口
    port: 5173,

    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的后端服务地址
        changeOrigin: true, // 修改请求头中的 Origin 字段
        rewrite: (path) => path.replace(/^\/api/, '') // 去掉 /api 前缀
      }
    }
  }
})
