import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || 'https://data-api.binance.vision/api/v3',
  timeout: 10000,
});

export default http;

