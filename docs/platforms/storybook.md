# Storybook Advanced Integration & Visual Testing

This document covers advanced Storybook integration including interaction testing, visual regression testing with Loki,
test-runner setup, and automated review workflows.

## Table of Contents

- [Advanced Configuration](#advanced-configuration)
- [Interaction Testing](#interaction-testing)
- [Visual Testing with Loki](#visual-testing-with-loki)
- [Test Runner Setup](#test-runner-setup)
- [Automated Review Workflows](#automated-review-workflows)
- [Design Token Stories](#design-token-stories)

## Advanced Configuration

### Storybook Configuration with Design Tokens

Enhanced Storybook configuration for design token integration:

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: [
    '../packages/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../docs/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-design-tokens', // Design token surfacing with live tables
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    '@storybook/addon-designs', // Figma/Penpot frame embeds
    'storybook-addon-pseudo-states',
    'storybook-design-token', // Additional token addon for CSS variable parsing
    '@storybook/addon-vitest', // Vitest integration for headless testing
  ],

  framework: {
    name: '@storybook/vite',
    options: {},
  },

  features: {
    interactionsDebugger: true,
    buildStoriesJson: true,
    experimentalRSC: true, // React Server Components support
    storyStoreV7: true, // Enhanced story indexing
  },

  viteFinal: config => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@n00plicate/design-tokens': '../packages/design-tokens/src',
          '@n00plicate/design-system': '../packages/design-system/src',
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `@import "@n00plicate/design-tokens/dist/web/tokens.scss";`,
          },
        },
      },
    });
  },
};

export default config;
```

### Theme Decorator

Create a theme decorator for consistent testing:

```typescript
// .storybook/decorators/theme-decorator.tsx
import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import { tokens } from '@n00plicate/design-tokens';

export const ThemeDecorator: Decorator = (Story, context) => {
  const { globals } = context;
  const theme = globals.theme || 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    // Update CSS custom properties
    Object.entries(tokens.color[theme] || tokens.color.light).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  return (
    <div className={`theme-${theme}`} data-theme={theme}>
      <Story />
    </div>
  );
};

// Global types for theme switching
export const globalTypes = {
  theme: {
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      title: 'Theme',
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
        { value: 'high-contrast', title: 'High Contrast' }
      ],
      dynamicTitle: true
    }
  }
};
```

### Design Token Documentation

```typescript
// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { ThemeDecorator, globalTypes } from './decorators/theme-decorator';
import '../packages/design-tokens/dist/web/tokens.css';

const preview: Preview = {
  globalTypes,

  decorators: [ThemeDecorator],

  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    docs: {
      theme: 'dark',
      extractComponentDescription: (component, { notes }) => {
        if (notes) {
          return typeof notes === 'string'
            ? notes
            : notes.markdown || notes.text;
        }
        return null;
      },
    },

    designToken: {
      defaultTab: 'Colors',
      tabs: [
        { label: 'Colors', type: 'color' },
        { label: 'Spacing', type: 'spacing' },
        { label: 'Typography', type: 'typography' },
        { label: 'Borders', type: 'border' },
        { label: 'Shadows', type: 'shadow' },
      ],
    },

    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },

  tags: ['autodocs'],
};

export default preview;
```

## Storybook 9.1 Advanced Features

### Design Token Surfacing with Live Tables

Install and configure the design token addon to automatically parse CSS variables and display live token tables:

```bash
# Install the design token addon
pnpm add -D storybook-design-token @storybook/addon-design-tokens
```

Configure the addon to surface tokens in stories:

```typescript
// .storybook/main.ts - already included in addons array above
// The addon automatically parses CSS custom properties and creates interactive tables

// .storybook/preview.tsx - enhanced design token configuration
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    // ...existing parameters...

    designToken: {
      defaultTab: 'Colors',
      tabs: [
        {
          label: 'Colors',
          type: 'color',
          presentationStyle: 'swatch', // Shows color swatches with hex values
        },
        {
          label: 'Spacing',
          type: 'spacing',
          presentationStyle: 'spacing', // Visual spacing indicators
        },
        {
          label: 'Typography',
          type: 'typography',
          presentationStyle: 'text', // Live text samples
        },
        {
          label: 'Borders',
          type: 'border',
          presentationStyle: 'border', // Border style previews
        },
        {
          label: 'Shadows',
          type: 'shadow',
          presentationStyle: 'shadow', // Shadow effect previews
        },
      ],
      // Parse tokens from CSS custom properties
      parseStyle: true,
      // Include SCSS/CSS files for token parsing
      files: [
        '../packages/design-tokens/dist/web/tokens.css',
        '../packages/design-tokens/dist/web/tokens.scss',
      ],
    },

    // Design frame embeds for round-trip validation
    design: {
      type: 'figma', // or 'penpot'
      url: 'https://www.figma.com/file/[FILE_ID]', // Replace with actual Figma/Penpot URL
      embedHost: 'share.figma.com', // or penpot equivalent
    },
  },
};

