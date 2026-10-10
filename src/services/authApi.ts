
import api from './api';
import { User, LoginRequest, SignupRequest } from '../types/User';

/**
 * Register a New User
 */
export const registerUser = async (
  user: SignupRequest
): Promise<User> => {
  try {
    const response = await api.post<User>('/users', user);

    return response.data;
  } catch (error) {
    console.log('Register Error:', error);
    throw error;
  }
};

/**
 * Login User
 */
export const loginUser = async (
  data: LoginRequest
): Promise<User | null> => {
  try {
    const response = await api.get<User[]>('/users', {
      params: {
        email: data.email,
        password: data.password,
      },
    });

    if (response.data.length > 0) {
      return response.data[0];
    }

    return null;
  } catch (error) {
    console.log('Login Error:', error);
    throw error;
  }
};

/**
 * Check if Email Already Exists
 */
export const checkEmailExists = async (
  email: string
): Promise<boolean> => {
  try {
    const response = await api.get<User[]>('/users', {
      params: {
        email,
      },
    });

    return response.data.length > 0;
  } catch (error) {
    console.log('Email Check Error:', error);
    throw error;
  }
};

/**
 * Get User By ID
 */
export const getUserById = async (
  id: number
): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/users/${id}`);

    return response.data;
  } catch (error) {
    console.log('Get User Error:', error);
    return null;
  }
};

/**
 * Update User
 */
export const updateUser = async (
  id: number,
  user: User
): Promise<User> => {
  try {
    const response = await api.put<User>(
      `/users/${id}`,
      user
    );

    return response.data;
  } catch (error) {
    console.log('Update Error:', error);
    throw error;
  }
};

/**
 * Delete User
 */
export const deleteUser = async (
  id: number
): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.log('Delete Error:', error);
    throw error;
  }
};
