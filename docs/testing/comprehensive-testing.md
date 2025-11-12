# Comprehensive Testing Strategy

Advanced testing approaches for the n00plicate design system monorepo, covering visual regression, interaction testing,\
accessibility validation, and cross-platform compatibility.

## Visual Regression Testing

### Storybook Visual Testing

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Testing

on:
  pull_request:
    paths:
      - 'packages/design-system/**'
      - 'packages/design-tokens/**'

jobs:
  visual-tests:
    runs-on: ubuntu-latest
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

      - name: Build Storybook
        run: pnpm --filter @n00plicate/design-system run build-storybook

      - name: Run Loki visual tests
        run: pnpm dlx loki test --verboseRenderer
        env:
          LOKI_UPDATE_BASELINE: false

      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: .loki/current/
```

### Loki Configuration

```json
// .loki/config.json
{
  "configurations": {
    "chrome.laptop": {
      "target": "chrome.docker",
      "width": 1366,
      "height": 768
    },
    "chrome.mobile": {
      "target": "chrome.docker",
      "width": 375,
      "height": 667,
      "mobile": true
    },
    "chrome.tablet": {
      "target": "chrome.docker",
      "width": 768,
      "height": 1024
    }
  },
  "chromeSelector": ".loki-test",
  "diffThreshold": 0.1,
  "storybookPort": 6006,
  "verboseRenderer": true,
  "skipStories": ["Example/*", "Internal/*"]
}
```

### Percy Integration (Alternative)

```yaml
# Alternative using Percy for visual testing
- name: Percy visual tests
  run: pnpm dlx percy storybook ./storybook-static
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

## Interaction Testing

### Storybook Test Runner

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async postRender(page, context) {
    const storyContext = await getStoryContext(page, context);

    // Skip interaction tests for specific stories
    if (storyContext.parameters?.skipInteractionTests) {
      return;
    }

    // Run accessibility tests
    await page.evaluate(() => {
      if (window.axe) {
        return window.axe.run();
      }
    });

    // Custom interaction tests
    await page.waitForSelector('[data-testid="component-root"]');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Validate focus management
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    console.log('Focused element:', focusedElement);
  },

  // Configure test timeouts
  logLevel: 'verbose',
  failOnConsole: true,

  // Browser configuration
  browserOptions: {
    launch: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
};

export default config;
```

### Custom Interaction Tests

```typescript
// packages/design-system/src/components/button/button.stories.ts
import type { Meta, StoryObj } from '@storybook/qwik';
import { expect, within, userEvent } from '@storybook/test';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Interactive button component with comprehensive testing',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const InteractionTest: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Test initial state
    await expect(button).toBeInTheDocument();
    await expect(button).toBeEnabled();

    // Test click interaction
    await userEvent.click(button);

    // Test keyboard interaction
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    // Test hover state
    await userEvent.hover(button);
    await expect(button).toHaveClass('hover');

    // Test focus state
    await userEvent.click(button);
    await expect(button).toHaveFocus();
  },
};
```

## Accessibility Testing

### Automated A11y Testing

```typescript
// packages/design-system/src/testing/a11y-utils.ts
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export const runA11yTests = async (component: HTMLElement) => {
  const results = await axe(component, {
    rules: {
      // Configure specific rules
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
    },
  });

  expect(results).toHaveNoViolations();
};

