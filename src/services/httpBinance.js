import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 10000,
});

export default http;

