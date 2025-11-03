# Tauri Security Framework

This document covers the complete security implementation for the Tauri desktop application,
including CSP configuration, auto-updater security, code signing, and design token protection.

## Table of Contents

- [Security Architecture](#security-architecture)
- [Content Security Policy (CSP)](#content-security-policy-csp)
- [Auto-Updater Security](#auto-updater-security)
- [Code Signing & Distribution](#code-signing--distribution)
- [Token Security](#token-security)
- [Secure Communication](#secure-communication)
- [Runtime Security](#runtime-security)

## Security Architecture

### Security Model Overview

Tauri's security model provides multiple layers of protection for the design token pipeline:

```typescript
// src-tauri/src/security/mod.rs
use tauri::{Manager, Runtime, Window};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SecurityConfig {
    // CSP configuration
    pub csp: ContentSecurityPolicy,

    // Token security
    pub token_encryption: bool,
    pub token_validation: bool,

    // Communication security
    pub ipc_whitelist: Vec<String>,
    pub api_allowlist: Vec<String>,

    // Update security
    pub auto_update_enabled: bool,
    pub signature_verification: bool,

    // Development vs production modes
    pub dev_mode: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContentSecurityPolicy {
    pub default_src: Vec<String>,
    pub script_src: Vec<String>,
    pub style_src: Vec<String>,
    pub img_src: Vec<String>,
    pub font_src: Vec<String>,
    pub connect_src: Vec<String>,
    pub media_src: Vec<String>,
    pub object_src: Vec<String>,
    pub child_src: Vec<String>,
    pub frame_src: Vec<String>,
    pub worker_src: Vec<String>,
    pub manifest_src: Vec<String>,
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            csp: ContentSecurityPolicy::strict(),
            token_encryption: true,
            token_validation: true,
            ipc_whitelist: vec![
                "design_tokens".to_string(),
                "theme_manager".to_string(),
                "updater".to_string(),
            ],
            api_allowlist: vec![
                "fs".to_string(),
                "path".to_string(),
                "app".to_string(),
            ],
            auto_update_enabled: true,
            signature_verification: true,
            dev_mode: cfg!(debug_assertions),
        }
    }
}

impl ContentSecurityPolicy {
    pub fn strict() -> Self {
        Self {
            default_src: vec!["'self'".to_string()],
            script_src: vec![
                "'self'".to_string(),
                "'unsafe-inline'".to_string(), // Only for dev mode
            ],
            style_src: vec![
                "'self'".to_string(),
                "'unsafe-inline'".to_string(),
                "data:".to_string(),
            ],
            img_src: vec![
                "'self'".to_string(),
                "data:".to_string(),
                "blob:".to_string(),
            ],
            font_src: vec![
                "'self'".to_string(),
                "data:".to_string(),
            ],
            connect_src: vec![
                "'self'".to_string(),
                "tauri://localhost".to_string(),
            ],
            media_src: vec!["'none'".to_string()],
            object_src: vec!["'none'".to_string()],
            child_src: vec!["'none'".to_string()],
            frame_src: vec!["'none'".to_string()],
            worker_src: vec!["'self'".to_string()],
            manifest_src: vec!["'self'".to_string()],
        }
    }

    pub fn development() -> Self {
        let mut csp = Self::strict();
        csp.script_src.push("'unsafe-eval'".to_string());
        csp.connect_src.push("ws://localhost:*".to_string());
        csp.connect_src.push("http://localhost:*".to_string());
        csp.connect_src.push("https://localhost:*".to_string());
        csp
    }

    pub fn to_header_value(&self) -> String {
        format!(
            "default-src {}; script-src {}; style-src {}; img-src {}; font-src {}; connect-src {}; media-src {}; object-src {}; child-src {}; frame-src {}; worker-src {}; manifest-src {}",
            self.default_src.join(" "),
            self.script_src.join(" "),
            self.style_src.join(" "),
            self.img_src.join(" "),
            self.font_src.join(" "),
            self.connect_src.join(" "),
            self.media_src.join(" "),
            self.object_src.join(" "),
            self.child_src.join(" "),
            self.frame_src.join(" "),
            self.worker_src.join(" "),
            self.manifest_src.join(" ")
        )
    }
}
```

## Content Security Policy (CSP)

### CSP Configuration

```toml
# src-tauri/tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'wasm-unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'", "data:"],
        "img-src": ["'self'", "data:", "blob:"],
        "font-src": ["'self'", "data:"],
        "connect-src": ["'self'", "tauri://localhost", "https://api.n00plicate.design"],
        "media-src": ["'none'"],
        "object-src": ["'none'"],
        "child-src": ["'none'"],
        "frame-src": ["'none'"],
        "worker-src": ["'self'"],
        "manifest-src": ["'self'"]
      },
      "dangerousDisableAssetCspModification": false,
      "assetProtocol": {
        "enable": true,
        "scope": ["$APPDATA/n00plicate/tokens/**", "$RESOURCE/tokens/**"]
      }
    }
  }
}
```

### Dynamic CSP Management

```rust
// src-tauri/src/security/csp.rs
use tauri::{App, Manager, Runtime, WebviewWindow};

pub struct CspManager {
    config: SecurityConfig,
}

impl CspManager {
    pub fn new(config: SecurityConfig) -> Self {
        Self { config }
    }

    pub fn setup<R: Runtime>(&self, app: &App<R>) -> tauri::Result<()> {
        let config = self.config.clone();

        app.webview_windows().values().for_each(|window| {
            let _ = self.apply_csp_to_window(window, &config.csp);
        });

        // Listen for new windows
        app.listen_global("tauri://window-created", move |event| {
            if let Some(window) = event.payload() {
                // Apply CSP to new windows
            }
        });

        Ok(())
    }

    fn apply_csp_to_window<R: Runtime>(
        &self,
        window: &WebviewWindow<R>,
        csp: &ContentSecurityPolicy,
    ) -> tauri::Result<()> {
        let csp_header = if self.config.dev_mode {
            ContentSecurityPolicy::development().to_header_value()
        } else {
            csp.to_header_value()
        };

        window.eval(&format!(
            r#"
            if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {{
                const meta = document.createElement('meta');
                meta.setAttribute('http-equiv', 'Content-Security-Policy');
                meta.setAttribute('content', '{}');
                document.head.appendChild(meta);
            }}
            "#,
            csp_header.replace("'", "\\'")
        ))?;

        Ok(())
    }

    pub fn validate_resource_access(&self, resource_path: &str) -> bool {
        // Validate that requested resources are within allowed scopes
        let allowed_paths = [
            "/tokens/",
            "/assets/",
            "/static/",
        ];

        allowed_paths.iter().any(|path| resource_path.starts_with(path))
    }
}
```

### CSP Violation Reporting

```typescript
// frontend/src/security/csp-reporter.ts
interface CSPViolation {
  documentURI: string;
  referrer: string;
  violatedDirective: string;
  effectiveDirective: string;
  originalPolicy: string;
  disposition: string;
  blockedURI: string;
  lineNumber?: number;
  columnNumber?: number;
  sourceFile?: string;
  statusCode?: number;
  scriptSample?: string;
}

class CSPReporter {
  private violations: CSPViolation[] = [];
  private maxViolations = 100;

  constructor() {
    this.setupViolationListener();
  }

  private setupViolationListener() {
    document.addEventListener('securitypolicyviolation', event => {
      const violation: CSPViolation = {
        documentURI: event.documentURI,
        referrer: event.referrer,
        violatedDirective: event.violatedDirective,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        disposition: event.disposition,
        blockedURI: event.blockedURI,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sourceFile: event.sourceFile,
        statusCode: event.statusCode,
        scriptSample: event.sample,
      };

      this.reportViolation(violation);
    });
  }

  private reportViolation(violation: CSPViolation) {
    // Store violation
    this.violations.push(violation);

    // Limit stored violations
    if (this.violations.length > this.maxViolations) {
      this.violations.shift();
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.warn('🚨 CSP Violation:', violation);
    }

    // Report to backend for analysis
    this.sendViolationReport(violation);
  }

  private async sendViolationReport(violation: CSPViolation) {
    try {
      await window.__TAURI__.invoke('report_csp_violation', { violation });
    } catch (error) {
      console.error('Failed to report CSP violation:', error);
    }
  }

  getViolations(): CSPViolation[] {
    return [...this.violations];
  }

  clearViolations() {
    this.violations = [];
  }
}

export const cspReporter = new CSPReporter();
```

## Auto-Updater Security

### Secure Update Configuration

```rust
// src-tauri/src/updater/mod.rs
use tauri::{App, Manager, Runtime, UpdaterEvent};
use tauri_plugin_updater::UpdaterExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ed25519_dalek::{PublicKey, Signature, Verifier};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateManifest {
    pub version: String,
    pub release_date: String,
    pub signature: String,
    pub checksum: String,
    pub download_url: String,
    pub changelog: String,
    pub critical: bool,
    pub platforms: UpdatePlatforms,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePlatforms {
    #[serde(rename = "windows-x86_64")]
    pub windows_x64: Option<PlatformUpdate>,
    #[serde(rename = "darwin-x86_64")]
    pub macos_x64: Option<PlatformUpdate>,
    #[serde(rename = "darwin-aarch64")]
    pub macos_arm64: Option<PlatformUpdate>,
    #[serde(rename = "linux-x86_64")]
    pub linux_x64: Option<PlatformUpdate>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlatformUpdate {
    pub url: String,
    pub signature: String,
    pub checksum: String,
    pub size: u64,
}

pub struct SecureUpdater {
    public_key: PublicKey,
    client: Client,
    manifest_url: String,
}

impl SecureUpdater {
    pub fn new(public_key_bytes: &[u8; 32], manifest_url: String) -> tauri::Result<Self> {
        let public_key = PublicKey::from_bytes(public_key_bytes)
            .map_err(|e| tauri::Error::Updater(format!("Invalid public key: {}", e)))?;

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .user_agent("n00plicate-Desktop-Updater/1.0")
            .build()
            .map_err(|e| tauri::Error::Updater(format!("HTTP client error: {}", e)))?;

        Ok(Self {
            public_key,
            client,
            manifest_url,
        })
    }

    pub async fn check_for_updates(&self) -> tauri::Result<Option<UpdateManifest>> {
        // Fetch update manifest
        let response = self.client
            .get(&self.manifest_url)
            .send()
            .await
            .map_err(|e| tauri::Error::Updater(format!("Failed to fetch manifest: {}", e)))?;

        if !response.status().is_success() {
            return Err(tauri::Error::Updater(format!(
                "HTTP error: {}", response.status()
            )));
        }

        let manifest_bytes = response.bytes().await
            .map_err(|e| tauri::Error::Updater(format!("Failed to read response: {}", e)))?;

        // Verify manifest signature
        let manifest: UpdateManifest = serde_json::from_slice(&manifest_bytes)
            .map_err(|e| tauri::Error::Updater(format!("Invalid manifest format: {}", e)))?;

        if !self.verify_signature(&manifest_bytes, &manifest.signature)? {
            return Err(tauri::Error::Updater("Invalid manifest signature".into()));
        }

        Ok(Some(manifest))
    }

    fn verify_signature(&self, data: &[u8], signature_hex: &str) -> tauri::Result<bool> {
        let signature_bytes = hex::decode(signature_hex)
            .map_err(|e| tauri::Error::Updater(format!("Invalid signature format: {}", e)))?;

        let signature = Signature::from_bytes(&signature_bytes)
            .map_err(|e| tauri::Error::Updater(format!("Invalid signature: {}", e)))?;

        Ok(self.public_key.verify(data, &signature).is_ok())
    }

    pub async fn download_and_verify_update(
        &self,
        platform_update: &PlatformUpdate,
    ) -> tauri::Result<Vec<u8>> {
        // Download update
        let response = self.client
            .get(&platform_update.url)
            .send()
            .await
            .map_err(|e| tauri::Error::Updater(format!("Download failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(tauri::Error::Updater(format!(
                "Download HTTP error: {}", response.status()
            )));
        }

        let update_bytes = response.bytes().await
            .map_err(|e| tauri::Error::Updater(format!("Failed to read update: {}", e)))?;

        // Verify checksum
        let mut hasher = Sha256::new();
        hasher.update(&update_bytes);
        let calculated_checksum = hex::encode(hasher.finalize());

        if calculated_checksum != platform_update.checksum {
            return Err(tauri::Error::Updater("Checksum verification failed".into()));
        }

        // Verify signature
        if !self.verify_signature(&update_bytes, &platform_update.signature)? {
            return Err(tauri::Error::Updater("Update signature verification failed".into()));
        }

        Ok(update_bytes.to_vec())
    }
}

#[tauri::command]
pub async fn check_for_updates<R: Runtime>(
    app: tauri::AppHandle<R>,
) -> Result<Option<UpdateManifest>, String> {
    let public_key = include_bytes!("../../../keys/public.key");
    let manifest_url = "https://releases.n00plicate.design/manifest.json".to_string();

    let updater = SecureUpdater::new(public_key, manifest_url)
        .map_err(|e| format!("Updater initialization failed: {}", e))?;

    updater.check_for_updates().await
        .map_err(|e| format!("Update check failed: {}", e))
}
```

### Update Installation Security

```rust
// src-tauri/src/updater/installer.rs
use std::path::PathBuf;
use tauri::{App, Manager, Runtime};

pub struct SecureInstaller {
    temp_dir: PathBuf,
    backup_dir: PathBuf,
}

impl SecureInstaller {
    pub fn new() -> tauri::Result<Self> {
        let temp_dir = std::env::temp_dir().join("n00plicate-updates");
        let backup_dir = std::env::temp_dir().join("n00plicate-backup");

        std::fs::create_dir_all(&temp_dir)
            .map_err(|e| tauri::Error::Io(e))?;
        std::fs::create_dir_all(&backup_dir)
            .map_err(|e| tauri::Error::Io(e))?;

        Ok(Self { temp_dir, backup_dir })
    }

    pub async fn install_update<R: Runtime>(
        &self,
        app: &tauri::AppHandle<R>,
        update_data: Vec<u8>,
    ) -> tauri::Result<()> {
        // Create backup of current installation
        self.create_backup(app)?;

        // Write update to temporary location
        let temp_update_path = self.temp_dir.join("update.bundle");
        tokio::fs::write(&temp_update_path, update_data).await
            .map_err(|e| tauri::Error::Io(e))?;

        // Verify update integrity one more time
        self.verify_update_integrity(&temp_update_path)?;

        // Install update atomically
        self.atomic_install(app, &temp_update_path)?;

        // Cleanup temporary files
        let _ = std::fs::remove_file(temp_update_path);

        Ok(())
    }

    fn create_backup<R: Runtime>(&self, app: &tauri::AppHandle<R>) -> tauri::Result<()> {
        let app_dir = app.path_resolver().app_dir()
            .ok_or_else(|| tauri::Error::PathNotAllowed("App directory not found".into()))?;

        // Copy critical files to backup
        let backup_path = self.backup_dir.join(format!("backup-{}", chrono::Utc::now().timestamp()));

        copy_dir_all(&app_dir, &backup_path)
            .map_err(|e| tauri::Error::Io(e))?;

        Ok(())
    }

    fn verify_update_integrity(&self, update_path: &PathBuf) -> tauri::Result<()> {
        // Additional integrity checks specific to our application
        // - Verify it's a valid bundle
        // - Check for required files
        // - Validate permissions

        if !update_path.exists() {
            return Err(tauri::Error::Updater("Update file not found".into()));
        }

        let metadata = std::fs::metadata(update_path)
            .map_err(|e| tauri::Error::Io(e))?;

        if metadata.len() == 0 {
            return Err(tauri::Error::Updater("Update file is empty".into()));
        }

        Ok(())
    }

    fn atomic_install<R: Runtime>(
        &self,
        app: &tauri::AppHandle<R>,
        update_path: &PathBuf,
    ) -> tauri::Result<()> {
        // Platform-specific atomic installation
        #[cfg(target_os = "windows")]
        {
            self.windows_install(app, update_path)
        }

        #[cfg(target_os = "macos")]
        {
            self.macos_install(app, update_path)
        }

        #[cfg(target_os = "linux")]
        {
            self.linux_install(app, update_path)
        }
    }

    #[cfg(target_os = "windows")]
    fn windows_install<R: Runtime>(
        &self,
        app: &tauri::AppHandle<R>,
        update_path: &PathBuf,
    ) -> tauri::Result<()> {
        use std::process::Command;

        let app_dir = app.path_resolver().app_dir()
            .ok_or_else(|| tauri::Error::PathNotAllowed("App directory not found".into()))?;

        // Use Windows installer with elevated privileges
        let output = Command::new("powershell")
            .args(&[
                "-ExecutionPolicy", "Bypass",
                "-Command",
                &format!(
                    "Start-Process -FilePath '{}' -ArgumentList '/S', '/D={}' -Verb RunAs -Wait",
                    update_path.display(),
                    app_dir.display()
                )
            ])
            .output()
            .map_err(|e| tauri::Error::Io(e))?;

        if !output.status.success() {
            return Err(tauri::Error::Updater(
                format!("Installation failed: {}", String::from_utf8_lossy(&output.stderr))
            ));
        }

        Ok(())
    }

    #[cfg(target_os = "macos")]
    fn macos_install<R: Runtime>(
        &self,
        app: &tauri::AppHandle<R>,
        update_path: &PathBuf,
    ) -> tauri::Result<()> {
        use std::process::Command;

        // Extract and install .app bundle
        let output = Command::new("hdiutil")
            .args(&["attach", "-nobrowse", &update_path.to_string_lossy()])
            .output()
            .map_err(|e| tauri::Error::Io(e))?;

        if !output.status.success() {
            return Err(tauri::Error::Updater("Failed to mount DMG".into()));
        }

        // Copy app bundle to Applications
        // Note: This is simplified - real implementation would need more robust handling

        Ok(())
    }

    #[cfg(target_os = "linux")]
    fn linux_install<R: Runtime>(
        &self,
        app: &tauri::AppHandle<R>,
        update_path: &PathBuf,
    ) -> tauri::Result<()> {
        use std::process::Command;

        // Extract and install AppImage or .deb package
        let output = Command::new("chmod")
            .args(&["+x", &update_path.to_string_lossy()])
            .output()
            .map_err(|e| tauri::Error::Io(e))?;

        if !output.status.success() {
            return Err(tauri::Error::Updater("Failed to make update executable".into()));
        }

        Ok(())
    }
}

fn copy_dir_all(src: impl AsRef<std::path::Path>, dst: impl AsRef<std::path::Path>) -> std::io::Result<()> {
    std::fs::create_dir_all(&dst)?;
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            std::fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}
```

## Code Signing & Distribution

### Code Signing Configuration

```toml
# src-tauri/tauri.conf.json
{
  "tauri": {
    "bundle": {
      "active": true,
      "category": "DeveloperTool",
      "copyright": "© 2024 n00plicate Design Systems",
      "description": "Advanced design token management and synchronization",
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "design.n00plicate.desktop",
      "longDescription": "n00plicate provides comprehensive design token management with real-time synchronization across Penpot, Style Dictionary, and multiple platform outputs.",
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "10.13",
        "exceptionDomain": "",
        "signingIdentity": "Developer ID Application: n00plicate Design Systems",
        "providerShortName": "MIMIC",
        "entitlements": "entitlements.plist"
      },
      "resources": [
        "tokens/**/*",
        "templates/**/*"
      ],
      "shortDescription": "Design token management platform",
      "targets": ["app", "msi", "deb", "appimage", "dmg"],
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.comodoca.com",
        "tsp": false,
        "wix": {
          "language": "en-US",
          "template": "installer.wxs"
        }
      }
    }
  }
}
```

### macOS Entitlements

```xml
<!-- src-tauri/entitlements.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Network access for token synchronization -->
    <key>com.apple.security.network.client</key>
    <true/>

    <!-- File system access for token files -->
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>

    <!-- Auto-updater requirements -->
    <key>com.apple.security.network.server</key>
    <false/>

    <!-- Hardened runtime -->
    <key>com.apple.security.cs.allow-jit</key>
    <false/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <false/>
    <key>com.apple.security.cs.disable-executable-page-protection</key>
    <false/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <false/>

    <!-- Notarization requirements -->
    <key>com.apple.security.app-sandbox</key>
    <false/>
</dict>
</plist>
```

### Signing Scripts

```bash
#!/bin/bash
# scripts/sign-and-notarize.sh

set -e

# Configuration
APP_NAME="n00plicate"
DEVELOPER_ID="Developer ID Application: n00plicate Design Systems"
TEAM_ID="YOUR_TEAM_ID"
BUNDLE_ID="design.n00plicate.desktop"
APP_PATH="src-tauri/target/release/bundle/macos/${APP_NAME}.app"
DMG_PATH="src-tauri/target/release/bundle/dmg/${APP_NAME}_*.dmg"

echo "🔐 Starting code signing and notarization process..."

# Step 1: Sign the application
echo "📝 Signing application..."
codesign --force --deep --sign "$DEVELOPER_ID" \
  --options runtime \
  --entitlements src-tauri/entitlements.plist \
  "$APP_PATH"

# Verify signing
echo "✅ Verifying signature..."
codesign --verify --verbose "$APP_PATH"
spctl --assess --verbose "$APP_PATH"

# Step 2: Create and sign DMG
echo "💽 Creating DMG..."
# DMG creation happens during Tauri build

# Sign the DMG
echo "📝 Signing DMG..."
codesign --force --sign "$DEVELOPER_ID" "$DMG_PATH"

# Step 3: Notarize
echo "🔔 Submitting for notarization..."
xcrun notarytool submit "$DMG_PATH" \
  --team-id "$TEAM_ID" \
  --wait \
  --timeout 900

# Step 4: Staple notarization
echo "📎 Stapling notarization..."
xcrun stapler staple "$DMG_PATH"

# Final verification
echo "🎉 Final verification..."
spctl --assess --type open --context context:primary-signature "$DMG_PATH"

echo "✅ Code signing and notarization complete!"
```

## Token Security

### Token Encryption

```rust
// src-tauri/src/security/token_crypto.rs
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use serde::{Deserialize, Serialize};
use rand::RngCore;

#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedTokens {
    pub data: Vec<u8>,
    pub nonce: Vec<u8>,
    pub salt: Vec<u8>,
    pub version: u8,
}

pub struct TokenCrypto {
    cipher: Aes256Gcm,
}

impl TokenCrypto {
    pub fn new(password: &str, salt: &[u8]) -> Result<Self, Box<dyn std::error::Error>> {
        let argon2 = Argon2::default();
        let mut key = [0u8; 32];

        argon2.hash_password_into(password.as_bytes(), salt, &mut key)?;

        let cipher = Aes256Gcm::new_from_slice(&key)?;

        Ok(Self { cipher })
    }

    pub fn encrypt_tokens(&self, tokens: &str) -> Result<EncryptedTokens, Box<dyn std::error::Error>> {
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let data = self.cipher.encrypt(nonce, tokens.as_bytes())?;

        let mut salt = [0u8; 16];
        OsRng.fill_bytes(&mut salt);

        Ok(EncryptedTokens {
            data,
            nonce: nonce_bytes.to_vec(),
            salt: salt.to_vec(),
            version: 1,
        })
    }

    pub fn decrypt_tokens(&self, encrypted: &EncryptedTokens) -> Result<String, Box<dyn std::error::Error>> {
        let nonce = Nonce::from_slice(&encrypted.nonce);
        let decrypted = self.cipher.decrypt(nonce, encrypted.data.as_ref())?;

        Ok(String::from_utf8(decrypted)?)
    }
}

#[tauri::command]
pub async fn save_encrypted_tokens(
    password: String,
    tokens: String,
    path: String,
) -> Result<(), String> {
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);

    let crypto = TokenCrypto::new(&password, &salt)
        .map_err(|e| format!("Encryption setup failed: {}", e))?;

    let encrypted = crypto.encrypt_tokens(&tokens)
        .map_err(|e| format!("Encryption failed: {}", e))?;

    let serialized = bincode::serialize(&encrypted)
        .map_err(|e| format!("Serialization failed: {}", e))?;

    tokio::fs::write(path, serialized).await
        .map_err(|e| format!("File write failed: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn load_encrypted_tokens(
    password: String,
    path: String,
) -> Result<String, String> {
    let data = tokio::fs::read(path).await
        .map_err(|e| format!("File read failed: {}", e))?;

    let encrypted: EncryptedTokens = bincode::deserialize(&data)
        .map_err(|e| format!("Deserialization failed: {}", e))?;

    let crypto = TokenCrypto::new(&password, &encrypted.salt)
        .map_err(|e| format!("Decryption setup failed: {}", e))?;

    let tokens = crypto.decrypt_tokens(&encrypted)
        .map_err(|e| format!("Decryption failed: {}", e))?;

    Ok(tokens)
}
```

## Secure Communication

### IPC Security

```rust
// src-tauri/src/security/ipc.rs
use tauri::{command, Runtime, Window};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IPCMessage {
    pub id: String,
    pub command: String,
    pub payload: serde_json::Value,
    pub timestamp: u64,
    pub signature: Option<String>,
}

pub struct IPCValidator {
    allowed_commands: HashMap<String, Vec<String>>, // command -> allowed origins
}

impl IPCValidator {
    pub fn new() -> Self {
        let mut allowed_commands = HashMap::new();

        // Define allowed commands and their permitted origins
        allowed_commands.insert(
            "load_tokens".to_string(),
            vec!["tauri://localhost".to_string()],
        );
        allowed_commands.insert(
            "save_tokens".to_string(),
            vec!["tauri://localhost".to_string()],
        );
        allowed_commands.insert(
            "update_theme".to_string(),
            vec!["tauri://localhost".to_string()],
        );

        Self { allowed_commands }
    }

    pub fn validate_command<R: Runtime>(
        &self,
        window: &Window<R>,
        command: &str,
    ) -> Result<(), String> {
        // Check if command is allowed
        let allowed_origins = self.allowed_commands.get(command)
            .ok_or_else(|| format!("Command '{}' not allowed", command))?;

        // Get window origin (in a real implementation)
        let origin = "tauri://localhost"; // Simplified

        if !allowed_origins.contains(&origin.to_string()) {
            return Err(format!("Origin '{}' not allowed for command '{}'", origin, command));
        }

        Ok(())
    }

    pub fn rate_limit_check(&self, command: &str, window_id: &str) -> Result<(), String> {
        // Implement rate limiting logic
        // This is a simplified example - real implementation would track timing
        Ok(())
    }
}

// Secure command wrapper
pub fn create_secure_command<F, R>(
    validator: &IPCValidator,
    command_name: &str,
    handler: F,
) -> impl Fn(tauri::Window<R>, serde_json::Value) -> Result<serde_json::Value, String>
where
    F: Fn(serde_json::Value) -> Result<serde_json::Value, String>,
    R: Runtime,
{
    let command_name = command_name.to_string();
    let validator = validator.clone();

    move |window: tauri::Window<R>, payload: serde_json::Value| {
        // Validate command
        validator.validate_command(&window, &command_name)?;

        // Rate limiting
        let window_id = window.label();
        validator.rate_limit_check(&command_name, window_id)?;

        // Execute command
        handler(payload)
    }
}
```

## Runtime Security

### Security Monitoring

```rust
// src-tauri/src/security/monitor.rs
use tauri::{App, Manager, Runtime};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
pub struct SecurityEvent {
    pub event_type: SecurityEventType,
    pub timestamp: DateTime<Utc>,
    pub source: String,
    pub details: String,
    pub severity: SecuritySeverity,
}

#[derive(Debug, Clone)]
pub enum SecurityEventType {
    CSPViolation,
    UnauthorizedAccess,
    SuspiciousActivity,
    InvalidSignature,
    RateLimitExceeded,
    FileAccessDenied,
}

#[derive(Debug, Clone)]
pub enum SecuritySeverity {
    Low,
    Medium,
    High,
    Critical,
}

pub struct SecurityMonitor {
    events: Arc<Mutex<Vec<SecurityEvent>>>,
    thresholds: HashMap<SecurityEventType, usize>,
}

impl SecurityMonitor {
    pub fn new() -> Self {
        let mut thresholds = HashMap::new();
        thresholds.insert(SecurityEventType::CSPViolation, 10);
        thresholds.insert(SecurityEventType::UnauthorizedAccess, 5);
        thresholds.insert(SecurityEventType::RateLimitExceeded, 20);

        Self {
            events: Arc::new(Mutex::new(Vec::new())),
            thresholds,
        }
    }

    pub fn log_event(&self, event: SecurityEvent) {
        let mut events = self.events.lock().unwrap();
        events.push(event.clone());

        // Check thresholds
        if let Some(&threshold) = self.thresholds.get(&event.event_type) {
            let recent_count = events
                .iter()
                .filter(|e| {
                    e.event_type == event.event_type &&
                    (Utc::now() - e.timestamp).num_minutes() < 10
                })
                .count();

            if recent_count >= threshold {
                self.trigger_security_response(&event.event_type);
            }
        }

        // Limit stored events
        if events.len() > 1000 {
            events.drain(0..100);
        }
    }

    fn trigger_security_response(&self, event_type: &SecurityEventType) {
        match event_type {
            SecurityEventType::CSPViolation => {
                eprintln!("🚨 High CSP violation rate detected!");
            }
            SecurityEventType::UnauthorizedAccess => {
                eprintln!("🚨 Multiple unauthorized access attempts!");
                // Could implement temporary blocking
            }
            SecurityEventType::RateLimitExceeded => {
                eprintln!("🚨 Rate limit threshold exceeded!");
            }
            _ => {
                eprintln!("🚨 Security threshold exceeded for {:?}", event_type);
            }
        }
    }

    pub fn get_recent_events(&self, minutes: i64) -> Vec<SecurityEvent> {
        let events = self.events.lock().unwrap();
        let cutoff = Utc::now() - chrono::Duration::minutes(minutes);

        events
            .iter()
            .filter(|e| e.timestamp > cutoff)
            .cloned()
            .collect()
    }
}

#[tauri::command]
pub async fn get_security_status() -> Result<serde_json::Value, String> {
    // Return security status information
    Ok(serde_json::json!({
        "status": "secure",
        "last_check": Utc::now(),
        "active_protections": [
            "CSP enforcement",
            "Code signing verification",
            "Token encryption",
            "IPC validation"
        ]
    }))
}
```

This comprehensive security framework provides multiple layers of protection for the Tauri desktop
application, ensuring secure token management, safe updates, and robust runtime security monitoring.
