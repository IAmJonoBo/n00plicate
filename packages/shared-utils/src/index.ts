// Shared utilities for the n00plicate design system

// Runtime collision detection and guard-rails
import RuntimeGuards, { runtimeGuards } from './runtime-guards.js';

/**
 * Utility functions for design token manipulation
 */
export const tokenUtils = {
  /**
   * Convert a token path to CSS custom property format
   * @param path - Token path like 'color.primary.500'
   * @returns CSS custom property like '--ds-color-primary-500'
   */
  toCssVar: (path: string): string => {
    return `--ds-${path.replace(/\./g, '-')}`;
  },

  /**
   * Get a token value from a nested object using dot notation
   * @param tokens - Token object
   * @param path - Dot notation path
   * @returns Token value or undefined
   */
  getTokenValue: (tokens: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce((obj: unknown, key) => {
      if (obj && typeof obj === 'object' && key in obj) {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, tokens);
  },
};

/**
 * Type utilities for better TypeScript support
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type TokenPath<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object ? `${string & K}.${TokenPath<T[K]>}` : string & K;
    }[keyof T]
  : never;

/**
 * Platform detection utilities
 */
export const platformUtils = {
  isWeb: (): boolean => typeof window !== 'undefined',
  isNode: (): boolean => {
    try {
      return (
        typeof globalThis !== 'undefined' &&
        'process' in globalThis &&
        typeof (globalThis as { process?: { versions?: { node?: string } } }).process?.versions?.node !== 'undefined'
      );
    } catch {
      return false;
    }
  },
  isMobile: (): boolean => {
    try {
      return (
        typeof globalThis !== 'undefined' &&
        'navigator' in globalThis &&
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          (globalThis as { navigator?: { userAgent?: string } }).navigator?.userAgent ?? ''
        )
      );
    } catch {
      return false;
    }
  },
};

/**
 * Common validation utilities
 */
export const validationUtils = {
  isValidColor: (color: string): boolean => {
    const colorRegex = /^(#[0-9A-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/i;
    return colorRegex.test(color);
  },

  isValidSpacing: (spacing: string): boolean => {
    const spacingRegex = /^(\d+(\.\d+)?(px|rem|em|vh|vw|%))$/;
    return spacingRegex.test(spacing);
  },
};

export default {
  tokenUtils,
  platformUtils,
  validationUtils,
  RuntimeGuards,
  runtimeGuards,
};

// Runtime collision detection and guard-rails
export { default as RuntimeGuards, runtimeGuards } from './runtime-guards.js';
