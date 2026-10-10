import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export const addToCart = async (foodId: string) => {
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    throw new Error('Please log in again');
  }

  const response = await axios.post(
    `${API_BASE_URL}/cart/add`,
    {
      foodId,
      quantity: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
