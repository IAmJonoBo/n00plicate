#!/usr/bin/env bash
set -euo pipefail

# Navigate to repo root (script resides at root)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${REPO_ROOT}"

echo "🧩 Bootstrapping n00plicate dev environment..."

# Use nvm if available
if command -v nvm >/dev/null 2>&1; then
  if [[ -f .nvmrc ]]; then
    echo "📦 Using Node version from .nvmrc"
    nvm install
    nvm use
  fi
else
  NODE_VERSION=$(cat .nvmrc 2>/dev/null || echo '22.20.0' || true)
  echo "ℹ️ nvm not found; ensure your Node version matches ${NODE_VERSION}"
fi

# Enable corepack and prepare pnpm
if command -v corepack >/dev/null 2>&1; then
  echo "⚙️ Enabling corepack and preparing pnpm..."
  corepack enable
  corepack prepare pnpm@10.18.2 --activate
else
  echo "⚠️ corepack not found; install pnpm manually if needed"
fi

# Clean Apple junk files pre-install (safe)
node tools/apple-cleaner.js . || true

echo "📥 Installing dependencies with pnpm..."
pnpm install --no-frozen-lockfile

echo "🧹 Post-install cleanup..."
pnpm run clean:apple || true

echo "✅ Dev environment setup complete. Try: pnpm dev or pnpm storybook"
