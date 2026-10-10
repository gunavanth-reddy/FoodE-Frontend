import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User';

const USER_KEY = 'FOODE_USER';

/**
 * Save Logged In User
 */
export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.log('Save User Error:', error);
    throw error;
  }
};

/**
 * Get Logged In User
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as User;
  } catch (error) {
    console.log('Get User Error:', error);
    return null;
  }
};

/**
 * Check Login Status
 */
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);

    return data !== null;
  } catch (error) {
    console.log('Login Check Error:', error);
    return false;
  }
};

/**
 * Logout User
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.log('Logout Error:', error);
    throw error;
  }
};

/**
 * Clear Storage
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log('Clear Storage Error:', error);
    throw error;
  }
};
