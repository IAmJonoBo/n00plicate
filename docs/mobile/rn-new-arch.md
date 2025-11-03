# React Native New Architecture Integration

Comprehensive guide for integrating n00plicate design tokens with React Native's New Architecture (Fabric + TurboModules),\
covering token transformation, native module integration, and platform-specific optimizations.

## New Architecture Overview

### Fabric Renderer Integration

```typescript
// packages/mobile/react-native/src/fabric/TokenFabricComponent.ts
import { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

interface TokenViewProps extends ViewProps {
  tokenName: string;
  tokenValue: string;
  platform: 'ios' | 'android';
}

export default codegenNativeComponent<TokenViewProps>('TokenView');
```

### TurboModule Implementation

```typescript
// packages/mobile/react-native/src/turbo/TokenTurboModule.ts
import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getToken(name: string): Promise<string>;
  setToken(name: string, value: string): Promise<boolean>;
  validateTokens(): Promise<boolean>;
  syncTokensFromRemote(url: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('TokenTurboModule');
```

### Native Module Bridge

```cpp
// packages/mobile/react-native/ios/TokenTurboModule.mm
#import "TokenTurboModule.h"
#import <React/RCTBridge+Private.h>
#import <ReactCommon/RCTTurboModule.h>

@implementation TokenTurboModule

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeTokenTurboModuleCxxSpecJSI>(params);
}

- (NSString *)getToken:(NSString *)name
{
  // Retrieve token from native storage/bundle
  NSBundle *bundle = [NSBundle mainBundle];
  NSString *tokenPath = [bundle pathForResource:@"design-tokens" ofType:@"json"];
  NSData *tokenData = [NSData dataWithContentsOfFile:tokenPath];

  if (tokenData) {
    NSError *error;
    NSDictionary *tokens = [NSJSONSerialization JSONObjectWithData:tokenData options:0 error:&error];
    return tokens[name] ?: @"";
  }

  return @"";
}

@end
```

## Token Transform Pipeline

### Style Dictionary React Native Transform

```javascript
// packages/design-tokens/transforms/react-native-new-arch.js
const StyleDictionary = require('style-dictionary');

// Register custom transform for React Native New Architecture
StyleDictionary.registerTransform({
  name: 'size/react-native-new-arch',
  type: 'value',
  matcher: token => token.type === 'dimension',
  transformer: token => {
    const value = parseFloat(token.value);

    // Convert to dp/pt for New Architecture compatibility
    return {
      ios: `${value}pt`,
      android: `${value}dp`,
      fabric: value, // Raw number for Fabric calculations
    };
  },
});

// Color transform with platform-specific handling
StyleDictionary.registerTransform({
  name: 'color/react-native-new-arch',
  type: 'value',
  matcher: token => token.type === 'color',
  transformer: token => {
    const hexColor = token.value;

    return {
      ios: `UIColor(hex: "${hexColor}")`,
      android: `Color.parseColor("${hexColor}")`,
      fabric: hexColor,
      turbo: {
        red: parseInt(hexColor.slice(1, 3), 16) / 255,
        green: parseInt(hexColor.slice(3, 5), 16) / 255,
        blue: parseInt(hexColor.slice(5, 7), 16) / 255,
        alpha: 1.0,
      },
    };
  },
});

// Typography transform for New Architecture
StyleDictionary.registerTransform({
  name: 'typography/react-native-new-arch',
  type: 'value',
  matcher: token => token.type === 'typography',
  transformer: token => {
    return {
      fontFamily: token.value.fontFamily,
      fontSize: parseFloat(token.value.fontSize),
      fontWeight: token.value.fontWeight,
      lineHeight: parseFloat(token.value.lineHeight),
      letterSpacing: parseFloat(token.value.letterSpacing || 0),
      // New Architecture specific properties
      fabricProperties: {
        textShadowColor: 'transparent',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 0,
      },
    };
  },
});
```

### Build Configuration

