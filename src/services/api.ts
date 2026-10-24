import axios from 'axios';
import {GENERIC_ERROR_MESSAGE, getUserFacingErrorMessage} from '../utils/errorMessages';

const api = axios.create({
  baseURL: 'http://10.0.2.2:3000',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
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
