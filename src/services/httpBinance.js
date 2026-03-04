import axios from 'axios';

const http = axios.create({
  baseURL: 'https://api.binance.com/api/v3',
  timeout: 10000,
});

export default http;