```javascript
// packages/design-tokens/config/react-native-new-arch.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    'react-native-new-arch': {
      transforms: [
        'attribute/cti',
        'name/cti/kebab',
        'size/react-native-new-arch',
        'color/react-native-new-arch',
        'typography/react-native-new-arch',
      ],
      buildPath: 'dist/react-native-new-arch/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          options: {
            outputReferences: true,
            newArchitecture: true,
          },
        },
        {
          destination: 'tokens.json',
          format: 'json/flat',
          options: {
            newArchitecture: true,
          },
        },
        {
          destination: 'ios/Tokens.swift',
          format: 'ios-swift/class.swift',
          className: 'n00plicateTokens',
          options: {
            newArchitecture: true,
            fabricSupport: true,
          },
        },
        {
          destination: 'android/Tokens.kt',
          format: 'android/kotlin',
          className: 'n00plicateTokens',
          options: {
            newArchitecture: true,
            packageName: 'com.n00plicate.tokens',
          },
        },
      ],
    },
  },
};
```

## Platform-Specific Implementation

### iOS Fabric Integration

```swift
// packages/mobile/react-native/ios/Fabric/TokenViewComponentView.swift
import UIKit
import React

@objc(TokenViewComponentView)
class TokenViewComponentView: RCTViewComponentView {

  private var tokenName: String = ""
  private var tokenValue: String = ""

  override func updateProps(_ props: Props, oldProps: Props) {
    super.updateProps(props, oldProps)

    guard let tokenProps = props as? TokenViewProps else { return }

    if tokenProps.tokenName != tokenName {
      tokenName = tokenProps.tokenName
      applyToken()
    }

    if tokenProps.tokenValue != tokenValue {
      tokenValue = tokenProps.tokenValue
      applyToken()
    }
  }

  private func applyToken() {
    guard !tokenName.isEmpty else { return }

    // Apply token-based styling with Fabric optimization
    switch tokenName {
    case let name where name.contains("color"):
      if let color = UIColor(hex: tokenValue) {
        backgroundColor = color
      }
    case let name where name.contains("spacing"):
      if let spacing = Double(tokenValue) {
        layer.cornerRadius = CGFloat(spacing)
      }
    default:
      break
    }

    // Trigger Fabric re-render
    setNeedsLayout()
  }
}

// Props definition for code generation
struct TokenViewProps: ViewProps {
  let tokenName: String
  let tokenValue: String
  let platform: String
}
```

### Android Fabric Integration

```kotlin
// packages/mobile/react-native/android/src/main/java/com/n00plicate/tokens/TokenViewManager.kt
package com.n00plicate.tokens

import android.graphics.Color
import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.fabric.ComponentFactory
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class TokenViewManager : SimpleViewManager<View>() {

  companion object {
    const val REACT_CLASS = "TokenView"
  }

  override fun getName(): String = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext): View {
    return View(reactContext)
  }

  @ReactProp(name = "tokenName")
  fun setTokenName(view: View, tokenName: String?) {
    tokenName?.let { name ->
      applyToken(view, name)
    }
  }

  @ReactProp(name = "tokenValue")
  fun setTokenValue(view: View, tokenValue: String?) {
    tokenValue?.let { value ->
      applyTokenValue(view, value)
    }
  }

  private fun applyToken(view: View, tokenName: String) {
    when {
      tokenName.contains("color") -> {
        // Handle color tokens
      }
      tokenName.contains("spacing") -> {
        // Handle spacing tokens
      }
      tokenName.contains("typography") -> {
        // Handle typography tokens
      }
    }
  }

  private fun applyTokenValue(view: View, tokenValue: String) {
    try {
      when {
        tokenValue.startsWith("#") -> {
          view.setBackgroundColor(Color.parseColor(tokenValue))
        }
        tokenValue.endsWith("dp") -> {
          val dpValue = tokenValue.replace("dp", "").toFloat()
          val density = view.context.resources.displayMetrics.density
          val pixelValue = (dpValue * density).toInt()
          view.setPadding(pixelValue, pixelValue, pixelValue, pixelValue)
        }
      }
    } catch (e: Exception) {
      // Log error for debugging
    }
  }
}
```

