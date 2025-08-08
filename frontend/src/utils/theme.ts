/**
 * Theme utilities for dark mode management
 */

export const THEME_KEY = 'pokemon-todo-theme';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Get the current system preference
 */
export function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

/**
 * Get the stored theme preference or default to system
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem(THEME_KEY) as Theme;
  return stored || 'system';
}

/**
 * Apply theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const isDark = theme === 'dark' || (theme === 'system' && getSystemPreference() === 'dark');
  
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Save theme preference
 */
export function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Initialize theme on app start
 */
export function initializeTheme(): void {
  const theme = getStoredTheme();
  applyTheme(theme);
}

/**
 * Listen for system theme changes
 */
export function listenToSystemTheme(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  // Use the newer addEventListener if available, fallback to addListener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  } else {
    // @ts-ignore - fallback for older browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
}