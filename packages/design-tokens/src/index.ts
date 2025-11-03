/**
 * @n00plicate/design-tokens
 *
 * Design tokens generated from W3C DTCG compliant JSON using Style Dictionary.
 * Provides the single source of truth for all visual properties across the
 * n00plicate design system.
 *
 * @example
 * ```typescript
 * import { getToken, CommonTokens } from '@n00plicate/design-tokens';
 *
 * // Utility function access
 * const spacing = getToken('spacing.md');
 * const primaryColor = getToken(CommonTokens.PRIMARY_COLOR);
 * ```
 */

// Import source token files for fallback access
import baseTokens from '../tokens/base.json' with { type: 'json' };
import componentTokens from '../tokens/components.json' with { type: 'json' };
import mobileTokens from '../tokens/platforms/mobile.json' with { type: 'json' };
import webTokens from '../tokens/platforms/web.json' with { type: 'json' };
import semanticTokens from '../tokens/semantic.json' with { type: 'json' };

// Re-export token files for direct access
export { baseTokens, componentTokens, mobileTokens, semanticTokens, webTokens };

// Token type definitions
export interface TokenValue {
  $value: string;
  $type: string;
  $description?: string;
}

export interface TokenGroup {
  [key: string]: TokenValue | TokenGroup;
}

export interface DesignTokens {
  color: TokenGroup;
  spacing: TokenGroup;
  typography: TokenGroup;
  border: TokenGroup;
  shadow?: TokenGroup;
}

// Token validation utilities
export interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

type TokenSource = Record<string, unknown>;

type PlatformTarget = 'mobile' | 'web';

const baseTokenSources: TokenSource[] = [
  baseTokens as TokenSource,
  semanticTokens as TokenSource,
  componentTokens as TokenSource,
];

const parsePlatformPreference = (value: unknown): PlatformTarget | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (normalized === 'mobile') {
    return 'mobile';
  }

  if (normalized === 'web') {
    return 'web';
  }

  return undefined;
};

const detectPlatformTarget = (): PlatformTarget => {
  if (typeof process !== 'undefined') {
    const envPreference = parsePlatformPreference(process.env?.MIMIC_PLATFORM);
    if (envPreference) {
      return envPreference;
    }
  }

  const globalPreference = parsePlatformPreference((globalThis as { MIMIC_PLATFORM?: unknown }).MIMIC_PLATFORM);
  if (globalPreference) {
    return globalPreference;
  }

  const runtimeNavigator = (
    globalThis as {
      navigator?: { product?: string; userAgent?: string };
    }
  ).navigator;

  if (runtimeNavigator && typeof runtimeNavigator === 'object') {
    if (runtimeNavigator.product === 'ReactNative') {
      return 'mobile';
    }

    const userAgent = runtimeNavigator.userAgent?.toLowerCase();
    if (userAgent?.includes('reactnative')) {
      return 'mobile';
    }
  }

  return 'web';
};

const getPlatformTokenSources = (): TokenSource[] => {
  const platform = detectPlatformTarget();

  if (platform === 'mobile') {
    return [webTokens as TokenSource, mobileTokens as TokenSource];
  }

  return [mobileTokens as TokenSource, webTokens as TokenSource];
};

const getOrderedTokenSources = (): TokenSource[] => {
  return [...baseTokenSources, ...getPlatformTokenSources()];
};

/**
 * Try to find a token value in a token object
 */
const findTokenInSource = (path: string, tokens: TokenSource): string | null => {
  const parts = path.split('.');
  let current: unknown = tokens;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  // Extract the $value if it's a token object
  if (current && typeof current === 'object' && '$value' in current) {
    return String((current as { $value: unknown }).$value);
  }

  return typeof current === 'string' ? current : null;
};

/**
 * Safely access a token value using dot notation
 * @param path - Token path (e.g., 'color.primary.500')
 * @param fallback - Fallback value if token is not found
 * @returns Token value or fallback
 */