export default preview;
```

Create token documentation stories:

```typescript
// packages/design-system/src/tokens/TokenShowcase.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design Tokens/Token Showcase',
  parameters: {
    docs: {
      description: {
        component: 'Interactive design token showcase with live values and usage examples.'
      }
    },
    designToken: {
      // Force token display for this story
      disable: false,
      defaultTab: 'Colors'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorTokens: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)' }}>
      <h2 style={{ color: 'var(--color-text-primary)' }}>Color Tokens in Action</h2>

      <div style={{
        backgroundColor: 'var(--color-surface-primary)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-subtle)'
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          This card uses CSS custom properties that are automatically detected and displayed
          in the Design Tokens panel.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button style={{
          backgroundColor: 'var(--color-action-primary)',
          color: 'var(--color-text-on-primary)',
          border: 'none',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-body)'
        }}>
          Primary Action
        </button>

        <button style={{
          backgroundColor: 'transparent',
          color: 'var(--color-action-primary)',
          border: '1px solid var(--color-action-primary)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-body)'
        }}>
          Secondary Action
        </button>
      </div>
    </div>
  )
};
```

### Vitest Integration and Headless Testing

Configure Vitest addon for headless story execution in CI:

```typescript
// .storybook/main.ts - enhanced with Vitest integration
import type { StorybookConfig } from '@storybook/vite';

const config: StorybookConfig = {
  // ...existing configuration...

  // Vitest integration for headless testing
  viteFinal: config => {
    return mergeConfig(config, {
      // ...existing config...

      test: {
        // Vitest configuration for story testing
        globals: true,
        environment: 'jsdom',
        setupFiles: ['.storybook/vitest-setup.ts'],
        include: ['**/*.stories.@(js|jsx|ts|tsx)'],
        coverage: {
          reporter: ['text', 'json', 'html'],
          exclude: ['**/*.stories.*'],
        },
      },
    });
  },
};

export default config;
```

Create Vitest setup for story testing:

```typescript
// .storybook/vitest-setup.ts
import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react';
import * as projectAnnotations from './preview';

beforeAll(() => {
  setProjectAnnotations(projectAnnotations);
});
```

Enhanced play functions with Vitest compatibility:

```typescript
// packages/design-system/src/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './Button';

// ...existing meta configuration...

export const ViTestCompatible: Story = {
  args: {
    variant: 'primary',
    children: 'Test Button',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Use step() for better test organization in both Storybook and Vitest
    await step('Initial state validation', async () => {
      await expect(button).toBeInTheDocument();
      await expect(button).toHaveClass('btn-primary');
      await expect(button).toBeEnabled();
    });

    await step('Interaction testing', async () => {
      // Test hover state
      await userEvent.hover(button);
      await expect(button).toHaveClass('btn-hover');

      // Test click interaction
      await userEvent.click(button);
      await expect(button).toHaveClass('btn-active');
    });

    await step('Keyboard accessibility', async () => {
      // Test focus management
      await userEvent.tab();
      await expect(button).toHaveFocus();

      // Test keyboard activation
      await userEvent.keyboard('{Enter}');
      await expect(button).toHaveClass('btn-pressed');
    });
  },
};
```

### Full Test Runner with @storybook/test-runner

Install and configure the official Storybook test runner:

```bash
# Install test runner
pnpm add -D @storybook/test-runner playwright
npx playwright install
```

Configure test runner:

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  setup() {
    // Global test setup
    console.log('Storybook Test Runner: Starting test suite...');
  },

  async preRender(page, story) {
    // Pre-render setup for each story
    await injectAxe(page);

    // Set viewport for responsive testing
    const { parameters } = story;
    if (parameters?.viewport?.defaultViewport) {
      const viewport =
        parameters.viewport.viewports[parameters.viewport.defaultViewport];
      await page.setViewportSize({
        width: parseInt(viewport.styles.width),
        height: parseInt(viewport.styles.height),
      });
    }

    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
  },

  async postRender(page, story) {
    // Post-render validation for each story

    // Accessibility testing
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
      },
    });

    // Performance validation
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstPaint:
          performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      };
    });

    // Assert performance thresholds
    if (metrics.loadTime > 2000) {
      console.warn(
        `Story ${story.title} took ${metrics.loadTime}ms to load (threshold: 2000ms)`
      );
    }

    // Check for console errors
    const logs = await page.evaluate(() => {
      return (window as any).__storybook_errors__ || [];
    });

    if (logs.length > 0) {
      console.error(`Console errors in ${story.title}:`, logs);
    }
  },

  // Tags configuration for selective testing
  tags: {
    include: ['test'],
    exclude: ['skip-test', 'visual-only'],
    skip: ['broken', 'wip'],
  },

  // Test timeout and retry configuration
  testTimeout: 30000,
  testRetries: 2,
};

export default config;
```

