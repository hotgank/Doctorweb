import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import fs from 'fs';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  server: {
    host: '0.0.0.0', // 绑定到所有网络接口
    port: 5173, // 开发服务器的端口
    https: {
      key: fs.readFileSync('./cert/scs1733562700390_zeropw.cn_server.key'), // 私钥路径
      cert: fs.readFileSync('./cert/scs1733562700390_zeropw.cn_server.crt'), // 证书路径
      ca: fs.readFileSync('./cert/scs1733562700390_zeropw.cn_ca.crt'), // 可选：CA 证书路径
    },
    proxy: {
      '/api': {
        target: 'https://localhost:8081', // 后端 HTTPS 地址
        changeOrigin: true, // 修改请求头中的 Origin 字段
        secure: false, // 忽略后端自签名证书的验证
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀
      }
    }
  }
});
