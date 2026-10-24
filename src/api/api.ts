import axios from 'axios';
import API_BASE_URL from '../config/api';
import {GENERIC_ERROR_MESSAGE, getUserFacingErrorMessage} from '../utils/errorMessages';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status >= 500) {
      error.response.data = {
        ...(typeof error.response.data === 'object' && error.response.data
          ? error.response.data
          : {}),
        success: false,
        message: GENERIC_ERROR_MESSAGE,
      };
    } else if (!error?.response) {
      error.message = getUserFacingErrorMessage(error);
    }
    return Promise.reject(error);
  },
);

export default api;