Package.json scripts for test runner:

```json
{
  "scripts": {
    "test-storybook": "test-storybook",
    "test-storybook:ci": "test-storybook --ci --coverage --junit",
    "test-storybook:watch": "test-storybook --watch",
    "test-storybook:debug": "test-storybook --debug"
  }
}
```

CI integration for test runner:

```yaml
# .github/workflows/storybook-tests.yml
name: Storybook Tests

on:
  pull_request:
    paths:
      - 'packages/design-system/**'
      - 'packages/design-tokens/**'
      - '.storybook/**'

jobs:
  test-stories:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build Storybook
        run: pnpm run build-storybook

      - name: Serve Storybook and run tests
        run: |
          npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
            "npx http-server storybook-static --port 6006 --silent" \
            "npx wait-on http://127.0.0.1:6006 && pnpm run test-storybook:ci"

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: storybook-test-results
          path: |
            test-results/
            coverage/
```

### Storybook 9.1 Advanced Features

#### Enhanced Story Indexing and Build Performance

Configure Storybook 9.1's advanced indexing and build optimizations:

```typescript
// .storybook/main.ts - Enhanced Storybook 9.1 configuration
import type { StorybookConfig } from '@storybook/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  // ...existing configuration...

  // Storybook 9.1 specific features
  features: {
    interactionsDebugger: true,
    buildStoriesJson: true,
    storyStoreV7: true, // Enhanced story indexing
    experimentalRSC: true, // React Server Components support
    argTypeTargetsV7: true, // Better args type inference
    previewMdx2: true, // MDX 2.0 support
    modernInlineRender: true, // Improved inline rendering
  },

  // Enhanced story indexing for better performance
  stories: [
    {
      directory: '../packages',
      files: '**/*.stories.@(js|jsx|ts|tsx|mdx)',
      titlePrefix: 'Design System',
    },
    {
      directory: '../docs',
      files: '**/*.stories.@(js|jsx|ts|tsx|mdx)',
      titlePrefix: 'Documentation',
    },
  ],

  // Build optimization
  core: {
    disableTelemetry: true,
    enableCrashReports: false,
  },

  // TypeScript configuration
  typescript: {
    check: false, // Disable type checking for faster builds
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: prop => {
        if (prop.declarations !== undefined && prop.declarations.length > 0) {
          const hasPropAdditionalDescription = prop.declarations.find(
            declaration => {
              return !declaration.fileName.includes('node_modules');
            }
          );
          return Boolean(hasPropAdditionalDescription);
        }
        return true;
      },
    },
  },

  // Advanced addon configuration
  addons: [
    // ...existing addons...

    // Storybook 9.1 enhanced addons
    {
      name: '@storybook/addon-docs',
      options: {
        mdxCompileOptions: {
          development: process.env.NODE_ENV !== 'production',
        },
      },
    },

    // Enhanced interaction testing
    {
      name: '@storybook/addon-interactions',
      options: {
        debugger: true,
      },
    },

    // Advanced viewport configuration
    {
      name: '@storybook/addon-viewport',
      options: {
        viewports: {
          responsive: {
            name: 'Responsive',
            styles: {
              width: '100%',
              height: '100%',
            },
            type: 'desktop',
          },
        },
      },
    },
  ],

  // Vite configuration with Storybook 9.1 optimizations
  viteFinal: async config => {
    return mergeConfig(config, {
      // ...existing config...

      // Enhanced build performance
      build: {
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            manualChunks: {
              'design-tokens': ['@n00plicate/design-tokens'],
              vendor: ['react', 'react-dom'],
            },
          },
        },
      },

      // Better development experience
      optimizeDeps: {
        include: ['@storybook/addon-interactions', '@storybook/test'],
      },
    });
  },
};

export default config;
```

#### Advanced Testing Integration with Storybook 9.1

Enhanced test runner configuration with Storybook 9.1 features:

