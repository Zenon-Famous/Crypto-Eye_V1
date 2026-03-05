import { createApp } from 'vue'

import App from './App.vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/scss/main.scss';

const app = createApp(App)

app.use(createPinia());
app.use(router);
app.mount('#app');
