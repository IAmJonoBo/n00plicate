# Storybook CI & Visual Testing

This document covers the complete CI/CD integration for Storybook testing, including test-runner
automation, visual regression testing with Loki, and GitHub Actions workflows.

## Table of Contents

- [Test Runner CI Integration](#test-runner-ci-integration)
- [Loki Visual Regression Testing](#loki-visual-regression-testing)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Coverage Reports](#coverage-reports)
- [Performance Budgets](#performance-budgets)

## Test Runner CI Integration

### Complete Test Runner Setup

The Storybook test-runner provides comprehensive automated testing in CI:

```yaml
# .github/workflows/storybook-tests.yml
name: Storybook Tests

on:
  pull_request:
    paths:
      - 'packages/design-system/**'
      - 'packages/design-tokens/**'
      - '.storybook/**'
  push:
    branches: [main]

jobs:
  storybook-tests:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm dlx playwright install --with-deps ${{ matrix.browser }}

      - name: Build Storybook
        run: pnpm run build-storybook

      - name: Serve Storybook and run tests
        run: |
          pnpm dlx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
            "pnpm dlx http-server storybook-static --port 6006 --silent" \
            "pnpm dlx wait-on http://127.0.0.1:6006 && pnpm run test-storybook:ci --browser=${{ matrix.browser }}"
        env:
          PLAYWRIGHT_BROWSER: ${{ matrix.browser }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: storybook-test-results-${{ matrix.browser }}
          path: |
            test-results/
            coverage/
            playwright-report/

      - name: Upload coverage to Codecov
        if: matrix.browser == 'chromium'
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: storybook
```

### Enhanced Test Runner Configuration

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe, configureAxe } from 'axe-playwright';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

// Extend Jest matchers for visual testing
expect.extend({ toMatchImageSnapshot });

const config: TestRunnerConfig = {
  setup() {
    console.log('🚀 Starting Storybook Test Runner with CI optimizations...');
  },

  async preRender(page, story) {
    // Inject accessibility testing
    await injectAxe(page);

    // Configure axe with CI-optimized rules
    await configureAxe(page, {
      rules: [
        { id: 'color-contrast', enabled: true },
        { id: 'keyboard-navigation', enabled: true },
        { id: 'focus-management', enabled: true },
        { id: 'landmark-one-main', enabled: true },
        { id: 'page-has-heading-one', enabled: false },
      ],
      tags: ['wcag2a', 'wcag2aa', 'best-practice'],
    });

    // Wait for design tokens to load
    await page.waitForFunction(() => {
      const tokenElement = document.querySelector('[data-tokens-loaded]');
      return (
        tokenElement ||
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary')
          .trim() !== ''
      );
    });

    // Disable animations for consistent testing
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    // Set viewport based on story parameters
    const { parameters } = story;
    if (parameters?.viewport?.defaultViewport) {
      const viewport =
        parameters.viewport.viewports[parameters.viewport.defaultViewport];
      if (viewport) {
        await page.setViewportSize({
          width: parseInt(viewport.styles.width) || 1024,
          height: parseInt(viewport.styles.height) || 768,
        });
      }
    }
  },

  async postRender(page, story) {
    const { title, name } = story;

    // Accessibility testing
    if (!story.parameters?.a11y?.disable) {
      try {
        await checkA11y(page, '#storybook-root', {
          detailedReport: true,
          detailedReportOptions: { html: true },
        });
      } catch (error) {
        console.error(
          `❌ A11y test failed for ${title}/${name}:`,
          error.message
        );
        throw error;
      }
    }

    // Performance validation
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint:
          paint.find(p => p.name === 'largest-contentful-paint')?.startTime ||
          0,
      };
    });

    // Assert performance budgets
    const maxLoadTime = story.parameters?.performance?.maxLoadTime || 2000;
    const maxLCP = story.parameters?.performance?.maxLCP || 2500;

    if (metrics.loadTime > maxLoadTime) {
      console.warn(
        `⚠️ Performance: ${title}/${name} load time ${metrics.loadTime}ms exceeds ${maxLoadTime}ms`
      );
    }

    if (metrics.largestContentfulPaint > maxLCP) {
      console.warn(
        `⚠️ Performance: ${title}/${name} LCP ${metrics.largestContentfulPaint}ms exceeds ${maxLCP}ms`
      );
    }

    // Check for console errors
    const logs = await page.evaluate(() => {
      return (window as any).__storybook_test_logs__ || [];
    });

    if (logs.filter(log => log.level === 'error').length > 0) {
      console.error(`Console errors in ${title}/${name}:`, logs);
    }
  },

  // Test configuration
  testTimeout: 30000,
  testRetries: process.env.CI ? 2 : 0,

  // Story filtering for CI
  tags: {
    include: ['test'],
    exclude: ['skip-test', 'visual-only'],
    skip: ['broken', 'wip'],
  },
};

