# Qwik City Platform Integration Guide

This document covers advanced Qwik City integration techniques including prefetch strategies, image optimization,
optimizer configuration, and static asset management for the n00plicate design system.

## Table of Contents

- [Prefetch Strategies](#prefetch-strategies)
- [Image Optimization](#image-optimization)
- [Optimizer Configuration](#optimizer-configuration)
- [Static Assets & OG Images](#static-assets--og-images)
- [Design Token Integration](#design-token-integration)
- [Service Worker Setup](#service-worker-setup)
- [Performance Optimization](#performance-optimization)
- [SSR Considerations](#ssr-considerations)

## Prefetch Strategies

### Viewport-Based Prefetching

Implement intelligent prefetching with `prefetch="viewport"` to download bundles when links scroll into view:

```typescript
// src/components/smart-link.tsx
import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const SmartLink = component$<{
  href: string;
  prefetch?: 'viewport' | 'interaction' | 'none';
  children: any;
}>(({ href, prefetch = 'viewport', ...props }) => {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      {...props}
    >
      {props.children}
    </Link>
  );
});

// Usage in components
export const Navigation = component$(() => {
  return (
    <nav>
      <SmartLink href="/docs" prefetch="viewport">
        Documentation
      </SmartLink>
      <SmartLink href="/components" prefetch="viewport">
        Components
      </SmartLink>
      <SmartLink href="/tokens" prefetch="interaction">
        Design Tokens
      </SmartLink>
    </nav>
  );
});
```

Advanced prefetch configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        // Advanced prefetch configuration
        prefetchStrategy: {
          // Prefetch bundles when links enter viewport
          implementation: {
            linkInsert: null,
            linkRel: 'prefetch',
            workerFetchInsert: null,
            prefetchEvent: 'qvisible', // Custom event for viewport detection
          },
        },
      }),
      qwikVite({
        // Optimizer configuration for prefetching
        entryStrategy: {
          type: 'smart',
          manual: {
            // Critical routes to always prefetch
            '/': 'always',
            '/docs': 'viewport',
            '/components': 'viewport',
          },
        },
      }),
    ],
  };
});
```

### Service Worker Prefetch Integration

Combine prefetch with service worker for optimal caching:

```typescript
// src/service-worker/prefetch-worker.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache critical resources
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache Qwik bundles with stale-while-revalidate
registerRoute(
  ({ request, url }) =>
    url.pathname.startsWith('/build/') && request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'qwik-bundles',
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          // Use URL without query params as cache key
          const url = new URL(request.url);
          return `${url.origin}${url.pathname}`;
        },
      },
    ],
  })
);

// Cache design tokens and assets
registerRoute(
  ({ url }) =>
    url.pathname.includes('/tokens/') || url.pathname.includes('/assets/'),
  new CacheFirst({
    cacheName: 'design-system-assets',
    plugins: [
      {
        cacheExpiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    ],
  })
);

// Listen for prefetch events
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PREFETCH_ROUTES') {
    const routes = event.data.routes;

    // Prefetch critical route bundles
    routes.forEach(async (route: string) => {
      try {
        const response = await fetch(route);
        if (response.ok) {
          console.log(`Prefetched: ${route}`);
        }
      } catch (error) {
        console.warn(`Failed to prefetch: ${route}`, error);
      }
    });
  }
});
```

## Image Optimization

### Qwik Image Optimization Integration

Leverage Qwik's Vite-powered image optimization for automatic format conversion:

```bash
# Install image optimization
pnpm qwik add image-optimization
```

Configure image optimization:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikViteImageOptimization } from '@qwikdev/vite-image-optimization';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      qwikViteImageOptimization({
        // Image optimization configuration
        formats: ['webp', 'avif'], // Modern formats first
        quality: {
          webp: 80,
          avif: 75,
          jpg: 85,
          png: 90,
        },
        // Generate responsive images
        widths: [320, 640, 768, 1024, 1280, 1600],
        // Lazy loading by default
        loading: 'lazy',
        // Generate different densities
        densities: [1, 2],
        // Output directory
        outputDir: 'dist/assets/images',
      }),
    ],
    // Additional image handling
    assetsInclude: [
      '**/*.svg',
      '**/*.png',
      '**/*.jpg',
      '**/*.webp',
      '**/*.avif',
    ],
  };
});
```