export const testKeyboardNavigation = async (page: Page) => {
  // Test tab order
  await page.keyboard.press('Tab');
  const firstFocused = await page.evaluate(
    () => document.activeElement?.tagName
  );

  await page.keyboard.press('Tab');
  const secondFocused = await page.evaluate(
    () => document.activeElement?.tagName
  );

  // Validate focus trap
  expect(firstFocused).not.toBe(secondFocused);
};
```

### Custom A11y Matchers

```typescript
// packages/design-system/src/testing/a11y-matchers.ts
export const customA11yMatchers = {
  toHaveAriaLabel: (received: HTMLElement, expected: string) => {
    const ariaLabel = received.getAttribute('aria-label');
    const pass = ariaLabel === expected;

    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have aria-label "${expected}"`
          : `Expected element to have aria-label "${expected}", got "${ariaLabel}"`,
    };
  },

  toBeKeyboardAccessible: async (received: HTMLElement) => {
    // Test keyboard accessibility
    const isFocusable =
      received.tabIndex >= 0 ||
      ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(received.tagName);

    return {
      pass: isFocusable,
      message: () =>
        isFocusable
          ? 'Element is keyboard accessible'
          : 'Element is not keyboard accessible',
    };
  },
};
```

## Cross-Platform Testing

### Device Testing Matrix

```typescript
// packages/design-system/src/testing/device-matrix.ts
export const deviceMatrix = {
  mobile: {
    'iPhone 13': { width: 390, height: 844, userAgent: 'iPhone' },
    'Pixel 6': { width: 393, height: 851, userAgent: 'Android' },
    'Galaxy S21': { width: 384, height: 854, userAgent: 'Android' },
  },
  tablet: {
    'iPad Pro': { width: 1024, height: 1366, userAgent: 'iPad' },
    'Surface Pro': { width: 912, height: 1368, userAgent: 'Windows' },
  },
  desktop: {
    'MacBook Pro': { width: 1440, height: 900, userAgent: 'Mac' },
    'Windows Desktop': { width: 1920, height: 1080, userAgent: 'Windows' },
    'Linux Desktop': { width: 1366, height: 768, userAgent: 'Linux' },
  },
};

export const runCrossPlatformTests = async (storyUrl: string) => {
  for (const [category, devices] of Object.entries(deviceMatrix)) {
    for (const [deviceName, config] of Object.entries(devices)) {
      await test(`${deviceName} - ${category}`, async ({ page }) => {
        await page.setViewportSize({
          width: config.width,
          height: config.height,
        });

        await page.setUserAgent(config.userAgent);
        await page.goto(storyUrl);

        // Device-specific tests
        await validateResponsiveLayout(page, config);
        await testTouchInteractions(page, config);
      });
    }
  }
};
```

### Platform-Specific Validations

```typescript
// packages/design-system/src/testing/platform-validators.ts
export const validateResponsiveLayout = async (
  page: Page,
  device: DeviceConfig
) => {
  // Check responsive breakpoints
  const elements = await page.$$('[data-responsive]');

  for (const element of elements) {
    const computedStyle = await element.evaluate(el =>
      window.getComputedStyle(el)
    );

    // Validate layout properties
    expect(computedStyle.display).not.toBe('none');
    expect(computedStyle.visibility).toBe('visible');
  }
};

export const testTouchInteractions = async (
  page: Page,
  device: DeviceConfig
) => {
  if (
    device.userAgent.includes('Mobile') ||
    device.userAgent.includes('Tablet')
  ) {
    // Test touch targets meet minimum size requirements (44px)
    const touchTargets = await page.$$('[role="button"], button, a, input');

    for (const target of touchTargets) {
      const boundingBox = await target.boundingBox();
      expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    }
  }
};
```

## Performance Testing

### Bundle Size Monitoring

```typescript
// scripts/bundle-analysis.ts
import { analyzer } from '@bundle-analyzer/core';
import { bundleSize } from './utils/bundle-size';

export const performanceBudgets = {
  'design-system': {
    maxSize: '100kb',
    maxGzipSize: '30kb',
  },
  'design-tokens': {
    maxSize: '50kb',
    maxGzipSize: '15kb',
  },
};

export const validateBundleSize = async () => {
  for (const [packageName, budget] of Object.entries(performanceBudgets)) {
    const size = await bundleSize(`./packages/${packageName}/dist`);

    expect(size.raw).toBeLessThan(parseSize(budget.maxSize));
    expect(size.gzip).toBeLessThan(parseSize(budget.maxGzipSize));
  }
};

// Performance monitoring in Storybook
export const measureRenderPerformance = async (page: Page) => {
  await page.evaluate(() => {
    performance.mark('component-start');
  });

  await page.waitForSelector('[data-testid="component-root"]');

  const metrics = await page.evaluate(() => {
    performance.mark('component-end');
    performance.measure('component-render', 'component-start', 'component-end');

    return performance.getEntriesByName('component-render')[0];
  });

  expect(metrics.duration).toBeLessThan(100); // 100ms budget
};
```

### Memory Leak Detection

```typescript
// packages/design-system/src/testing/memory-testing.ts
export const detectMemoryLeaks = async (page: Page, iterations = 10) => {
  const initialMemory = await page.evaluate(
    () => (performance as any).memory?.usedJSHeapSize
  );

  // Perform multiple render cycles
  for (let i = 0; i < iterations; i++) {
    await page.reload();
    await page.waitForSelector('[data-testid="component-root"]');
  }

  const finalMemory = await page.evaluate(
    () => (performance as any).memory?.usedJSHeapSize
  );

  const memoryIncrease = finalMemory - initialMemory;
  const threshold = initialMemory * 0.1; // 10% increase threshold

  expect(memoryIncrease).toBeLessThan(threshold);
};
```

## Test Organization

### Test Structure

```text
packages/design-system/src/
├── components/
│   ├── button/
│   │   ├── button.component.ts
│   │   ├── button.stories.ts
│   │   ├── button.test.ts
│   │   └── button.visual.test.ts
│   └── input/
├── testing/
│   ├── utils/
│   ├── fixtures/
│   ├── mocks/
│   └── setup.ts
└── __tests__/
    ├── integration/
    ├── e2e/
    └── performance/
```

### Test Configuration

```typescript
// packages/design-system/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig({
  plugins: [qwikVite()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.stories.ts', '**/*.test.ts', '**/node_modules/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## CI/CD Integration

### Test Pipeline

```yaml
# .github/workflows/test-suite.yml
name: Comprehensive Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'
      - run: corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile
  - run: pnpm -w -r --parallel test
  - run: pnpm -w -r --parallel test:coverage

  visual-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
  - run: corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile
  - run: pnpm --filter @n00plicate/design-system run build-storybook
  - run: pnpm dlx loki test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diffs
          path: .loki/

  e2e-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
  - run: corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile
  - run: pnpm dlx playwright install
  - run: pnpm --filter @n00plicate/design-system run e2e
```

This comprehensive testing strategy ensures robust quality assurance across all aspects of the design system, from\
visual consistency to performance and accessibility compliance.
