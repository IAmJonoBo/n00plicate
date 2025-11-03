/**
 * Collision Prevention Test Suite
 *
 * Tests for all three critical collision-prevention strategies:
 * 1. Token-name clashes with Tailwind (Specify warning prevention)
 * 2. Storybook port conflicts (Supernova docs compliance)
 * 3. Metro duplication (Locofy FAQ compliance)
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import {
  validateCollisionPrevention,
  validateMetroDuplicationRisks,
  validateStorybookPortConflicts,
  validateTokenNameClashes,
} from '../collision-prevention.js';

const TEMP_DIR = resolve(__dirname, '__temp__');

describe('Collision Prevention Guards', () => {
  beforeEach(() => {
    // Clean up temp directory
    try {
      rmSync(TEMP_DIR, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
    mkdirSync(TEMP_DIR, { recursive: true });
  });

  describe('Token Name Clash Prevention (Specify Warning)', () => {
    it('should pass when all CSS tokens use ds- prefix', () => {
      const cssContent = `
        :root {
          --ds-color-primary-500: #3b82f6;
          --ds-spacing-medium: 16px;
          --ds-typography-heading-font-size: 24px;
        }

        .ds-button {
          background-color: var(--ds-color-primary-500);
          padding: var(--ds-spacing-medium);
        }
      `;

      const cssPath = resolve(TEMP_DIR, 'tokens.css');
      writeFileSync(cssPath, cssContent);

      const violations = validateTokenNameClashes(cssPath);
      expect(violations).toHaveLength(0);
    });

    it('should fail when CSS tokens lack ds- prefix', () => {
      const cssContent = `
        :root {
          --color-primary-500: #3b82f6;
          --ds-spacing-medium: 16px;
          --spacing-large: 24px;
        }

        .button {
          background-color: var(--color-primary-500);
        }

        .ds-card {
          padding: var(--ds-spacing-medium);
        }
      `;

      const cssPath = resolve(TEMP_DIR, 'tokens.css');
      writeFileSync(cssPath, cssContent);

      const violations = validateTokenNameClashes(cssPath);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some((v: string) => v.includes('--color-primary-500'))).toBe(true);
      expect(violations.some((v: string) => v.includes('--spacing-large'))).toBe(true);
      expect(violations.some((v: string) => v.includes('.button'))).toBe(true);
    });

    it('should handle malformed CSS gracefully', () => {
      const cssPath = resolve(TEMP_DIR, 'invalid.css');
      writeFileSync(cssPath, 'invalid css content {{{');

      const violations = validateTokenNameClashes(cssPath);
      // Should not throw, may have violations but should not crash
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Storybook Port Conflict Prevention (Supernova Docs)', () => {
    it('should pass when all Storybook configs use correct ports', () => {
      const webConfig = `
        const config = {
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 6006;
            return config;
          }
        };
      `;

      const mobileConfig = `
        const config = {
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 7007;
            return config;
          }
        };
      `;

      const desktopConfig = `
        const config = {
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 6008;
            return config;
          }
        };
      `;

      const webPath = resolve(TEMP_DIR, 'main.ts');
      const mobilePath = resolve(TEMP_DIR, 'main.mobile.ts');
      const desktopPath = resolve(TEMP_DIR, 'main.desktop.ts');

      writeFileSync(webPath, webConfig);
      writeFileSync(mobilePath, mobileConfig);
      writeFileSync(desktopPath, desktopConfig);

      const violations = validateStorybookPortConflicts([webPath, mobilePath, desktopPath]);
      expect(violations).toHaveLength(0);
    });

    it('should fail when ports conflict or are incorrect', () => {
      const configWithWrongPort = `
        const config = {
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 3000; // Wrong port
            return config;
          }
        };
      `;

      const configWithConflictingPort = `
        const config = {
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 6006; // Same as web
            return config;
          }
        };
      `;

      const webPath = resolve(TEMP_DIR, 'main.ts');
      const mobilePath = resolve(TEMP_DIR, 'main.mobile.ts');

      writeFileSync(webPath, configWithWrongPort);
      writeFileSync(mobilePath, configWithConflictingPort);

      const violations = validateStorybookPortConflicts([webPath, mobilePath]);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some((v: string) => v.includes('3000'))).toBe(true);
    });

    it('should validate composition reference ports', () => {
      const configWithInvalidRefs = `
        const config = {
          refs: {
            mobile: {
              url: 'http://localhost:3001',
            },
            desktop: {
              url: 'http://localhost:4000',
            }
          },
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 6006;
            return config;
          }
        };
      `;

      const webPath = resolve(TEMP_DIR, 'main.ts');
      writeFileSync(webPath, configWithInvalidRefs);

      const violations = validateStorybookPortConflicts([webPath]);
      expect(violations.some((v: string) => v.includes('3001') || v.includes('4000'))).toBe(true);
    });
  });

  describe('Metro Duplication Prevention (Locofy FAQ)', () => {
    it('should pass when Metro config has proper deduplication', () => {
      const metroConfig = `
        const config = {
          resolver: {
            dedupe: ['react', 'react-native', '@n00plicate/design-tokens'],
            alias: {
              '@n00plicate/design-tokens': './packages/design-tokens',
            },
            enableGlobalPackages: true,
          }
        };
      `;

      const packageJson1 = JSON.stringify({
        name: '@n00plicate/design-tokens',
        version: '1.0.0',
      });

      const packageJson2 = JSON.stringify({
        name: '@n00plicate/shared-utils',
        version: '1.0.0',
      });

      const metroPath = resolve(TEMP_DIR, 'metro.config.js');
      const pkg1Path = resolve(TEMP_DIR, 'package1.json');
      const pkg2Path = resolve(TEMP_DIR, 'package2.json');

      writeFileSync(metroPath, metroConfig);
      writeFileSync(pkg1Path, packageJson1);
      writeFileSync(pkg2Path, packageJson2);

      const violations = validateMetroDuplicationRisks(metroPath, [pkg1Path, pkg2Path]);
      expect(violations).toHaveLength(0);
    });

    it('should fail when Metro config lacks deduplication features', () => {
      const metroConfig = `
        const config = {
          resolver: {
            // Missing dedupe, alias, enableGlobalPackages
          }
        };
      `;

      const metroPath = resolve(TEMP_DIR, 'metro.config.js');
      writeFileSync(metroPath, metroConfig);

      const violations = validateMetroDuplicationRisks(metroPath, []);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some((v: string) => v.includes('dedupe'))).toBe(true);
      expect(violations.some((v: string) => v.includes('alias'))).toBe(true);
      expect(violations.some((v: string) => v.includes('enableGlobalPackages'))).toBe(true);
    });

    it('should fail when packages use unscoped names', () => {
      const metroConfig = `
        const config = {
          resolver: {
            dedupe: ['react'],
            alias: {},
            enableGlobalPackages: true,
          }
        };
      `;

      const unscopedPackage = JSON.stringify({
        name: 'design-tokens', // Should be @n00plicate/design-tokens
        version: '1.0.0',
      });

      const metroPath = resolve(TEMP_DIR, 'metro.config.js');
      const pkgPath = resolve(TEMP_DIR, 'package.json');

      writeFileSync(metroPath, metroConfig);
      writeFileSync(pkgPath, unscopedPackage);

      const violations = validateMetroDuplicationRisks(metroPath, [pkgPath]);
      expect(violations.some((v: string) => v.includes('@n00plicate/'))).toBe(true);
    });
  });

  describe('Comprehensive Collision Prevention Validation', () => {
    it('should run all validations and aggregate results', () => {
      // Create valid configurations
      const validCss = ':root { --ds-color-primary: #000; }';
      const validStorybookConfig = `
        const config = {
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 6006;
            return config;
          }
        };
      `;
      const validMetroConfig = `
        const config = {
          resolver: {
            dedupe: ['react'],
            alias: {},
            enableGlobalPackages: true,
          }
        };
      `;
      const validPackageJson = JSON.stringify({
        name: '@n00plicate/design-tokens',
        version: '1.0.0',
      });

      const cssPath = resolve(TEMP_DIR, 'tokens.css');
      const storybookPath = resolve(TEMP_DIR, 'main.ts');
      const metroPath = resolve(TEMP_DIR, 'metro.config.js');
      const packagePath = resolve(TEMP_DIR, 'package.json');

      writeFileSync(cssPath, validCss);
      writeFileSync(storybookPath, validStorybookConfig);
      writeFileSync(metroPath, validMetroConfig);
      writeFileSync(packagePath, validPackageJson);

      const report = validateCollisionPrevention({
        cssTokenPath: cssPath,
        storybookConfigPaths: [storybookPath],
        metroConfigPath: metroPath,
        packageJsonPaths: [packagePath],
      });

      expect(report.isValid).toBe(true);
      expect(report.tokenNameClashes).toHaveLength(0);
      expect(report.storybookPortConflicts).toHaveLength(0);
      expect(report.metroDuplicationRisks).toHaveLength(0);
    });

    it('should detect multiple types of violations', () => {
      // Create invalid configurations
      const invalidCss = ':root { --color-primary: #000; }'; // Missing ds- prefix
      const invalidStorybookConfig = `
        const config = {
          viteFinal: async config => {
            config.server = config.server || {};
            config.server.port = 3000; // Wrong port
            return config;
          }
        };
      `;
      const invalidMetroConfig = '{}'; // Missing everything
      const invalidPackageJson = JSON.stringify({
        name: 'design-tokens', // Unscoped
        version: '1.0.0',
      });

      const cssPath = resolve(TEMP_DIR, 'tokens.css');
      const storybookPath = resolve(TEMP_DIR, 'main.ts');
      const metroPath = resolve(TEMP_DIR, 'metro.config.js');
      const packagePath = resolve(TEMP_DIR, 'package.json');

      writeFileSync(cssPath, invalidCss);
      writeFileSync(storybookPath, invalidStorybookConfig);
      writeFileSync(metroPath, invalidMetroConfig);
      writeFileSync(packagePath, invalidPackageJson);

      const report = validateCollisionPrevention({
        cssTokenPath: cssPath,
        storybookConfigPaths: [storybookPath],
        metroConfigPath: metroPath,
        packageJsonPaths: [packagePath],
      });

      expect(report.isValid).toBe(false);
      expect(report.tokenNameClashes.length).toBeGreaterThan(0);
      expect(report.storybookPortConflicts.length).toBeGreaterThan(0);
      expect(report.metroDuplicationRisks.length).toBeGreaterThan(0);
    });
  });
});
