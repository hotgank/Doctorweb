import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.css';
import App from './App.vue'
import router from './router'
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

library.add(faArrowLeft, faArrowRight);

const app = createApp(App)
app.use(ElementPlus, {
    locale: zhCn,
});
app.use(router)
app.use(store)
app.mount('#app')