/**
 * Theme Provider for n00plicate Mobile App
 *
 * Provides design tokens and theme context for React Native components
 * with collision-prevention architecture and proper namespace prefixing.
 */

// Import design tokens with collision-safe paths
import * as tokens from '@n00plicate/design-tokens/react-native';
import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName, useColorScheme } from 'react-native';

interface ThemeContextType {
  theme: 'light' | 'dark';
  tokens: typeof tokens;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = PropsWithChildren;

const resolveSystemTheme = (scheme: ColorSchemeName | null | undefined): 'light' | 'dark' => {
  if (scheme === 'dark') {
    return 'dark';
  }

  return 'light';
};

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');

  const theme: 'light' | 'dark' = userTheme === 'system' ? resolveSystemTheme(systemColorScheme) : userTheme;

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: _colorScheme }) => {
      if (userTheme === 'system') {
        // Theme will update automatically via systemColorScheme
      }
    });

    return () => subscription?.remove();
  }, [userTheme]);

  const contextValue: ThemeContextType = {
    theme,
    tokens,
    setTheme: setUserTheme,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook for accessing design tokens with proper namespace
 * Provides collision-safe token access with fallback values
 */
export const useTokens = () => {
  const { tokens } = useTheme();

  const getToken = (tokenPath: string, fallback?: string | number): string | number | undefined => {
    const keys = tokenPath.split('.');
    let value: unknown = tokens;

    for (const key of keys) {
      if (value !== null && typeof value === 'object' && key in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return fallback;
      }
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    return fallback;
  };

  return {
    tokens,
    getToken,
  };
};