Smart image component with token integration:

```typescript
// src/components/optimized-image.tsx
import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { useTokens } from '../tokens/loader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage = component$<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  const tokens = useTokens();
  const imageRef = useSignal<Element>();

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1600];
    return widths
      .map(w => `${baseSrc}?w=${w} ${w}w`)
      .join(', ');
  };

  // Lazy load implementation with Intersection Observer
  useTask$(({ cleanup }) => {
    if (!imageRef.value || loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: tokens.value.spacing.lg || '50px' // Use token for intersection margin
      }
    );

    if (imageRef.value) {
      observer.observe(imageRef.value);
    }

    cleanup(() => observer.disconnect());
  });

  return (
    <picture>
      {/* AVIF for modern browsers */}
      <source
        srcSet={generateSrcSet(src.replace(/\.[^.]+$/, '.avif'))}
        sizes={sizes}
        type="image/avif"
      />

      {/* WebP fallback */}
      <source
        srcSet={generateSrcSet(src.replace(/\.[^.]+$/, '.webp'))}
        sizes={sizes}
        type="image/webp"
      />

      {/* Original format fallback */}
      <img
        ref={imageRef}
        src={loading === 'eager' ? src : undefined}
        data-src={loading === 'lazy' ? src : undefined}
        srcSet={loading === 'eager' ? generateSrcSet(src) : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        style={{
          borderRadius: tokens.value.radius?.md || '8px',
          boxShadow: tokens.value.shadow?.sm || '0 1px 3px rgba(0,0,0,0.1)'
        }}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
});
```

## Optimizer Configuration

### Production Build Optimization

Configure QWIK_BUILD_MODE and optimizer flags for maximum performance:

```typescript
// vite.config.ts - Enhanced optimizer configuration
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      qwikVite({
        // Rust-based optimizer configuration
        debug: mode === 'development',

        // Build mode configuration
        buildMode: mode === 'production' ? 'production' : 'development',

        // Symbol splitting for lazy loading
        entryStrategy: {
          type: 'smart', // Intelligent code splitting
          manual: {
            // Manual chunking for critical paths
            'design-system': [
              'src/components/button/',
              'src/components/input/',
              'src/components/modal/',
            ],
            'design-tokens': ['src/tokens/', '@n00plicate/design-tokens'],
          },
        },

        // Advanced optimizer flags
        optimizer: {
          // Symbol optimization
          symbolsOutput: mode === 'production' ? 'minimal' : 'readable',

          // Tree shaking
          treeshake: mode === 'production',

          // Minification
          minify: mode === 'production',

          // Source map generation
          sourcemap: mode === 'development',
        },

        // ESM output configuration
        esm: {
          // Modern ES modules for production
          target: mode === 'production' ? 'es2020' : 'es2018',
        },
      }),
    ],

    // Environment variables for optimizer
    define: {
      'process.env.QWIK_BUILD_MODE': JSON.stringify(
        mode === 'production' ? 'production' : 'development'
      ),
      'process.env.QWIK_DEBUG': JSON.stringify(mode === 'development'),
    },

    // Build configuration
    build: {
      // Output configuration
      outDir: 'dist',

      // Modern browser targets
      target: mode === 'production' ? 'es2020' : 'es2018',

      // Chunk size optimization
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['@builder.io/qwik', '@builder.io/qwik-city'],
            'design-tokens': ['@n00plicate/design-tokens'],
            'design-system': ['@n00plicate/design-system'],
          },
        },
      },

      // Source map configuration
      sourcemap: mode === 'development',

      // Minification
      minify: mode === 'production' ? 'esbuild' : false,
    },
  };
});
```

Nx executor configuration for Qwik optimization:

