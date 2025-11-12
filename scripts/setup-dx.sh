#!/bin/bash

# 🚀 Mimic Development Setup Script
# This script sets up your development environment with all the modern tools

set -e

echo "🎨 Setting up Mimic workspace with modern DX enhancements..."

# Install modern testing tools
echo "📋 Adding Cypress for E2E and component testing..."
pnpm add -D cypress

# Add performance and build tools
echo "⚡ Adding modern build tools..."
# Nx-specific wrappers removed; install native tooling or Vite-compatible plugins when needed
pnpm add -D esbuild webpack

# Add code quality tools
echo "🔍 Adding advanced code quality tools..."
pnpm add -D @commitlint/cli @commitlint/config-conventional
pnpm add -D @types/jest @testing-library/jest-dom
pnpm add -D chromatic
pnpm add -D concurrently
pnpm add -D cross-env

# Add design system specific tools
echo "🎨 Adding design system specific tools..."
pnpm add -D @storybook/addon-a11y
pnpm add -D @storybook/addon-design-tokens
pnpm add -D @storybook/addon-docs
pnpm add -D @storybook/addon-measure
pnpm add -D @storybook/addon-outline

# Add development utilities
echo "🛠️ Adding development utilities..."
pnpm add -D npm-run-all
pnpm add -D rimraf
pnpm add -D wait-on

echo "✅ Modern DX tools installed!"
echo "🚀 Run 'pnpm setup:complete' to finish configuration"