```typescript
// .storybook/test-runner.ts - Storybook 9.1 enhanced test runner
import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe, configureAxe } from 'axe-playwright';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

const config: TestRunnerConfig = {
  setup() {
    // Enhanced test setup for Storybook 9.1
    console.log('🚀 Storybook 9.1 Test Runner Starting...');
  },

  async preVisit(page, context) {
    // Enhanced pre-visit setup
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Configure viewport based on story parameters
    const story = context.story;
    if (story.parameters?.viewport?.defaultViewport) {
      const viewport =
        story.parameters.viewport.viewports[
          story.parameters.viewport.defaultViewport
        ];
      if (viewport) {
        await page.setViewportSize({
          width: parseInt(viewport.styles.width) || 1024,
          height: parseInt(viewport.styles.height) || 768,
        });
      }
    }
  },

  async preRender(page, story) {
    // Enhanced pre-render setup for Storybook 9.1
    await injectAxe(page);

    // Configure axe with custom rules
    await configureAxe(page, {
      rules: [
        { id: 'color-contrast', enabled: true },
        { id: 'keyboard-navigation', enabled: true },
        { id: 'focus-management', enabled: true },
        { id: 'landmark-one-main', enabled: true },
        { id: 'page-has-heading-one', enabled: false }, // Stories don't need h1
      ],
    });

    // Wait for fonts and CSS to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Additional buffer for animations

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
  },

  async postRender(page, story) {
    // Enhanced post-render validation for Storybook 9.1

    // Accessibility testing with enhanced reporting
    if (!story.parameters?.a11y?.disable) {
      try {
        await checkA11y(page, '#storybook-root', {
          detailedReport: true,
          detailedReportOptions: { html: true },
          rules: story.parameters?.a11y?.config?.rules || {},
        });
      } catch (error) {
        console.error(
          `❌ Accessibility test failed for ${story.title}:`,
          error.message
        );
        throw error;
      }
    }

    // Performance validation
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        firstPaint:
          paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint:
          paint.find(entry => entry.name === 'first-contentful-paint')
            ?.startTime || 0,
      };
    });

    // Assert performance thresholds
    const maxLoadTime = story.parameters?.performance?.maxLoadTime || 3000;
    if (performanceMetrics.loadTime > maxLoadTime) {
      console.warn(
        `⚠️ Performance: ${story.title} took ${performanceMetrics.loadTime}ms (threshold: ${maxLoadTime}ms)`
      );
    }

    // Visual regression testing
    if (story.parameters?.screenshot !== false) {
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
      });

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: `${story.title.replace(/\s+/g, '-')}-${story.name.replace(/\s+/g, '-')}`,
        failureThreshold: story.parameters?.screenshot?.threshold || 0.2,
        failureThresholdType: 'percent',
      });
    }

    // Console error detection
    const consoleLogs = await page.evaluate(() => {
      return (window as any).__storybook_errors__ || [];
    });

    if (consoleLogs.length > 0) {
      const errors = consoleLogs.filter(log => log.level === 'error');
      if (errors.length > 0) {
        console.error(`❌ Console errors in ${story.title}:`, errors);
        throw new Error(
          `Console errors detected: ${errors.map(e => e.message).join(', ')}`
        );
      }
    }
  },

  // Enhanced test configuration
  testTimeout: 60000, // 60 seconds for complex stories

  // Story filtering with Storybook 9.1 features
  async getStorybookUrl(config) {
    return `http://127.0.0.1:6006`;
  },

  // Enhanced error handling
  async prepare() {
    // Custom preparation logic
    console.log('📋 Preparing test environment...');
  },

  async cleanup() {
    // Custom cleanup logic
    console.log('🧹 Cleaning up test environment...');
  },
};