```json
{
  "name": "build",
  "executor": "@nx/vite:build",
  "outputs": ["{options.outputPath}"],
  "options": {
    "outputPath": "dist/apps/web",
    "configFile": "vite.config.ts"
  },
  "configurations": {
    "production": {
      "mode": "production",
      "define": {
        "process.env.QWIK_BUILD_MODE": "\"production\"",
        "process.env.QWIK_DEBUG": "\"false\""
      }
    },
    "development": {
      "mode": "development",
      "define": {
        "process.env.QWIK_BUILD_MODE": "\"development\"",
        "process.env.QWIK_DEBUG": "\"true\""
      }
    }
  }
}
```

## Static Assets & OG Images

### Font and Asset Management

Store fonts and images under `/public` with token integration:

```text
public/
├── fonts/
│   ├── inter/
│   │   ├── Inter-Regular.woff2
│   │   ├── Inter-Medium.woff2
│   │   └── Inter-Bold.woff2
│   └── font-display.css
├── images/
│   ├── og/                 # Open Graph images
│   ├── icons/              # App icons
│   └── illustrations/      # Design system illustrations
└── manifest.json
```

Font loading with design tokens:

```css
/* public/fonts/font-display.css */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* Important for performance */
  src: url('./inter/Inter-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./inter/Inter-Medium.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./inter/Inter-Bold.woff2') format('woff2');
}
```

### Open Graph Image Generation

Integrate with og-img for auto-generated Open Graph cards:

```bash
# Install og-img integration
pnpm add @qwikdev/og-img
```

Configure OG image generation:

```typescript
// src/routes/og-image.tsx
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { ImageResponse } from '@qwikdev/og-img';
import { tokens } from '@n00plicate/design-tokens';

export const useOGImageData = routeLoader$(async ({ params, url }) => {
  const title = params.title || 'n00plicate Design System';
  const description = params.description || 'Open-source design system built with design tokens';

  return { title, description, url: url.toString() };
});

export default component$(() => {
  const data = useOGImageData();

  return (
    <ImageResponse
      width={1200}
      height={630}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.color.surface.primary,
        fontFamily: tokens.typography.body.fontFamily,
        color: tokens.color.text.primary,
        padding: tokens.spacing.xl
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '800px'
        }}
      >
        <h1
          style={{
            fontSize: tokens.typography.heading.xl.fontSize,
            fontWeight: tokens.typography.heading.xl.fontWeight,
            marginBottom: tokens.spacing.lg,
            lineHeight: 1.2
          }}
        >
          {data.value.title}
        </h1>

        <p
          style={{
            fontSize: tokens.typography.body.lg.fontSize,
            color: tokens.color.text.secondary,
            marginBottom: tokens.spacing.xl,
            maxWidth: '600px'
          }}
        >
          {data.value.description}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.md,
            padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
            backgroundColor: tokens.color.action.primary,
            color: tokens.color.text.onPrimary,
            borderRadius: tokens.radius.md,
            fontSize: tokens.typography.body.md.fontSize,
            fontWeight: tokens.typography.body.md.fontWeight
          }}
        >
          🎨 View Design System
        </div>
      </div>
    </ImageResponse>
  );
});
```

Meta tag integration for OG images:

```typescript
// src/routes/layout.tsx
import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const usePageMeta = routeLoader$(async ({ url, params }) => {
  const title = params.title || 'n00plicate Design System';
  const description = params.description || 'Open-source design system built with design tokens';

  return {
    title,
    description,
    ogImage: `${url.origin}/og-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
  };
});

export default component$(() => {
  const meta = usePageMeta();

  return (
    <>
      <head>
        <title>{meta.value.title}</title>
        <meta name="description" content={meta.value.description} />

        {/* Open Graph */}
        <meta property="og:title" content={meta.value.title} />
        <meta property="og:description" content={meta.value.description} />
        <meta property="og:image" content={meta.value.ogImage} />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.value.title} />
        <meta name="twitter:description" content={meta.value.description} />
        <meta name="twitter:image" content={meta.value.ogImage} />

        {/* Preload critical assets */}
        <link rel="preload" href="/fonts/inter/Inter-Regular.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/font-display.css" as="style" />
      </head>

      <body>
        <Slot />
      </body>
    </>
  );
});
```
