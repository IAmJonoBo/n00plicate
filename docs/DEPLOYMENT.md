# 🚀 Deployment Guide

Complete guide for deploying n00plicate design system components to various platforms and environments.

> This guide is being updated for the 2.0 release. Where 1.x instructions remain, they are marked as
> legacy. Follow the release checklist in [`docs/IMPLEMENTATION_PLAN_2.0.md`](./IMPLEMENTATION_PLAN_2.0.md)
> for current milestones.

## 📋 Table of Contents

- [Overview](#overview)
- [Package Publishing](#package-publishing)
- [Storybook Deployment](#storybook-deployment)
- [Documentation Sites](#documentation-sites)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Overview

The n00plicate design system supports multiple deployment targets:

- **NPM Packages**: Component library and utilities
- **Storybook**: Interactive component documentation
- **Documentation Site**: Comprehensive guides and API docs
- **Design Tokens**: Multi-platform token artifacts

## Package Publishing

### NPM Package Deployment

#### Prerequisites

```bash
# Ensure you're logged into NPM
npm whoami

# If not logged in
npm login
```

#### Publishing Workflow

1. **Version Update**:

   ```bash
   # Update package versions
   pnpm changeset

   # Or manually update package.json versions
   pnpm version:bump
   ```

2. **Build Packages**:

   ```bash
   # Clean and rebuild all packages
   pnpm clean:all
   pnpm build

   # Run quality checks
   pnpm lint
   pnpm test
   pnpm typecheck
   ```

3. **Publish Packages**:

   ```bash
   # Publish all packages
   pnpm changeset publish

   # Or publish individually
   cd packages/design-tokens
   npm publish

   cd packages/design-system
   npm publish

   cd packages/shared-utils
   npm publish
   ```

#### Package Configuration

Ensure each package has proper configuration:

```json
// packages/*/package.json
{
  "name": "@n00plicate/package-name",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md"],
  "publishConfig": {
    "access": "public"
  }
}
```

### GitHub Packages Alternative

For private repositories or GitHub-hosted packages:

```bash
# Configure npm for GitHub Packages
echo "@n00plicate:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Publish to GitHub Packages
npm publish
```

## Storybook Deployment

### GitHub Pages Deployment

1. **Build Storybook**:

   ```bash
   cd packages/design-system
   pnpm build-storybook
   ```

2. **Deploy via GitHub Actions**:

   ```yaml
   # .github/workflows/storybook.yml
   name: Deploy Storybook

   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'pnpm'

         - run: pnpm install --frozen-lockfile
         - run: pnpm nx run design-system:build-storybook

         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: packages/design-system/storybook-static
   ```

### Netlify Deployment

1. **Create `netlify.toml`**:

   ```toml
   [build]
   base = "packages/design-system"
   command = "pnpm build-storybook"
   publish = "storybook-static"

   [build.environment]
   NODE_VERSION = "18"

   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

2. **Configure Netlify**:
   - Connect GitHub repository
   - Set build command: `pnpm install && pnpm nx run design-system:build-storybook`
   - Set publish directory: `packages/design-system/storybook-static`

### Vercel Deployment

1. **Create `vercel.json`**:

   ```json
   {
     "buildCommand": "pnpm nx run design-system:build-storybook",
     "outputDirectory": "packages/design-system/storybook-static",
     "installCommand": "pnpm install --frozen-lockfile"
   }
   ```

2. **Deploy**:

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

### Chromatic Visual Testing

1. **Setup Chromatic**:

   ```bash
   # Install Chromatic
   pnpm add -D chromatic

   # Add to package.json scripts
   "chromatic": "chromatic --exit-zero-on-changes"
   ```

2. **CI Integration**:

   ```yaml
   # Add to .github/workflows/ci.yml
   - name: Visual Regression Tests
     run: pnpm chromatic --project-token=${{ secrets.CHROMATIC_PROJECT_TOKEN }}
   ```

## Documentation Sites

### GitHub Pages Documentation

1. **Setup Documentation Build**:

   ```bash
   # Install documentation generator
   pnpm add -D @storybook/addon-docs vitepress
   ```

2. **Create Documentation Site**:

   ```javascript
   // docs/.vitepress/config.js
   export default {
     title: 'n00plicate Design System',
     description: 'Design system documentation',
     themeConfig: {
       nav: [
         { text: 'Guide', link: '/guide/' },
         { text: 'Components', link: '/components/' },
         { text: 'Tokens', link: '/tokens/' },
       ],
     },
   };
   ```

3. **Deploy Documentation**:

   ```yaml
   # .github/workflows/docs.yml
   name: Deploy Documentation

   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'

         - run: pnpm install
         - run: pnpm docs:build

         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: docs/.vitepress/dist
   ```

## CI/CD Pipeline

### Complete GitHub Actions Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Quality checks
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm nx affected -t build

      # Visual regression tests
      - run: pnpm nx run design-system:visual-test
        if: github.event_name == 'pull_request'

  release:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      # Create release PR or publish
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          commit: 'chore: release packages'
          title: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  deploy-storybook:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm nx run design-system:build-storybook

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: packages/design-system/storybook-static
          destination_dir: storybook
```

### Environment Secrets

Configure these secrets in GitHub repository settings:

```bash
# NPM publishing
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Chromatic visual testing
CHROMATIC_PROJECT_TOKEN=chpt_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Custom registry
CUSTOM_REGISTRY_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
```

## Environment Configuration

### Development Environment

```bash
# .env.development
NODE_ENV=development
VITE_API_URL=http://localhost:3000
STORYBOOK_API_URL=http://localhost:6006
```

### Staging Environment

```bash
# .env.staging
NODE_ENV=production
VITE_API_URL=https://api-staging.example.com
STORYBOOK_API_URL=https://storybook-staging.example.com
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.example.com
STORYBOOK_API_URL=https://storybook.example.com
```

### Container Deployment

#### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/*/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/packages/design-system/storybook-static /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n00plicate-storybook
  labels:
    app: n00plicate-storybook
spec:
  replicas: 3
  selector:
    matchLabels:
      app: n00plicate-storybook
  template:
    metadata:
      labels:
        app: n00plicate-storybook
    spec:
      containers:
        - name: n00plicate-storybook
          image: n00plicate/storybook:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: '128Mi'
              cpu: '100m'
            limits:
              memory: '256Mi'
              cpu: '200m'

---
apiVersion: v1
kind: Service
metadata:
  name: n00plicate-storybook-service
spec:
  selector:
    app: n00plicate-storybook
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

## Monitoring and Maintenance

### Health Checks

```javascript
// scripts/health-check.js
const packages = [
  '@n00plicate/design-tokens',
  '@n00plicate/design-system',
  '@n00plicate/shared-utils',
];

async function checkPackageHealth() {
  for (const pkg of packages) {
    try {
      const response = await fetch(`https://registry.npmjs.org/${pkg}`);
      const data = await response.json();
      console.log(`✅ ${pkg}: v${data['dist-tags'].latest}`);
    } catch (error) {
      console.error(`❌ ${pkg}: Error - ${error.message}`);
    }
  }
}

checkPackageHealth();
```

### Automated Updates

```yaml
# .github/workflows/update-dependencies.yml
name: Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - run: pnpm update
      - run: pnpm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update dependencies'
          body: 'Automated dependency updates'
          branch: 'chore/update-dependencies'
```

### Performance Monitoring

```javascript
// scripts/bundle-size-check.js
const { execSync } = require('child_process');
const fs = require('fs');

function checkBundleSize() {
  const packages = ['design-system', 'shared-utils'];
  const results = {};

  packages.forEach(pkg => {
    try {
      execSync(`cd packages/${pkg} && pnpm build`);
      const stats = fs.statSync(`packages/${pkg}/dist/index.js`);
      results[pkg] = {
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024),
      };
    } catch (error) {
      results[pkg] = { error: error.message };
    }
  });

  console.log('Bundle Size Report:');
  console.table(results);

  // Fail if any package exceeds size limit
  const sizeLimit = 100 * 1024; // 100KB
  const oversized = Object.entries(results).filter(
    ([_, stats]) => stats.size > sizeLimit
  );

  if (oversized.length > 0) {
    console.error('❌ Bundle size limit exceeded!');
    process.exit(1);
  }
}