export const getToken = (path: string, fallback = ''): string => {
  try {
    // Try browser CSS variables first
    if (typeof window !== 'undefined') {
      const cssVarName = `--${path.replace(/\./g, '-')}`;
      const computedStyle = getComputedStyle(document.documentElement);
      const value = computedStyle.getPropertyValue(cssVarName).trim();
      if (value) return value;
    }

    const tokenSources = getOrderedTokenSources();

    for (let index = tokenSources.length - 1; index >= 0; index -= 1) {
      const tokens = tokenSources[index];
      const result = findTokenInSource(path, tokens);
      if (result !== null) {
        return result;
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
};

/**
 * Get all tokens matching a pattern
 * @param pattern - Glob-like pattern (e.g., 'color.primary.*')
 * @returns Array of matching tokens with their paths and values
 */
export const getTokensByPattern = (pattern: string): Array<{ path: string; value: string; type?: string }> => {
  const results: Array<{ path: string; value: string; type?: string }> = [];

  // Collect tokens from each source
  const tokenSources = getOrderedTokenSources();

  for (const tokens of tokenSources) {
    collectTokensFromSource(tokens, pattern, results);
  }

  return results;
};

/**
 * Collect tokens from a token source that match the pattern
 */
const collectTokensFromSource = (
  tokens: TokenSource,
  pattern: string,
  results: Array<{ path: string; value: string; type?: string }>,
  currentPath = ''
): void => {
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('$')) continue; // Skip metadata properties

    const newPath = currentPath ? `${currentPath}.${key}` : key;

    if (isTokenValue(value)) {
      addTokenIfMatches(newPath, value, pattern, results);
    } else if (value && typeof value === 'object') {
      // Continue traversing
      collectTokensFromSource(value as Record<string, unknown>, pattern, results, newPath);
    }
  }
};

/**
 * Check if a value is a token (has $value property)
 */
const isTokenValue = (value: unknown): value is { $value: unknown; $type?: unknown } => {
  return value !== null && typeof value === 'object' && '$value' in value;
};

/**
 * Add token to results if it matches the pattern
 */
const addTokenIfMatches = (
  path: string,
  tokenValue: { $value: unknown; $type?: unknown },
  pattern: string,
  results: Array<{ path: string; value: string; type?: string }>
): void => {
  if (matchesPattern(path, pattern)) {
    const entry = {
      path,
      value: String(tokenValue.$value),
      type: tokenValue.$type as string | undefined,
    };

    const existingIndex = results.findIndex((r) => r.path === path);

    if (existingIndex >= 0) {
      results[existingIndex] = entry;
    } else {
      results.push(entry);
    }
  }
};

/**
 * Simple pattern matching for token paths
 * @param path - Token path to test
 * @param pattern - Pattern with * wildcard support
 * @returns Whether the path matches the pattern
 */
export const matchesPattern = (path: string, pattern: string): boolean => {
  // Special case: single * should match everything
  if (pattern === '*') {
    return true;
  }

  const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
};

/**
 * Validate token structure and values
 * @param tokenObj - Token object to validate
 * @returns Validation result with errors and warnings
 */
export const validateTokens = (tokenObj?: Record<string, unknown>): TokenValidationResult => {
  const result: TokenValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!tokenObj || typeof tokenObj !== 'object') {
    result.errors.push('Tokens must be an object');
    result.isValid = false;
    return result;
  }

  const validateSingleToken = (tokenObject: Record<string, unknown>, path: string): void => {
    if (!tokenObject.$value && tokenObject.$value !== 0) {
      result.errors.push(`Token at "${path}" is missing $value`);
      result.isValid = false;
    }

    if (!tokenObject.$type) {
      result.warnings.push(`Token at "${path}" is missing $type`);
    }

    if (!tokenObject.$description) {
      result.warnings.push(`Token at "${path}" is missing $description`);
    }
  };

  const isTokenObject = (obj: Record<string, unknown>): boolean => '$value' in obj;

  const isGroupObject = (obj: Record<string, unknown>): boolean => {
    const dollarKeys = Object.keys(obj).filter((key) => key.startsWith('$'));
    // Groups can have $description and $type properties (for inheritance)
    // BUT if they have other $ properties or appear to be intended as tokens, they're not groups
    const validGroupKeys = ['$description', '$type'];
    const hasOnlyValidGroupKeys = dollarKeys.every((key) => validGroupKeys.includes(key));

    // If object has non-group $ properties or seems like an incomplete token, it's not a group
    if (!hasOnlyValidGroupKeys) return false;

    // If it has $ properties and seems like it should be a token (no sub-objects), it's invalid
    const hasSubObjects = Object.values(obj).some(
      (value) => value && typeof value === 'object' && !Array.isArray(value)
    );

    // Groups should contain other objects, tokens should not
    return dollarKeys.length === 0 || hasSubObjects;
  };

  const handleInvalidObject = (tokenObject: Record<string, unknown>, currentPath: string): void => {
    const dollarKeys = Object.keys(tokenObject).filter((key) => key.startsWith('$'));
    // If object has $ properties (indicating it's meant to be a token) but no $value, it's invalid
    if (dollarKeys.length > 0 && !isTokenObject(tokenObject)) {
      result.errors.push(`Object at "${currentPath}" has token properties but missing $value`);
      result.isValid = false;
    }
  };

  const traverseGroupObject = (tokenObject: Record<string, unknown>, currentPath: string): void => {
    for (const [key, value] of Object.entries(tokenObject)) {
      if (!key.startsWith('$')) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverseTokens(value, newPath);
      }
    }
  };

  const traverseTokens = (obj: unknown, currentPath = ''): void => {
    if (!obj || typeof obj !== 'object') return;

    const tokenObject = obj as Record<string, unknown>;

    if (isTokenObject(tokenObject)) {
      validateSingleToken(tokenObject, currentPath);
    } else if (isGroupObject(tokenObject)) {
      traverseGroupObject(tokenObject, currentPath);
    } else {
      handleInvalidObject(tokenObject, currentPath);
    }
  };

  traverseTokens(tokenObj);
  return result;
};

