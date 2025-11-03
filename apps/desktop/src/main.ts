/**
 * n00plicate Desktop App - Tauri Main Entry
 *
 * Desktop application for the n00plicate design token system demonstrating
 * collision-prevention architecture with web technologies and native performance.
 */

// Import design tokens with collision-safe paths
// Import design tokens with collision-safe paths
import '@n00plicate/design-tokens/css';

// TypeScript compatibility: Allow importing CSS files as modules to prevent TypeScript errors.
// Move the CSS module declaration to a separate .d.ts file for proper type support.

import './style.css';

// Initialize the desktop app
// Main container for the app
const appRoot = document.getElementById('app');
if (!appRoot) {
  const errorMsg = 'Desktop shell failed to locate #app root element';
  throw new Error(errorMsg);
}
appRoot.innerHTML = getAppHtml();

function getAppHtml(): string {
  return `
    <div class="container">
      <header class="header">
        <h1 class="title">n00plicate Design Tokens</h1>
        <p class="subtitle">Desktop App with Collision-Prevention Architecture</p>
      </header>
      <main class="main">
        <section class="token-section">
          <h2 class="section-title">Design Token Demo</h2>

          <div class="color-grid">
            <div class="color-item">
              <div class="color-swatch primary"></div>
              <span class="token-label">--ds-color-primary-500</span>
            </div>

            <div class="color-item">
              <div class="color-swatch secondary"></div>
              <span class="token-label">--ds-color-secondary-500</span>
            </div>

            <div class="color-item">
              <div class="color-swatch neutral"></div>
              <span class="token-label">--ds-color-neutral-500</span>
            </div>
          </div>
        </section>

        <section class="button-section">
          <h2 class="section-title">Button Demo</h2>

          <div class="button-grid">
            <button class="btn btn-primary">Primary Button</button>
            <button class="btn btn-secondary">Secondary Button</button>
            <button class="btn btn-outline">Outline Button</button>
          </div>
        </section>

        <section class="spacing-section">
          <h2 class="section-title">Spacing Demo</h2>

          <div class="spacing-grid">
            <div class="spacing-item spacing-xs">XS (--ds-spacing-xs)</div>
            <div class="spacing-item spacing-sm">SM (--ds-spacing-sm)</div>
            <div class="spacing-item spacing-md">MD (--ds-spacing-md)</div>
            <div class="spacing-item spacing-lg">LG (--ds-spacing-lg)</div>
          </div>
        </section>
      </main>

      <footer class="footer">
        <p class="footer-text">
          Built with Tauri 2.0 • Design tokens with ds- prefix collision prevention
        </p>
      </footer>
    </div>
  `;
}
