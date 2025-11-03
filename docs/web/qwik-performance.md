# Qwik City Performance Optimization

Complete guide to Qwik City performance: image optimization, prefetch strategies, service worker integration, and build
optimizations.

## Table of Contents

- [Image Optimization](#image-optimization)
- [Prefetch Strategies](#prefetch-strategies)
- [Service Worker Integration](#service-worker-integration)
- [Build Optimizations](#build-optimizations)
- [Performance Monitoring](#performance-monitoring)
- [Environment Configuration](#environment-configuration)

## Image Optimization

### Automatic Image Optimization Setup

Qwik City provides automatic image optimization through the `@builder.io/qwik-image` package:

```bash
# Install image optimization
pnpm qwik add image-optimization

# Or manually install
pnpm add @builder.io/qwik-image
```

### Configuration

```typescript
// vite.config.ts - Image optimization configuration
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikImageOptimization } from '@builder.io/qwik-image/vite';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      qwikImageOptimization({
        // Automatic format conversion
        formats: ['webp', 'avif', 'jpeg'],

        // Quality settings
        quality: {
          webp: 85,
          avif: 80,
          jpeg: 85,
        },

        // Responsive breakpoints
        breakpoints: [640, 768, 1024, 1280, 1536],

        // Lazy loading by default
        loading: 'lazy',

        // Decode async for better performance
        decoding: 'async',
      }),
    ],

    // Additional optimizations
    build: {
      rollupOptions: {
        output: {
          // Separate image chunks
          assetFileNames: assetInfo => {
            if (/\.(jpe?g|png|svg|gif|webp|avif)$/i.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  };
});
```

### Component Usage

```tsx
// components/OptimizedImage.tsx - Enhanced image component
import { component$, type QwikIntrinsicElements } from '@builder.io/qwik';
import { Image } from '@builder.io/qwik-image';

interface OptimizedImageProps extends QwikIntrinsicElements['img'] {
  src: string;
  alt: string;
  priority?: boolean;
  responsive?: boolean;
  placeholder?: 'blur' | 'empty';
}

export const OptimizedImage = component$<OptimizedImageProps>(({
  src,
  alt,
  priority = false,
  responsive = true,
  placeholder = 'empty',
  class: className,
  ...props
}) => {
  return (
    <Image
      src={src}
      alt={alt}

      // Automatic format selection (webp/avif fallback)
      format="auto"

      // Responsive images
      sizes={responsive ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}

      // Priority loading for above-the-fold images
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : 'auto'}

      // Decode async for better performance
      decoding="async"

      // Placeholder while loading
      placeholder={placeholder}

      // Additional optimizations
      quality={85}

      class={className}
      {...props}
    />
  );
});
```

### Hero Image Optimization

```tsx
// components/HeroImage.tsx - Optimized hero image with preload
import { component$, useTask$ } from '@builder.io/qwik';
import { OptimizedImage } from './OptimizedImage';

export const HeroImage = component$<{
  src: string;
  alt: string;
  preload?: boolean;
}>(props => {
  // Preload hero image for LCP optimization
  useTask$(({ track }) => {
    track(() => props.preload);

    if (props.preload && typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = props.src;
      link.fetchpriority = 'high';
      document.head.appendChild(link);
    }
  });

  return (
    <OptimizedImage
      src={props.src}
      alt={props.alt}
      priority={true}
      class="hero-image"
      // Hero-specific optimizations
      sizes="100vw"
      quality={90}
      format="webp"
      // Ensure hero image loads fast
      loading="eager"
      fetchpriority="high"
    />
  );
});
```

## Prefetch Strategies

### Viewport-Based Prefetching

```tsx
// components/SmartLink.tsx - Intelligent link prefetching
import { component$, type PropFunction } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

interface SmartLinkProps {
  href: string;
  children: any;
  prefetchStrategy?: 'viewport' | 'hover' | 'intent' | 'none';
  priority?: 'high' | 'low' | 'auto';
}

export const SmartLink = component$<SmartLinkProps>(
  ({
    href,
    children,
    prefetchStrategy = 'viewport',
    priority = 'auto',
    ...props
  }) => {
    return (
      <Link
        href={href}
        // Prefetch when link enters viewport
        prefetch={prefetchStrategy === 'viewport' ? 'viewport' : false}
        // Alternative: Prefetch on hover/intent
        onMouseEnter$={
          prefetchStrategy === 'hover'
            ? () => {
                // Manual prefetch trigger
                if (typeof document !== 'undefined') {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = href;
                  document.head.appendChild(link);
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </Link>
    );
  }
);
```

### Advanced Prefetch Configuration

```typescript
// vite.config.ts - Prefetch optimization
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        // Configure prefetch behavior
        prefetch: {
          // Prefetch strategy for navigation
          implementation: {
            linkInsert: 'html-append',
            linkRel: 'prefetch',
            workerFetchInsert: 'always',
            prefetchEvent: 'qvisible', // Prefetch when visible
          },

          // Prefetch rules
          include: [
            // Prefetch critical routes
            { path: '/', priority: 'high' },
            { path: '/about', priority: 'low' },
            { path: '/contact', priority: 'low' },
          ],

          exclude: [
            // Don't prefetch heavy pages
            '/dashboard/**',
            '/admin/**',
          ],
        },
      }),
      qwikVite({
        // Optimizer options for prefetch
        optimizer: {
          chunkStrategy: {
            type: 'smart', // Smart chunking for better prefetch
            minChunkSize: 1000,
          },
        },
      }),
    ],
  };
});
```

### Route-Based Prefetch Strategy

```tsx
// src/routes/layout.tsx - Smart route prefetching
import { component$, Slot, useTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const location = useLocation();

  // Intelligent prefetching based on current route
  useTask$(({ track }) => {
    track(() => location.url.pathname);

    if (typeof document !== 'undefined') {
      // Prefetch likely next pages based on current route
      const prefetchMap = {
        '/': ['/about', '/features'],
        '/about': ['/contact', '/team'],
        '/features': ['/pricing', '/demo'],
        '/pricing': ['/signup', '/contact'],
      };

      const currentPath = location.url.pathname;
      const prefetchPaths = prefetchMap[currentPath] || [];

      prefetchPaths.forEach((path, index) => {
        // Stagger prefetch requests
        setTimeout(() => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = path;
          link.fetchpriority = index === 0 ? 'high' : 'low';
          document.head.appendChild(link);
        }, index * 500);
      });
    }
  });

  return (
    <div class="app-layout">
      <Slot />
    </div>
  );
});
```

## Service Worker Integration

### Service Worker Setup

```typescript
// src/entry.service-worker.ts - Custom service worker
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';

// Qwik City service worker
setupServiceWorker();

// Custom caching strategies
const CACHE_NAME = 'n00plicate-v1';
const STATIC_CACHE = 'n00plicate-static-v1';
const RUNTIME_CACHE = 'n00plicate-runtime-v1';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  // Critical CSS and JS files
  '/build/q-*.css',
  '/build/q-*.js',
];

// Cache strategies
const cacheStrategies = {
  // Images: Cache first with fallback
  images: {
    match: /\.(jpg|jpeg|png|gif|webp|avif|svg)$/,
    strategy: 'cache-first',
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  // API: Network first with cache fallback
  api: {
    match: /\/api\//,
    strategy: 'network-first',
    cacheName: RUNTIME_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
  },

  // Static assets: Cache first
  static: {
    match: /\.(css|js|woff2?)$/,
    strategy: 'cache-first',
    cacheName: STATIC_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  },
};

// Install event - precache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Apply matching strategy
  for (const [name, strategy] of Object.entries(cacheStrategies)) {
    if (strategy.match.test(url.pathname) || strategy.match.test(url.href)) {
      event.respondWith(handleRequest(request, strategy));
      return;
    }
  }

  // Default: network first for HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleHTMLRequest(request));
  }
});

// Cache strategies implementation
async function handleRequest(request: Request, strategy: any) {
  const cache = await caches.open(strategy.cacheName);

  if (strategy.strategy === 'cache-first') {
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  }

  if (strategy.strategy === 'network-first') {
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await cache.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  }
}

async function handleHTMLRequest(request: Request) {
  try {
    const response = await fetch(request);

    // Cache successful HTML responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    // Return cached version or offline page
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    if (cached) return cached;

    // Return offline page
    const offlineCache = await caches.open(STATIC_CACHE);
    return (
      offlineCache.match('/offline') || new Response('Offline', { status: 503 })
    );
  }
}
```

### Offline Page

```tsx
// src/routes/offline/index.tsx - Offline fallback page
import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="offline-page">
      <div class="offline-content">
        <h1>You're Offline</h1>
        <p>
          It looks like you've lost your internet connection. Don't worry, you
          can still browse some cached content.
        </p>

        <div class="offline-actions">
          <button
            type="button"
            onClick$={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            class="retry-button"
          >
            Try Again
          </button>

          <a href="/" class="home-link">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Offline - n00plicate Design System',
  meta: [
    {
      name: 'description',
      content:
        'You are currently offline. Some cached content may still be available.',
    },
  ],
};
```

## Build Optimizations

### Environment Configuration

```bash
# .env.production - Production environment variables
NODE_ENV=production

# Qwik specific optimizations
QWIK_BUILD_MODE=production
QWIK_DEBUG=false

# Nx execution environment
NX_EXEC_ENV=production

# Build optimizations
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true
VITE_BUILD_TARGET=es2020

# Performance monitoring
VITE_ANALYZE_BUNDLE=false
VITE_REPORT_PERFORMANCE=true
```

### Vite Build Configuration

```typescript
// vite.config.ts - Production optimizations
import { defineConfig, type UserConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';

export default defineConfig(({ mode }): UserConfig => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      qwikCity(),
      qwikVite({
        optimizer: {
          // Production optimizations
          minify: isProduction,
          sourcemap: !isProduction,

          // Chunking strategy for optimal loading
          chunkStrategy: {
            type: 'smart',
            minChunkSize: 1000,
            maxChunkSize: 50000,
          },

          // Tree shaking optimization
          treeShaking: isProduction,

          // Symbol optimization
          symbolsOutput: isProduction ? 'minimal' : 'detailed',
        },
      }),
    ],

    build: {
      // Target modern browsers for better optimization
      target: 'es2020',

      // Minification
      minify: isProduction ? 'terser' : false,

      // Source maps for debugging
      sourcemap: !isProduction,

      // Rollup optimizations
      rollupOptions: {
        output: {
          // Manual chunking for better caching
          manualChunks: {
            // Vendor libraries
            'vendor-react': ['react', 'react-dom'],
            'vendor-utils': ['lodash', 'date-fns'],

            // Design system components
            'design-system': ['@n00plicate/design-system'],
            'design-tokens': ['@n00plicate/design-tokens'],
          },

          // Optimal chunk sizes
          experimentalMinChunkSize: 1000,

          // Asset naming for caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },

      // Terser options for production
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log'],
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false,
            },
          }
        : undefined,
    },

    // Dependency optimization
    optimizeDeps: {
      include: ['@n00plicate/design-tokens', '@n00plicate/design-system'],
      exclude: ['@builder.io/qwik', '@builder.io/qwik-city'],
    },

    // Development server optimizations
    server: {
      fs: {
        strict: false, // Allow serving files from parent directories
      },
    },
  };
});
```

## Performance Monitoring

### Core Web Vitals Tracking

```typescript
// src/utils/performance.ts - Performance monitoring
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function trackWebVitals(callback: (metric: WebVitalsMetric) => void) {
  if (typeof window === 'undefined') return;

  // Dynamic import for better performance
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(callback);
    onFID(callback);
    onFCP(callback);
    onLCP(callback);
    onTTFB(callback);
    onINP?.(callback); // Optional for newer versions
  });
}

// Report to analytics
export function reportWebVitals(metric: WebVitalsMetric) {
  // Analytics integration
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Custom analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
    keepalive: true,
  }).catch(console.error);
}
```

### Performance Component

```tsx
// components/PerformanceMonitor.tsx - Client-side performance tracking
import { component$, useTask$, useSignal } from '@builder.io/qwik';
import { trackWebVitals, reportWebVitals } from '~/utils/performance';

export const PerformanceMonitor = component$(() => {
  const metrics = useSignal<Record<string, number>>({});

  useTask$(({ cleanup }) => {
    // Track Core Web Vitals
    trackWebVitals(metric => {
      metrics.value = {
        ...metrics.value,
        [metric.name]: metric.value,
      };

      // Report to analytics
      reportWebVitals(metric);
    });

    // Performance observer for additional metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const nav = entry as PerformanceNavigationTiming;

            // Track additional metrics
            const additionalMetrics = {
              'Dom-Load':
                nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
              'Resource-Load': nav.loadEventEnd - nav.loadEventStart,
              'DNS-Time': nav.domainLookupEnd - nav.domainLookupStart,
              'Connect-Time': nav.connectEnd - nav.connectStart,
              'Request-Time': nav.responseEnd - nav.requestStart,
              'Response-Time': nav.responseEnd - nav.responseStart,
            };

            Object.entries(additionalMetrics).forEach(([name, value]) => {
              if (value > 0) {
                metrics.value = { ...metrics.value, [name]: value };
              }
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });

      cleanup(() => observer.disconnect());
    }
  });

  return null; // This is a utility component with no UI
});
```

### Bundle Analysis

```bash
#!/bin/bash
# scripts/analyze-bundle.sh - Bundle analysis script

echo "📊 Analyzing bundle size and performance..."

# Build with analysis enabled
VITE_ANALYZE_BUNDLE=true pnpm build

# Generate bundle report
npx vite-bundle-analyzer dist/

# Check bundle size limits
node scripts/check-bundle-size.js

# Performance budget check
if [ -f "dist/manifest.json" ]; then
  echo "✅ Manifest generated successfully"

  # Check critical resource sizes
  MAIN_JS_SIZE=$(find dist -name "*.js" -exec du -b {} + | awk '{sum += $1} END {print sum}')
  MAIN_CSS_SIZE=$(find dist -name "*.css" -exec du -b {} + | awk '{sum += $1} END {print sum}')

  echo "📦 Bundle sizes:"
  echo "  JavaScript: $(echo $MAIN_JS_SIZE | numfmt --to=iec-i)B"
  echo "  CSS: $(echo $MAIN_CSS_SIZE | numfmt --to=iec-i)B"

  # Performance budget enforcement
  MAX_JS_SIZE=500000  # 500KB
  MAX_CSS_SIZE=100000 # 100KB

  if [ $MAIN_JS_SIZE -gt $MAX_JS_SIZE ]; then
    echo "❌ JavaScript bundle exceeds limit: $(echo $MAIN_JS_SIZE | numfmt --to=iec-i)B > $(echo $MAX_JS_SIZE | numfmt --to=iec-i)B"
    exit 1
  fi

  if [ $MAIN_CSS_SIZE -gt $MAX_CSS_SIZE ]; then
    echo "❌ CSS bundle exceeds limit: $(echo $MAIN_CSS_SIZE | numfmt --to=iec-i)B > $(echo $MAX_CSS_SIZE | numfmt --to=iec-i)B"
    exit 1
  fi

  echo "✅ Bundle sizes within performance budget"
fi
```

This comprehensive Qwik City performance documentation covers essential optimization strategies for excellent Core Web
Vitals.
