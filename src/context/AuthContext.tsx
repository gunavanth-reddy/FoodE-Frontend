import React, {
  useCallback,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import {refreshSession} from '../api/auth';

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

const ACCESS_TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

const getAccessTokenExpiry = (accessToken: string): number | null => {
  try {
    const payload = accessToken.split('.')[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let decoded = '';
    let bitBuffer = 0;
    let bitCount = 0;
    for (const character of paddedBase64) {
      if (character === '=') {
        break;
      }
      const value = alphabet.indexOf(character);
      if (value < 0) {
        return null;
      }
      bitBuffer = (bitBuffer << 6) | value;
      bitCount += 6;
      if (bitCount >= 8) {
        bitCount -= 8;
        decoded += String.fromCharCode((bitBuffer >> bitCount) & 0xff);
      }
    }
    const claims = JSON.parse(decoded);
    return typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
};

const accessTokenNeedsRefresh = (accessToken: string): boolean => {
  const expiresAt = getAccessTokenExpiry(accessToken);
  return (
    expiresAt === null ||
    expiresAt <= Date.now() + ACCESS_TOKEN_REFRESH_WINDOW_MS
  );
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
    refreshToken?: string,
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
  const refreshInFlight = useRef<Promise<boolean> | null>(null);

  const refreshSavedSession = useCallback(async (): Promise<boolean> => {
    if (!token || !user || !accessTokenNeedsRefresh(token)) {
      return false;
    }
    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    const refreshTask = (async () => {
      try {
        const savedRefreshToken = await AsyncStorage.getItem('refreshToken');
        const session = await refreshSession(savedRefreshToken || token);
        const normalizedUser = normalizeUser(session.user);
        if (!session.token || !session.refreshToken || !normalizedUser) {
          return false;
        }

        await Promise.all([
          AsyncStorage.setItem('user', JSON.stringify(normalizedUser)),
          AsyncStorage.setItem('token', session.token),
          AsyncStorage.setItem('refreshToken', session.refreshToken),
        ]);
        setUser(normalizedUser);
        setToken(session.token);
        return true;
      } catch (error) {
        const status = (error as any)?.response?.status;
        if (status === 401 || status === 403) {
          await Promise.all([
            AsyncStorage.removeItem('user'),
            AsyncStorage.removeItem('token'),
            AsyncStorage.removeItem('refreshToken'),
          ]);
          setUser(null);
          setToken(null);
        }
        // Keep a saved session on transient network/server failures and retry later.
        return false;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = refreshTask;
    return refreshTask;
  }, [token, user]);

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
        const savedRefreshToken =
          await AsyncStorage.getItem('refreshToken');

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

            if (!accessTokenNeedsRefresh(savedToken)) {
              setUser(normalizedUser);
              setToken(savedToken);
            } else {
              try {
                // Refresh only when the access token is expired or close to
                // expiry. This also upgrades valid legacy access tokens.
                const session = await refreshSession(
                  savedRefreshToken || savedToken,
                );
                const refreshedUser = normalizeUser(session.user);
                if (!session.token || !session.refreshToken || !refreshedUser) {
                  throw new Error('Invalid refreshed session response.');
                }
                await Promise.all([
                  AsyncStorage.setItem('user', JSON.stringify(refreshedUser)),
                  AsyncStorage.setItem('token', session.token),
                  AsyncStorage.setItem('refreshToken', session.refreshToken),
                ]);
                setUser(refreshedUser);
                setToken(session.token);
              } catch (refreshError) {
                const status = (refreshError as any)?.response?.status;
                if (status === 401 || status === 403) {
                  await Promise.all([
                    AsyncStorage.removeItem('user'),
                    AsyncStorage.removeItem('token'),
                    AsyncStorage.removeItem('refreshToken'),
                  ]);
                  setUser(null);
                  setToken(null);
                } else {
                  // Stay signed in if the refresh service is temporarily offline.
                  setUser(normalizedUser);
                  setToken(savedToken);
                }
              }
            }
          } else {
            // Invalid role/session.
            // Do NOT fall back to customer.
            await Promise.all([
              AsyncStorage.removeItem('user'),
              AsyncStorage.removeItem('token'),
              AsyncStorage.removeItem('refreshToken'),
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
          AsyncStorage.removeItem('refreshToken'),
        ]);

        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Check periodically and when the app returns to the foreground, but only
  // contact /refresh when the access token is within five minutes of expiry.
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const interval = setInterval(() => {
      void refreshSavedSession();
    }, 15 * 60 * 1000);
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refreshSavedSession();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [refreshSavedSession, token, user]);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (
    loggedInUser: User,
    jwtToken: string,
    jwtRefreshToken?: string,
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
      if (jwtRefreshToken) {
        await AsyncStorage.setItem('refreshToken', jwtRefreshToken);
      } else {
        await AsyncStorage.removeItem('refreshToken');
      }

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
        AsyncStorage.removeItem('refreshToken'),
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
