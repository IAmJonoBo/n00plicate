# Changelog

All notable changes to the n00plicate project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added Nx plugins for enhanced build capabilities:
  - `@nx/cypress` (21.6.2) - E2E testing support
  - `@nx/esbuild` (21.6.2) - Fast bundling
  - `@nx/webpack` (21.6.2) - Webpack integration
- Added Storybook addons for improved DX:
  - `@storybook/addon-a11y` (9.0.8) - Accessibility testing
  - `@storybook/addon-measure` (9.0.8) - Element measurement tools
  - `@storybook/addon-outline` (9.0.8) - Layout debugging
- Added development utilities:
  - `concurrently` (9.1.2) - Run multiple commands
  - `npm-run-all` (4.1.5) - Task orchestration
  - `wait-on` (8.0.2) - Wait for resources
  - `cross-env` (7.0.3) - Cross-platform environment variables
  - `rimraf` (6.0.1) - Cross-platform file deletion
- Added testing tools:
  - `cypress` (13.17.0) - E2E testing framework
  - `chromatic` (13.3.0) - Visual regression testing
  - `@types/jest` (29.5.14) - Jest type definitions
  - `@types/testing-library__jest-dom` (6.0.0) - Testing library types
- New npm scripts:
  - `dev:all` - Start all development services concurrently
  - `test:e2e` - Run E2E tests
  - `test:visual` - Run visual regression tests with Chromatic

### Changed

- Updated Node.js requirement from `>=22.19.0` to `>=22.20.0`
- Updated pnpm requirement from `>=10.17.0` to `>=10.18.2`
- Updated TypeScript from `5.9.2` to `5.9.3`
- Updated README badges to reflect current versions:
  - Nx: 21.5 → 21.6
  - TypeScript: 5.9 → 5.9.3
  - Added Node.js badge (22.20.0)
  - Added pnpm badge (10.18.2)
  - Added Storybook badge (9.1.9)
- Enhanced Storybook configuration with new addons in design-system package

### Fixed

- Improved DX with better tooling support
- Enhanced QC capabilities with visual and E2E testing tools

## [0.1.1] - Previous Release

See git history for changes prior to this changelog.
