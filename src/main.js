import { createApp } from 'vue'

import App from './App.vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/icons/style.css'

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/scss/main.scss';

const app = createApp(App)
app.use(ElementPlus)

app.use(createPinia());
app.use(router);
app.mount('#app');