export default config;
```

#### Design Frame Embeds with Enhanced Integration

Advanced design frame embedding with multiple design tools:

```typescript
// Enhanced story with multiple design frame embeds
export const WithMultipleDesignEmbeds: Story = {
  args: {
    variant: 'primary',
    children: 'Multi-Design Reference',
  },
  parameters: {
    design: [
      {
        type: 'figma',
        name: 'Component Specs',
        url: 'https://www.figma.com/file/ABC123/Design-System?node-id=123%3A456',
        embedHost: 'figma.com',
        allowFullscreen: true,
      },
      {
        type: 'penpot',
        name: 'Interactive Prototype',
        url: 'https://design.penpot.app/#/view/PROJECT-ID/FILE-ID?page-id=PAGE-ID&section=interactions&frame-id=FRAME-ID',
        embedHost: 'design.penpot.app',
        allowFullscreen: true,
      },
      {
        type: 'sketch',
        name: 'Design Tokens',
        url: 'https://sketch.cloud/s/ABC123',
        embedHost: 'sketch.cloud',
      },
      {
        type: 'link',
        name: 'Design Guidelines',
        url: 'https://n00plicate-design.com/guidelines/button',
      },
    ],
    docs: {
      description: {
        story: `This component implementation follows the design specifications shown in the Design tab. 
                Multiple design references are provided for comprehensive validation.`,
      },
      source: {
        code: `
// Implementation matches Figma component specs
<Button variant="primary" size="medium">
  {children}
</Button>
        `,
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await step('Validate design implementation', async () => {
      // Check that component matches design specs
      await expect(button).toHaveClass('btn-primary');

      // Verify design token usage
      const styles = window.getComputedStyle(button);
      expect(styles.getPropertyValue('--btn-primary-bg')).toBeTruthy();
    });
  },
};
```

#### Complete CI/CD Integration for Storybook 9.1

```yaml
# .github/workflows/storybook-8.5-ci.yml
name: Storybook 9.1 CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    paths:
      - 'packages/design-system/**'
      - '.storybook/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'packages/design-system/**'
      - '.storybook/**'

env:
  STORYBOOK_VERSION: '8.5'
  NODE_OPTIONS: '--max-old-space-size=4096'

jobs:
  storybook-tests:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        test-suite: [interaction, visual, accessibility, performance]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build design tokens
        run: pnpm nx build design-tokens

      - name: Build Storybook 9.1
        run: |
          echo "🏗️ Building Storybook with optimizations..."
          pnpm nx build-storybook design-system \
            --webpack-stats-json \
            --output-dir storybook-static

      - name: Analyze Storybook bundle
        run: |
          echo "📊 Analyzing Storybook bundle size..."
          npx webpack-bundle-analyzer storybook-static/project.json \
            --mode static --report bundle-analysis.html --no-open

      - name: Start Storybook server
        run: |
          echo "🚀 Starting Storybook server..."
          npx http-server storybook-static --port 6006 --silent &
          npx wait-on http://127.0.0.1:6006

      - name: Run test suite - ${{ matrix.test-suite }}
        run: |
          case "${{ matrix.test-suite }}" in
            "interaction")
              echo "🎯 Running interaction tests..."
              pnpm run test-storybook --ci --coverage --junit \
                --index-json --stories-json
              ;;
            "visual")
              echo "📸 Running visual regression tests..."
              pnpm run chromatic --project-token ${{ secrets.CHROMATIC_TOKEN }} \
                --exit-zero-on-changes --build-script-name build-storybook
              ;;
            "accessibility")
              echo "♿ Running accessibility tests..."
              pnpm run test-storybook --ci --coverage \
                --testNamePattern="accessibility" \
                --reporters=default --reporters=jest-junit
              ;;
            "performance")
              echo "⚡ Running performance tests..."
              npx lighthouse-ci autorun --config=.lighthouserc.json
              ;;
          esac

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.test-suite }}
          path: |
            test-results/
            coverage/
            lighthouse-reports/
            bundle-analysis.html

      - name: Comment performance results
        if: matrix.test-suite == 'performance' && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');

            try {
              const lighthouseReport = JSON.parse(
                fs.readFileSync('lighthouse-reports/manifest.json', 'utf8')
              );

              const scores = lighthouseReport[0].summary;

              const comment = `
              ## ⚡ Storybook Performance Report

              | Metric | Score | Status |
              |--------|--------|--------|
              | Performance | ${scores.performance * 100}% | ${scores.performance > 0.9 ? '✅' : '⚠️'} |
              | Accessibility | ${scores.accessibility * 100}% | ${scores.accessibility > 0.9 ? '✅' : '⚠️'} |
              | Best Practices | ${scores['best-practices'] * 100}% | ${scores['best-practices'] > 0.9 ? '✅' : '⚠️'} |
              | SEO | ${scores.seo * 100}% | ${scores.seo > 0.9 ? '✅' : '⚠️'} |

              [View detailed report in artifacts]
              `;

              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            } catch (error) {
              console.log('Failed to parse lighthouse report:', error);
            }

  deploy-storybook:
    runs-on: ubuntu-latest
    needs: storybook-tests
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build design tokens
        run: pnpm nx build design-tokens

      - name: Build Storybook for production
        run: |
          echo "🏗️ Building production Storybook..."
          pnpm nx build-storybook design-system \
            --output-dir storybook-static \
            --quiet

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
          cname: storybook.n00plicate-design.com

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './storybook-static'
          production-branch: main
          deploy-message: 'Deploy from GitHub Actions'
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#design-system'
          text: |
            🚀 Storybook 9.1 deployed successfully!
            📚 GitHub Pages: https://storybook.n00plicate-design.com
            🌐 Netlify: https://n00plicate-storybook.netlify.app
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```