checkBundleSize();
```

### Rollback Procedures

1. **NPM Package Rollback**:

   ```bash
   # Deprecate problematic version
   npm deprecate @n00plicate/design-system@1.2.0 "Critical bug - use 1.1.0 instead"

   # Or unpublish within 24 hours
   npm unpublish @n00plicate/design-system@1.2.0
   ```

2. **Storybook Rollback**:

   ```bash
   # Revert to previous deployment
   git revert HEAD
   git push origin main

   # Or manually deploy previous version
   git checkout previous-working-commit
   pnpm nx run design-system:build-storybook
   # Deploy to hosting platform
   ```

3. **Emergency Procedures**:

   ```bash
   # Quick fix process
   git checkout -b hotfix/critical-fix
   # Make minimal changes
   git commit -m "hotfix: critical issue"
   git push origin hotfix/critical-fix
   # Create PR and merge immediately
   # Trigger emergency deployment
   ```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Visual regression tests completed
- [ ] Bundle size within limits
- [ ] Breaking changes documented
- [ ] Migration guide updated (if needed)
- [ ] Version numbers updated
- [ ] Changelog updated

### Post-Deployment

- [ ] NPM packages published successfully
- [ ] Storybook deployed and accessible
- [ ] Documentation site updated
- [ ] Health checks passing
- [ ] Team notified of new release
- [ ] Release notes published

### Monitoring

- [ ] Package download metrics
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] User feedback collection

This deployment guide ensures reliable, automated releases while maintaining high quality standards for the n00plicate design
system.