export default config;
```

## Loki Visual Regression Testing

### Loki Configuration

```javascript
// .loki/config.js
module.exports = {
  configurations: {
    'chrome.laptop': {
      target: 'chrome.app',
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false,
    },
    'chrome.mobile': {
      target: 'chrome.app',
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    },
    'firefox.laptop': {
      target: 'firefox',
      width: 1366,
      height: 768,
    },
  },

  // Storybook configuration
  chromeDockerImage: 'yukinying/chrome-headless-browser:91.0.4472.114',
  storybookUrl: 'http://localhost:6006',

  // Visual diff configuration
  diffingEngine: 'pixelmatch',
  threshold: 0.1,

  // File patterns
  fileNameFormatter: ({ configurationName, kind, story }) => {
    return `${configurationName}/${kind.replace(/\s+/g, '-')}/${story.replace(/\s+/g, '-')}`;
  },
};
```

### Loki GitHub Actions Integration

```yaml
# .github/workflows/visual-tests.yml
name: Visual Regression Tests

on:
  pull_request:
    paths:
      - 'packages/design-system/**'
      - 'packages/design-tokens/**'
      - '.storybook/**'

jobs:
  loki-visual-tests:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          lfs: true

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Storybook
        run: pnpm run build-storybook

      - name: Download reference images
        run: |
          git lfs fetch
          git lfs checkout

      - name: Run Loki visual tests
        run: |
          pnpm dlx concurrently -k -s first -n "SB,LOKI" -c "magenta,blue" \
            "pnpm dlx http-server storybook-static --port 6006 --silent" \
            "pnpm dlx wait-on http://127.0.0.1:6006 && pnpm run loki:test"

      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: loki-diffs
          path: .loki/current/

      - name: Update references on main
        if: github.ref == 'refs/heads/main' && success()
        run: |
          pnpm run loki:update
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .loki/reference/
          git commit -m "Update Loki reference images" || exit 0
          git push
