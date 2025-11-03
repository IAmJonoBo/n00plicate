/**
 * Integration coverage to ensure design-system bridges shared utilities
 * through tokens-core into design tokens.
 */
import { buttonTokenBlueprint, CommonTokens, snapshotTokens, tokenUtils } from '@n00plicate/tokens-core';
import { describe, expect, it } from 'vitest';

import { getButtonStyles, getButtonTokenBundle } from '../index.js';

describe('design-system ↔︎ tokens-core integration', () => {
  it('resolves button blueprint through tokens-core', () => {
    const bundle = getButtonTokenBundle();

    expect(Object.keys(bundle)).toEqual(Object.keys(buttonTokenBlueprint));

    const [primaryColor] = snapshotTokens(CommonTokens.PRIMARY_COLOR);
    expect(bundle.background.value).toBe(primaryColor?.value);
    expect(bundle.background.cssVarReference).toBe(`var(${tokenUtils.toCssVar(CommonTokens.PRIMARY_COLOR)})`);

    const [spacingMedium] = snapshotTokens(CommonTokens.SPACING_MEDIUM);
    expect(bundle.paddingX.value).toBe(spacingMedium?.value);

    const [spacingSmall] = snapshotTokens(CommonTokens.SPACING_SMALL);
    expect(bundle.paddingY.value).toBe(spacingSmall?.value);

    const [borderRadius] = snapshotTokens('border.radius.md');
    expect(bundle.borderRadius.value).toBe(borderRadius?.value);
  });

  it('maps resolved tokens into component style config', () => {
    const styles = getButtonStyles();
    const bundle = styles.tokens;

    expect(styles.backgroundColor).toBe(bundle.background.cssVarReference);
    expect(styles.color).toBe(bundle.foreground.cssVarReference);
    expect(styles.padding).toBe(`${bundle.paddingY.value} ${bundle.paddingX.value}`);
    expect(styles.borderRadius).toBe(bundle.borderRadius.value);
    expect(styles.borderWidth).toBe(bundle.borderWidth.value);
  });
});