/**
 * Generate CSS custom properties from tokens
 * @param prefix - CSS custom property prefix (default: '--')
 * @returns CSS string with custom properties
 */
export const generateCSSVariables = (prefix = '--'): string => {
  const tokens = getTokensByPattern('*');
  const cssLines = [':root {'];

  tokens.forEach(({ path, value }) => {
    const cssName = path.replace(/\./g, '-');
    cssLines.push(`  ${prefix}${cssName}: ${value};`);
  });

  cssLines.push('}');
  return cssLines.join('\n');
};

/**
 * Token categories for type safety and organization
 */
export const TokenCategories = {
  COLOR: 'color',
  SPACING: 'spacing',
  TYPOGRAPHY: 'typography',
  BORDER: 'border',
  SHADOW: 'shadow',
} as const;

export type TokenCategory = (typeof TokenCategories)[keyof typeof TokenCategories];

/**
 * Common token paths for easy access
 */
export const CommonTokens = {
  // Colors
  PRIMARY_COLOR: 'color.primary.500',
  SECONDARY_COLOR: 'color.secondary.500',
  TEXT_PRIMARY: 'color.text.primary',
  TEXT_SECONDARY: 'color.text.secondary',
  BACKGROUND_PRIMARY: 'color.background.primary',

  // Typography
  FONT_FAMILY_PRIMARY: 'typography.fontFamily.primary',
  FONT_SIZE_BASE: 'typography.fontSize.base',
  FONT_WEIGHT_NORMAL: 'typography.fontWeight.normal',

  // Spacing
  SPACING_SMALL: 'spacing.sm',
  SPACING_MEDIUM: 'spacing.md',
  SPACING_LARGE: 'spacing.lg',

  // Border
  BORDER_RADIUS_MEDIUM: 'border.radius.md',
  BORDER_WIDTH_THIN: 'border.width.thin',
} as const;

export type CommonToken = (typeof CommonTokens)[keyof typeof CommonTokens];

// Placeholder tokens object - will be replaced with actual generated tokens
export const tokens: Partial<DesignTokens> = {};

// Default export for convenience
export default tokens;