```

### Loki Package Scripts

```json
{
  "scripts": {
    "loki:test": "loki test --requireReference --reactUri file:./storybook-static",
    "loki:update": "loki update --requireReference --reactUri file:./storybook-static",
    "loki:approve": "loki approve",
  "visual:test": "concurrently -k -s first -n \"SB,LOKI\" -c \"magenta,blue\" \"http-server storybook-static --port 6006 --silent\" \"wait-on http://127.0.0.1:6006 && pnpm run loki:test\"",
  "visual:update": "concurrently -k -s first -n \"SB,LOKI\" -c \"magenta,blue\" \"http-server storybook-static --port 6006 --silent\" \"wait-on http://127.0.0.1:6006 && pnpm run loki:update\""
  }
}
```

## Coverage Reports

### Jest Coverage Configuration

```javascript
// jest.config.js for Storybook coverage
module.exports = {
  testMatch: ['**/*.stories.@(js|jsx|ts|tsx)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          '@babel/preset-env',
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  collectCoverageFrom: [
    'packages/design-system/src/**/*.{js,jsx,ts,tsx}',
    '!packages/design-system/src/**/*.stories.{js,jsx,ts,tsx}',
    '!packages/design-system/src/**/*.test.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Coverage Integration with Test Runner

```typescript
// Enhanced test runner with coverage
const config: TestRunnerConfig = {
  // ...existing configuration...

  async postRender(page, story) {
    // ...existing post-render logic...

    // Collect coverage data
    const coverage = await page.evaluate(() => {
      return (window as any).__coverage__;
    });

    if (coverage) {
      // Save coverage data for aggregation
      const fs = require('fs');
      const path = require('path');
      const coverageDir = path.join(process.cwd(), 'coverage', 'stories');

      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const storyId = story.id.replace(/[^a-z0-9]/gi, '_');
      fs.writeFileSync(
        path.join(coverageDir, `${storyId}.json`),
        JSON.stringify(coverage)
      );
    }
  },
};
```

## Performance Budgets

### Performance Testing Integration

```typescript
// .storybook/performance-budgets.ts
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals thresholds
  largestContentfulPaint: 2500, // ms
  firstInputDelay: 100, // ms
  cumulativeLayoutShift: 0.1, // score

  // Custom thresholds
  maxLoadTime: 2000, // ms
  maxBundleSize: 500, // KB
  maxImageSize: 100, // KB

  // Accessibility requirements
  colorContrastRatio: 4.5, // WCAG AA
  keyboardNavigation: true,
  screenReaderCompatible: true,
};

// Performance test helper
export async function validatePerformance(page: Page, story: any) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const layout = performance.getEntriesByType('layout-shift');

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint:
        paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint:
        paint.find(p => p.name === 'largest-contentful-paint')?.startTime || 0,
      cumulativeLayoutShift: layout.reduce(
        (sum, entry) => sum + entry.value,
        0
      ),
    };
  });

  const budgets = { ...PERFORMANCE_BUDGETS, ...story.parameters?.performance };

  // Validate against budgets
  const violations = [];

  if (metrics.loadTime > budgets.maxLoadTime) {
    violations.push(
      `Load time ${metrics.loadTime}ms exceeds budget ${budgets.maxLoadTime}ms`
    );
  }

  if (metrics.largestContentfulPaint > budgets.largestContentfulPaint) {
    violations.push(
      `LCP ${metrics.largestContentfulPaint}ms exceeds budget ${budgets.largestContentfulPaint}ms`
    );
  }

  if (metrics.cumulativeLayoutShift > budgets.cumulativeLayoutShift) {
    violations.push(
      `CLS ${metrics.cumulativeLayoutShift} exceeds budget ${budgets.cumulativeLayoutShift}`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `Performance budget violations in ${story.title}:\n${violations.join('\n')}`
    );
  }

  return metrics;
}
```

### Bundle Size Monitoring

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  pull_request:
    paths:
      - 'packages/**'
      - '.storybook/**'

jobs:
  bundle-size:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Storybook
        run: pnpm run build-storybook

      - name: Analyze bundle size
        run: |
          pnpm dlx bundlesize --config .bundlesize.json
        env:
          BUNDLESIZE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Bundle size configuration:

```json
{
  "files": [
    {
      "path": "storybook-static/static/js/*.js",
      "maxSize": "500kb",
      "compression": "gzip"
    },
    {
      "path": "storybook-static/static/css/*.css",
      "maxSize": "100kb",
      "compression": "gzip"
    }
  ]
}
```

## CI Pipeline Integration

### Complete CI Workflow

```yaml
# .github/workflows/storybook-complete.yml
name: Storybook Complete Pipeline

on:
  pull_request:
    paths:
      - 'packages/**'
      - '.storybook/**'
      - 'docs/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    outputs:
      storybook-url: ${{ steps.deploy.outputs.url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          lfs: true

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
  run: pnpm dlx playwright install --with-deps

      - name: Lint Storybook files
        run: pnpm run lint:storybook

      - name: Build Storybook
        run: pnpm run build-storybook

      - name: Test stories (interaction)
        run: |
          pnpm dlx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
            "pnpm dlx http-server storybook-static --port 6006 --silent" \
            "pnpm dlx wait-on http://127.0.0.1:6006 && pnpm run test-storybook:ci"

      - name: Test stories (visual)
        run: |
          pnpm dlx concurrently -k -s first -n "SB,LOKI" -c "magenta,blue" \
            "pnpm dlx http-server storybook-static --port 6006 --silent" \
            "pnpm dlx wait-on http://127.0.0.1:6006 && pnpm run loki:test"

      - name: Check bundle size
  run: pnpm dlx bundlesize

      - name: Deploy to preview
        id: deploy
        uses: peaceiris/actions-gh-pages@v3
        if: github.event_name == 'pull_request'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
          destination_dir: pr-${{ github.event.number }}

      - name: Comment PR with preview
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const { owner, repo } = context.repo;
            const pr = context.payload.pull_request.number;
            const url = `https://${owner}.github.io/${repo}/pr-${pr}/`;

            await github.rest.issues.createComment({
              owner,
              repo,
              issue_number: pr,
              body: `🎨 **Storybook Preview**: ${url}\n\n✅ All tests passed!`
            });

      - name: Upload test artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            test-results/
            coverage/
            .loki/current/
            playwright-report/
```

This comprehensive CI setup provides:

- **Multi-browser testing** with Playwright
- **Visual regression testing** with Loki and Git LFS
- **Performance budgets** and bundle size monitoring
- **Accessibility testing** with axe-core
- **Coverage reporting** with detailed metrics
- **Preview deployments** for PR reviews
- **Automated artifact collection** for debugging

The pipeline ensures every design system change is validated across multiple dimensions before
merging, maintaining the quality and consistency of the design token system.
