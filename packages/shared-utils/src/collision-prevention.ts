/**
 * Runtime Collision Prevention Guards
 *
 * This module provides runtime validation for the three critical collision-prevention
 * strategies documented in the n00plicate design token pipeline:
 *
 * 1. Token-name clashes with Tailwind (Specify warning prevention)
 * 2. Storybook port conflicts (Supernova docs compliance)
 * 3. Metro duplication (Locofy FAQ compliance)
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface CollisionReport {
  tokenNameClashes: string[];
  storybookPortConflicts: string[];
  metroDuplicationRisks: string[];
  isValid: boolean;
}

/**
 * Validates that all CSS tokens use the ds- prefix to prevent Tailwind conflicts
 * as documented in Specify warnings
 */
export function validateTokenNameClashes(cssFilePath: string): string[] {
  const violations: string[] = [];

  try {
    const cssContent = readFileSync(cssFilePath, 'utf-8');
    const lines = cssContent.split('\n');

    lines.forEach((line, index) => {
      const propertyMatches = line.match(/--[a-z0-9-]+/gi);
      propertyMatches?.forEach((propertyName) => {
        if (!propertyName.toLowerCase().startsWith('--ds-')) {
          violations.push(`Line ${index + 1}: "${propertyName}" should use --ds- prefix (Specify warning prevention)`);
        }
      });

      // Check for class names that might conflict with Tailwind
      const classMatch = line.match(/(\.((?!ds-)[a-z-]+))\s*{/);
      if (classMatch) {
        violations.push(
          `Line ${index + 1}: Class "${classMatch[1]}" should use ds- prefix to prevent Tailwind conflicts`
        );
      }
    });
  } catch (error) {
    violations.push(`Failed to read CSS file: ${error}`);
  }

  return violations;
}

/**
 * Validates Storybook port configurations to prevent conflicts
 * as documented in Supernova docs
 */
export function validateStorybookPortConflicts(storybookConfigPaths: string[]): string[] {
  const violations: string[] = [];
  const usedPorts = new Set<number>();
  const requiredPorts = {
    'main.ts': 6006, // Web Storybook
    'main.mobile.ts': 7007, // Mobile Storybook
    'main.desktop.ts': 6008, // Desktop Storybook
  };

  storybookConfigPaths.forEach((configPath) => {
    try {
      const configContent = readFileSync(configPath, 'utf-8');
      const configName = configPath.split('/').pop() || '';

      // Extract port configuration
      const portMatch = configContent.match(/config\.server\.port\s*=\s*(\d+)/);
      if (portMatch) {
        const port = Number.parseInt(portMatch[1], 10);

        // Check if port is the required one for this config
        if (requiredPorts[configName as keyof typeof requiredPorts] !== port) {
          violations.push(
            `${configName}: Port ${port} doesn't match Supernova requirement (should be ${requiredPorts[configName as keyof typeof requiredPorts]})`
          );
        }

        // Check for port conflicts
        if (usedPorts.has(port)) {
          violations.push(
            `${configName}: Port ${port} conflicts with another Storybook instance (Supernova violation)`
          );
        }
        usedPorts.add(port);
      } else {
        violations.push(`${configName}: No explicit port configuration found (Supernova docs require fixed ports)`);
      }

      // Validate composition references use correct ports
      const refsMatch = configContent.match(/refs:\s*{([^}]+)}/s);
      if (refsMatch) {
        const refsContent = refsMatch[1];
        const urlMatches = refsContent.match(/url:\s*['"]http:\/\/localhost:(\d+)['"]/g);
        urlMatches?.forEach((urlMatch) => {
          const portMatch = urlMatch.match(/localhost:(\d+)/);
          if (portMatch) {
            const refPort = Number.parseInt(portMatch[1], 10);
            const validRefPorts = [6006, 7007, 6008];
            if (!validRefPorts.includes(refPort)) {
              violations.push(
                `${configName}: Composition reference uses invalid port ${refPort} (should be 6006, 7007, or 6008)`
              );
            }
          }
        });
      }
    } catch (error) {
      violations.push(`Failed to read Storybook config ${configPath}: ${error}`);
    }
  });

  return violations;
}

/**
 * Validates Metro configuration to prevent package duplication
 * as documented in Locofy FAQ
 */
export function validateMetroDuplicationRisks(metroConfigPath: string, packageJsonPaths: string[]): string[] {
  const violations: string[] = [];

  try {
    const metroContent = readFileSync(metroConfigPath, 'utf-8');

    // Check for deduplication configuration
    if (!/\bdedupe\s*:/u.test(metroContent)) {
      violations.push('Metro config missing dedupe configuration (Locofy FAQ requirement)');
    }

    // Check for alias configuration
    if (!/\balias\s*:/u.test(metroContent)) {
      violations.push('Metro config missing alias configuration (Locofy FAQ requirement)');
    }

    // Validate scoped package names in package.json files
    packageJsonPaths.forEach((packagePath) => {
      try {
        const packageContent = readFileSync(packagePath, 'utf-8');
        const packageJson = JSON.parse(packageContent);

        if (packageJson.name && !packageJson.name.startsWith('@n00plicate/')) {
          violations.push(
            `${packagePath}: Package name "${packageJson.name}" should use @n00plicate/ scope (Locofy FAQ compliance)`
          );
        }
      } catch (error) {
        violations.push(`Failed to parse package.json ${packagePath}: ${error}`);
      }
    });

    // Check for enableGlobalPackages setting
    if (!/\benableGlobalPackages\s*:/u.test(metroContent)) {
      violations.push('Metro config missing enableGlobalPackages setting (Locofy FAQ best practice)');
    }
  } catch (error) {
    violations.push(`Failed to read Metro config: ${error}`);
  }

  return violations;
}

/**
 * Runs comprehensive collision prevention validation
 */
export function validateCollisionPrevention(options: {
  cssTokenPath: string;
  storybookConfigPaths: string[];
  metroConfigPath: string;
  packageJsonPaths: string[];
}): CollisionReport {
  const tokenNameClashes = validateTokenNameClashes(options.cssTokenPath);
  const storybookPortConflicts = validateStorybookPortConflicts(options.storybookConfigPaths);
  const metroDuplicationRisks = validateMetroDuplicationRisks(options.metroConfigPath, options.packageJsonPaths);

  const isValid =
    tokenNameClashes.length === 0 && storybookPortConflicts.length === 0 && metroDuplicationRisks.length === 0;

  return {
    tokenNameClashes,
    storybookPortConflicts,
    metroDuplicationRisks,
    isValid,
  };
}

/**
 * CLI utility for running collision prevention checks
 */
export function runCollisionCheck(): void {
  const workspaceRoot = process.cwd();

  const report = validateCollisionPrevention({
    cssTokenPath: resolve(workspaceRoot, 'packages/design-tokens/libs/tokens/css/tokens.css'),
    storybookConfigPaths: [
      resolve(workspaceRoot, 'packages/design-system/.storybook/main.ts'),
      resolve(workspaceRoot, 'packages/design-system/.storybook/main.mobile.ts'),
      resolve(workspaceRoot, 'packages/design-system/.storybook/main.desktop.ts'),
    ],
    metroConfigPath: resolve(workspaceRoot, 'metro.config.js'),
    packageJsonPaths: [
      resolve(workspaceRoot, 'packages/design-tokens/package.json'),
      resolve(workspaceRoot, 'packages/shared-utils/package.json'),
      resolve(workspaceRoot, 'packages/design-system/package.json'),
    ],
  });

  // eslint-disable-next-line no-console
  console.log('\n🔍 Collision Prevention Validation Report\n');

  // Report token name clashes (Specify warnings)
  if (report.tokenNameClashes.length > 0) {
    // eslint-disable-next-line no-console
    console.log('❌ Token Name Clashes (Specify Warning Prevention):');

    report.tokenNameClashes.forEach((clash) => {
      console.warn(`   • ${clash}`);
    });
    // eslint-disable-next-line no-console
    console.log('');
  } else {
    // eslint-disable-next-line no-console
    console.log('✅ Token Name Clashes (Specify Warning Prevention): PASSED');
  }

  // Report Storybook port conflicts (Supernova docs)
  if (report.storybookPortConflicts.length > 0) {
    // eslint-disable-next-line no-console
    console.log('❌ Storybook Port Conflicts (Supernova Docs Compliance):');

    report.storybookPortConflicts.forEach((conflict) => {
      console.warn(`   • ${conflict}`);
    });
    // eslint-disable-next-line no-console
    console.log('');
  } else {
    // eslint-disable-next-line no-console
    console.log('✅ Storybook Port Conflicts (Supernova Docs Compliance): PASSED');
  }

  // Report Metro duplication risks (Locofy FAQ)
  if (report.metroDuplicationRisks.length > 0) {
    // eslint-disable-next-line no-console
    console.log('❌ Metro Duplication Risks (Locofy FAQ Compliance):');

    report.metroDuplicationRisks.forEach((risk) => {
      console.warn(`   • ${risk}`);
    });
    // eslint-disable-next-line no-console
    console.log('');
  } else {
    // eslint-disable-next-line no-console
    console.log('✅ Metro Duplication Risks (Locofy FAQ Compliance): PASSED');
  }

  // eslint-disable-next-line no-console
  console.log(`\n🎯 Overall Status: ${report.isValid ? '✅ PASSED' : '❌ FAILED'}\n`);

  if (!report.isValid) {
    process.exit(1);
  }
}

// Run CLI check if this module is executed directly
if (require.main === module) {
  runCollisionCheck();
}
