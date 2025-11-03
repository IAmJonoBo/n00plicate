import { CommonTokens, getToken, getTokensByPattern } from '@n00plicate/design-tokens/sdk';
import { tokenUtils, validationUtils } from '@n00plicate/shared-utils';

export type TokenExpectation = 'color' | 'spacing' | 'string';

export interface TokenRequest {
  path: string;
  expectation?: TokenExpectation;
  fallback?: string;
}

export interface ResolvedToken {
  path: string;
  value: string;
  expectation?: TokenExpectation;
  cssVariable: string;
  cssVarReference: string;
  isFallback: boolean;
}

export type TokenBundle<TBlueprint extends Record<string, TokenRequest>> = {
  [Key in keyof TBlueprint]: ResolvedToken;
};

/**
 * Resolve a single token path into a value plus CSS references. The implementation
 * runs the path through @n00plicate/design-tokens and validates the resulting value
 * using @n00plicate/shared-utils to ensure design-time regressions are caught in tests.
 */
export const resolveToken = ({ path, expectation, fallback = '' }: TokenRequest): ResolvedToken => {
  const rawValue = getToken(path, fallback);
  const isFallback = rawValue === fallback;
  const trimmedValue = rawValue.trim();
  const isAliasReference = /^\{.+\}$/.test(trimmedValue);

  if (!isFallback) {
    if (expectation === 'color' && !validationUtils.isValidColor(trimmedValue) && !isAliasReference) {
      throw new Error(`Token at path "${path}" is expected to be a color but resolved to "${rawValue}".`);
    }

    if (expectation === 'spacing' && !validationUtils.isValidSpacing(trimmedValue) && !isAliasReference) {
      throw new Error(`Token at path "${path}" is expected to be spacing but resolved to "${rawValue}".`);
    }
  }

  const cssVariable = tokenUtils.toCssVar(path);

  return {
    path,
    value: rawValue,
    expectation,
    cssVariable,
    cssVarReference: `var(${cssVariable})`,
    isFallback,
  };
};

/**
 * Given a blueprint of token requests, resolve them to concrete values.
 */
export const resolveTokenBundle = <TBlueprint extends Record<string, TokenRequest>>(
  blueprint: TBlueprint
): TokenBundle<TBlueprint> => {
  const entries = Object.entries(blueprint).map(([key, request]) => {
    return [key, resolveToken(request)] as const;
  });

  return Object.fromEntries(entries) as TokenBundle<TBlueprint>;
};

export type ComponentTokenBlueprint = Record<string, TokenRequest>;

export const componentTokenBlueprints = {
  button: {
    background: { path: CommonTokens.PRIMARY_COLOR, expectation: 'color' },
    foreground: { path: CommonTokens.TEXT_PRIMARY, expectation: 'color' },
    borderRadius: { path: 'border.radius.md', expectation: 'spacing' },
    borderWidth: { path: 'border.width.thin', expectation: 'spacing' },
    paddingX: { path: CommonTokens.SPACING_MEDIUM, expectation: 'spacing' },
    paddingY: { path: CommonTokens.SPACING_SMALL, expectation: 'spacing' },
  },
} satisfies Record<string, ComponentTokenBlueprint>;

export type ComponentTokenBlueprints = typeof componentTokenBlueprints;

export type ComponentTokenName = keyof ComponentTokenBlueprints;

export const buttonTokenBlueprint = componentTokenBlueprints.button;

export type ButtonTokenBundle = TokenBundle<typeof buttonTokenBlueprint>;

export const getButtonTokenBundle = (): ButtonTokenBundle => {
  return resolveTokenBundle(buttonTokenBlueprint);
};

/**
 * Resolve a named component blueprint.
 */
export const getComponentTokenBundle = (componentName: ComponentTokenName): TokenBundle<ComponentTokenBlueprint> => {
  const blueprint = componentTokenBlueprints[componentName];

  if (!blueprint) {
    throw new Error(`Unknown component token blueprint: ${String(componentName)}`);
  }

  return resolveTokenBundle(blueprint);
};

/**
 * Utility for extracting a snapshot of tokens that match a given pattern.
 * Useful for integration tests that need to ensure cross-package availability
 * of design-token exports.
 */
export const snapshotTokens = (pattern: string): Array<{ path: string; value: string; type?: string }> => {
  return getTokensByPattern(pattern);
};

export { CommonTokens, tokenUtils };