## React Native Integration

### Token Hook with New Architecture

```typescript
// packages/mobile/react-native/src/hooks/useTokens.ts
import { useEffect, useState, useMemo } from 'react';
import { Platform } from 'react-native';
import TokenTurboModule from '../turbo/TokenTurboModule';

export interface TokenValue {
  value: string | number;
  type: 'color' | 'spacing' | 'typography' | 'shadow';
  platform: 'ios' | 'android' | 'web';
}

export const useTokens = () => {
  const [tokens, setTokens] = useState<Record<string, TokenValue>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTokens = async () => {
      try {
        setIsLoading(true);

        // Use TurboModule for optimal performance
        if (TokenTurboModule) {
          const validated = await TokenTurboModule.validateTokens();
          if (validated) {
            // Tokens are valid, load from native cache
            const tokenNames = [
              'color.primary',
              'color.secondary',
              'spacing.small',
              'spacing.medium',
              'typography.body',
              'typography.heading',
            ];

            const tokenPromises = tokenNames.map(async name => {
              const value = await TokenTurboModule.getToken(name);
              return { name, value };
            });

            const resolvedTokens = await Promise.all(tokenPromises);
            const tokenMap = resolvedTokens.reduce(
              (acc, { name, value }) => {
                acc[name] = parseTokenValue(value);
                return acc;
              },
              {} as Record<string, TokenValue>
            );

            setTokens(tokenMap);
          }
        } else {
          // Fallback to bundle tokens
          const bundleTokens = require('../assets/tokens.json');
          setTokens(bundleTokens);
        }
      } catch (error) {
        console.error('Failed to load tokens:', error);
        // Load fallback tokens
        const fallbackTokens = require('../assets/fallback-tokens.json');
        setTokens(fallbackTokens);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  const getToken = useMemo(() => {
    return (tokenName: string, fallback?: string | number) => {
      const token = tokens[tokenName];
      if (token) {
        return Platform.select({
          ios: token.platform === 'ios' ? token.value : fallback,
          android: token.platform === 'android' ? token.value : fallback,
          default: token.value,
        });
      }
      return fallback;
    };
  }, [tokens]);

  const syncTokens = async (remoteUrl?: string) => {
    if (TokenTurboModule && remoteUrl) {
      try {
        const success = await TokenTurboModule.syncTokensFromRemote(remoteUrl);
        if (success) {
          // Reload tokens after sync
          window.location.reload(); // For web
          // For native, tokens will be updated automatically
        }
      } catch (error) {
        console.error('Token sync failed:', error);
      }
    }
  };

  return {
    tokens,
    getToken,
    syncTokens,
    isLoading,
  };
};

const parseTokenValue = (rawValue: string): TokenValue => {
  // Parse token value based on format
  if (rawValue.startsWith('#')) {
    return {
      value: rawValue,
      type: 'color',
      platform: Platform.OS as 'ios' | 'android',
    };
  }

  if (rawValue.endsWith('dp') || rawValue.endsWith('pt')) {
    const numericValue = parseFloat(rawValue);
    return {
      value: numericValue,
      type: 'spacing',
      platform: Platform.OS as 'ios' | 'android',
    };
  }

  // Default to string value
  return {
    value: rawValue,
    type: 'typography',
    platform: Platform.OS as 'ios' | 'android',
  };
};
```

### Styled Components Integration

