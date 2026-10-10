import axios from 'axios';

const api = axios.create({
  baseURL: 'https://foode-backend-vn67.onrender.com/api',

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
