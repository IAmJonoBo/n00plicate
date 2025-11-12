# Tauri Integration Guide

Advanced Tauri v2 integration for design tokens, security, auto-updates, and CSP configuration for desktop delivery.

## Overview

This guide covers Tauri desktop app integration with design tokens, security best practices, auto-updater configuration,
and Content Security Policy (CSP) implementation for the n00plicate design system.

## Table of Contents

- [CSP and Security Configuration](#csp-and-security-configuration)
- [Auto-Updater Plugin](#auto-updater-plugin)
- [Frontend Folder Configuration](#frontend-folder-configuration)
- [Token Integration](#token-integration)
- [Security Checklist](#security-checklist)
- [Advanced Configuration](#advanced-configuration)

## CSP and Security Configuration

### Strict CSP with Script Hashes

Tauri automatically injects strict CSP with script hashes. Keep HTML meta tag blank to enforce default policy:

```html
<!-- src/index.html - Keep CSP meta tag empty for auto-injection -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ❌ Don't manually set CSP - let Tauri handle it -->
    <!-- <meta http-equiv="Content-Security-Policy" content="..."> -->

    <!-- ✅ Let Tauri inject CSP automatically -->
    <meta http-equiv="Content-Security-Policy" content="" />

    <title>n00plicate Design System</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Configure CSP in Tauri configuration:

```json
{
  "tauri": {
    "security": {
      "csp": {
        "default-src": "'self'",
        "style-src": "'self' 'unsafe-inline'",
        "script-src": "'self' 'wasm-unsafe-eval'",
        "img-src": "'self' data: blob:",
        "font-src": "'self' data:",
        "connect-src": "'self' https://api.n00plicate.design wss://api.n00plicate.design",
        "media-src": "'self'",
        "object-src": "'none'",
        "base-uri": "'self'",
        "frame-ancestors": "'none'",
        "form-action": "'self'"
      },
      "dangerousDisableAssetCspModification": false,
      "assetProtocol": {
        "enable": true,
        "scope": ["**"]
      },
      "allowlist": {
        "all": false,
        "shell": {
          "all": false,
          "open": true,
          "scope": [
            {
              "name": "browser",
              "cmd": "open",
              "args": {
                "url": {
                  "validator": "^https://github\\.com/.*|^https://design\\.penpot\\.app/.*"
                }
              }
            }
          ]
        },
        "fs": {
          "all": false,
          "readFile": true,
          "writeFile": true,
          "scope": [
            "$APPDATA/n00plicate/**",
            "$DOCUMENT/n00plicate/**",
            "$APPCONFIG/n00plicate/**"
          ]
        },
        "http": {
          "all": false,
          "request": true,
          "scope": [
            "https://api.n00plicate.design/**",
            "https://cdn.n00plicate.design/**",
            "https://github.com/IAmJonoBo/n00plicate/**"
          ]
        },
        "notification": {
          "all": true
        },
        "dialog": {
          "all": false,
          "ask": true,
          "confirm": true,
          "message": true,
          "open": true,
          "save": true
        },
        "updater": {
          "active": true
        }
      }
    }
  }
}
```

## Auto-Updater Plugin

### Plugin Installation and Configuration

Add the updater plugin to Cargo.toml:

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri = { version = "2.0", features = ["updater"] }
tauri-plugin-updater = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
```

Configure updater in main.rs:

```rust
// src-tauri/src/main.rs
use tauri::Manager;
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Auto-check for updates on startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = check_for_updates(handle).await {
                    eprintln!("Failed to check for updates: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_for_updates_command,
            install_update_command,
            get_app_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn check_for_updates(app: tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let updater = app.updater()?;

    if let Some(update) = updater.check().await? {
        println!("Update available: {}", update.version);

        // Notify frontend about available update
        app.emit_all("update-available", &update.version)?;

        // Optional: Auto-download update
        let mut downloaded = 0;
        update.download_and_install(
            |chunk_length, content_length| {
                downloaded += chunk_length;
                let progress = (downloaded as f64 / content_length.unwrap_or(1) as f64) * 100.0;
                println!("Download progress: {:.2}%", progress);
            },
            || {
                println!("Update downloaded, restarting...");
            }
        ).await?;
    } else {
        println!("No updates available");
    }

    Ok(())
}

#[tauri::command]
async fn check_for_updates_command(app: tauri::AppHandle) -> Result<String, String> {
    match check_for_updates(app).await {
        Ok(_) => Ok("Update check completed".to_string()),
        Err(e) => Err(format!("Update check failed: {}", e))
    }
}

#[tauri::command]
async fn install_update_command(app: tauri::AppHandle) -> Result<(), String> {
    let updater = app.updater().map_err(|e| e.to_string())?;

    if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
        update.download_and_install(
            |_chunk_length, _content_length| {
                // Progress callback
            },
            || {
                // Download completed callback
            }
        ).await.map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
```

### Update Manifest Configuration

Configure updater endpoints in tauri.conf.json:

```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/IAmJonoBo/n00plicate/releases/latest/download/n00plicate-updater.json",
        "https://cdn.n00plicate.design/releases/latest/n00plicate-updater.json"
      ],
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmljIGFwcCBwdWJsaWMga2V5CkZDUUZBUEh2MzJMdWJ5Z..."
    }
  }
}
```

Create update manifest for GitHub Releases:

```json
{
  "version": "v1.0.1",
  "notes": "Bug fixes and performance improvements",
  "pub_date": "2025-06-23T10:30:00Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkK...",
      "url": "https://github.com/IAmJonoBo/n00plicate/releases/download/v1.0.1/n00plicate_1.0.1_x64.dmg"
    },
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkK...",
      "url": "https://github.com/IAmJonoBo/n00plicate/releases/download/v1.0.1/n00plicate_1.0.1_aarch64.dmg"
    },
    "linux-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkK...",
      "url": "https://github.com/IAmJonoBo/n00plicate/releases/download/v1.0.1/n00plicate_1.0.1_amd64.AppImage"
    },
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkK...",
      "url": "https://github.com/IAmJonoBo/n00plicate/releases/download/v1.0.1/n00plicate_1.0.1_x64-setup.exe"
    }
  }
}
```

### Frontend Updater Integration

Implement updater UI in the frontend:

```typescript
// src/lib/updater.ts
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { ask, message } from '@tauri-apps/api/dialog';

export interface UpdateInfo {
  version: string;
  notes: string;
  available: boolean;
}

export class UpdateManager {
  private static instance: UpdateManager;

  static getInstance(): UpdateManager {
    if (!UpdateManager.instance) {
      UpdateManager.instance = new UpdateManager();
    }
    return UpdateManager.instance;
  }

  async initialize() {
    // Listen for update events
    await listen('update-available', async event => {
      const version = event.payload as string;
      const shouldUpdate = await ask(
        `A new version (${version}) is available. Would you like to update now?`,
        { title: 'Update Available', type: 'info' }
      );

      if (shouldUpdate) {
        await this.installUpdate();
      }
    });

    // Check for updates on app startup
    await this.checkForUpdates();
  }

  async checkForUpdates(): Promise<void> {
    try {
      await invoke('check_for_updates_command');
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  async installUpdate(): Promise<void> {
    try {
      await message(
        'Update will be downloaded and installed. The app will restart automatically.',
        {
          title: 'Installing Update',
          type: 'info',
        }
      );

      await invoke('install_update_command');
    } catch (error) {
      console.error('Failed to install update:', error);
      await message(`Failed to install update: ${error}`, {
        title: 'Update Error',
        type: 'error',
      });
    }
  }

  async getAppVersion(): Promise<string> {
    return await invoke('get_app_version');
  }
}

// Auto-initialize updater
if (typeof window !== 'undefined') {
  UpdateManager.getInstance().initialize();
}
```

## Token Integration

### Design Token Loading in Tauri

Import and use design tokens in your Tauri frontend:

```typescript
// src/lib/tokens.ts
import '@n00plicate/design-tokens/css';
import { dsColors, dsSpacing, dsTypography } from '@n00plicate/design-tokens/js';

export class TokenManager {
  static loadTokens() {
    // Tokens are automatically available via CSS imports
    // JavaScript tokens are available for dynamic usage
    console.log('Design tokens loaded:', {
      colors: dsColors,
      spacing: dsSpacing,
      typography: dsTypography,
    });
  }

  static applyTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
```

### CSS Token Usage

Apply design tokens in your Tauri app styles:

```css
/* src/styles/app.css */
.tauri-app {
  font-family: var(--ds-typography-body-font-family);
  color: var(--ds-color-text-primary);
  background-color: var(--ds-color-background-primary);
  padding: var(--ds-spacing-md);
}

.tauri-button {
  background-color: var(--ds-color-primary-500);
  color: var(--ds-color-primary-contrast);
  padding: var(--ds-spacing-sm) var(--ds-spacing-md);
  border-radius: var(--ds-border-radius-md);
  border: none;
  font-size: var(--ds-typography-button-font-size);
  font-weight: var(--ds-typography-button-font-weight);
}

.tauri-button:hover {
  background-color: var(--ds-color-primary-600);
}
```

### Dynamic Token Application

Use tokens dynamically in TypeScript:

```typescript
// src/components/TauriComponent.tsx
import { dsColors, dsSpacing } from '@n00plicate/design-tokens/js';

export function TauriComponent() {
  const dynamicStyles = {
    backgroundColor: dsColors.primary[500],
    padding: `${dsSpacing.sm} ${dsSpacing.md}`,
    margin: dsSpacing.lg,
  };

  return (
    <div style={dynamicStyles}>
      <h1>Tauri App with Design Tokens</h1>
    </div>
  );
}
```

### Token Bundling Configuration

Ensure tokens are properly bundled with your Tauri app:

```json
{
  "tauri": {
    "bundle": {
      "resources": [
        "tokens/**",
        "assets/**",
        "../../../packages/design-tokens/dist/**"
      ]
    }
  }
}
```

## Security Checklist

### Essential Security Configuration

- [ ] **CSP Configuration**: Implement strict Content Security Policy
- [ ] **Asset Protocol**: Enable secure asset loading with proper scope
- [ ] **API Allowlist**: Minimize enabled APIs to only what's needed
- [ ] **File System Access**: Restrict to specific directories only
- [ ] **Network Access**: Limit HTTP requests to trusted domains
- [ ] **Shell Commands**: Disable or strictly limit shell access

### CSP Security Validation

Verify your CSP configuration:

```bash
# Test CSP headers in development
curl -I http://localhost:5173

# Check for CSP violations in browser console
# Look for: "Content Security Policy directive violated"
```

### API Surface Minimization

Audit your allowlist configuration:

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true,
        "scope": [
          {
            "name": "browser",
            "cmd": "open",
            "args": {
              "url": {
                "validator": "^https://github\\.com/.*|^https://design\\.penpot\\.app/.*"
              }
            }
          }
        ]
      },
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "scope": ["$APPDATA/n00plicate/**"]
      }
    }
  }
}
```

### Code Signing and Distribution

Configure code signing for production builds:

```json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "signingIdentity": "Developer ID Application: Your Name",
        "hardenedRuntime": true,
        "entitlements": "entitlements.plist"
      },
      "windows": {
        "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

### Security Testing

Regular security validation:

```bash
# Audit dependencies
cargo audit

# Check for security vulnerabilities
pnpm audit

# Run security linting
cargo clippy -- -D warnings

# Test CSP compliance
pnpm run test:security
```

## Advanced Configuration

### Multi-Window Configuration

Configure multiple windows for advanced desktop features:

```json
{
  "tauri": {
    "windows": [
      {
        "label": "main",
        "title": "n00plicate Design System",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      },
      {
        "label": "preferences",
        "title": "Preferences",
        "width": 600,
        "height": 400,
        "resizable": false,
        "center": true,
        "visible": false
      }
    ]
  }
}
```

### System Tray Integration

Add system tray functionality:

```rust
// src-tauri/src/main.rs
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let preferences = CustomMenuItem::new("preferences".to_string(), "Preferences");
    let tray_menu = SystemTrayMenu::new()
        .add_item(preferences)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "preferences" => {
                    let window = app.get_window("preferences").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Native Menu Integration

Configure native application menus:

```rust
// src-tauri/src/main.rs
use tauri::{Menu, MenuItem, Submenu};

fn main() {
    let menu = Menu::new()
        .add_submenu(Submenu::new(
            "File",
            Menu::new()
                .add_item(MenuItem::CloseWindow)
                .add_native_item(tauri::MenuItem::Separator)
                .add_item(MenuItem::Quit),
        ))
        .add_submenu(Submenu::new(
            "Edit",
            Menu::new()
                .add_item(MenuItem::Undo)
                .add_item(MenuItem::Redo)
                .add_native_item(tauri::MenuItem::Separator)
                .add_item(MenuItem::Cut)
                .add_item(MenuItem::Copy)
                .add_item(MenuItem::Paste),
        ))
        .add_submenu(Submenu::new(
            "View",
            Menu::new()
                .add_item(MenuItem::EnterFullScreen)
                .add_item(MenuItem::Minimize)
                .add_item(MenuItem::Zoom),
        ));

    tauri::Builder::default()
        .menu(menu)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Performance Optimization

Optimize Tauri app performance:

```json
{
  "tauri": {
    "bundle": {
      "resources": ["tokens/**"],
      "externalBin": [],
      "deb": {
        "depends": []
      }
    },
    "allowlist": {
      "all": false
    }
  },
  "build": {
    "withGlobalTauri": false
  }
}
```

### Development Tools Integration

Configure development tools:

```json
{
  "scripts": {
  "tauri:dev": "pnpm --filter ./apps/web run serve & tauri dev",
  "tauri:build": "pnpm --filter ./apps/web run build && tauri build",
    "tauri:bundle": "tauri build --bundles all"
  }
}
```

### Cross-Platform Considerations

Platform-specific configurations:

```json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "10.13",
        "useBootstrapper": false
      },
      "windows": {
        "wix": {
          "language": "en-US"
        }
      },
      "linux": {
        "deb": {
          "depends": ["libwebkit2gtk-4.0-37"]
        }
      }
    }
  }
}
```

## Frontend Folder Configuration

### Project Structure

Configure your Tauri frontend following the recommended structure for design system integration:

```text
src/
├── index.html              # Entry point with CSP meta tags
├── main.ts                 # App initialization and updater setup
├── lib/
│   ├── tokens.ts           # Design token management
│   ├── updater.ts          # Update manager
│   └── tauri.ts            # Tauri API wrappers
├── components/
│   ├── ui/                 # Design system components
│   └── tauri/              # Tauri-specific components
├── styles/
│   ├── app.css             # Global styles with design tokens
│   ├── components.css      # Component-specific styles
│   └── tokens.css          # Token imports
└── assets/
    ├── icons/              # App icons and favicons
    └── images/             # Static images
```

### Tauri Configuration Files

Essential configuration files for frontend integration:

```json
// tauri.conf.json
{
  "build": {
  "beforeDevCommand": "pnpm run dev",
  "beforeBuildCommand": "pnpm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist",
    "withGlobalTauri": false
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "design.n00plicate.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": ["assets/**", "../../../packages/design-tokens/dist/**"]
    }
  }
}
```

### Package.json Scripts

Configure development and build scripts for Tauri:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:bundle": "tauri build --bundles all"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-updater": "^2.0.0",
    "@n00plicate/design-tokens": "workspace:*"
  }
}
```

### Vite Configuration

Optimize Vite for Tauri development:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(async () => ({
  plugins: [],

  // Prevent vite from obscuring rust errors
  clearScreen: false,

  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },

  // Production build optimizations
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',

    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,

    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@n00plicate/tokens': resolve(
        __dirname,
        '../../../packages/design-tokens/dist'
      ),
    },
  },
}));
```

### HTML Entry Point

Configure your main HTML file for Tauri:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- CSP will be injected by Tauri -->
    <meta http-equiv="Content-Security-Policy" content="" />

    <title>n00plicate Design System</title>

    <!-- Design token CSS imports -->
    <link rel="stylesheet" href="/src/styles/tokens.css" />
    <link rel="stylesheet" href="/src/styles/app.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### Frontend Initialization

Initialize your Tauri frontend with proper setup:

```typescript
// src/main.ts
import { TokenManager } from './lib/tokens';
import { UpdateManager } from './lib/updater';

// Initialize design tokens
TokenManager.loadTokens();

// Initialize update manager
UpdateManager.getInstance().initialize();

// Initialize your frontend framework
async function initApp() {
  // Your app initialization code here
  console.log('Tauri app initialized with design tokens');
}

// Wait for DOM and Tauri to be ready
document.addEventListener('DOMContentLoaded', initApp);
```