```typescript
// packages/mobile/react-native/src/components/StyledComponents.tsx
import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTokens } from '../hooks/useTokens';

interface StyledViewProps {
  tokenStyle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const StyledView: React.FC<StyledViewProps> = ({
  tokenStyle,
  children,
  style,
  ...props
}) => {
  const { getToken } = useTokens();

  const computedStyle: ViewStyle = React.useMemo(() => {
    if (!tokenStyle) return style || {};

    const baseStyle: ViewStyle = {};

    // Parse token-based styles
    const backgroundColor = getToken(`color.${tokenStyle}`, 'transparent');
    const padding = getToken(`spacing.${tokenStyle}`, 0);
    const borderRadius = getToken(`radius.${tokenStyle}`, 0);

    if (backgroundColor !== 'transparent') {
      baseStyle.backgroundColor = backgroundColor as string;
    }

    if (padding) {
      baseStyle.padding = padding as number;
    }

    if (borderRadius) {
      baseStyle.borderRadius = borderRadius as number;
    }

    return { ...baseStyle, ...style };
  }, [tokenStyle, style, getToken]);

  return (
    <View style={computedStyle} {...props}>
      {children}
    </View>
  );
};

interface StyledTextProps {
  tokenStyle?: string;
  children: React.ReactNode;
  style?: TextStyle;
}

export const StyledText: React.FC<StyledTextProps> = ({
  tokenStyle,
  children,
  style,
  ...props
}) => {
  const { getToken } = useTokens();

  const computedStyle: TextStyle = React.useMemo(() => {
    if (!tokenStyle) return style || {};

    const baseStyle: TextStyle = {};

    // Parse typography tokens
    const fontSize = getToken(`typography.${tokenStyle}.fontSize`, 16);
    const fontFamily = getToken(`typography.${tokenStyle}.fontFamily`, 'System');
    const fontWeight = getToken(`typography.${tokenStyle}.fontWeight`, 'normal');
    const color = getToken(`typography.${tokenStyle}.color`, '#000000');
    const lineHeight = getToken(`typography.${tokenStyle}.lineHeight`);

    baseStyle.fontSize = fontSize as number;
    baseStyle.fontFamily = fontFamily as string;
    baseStyle.fontWeight = fontWeight as TextStyle['fontWeight'];
    baseStyle.color = color as string;

    if (lineHeight) {
      baseStyle.lineHeight = lineHeight as number;
    }

    return { ...baseStyle, ...style };
  }, [tokenStyle, style, getToken]);

  return (
    <Text style={computedStyle} {...props}>
      {children}
    </Text>
  );
};
```

## Performance Optimizations

### Token Caching Strategy

```typescript
// packages/mobile/react-native/src/cache/TokenCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export class TokenCache {
  private static instance: TokenCache;
  private cache = new Map<string, any>();
  private lastSync = 0;
  private readonly CACHE_KEY = '@n00plicate_tokens';
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TokenCache {
    if (!TokenCache.instance) {
      TokenCache.instance = new TokenCache();
    }
    return TokenCache.instance;
  }

  async loadFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.tokens);
        this.lastSync = data.lastSync;
      }
    } catch (error) {
      console.warn('Failed to load tokens from storage:', error);
    }
  }

  async saveToStorage(): Promise<void> {
    try {
      const data = {
        tokens: Array.from(this.cache.entries()),
        lastSync: this.lastSync,
      };
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save tokens to storage:', error);
    }
  }

  get(tokenName: string): any {
    return this.cache.get(tokenName);
  }

  set(tokenName: string, value: any): void {
    this.cache.set(tokenName, value);
  }

  shouldSync(): boolean {
    return Date.now() - this.lastSync > this.SYNC_INTERVAL;
  }

  markSynced(): void {
    this.lastSync = Date.now();
  }

  clear(): void {
    this.cache.clear();
    AsyncStorage.removeItem(this.CACHE_KEY);
  }
}
```

### Bundle Optimization

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for New Architecture
config.transformer = {
  ...config.transformer,
  experimental: {
    enableNewArchitecture: true,
  },
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Token-specific optimizations
config.resolver = {
  ...config.resolver,
  alias: {
    '@n00plicate/tokens':
      './node_modules/@n00plicate/design-tokens/dist/react-native-new-arch/tokens.js',
  },
  assetExts: [...config.resolver.assetExts, 'svg'],
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

// Enable tree shaking for token files
config.optimization = {
  ...config.optimization,
  sideEffects: false,
  usedExports: true,
};

module.exports = config;
```

This comprehensive guide ensures seamless integration of n00plicate design tokens with React Native's New Architecture,\
providing optimal performance and platform-specific optimizations while maintaining token consistency across all
platforms.
