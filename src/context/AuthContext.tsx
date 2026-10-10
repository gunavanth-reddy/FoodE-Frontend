import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// USER ROLE
// =====================================================

export type UserRole =
  | 'user'
  | 'restaurant_owner'
  | 'admin';

// =====================================================
// USER TYPE
// =====================================================

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

// =====================================================
// PROFILE UPDATE TYPE
// =====================================================

export interface UpdateProfileData {
  name: string;
  phone: string;
}

// =====================================================
// NORMALIZE ROLE
// =====================================================

export const normalizeUserRole = (
  role: unknown,
): UserRole | null => {
  if (typeof role !== 'string') {
    return null;
  }

  const normalizedRole =
    role.trim().toLowerCase();

  if (normalizedRole === 'user') {
    return 'user';
  }

  if (
    normalizedRole === 'restaurant_owner' ||
    normalizedRole === 'restaurantowner'
  ) {
    return 'restaurant_owner';
  }

  if (normalizedRole === 'admin') {
    return 'admin';
  }

  return null;
};

// =====================================================
// NORMALIZE USER
// =====================================================

const normalizeUser = (
  rawUser: any,
): User | null => {
  if (!rawUser || !rawUser.id) {
    return null;
  }

  const role = normalizeUserRole(
    rawUser.role,
  );

  if (!role) {
    return null;
  }

  return {
    ...rawUser,
    role,
  };
};

// =====================================================
// AUTH CONTEXT TYPE
// =====================================================

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (
    user: User,
    token: string,
  ) => Promise<void>;

  logout: () => Promise<void>;

  updateProfile: (
    profileData: UpdateProfileData,
  ) => Promise<void>;
}

// =====================================================
// CONTEXT
// =====================================================

const AuthContext =
  createContext<AuthContextType | null>(null);

// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  // ===================================================
  // LOAD SAVED SESSION
  // ===================================================

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      try {
        const savedUser =
          await AsyncStorage.getItem('user');

        const savedToken =
          await AsyncStorage.getItem('token');

        if (savedUser && savedToken) {
          const parsedUser =
            JSON.parse(savedUser);

          const normalizedUser =
            normalizeUser(parsedUser);

          if (normalizedUser) {
            // Save normalized role
            await AsyncStorage.setItem(
              'user',
              JSON.stringify(normalizedUser),
            );

            setUser(normalizedUser);
            setToken(savedToken);
          } else {
            // Invalid role/session.
            // Do NOT fall back to customer.
            await Promise.all([
              AsyncStorage.removeItem('user'),
              AsyncStorage.removeItem('token'),
            ]);

            setUser(null);
            setToken(null);

            console.log(
              'Invalid saved user role. Session cleared.',
            );
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.log(
          'Load Auth Error:',
          error,
        );

        await Promise.all([
          AsyncStorage.removeItem('user'),
          AsyncStorage.removeItem('token'),
        ]);

        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (
    loggedInUser: User,
    jwtToken: string,
  ): Promise<void> => {
    try {
      const normalizedUser =
        normalizeUser(loggedInUser);

      if (!normalizedUser) {
        throw new Error(
          'Invalid user role received from server.',
        );
      }

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(normalizedUser),
      );

      await AsyncStorage.setItem(
        'token',
        jwtToken,
      );

      setUser(normalizedUser);
      setToken(jwtToken);

      console.log(
        'Login successful:',
        normalizedUser.role,
      );
    } catch (error) {
      console.log(
        'Login Error:',
        error,
      );

      throw error;
    }
  };

  // ===================================================
  // UPDATE PROFILE
  // ===================================================

  const updateProfile = async (
    profileData: UpdateProfileData,
  ): Promise<void> => {
    try {
      if (!user) {
        throw new Error(
          'User is not logged in.',
        );
      }

      const updatedUser: User = {
        ...user,
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
      };

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(updatedUser),
      );

      setUser(updatedUser);

      console.log(
        'Profile updated successfully',
      );
    } catch (error) {
      console.log(
        'Update Profile Error:',
        error,
      );

      throw error;
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('token'),
      ]);

      setUser(null);
      setToken(null);

      console.log(
        'User logged out successfully',
      );
    } catch (error) {
      console.log(
        'Logout Error:',
        error,
      );

      throw error;
    }
  };

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn:
          user !== null &&
          token !== null,

        user,
        token,
        loading,
        login,
        logout,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// USE AUTH
// =====================================================

export const useAuth =
  (): AuthContextType => {
    const context =
      useContext(AuthContext);

    if (!context) {
      throw new Error(
        'useAuth must be used within AuthProvider',
      );
    }

    return context;
  };