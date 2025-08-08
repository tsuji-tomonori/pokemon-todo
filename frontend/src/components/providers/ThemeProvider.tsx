import React, { useEffect } from 'react';
import { initializeTheme } from '../../utils/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider component that initializes theme on mount
 * This ensures the theme is applied before any components render
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize theme immediately when the provider mounts
    initializeTheme();
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;