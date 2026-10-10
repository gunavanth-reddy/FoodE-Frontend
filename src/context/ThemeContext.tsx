import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {LightColors, DarkColors} from '../theme/colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof LightColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType,
);

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(
        'APP_THEME',
      );

      if (
        savedTheme === 'light' ||
        savedTheme === 'dark'
      ) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const nextTheme =
        theme === 'light' ? 'dark' : 'light';

      setTheme(nextTheme);

      await AsyncStorage.setItem(
        'APP_THEME',
        nextTheme,
      );
    } catch (error) {
      console.log('Failed to save theme:', error);
    }
  };

  const colors =
    theme === 'light'
      ? LightColors
      : DarkColors;

  const value = useMemo(
    () => ({
      theme,
      colors,
      toggleTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () =>
  useContext(ThemeContext);
