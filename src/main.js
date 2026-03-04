import { createApp } from 'vue'

import App from './App.vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/scss/main.scss';

import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App)

app.use(createPinia());
app.use(router);
app.use(VueApexCharts)
app.mount('#app');
