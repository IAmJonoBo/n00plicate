#!/usr/bin/env node

/**
 * Token Contract Validation CLI
 *
 * Validates that the entire n00plicate design token pipeline follows the formal contract rules.
 * This script should be run before any token export or deployment.
 *
 * Usage:
 *   node scripts/validate-token-contract.js
 *   pnpm run validate:token-contract
 */

const { resolve } = require('node:path');
const { existsSync } = require('node:fs');

// Import the validation function from shared-utils
const { validateTokenContract } = require('../packages/shared-utils/dist/token-contract-validation.js');

function main() {
  console.log('🔍 n00plicate Token Contract Validation\n');
  console.log('Validating formal contract compliance for collision-free tokens...\n');

  const workspaceRoot = process.cwd();
  const tokensPath = resolve(workspaceRoot, 'tokens.json');

  // Check if tokens.json exists
  if (!existsSync(tokensPath)) {
    console.log('❌ tokens.json not found in workspace root');
    console.log('Expected path:', tokensPath);
    console.log('\nTo fix this:');
    console.log('1. Export tokens from Penpot using CLI: pnpm dlx penpot-export --file <FILE_UUID> --out tokens.json');
    console.log('2. Or use Penpot UI: Tokens ▶ Export button');
    process.exit(1);
  }

  // Run comprehensive validation
  console.log('📋 Running Contract Validations:\n');

  try {
    const validation = validateTokenContract(tokensPath, workspaceRoot);

    // Report individual check results
    const checks = [
      {
        name: '1. Prefix Compliance',
        description: 'All semantic tokens use ds- prefix',
        status: validation.prefixCompliance,
      },
      {
        name: '2. Naming Compliance',
        description: 'All tokens use kebab-case (no spaces/slashes/capitals)',
        status: validation.namingCompliance,
      },
      {
        name: '3. Structure Compliance',
        description: 'DTCG hierarchy maintained (global → alias → semantic)',
        status: validation.structureCompliance,
      },
      {
        name: '4. Type Compliance',
        description: 'Colors are 6-digit hex, dimensions are unitless',
        status: validation.typeCompliance,
      },
      {
        name: '5. Platform Outputs',
        description: 'All platform-scoped outputs generated correctly',
        status: validation.platformOutputs,
      },
      {
        name: '6. Storybook Isolation',
        description: 'Port isolation configured (Qwik: 6006, RN: 7007)',
        status: validation.storybookPorts,
      },
    ];

    checks.forEach(({ name, description, status }) => {
      const icon = status ? '✅' : '❌';
      console.log(`${icon} ${name}`);
      console.log(`   ${description}`);
      if (!status) {
        console.log('');
      }
    });

    console.log('');

    // Report violations
    if (validation.violations.length > 0) {
      console.log('🚫 Contract Violations Found:\n');
      validation.violations.forEach((violation, index) => {
        console.log(`   ${index + 1}. ${violation}`);
      });
      console.log('');
    }

    // Report warnings
    if (validation.warnings.length > 0) {
      console.log('⚠️  Warnings:\n');
      validation.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
      console.log('');
    }

    // Overall status
    const allPassed =
      validation.prefixCompliance &&
      validation.namingCompliance &&
      validation.structureCompliance &&
      validation.typeCompliance &&
      validation.platformOutputs &&
      validation.storybookPorts;

    if (allPassed) {
      console.log('🎉 TOKEN CONTRACT VALIDATION: PASSED\n');
      console.log('✨ Your tokens are ready for collision-free consumption!');
      console.log('✨ All platforms (Qwik, React Native, Compose MP, Tauri 2, Storybook) will work seamlessly.');
      console.log('✨ Pipeline is stable and ready for deployment.\n');

      // Show next steps
      console.log('📝 Next Steps:');
      console.log('   1. Run: pnpm build:tokens');
      console.log('   2. Run: pnpm lint (check module boundaries)');
      console.log('   3. Run: pnpm test:storybook (verify builders)');
      console.log('   4. Commit and push changes');
      console.log('');
    } else {
      console.log('❌ TOKEN CONTRACT VALIDATION: FAILED\n');
      console.log('Please fix the violations above before proceeding.');
      console.log('The contract ensures collision-free operation across all platforms.\n');

      // Show fix guidance
      console.log('🔧 Quick Fixes:');
      if (!validation.prefixCompliance) {
        console.log('   • Add "ds-" prefix to all semantic tokens in Penpot');
      }
      if (!validation.namingCompliance) {
        console.log('   • Use kebab-case naming (lowercase-with-hyphens)');
      }
      if (!validation.structureCompliance) {
        console.log('   • Organize tokens: global → alias → semantic hierarchy');
      }
      if (!validation.typeCompliance) {
        console.log('   • Use 6-digit hex colors (#RRGGBB), unitless dimensions');
      }
      if (!validation.platformOutputs) {
        console.log('   • Run: pnpm build:tokens');
      }
      if (!validation.storybookPorts) {
        console.log('   • Configure Storybook ports: Qwik (6006), React Native (7007)');
      }
      console.log('');

      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Validation Error:', error.message);
    console.log('\nThis might indicate:');
    console.log('• Invalid JSON in tokens.json');
    console.log('• Missing shared-utils package');
    console.log('• Corrupted token structure');
    console.log('');
    process.exit(1);
  }
}

// Show header
console.log('━'.repeat(60));
console.log('  MIMIC DESIGN TOKEN CONTRACT VALIDATION');
console.log('  Formal Contract Rules for Collision-Free Tokens');
console.log('━'.repeat(60));
console.log('');

main();
