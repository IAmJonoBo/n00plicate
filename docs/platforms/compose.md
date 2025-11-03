# Compose Multiplatform Integration Guide

This document covers advanced Compose Multiplatform integration including theme injection, iOS/Wasm platform quirks,
and React Native new architecture considerations.

## Table of Contents

- [Theme System Integration](#theme-system-integration)
- [Platform-Specific Considerations](#platform-specific-considerations)
- [iOS Platform Quirks](#ios-platform-quirks)
- [Wasm Platform Support](#wasm-platform-support)
- [React Native Integration](#react-native-integration)
- [Performance Optimization](#performance-optimization)

## Theme System Integration

### Compose Theme Provider

Create a comprehensive theme system for Compose Multiplatform:

```kotlin
// design-system/src/commonMain/kotlin/com/n00plicate/design/theme/n00plicateTheme.kt
package com.n00plicate.design.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Dp

// Import generated tokens
import com.n00plicate.design.tokens.n00plicateTokens

data class n00plicateColors(
    val primary: Color,
    val primaryVariant: Color,
    val secondary: Color,
    val background: Color,
    val surface: Color,
    val error: Color,
    val onPrimary: Color,
    val onSecondary: Color,
    val onBackground: Color,
    val onSurface: Color,
    val onError: Color
)

data class n00plicateTypography(
    val h1: TextStyle,
    val h2: TextStyle,
    val h3: TextStyle,
    val h4: TextStyle,
    val h5: TextStyle,
    val h6: TextStyle,
    val body1: TextStyle,
    val body2: TextStyle,
    val button: TextStyle,
    val caption: TextStyle,
    val overline: TextStyle
)

data class n00plicateSpacing(
    val xxs: Dp,
    val xs: Dp,
    val sm: Dp,
    val md: Dp,
    val lg: Dp,
    val xl: Dp,
    val xxl: Dp
)

object n00plicateTheme {
    val colors: n00plicateColors
        @Composable
        @ReadOnlyComposable
        get() = Localn00plicateColors.current

    val typography: n00plicateTypography
        @Composable
        @ReadOnlyComposable
        get() = Localn00plicateTypography.current

    val spacing: n00plicateSpacing
        @Composable
        @ReadOnlyComposable
        get() = Localn00plicateSpacing.current
}

// Local composition providers
internal val Localn00plicateColors = staticCompositionLocalOf<n00plicateColors> {
    error("No n00plicateColors provided")
}

internal val Localn00plicateTypography = staticCompositionLocalOf<n00plicateTypography> {
    error("No n00plicateTypography provided")
}

internal val Localn00plicateSpacing = staticCompositionLocalOf<n00plicateSpacing> {
    error("No n00plicateSpacing provided")
}

@Composable
fun n00plicateTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    colors: n00plicateColors = if (darkTheme) darkn00plicateColors() else lightn00plicateColors(),
    typography: n00plicateTypography = n00plicateTypography(),
    spacing: n00plicateSpacing = n00plicateSpacing(),
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(
        Localn00plicateColors provides colors,
        Localn00plicateTypography provides typography,
        Localn00plicateSpacing provides spacing
    ) {
        MaterialTheme(
            colorScheme = colors.toMaterial3ColorScheme(),
            typography = typography.toMaterial3Typography(),
            content = content
        )
    }
}

// Token-based theme factories
fun lightn00plicateColors(): n00plicateColors = n00plicateColors(
    primary = Color(n00plicateTokens.ColorPrimary500),
    primaryVariant = Color(n00plicateTokens.ColorPrimary700),
    secondary = Color(n00plicateTokens.ColorSecondary500),
    background = Color(n00plicateTokens.ColorSurface),
    surface = Color(n00plicateTokens.ColorSurfaceElevated),
    error = Color(n00plicateTokens.ColorError500),
    onPrimary = Color(n00plicateTokens.ColorOnPrimary),
    onSecondary = Color(n00plicateTokens.ColorOnSecondary),
    onBackground = Color(n00plicateTokens.ColorOnSurface),
    onSurface = Color(n00plicateTokens.ColorOnSurface),
    onError = Color(n00plicateTokens.ColorOnError)
)

fun darkn00plicateColors(): n00plicateColors = n00plicateColors(
    primary = Color(n00plicateTokens.ColorPrimary400),
    primaryVariant = Color(n00plicateTokens.ColorPrimary600),
    secondary = Color(n00plicateTokens.ColorSecondary400),
    background = Color(n00plicateTokens.ColorSurfaceDark),
    surface = Color(n00plicateTokens.ColorSurfaceElevatedDark),
    error = Color(n00plicateTokens.ColorError400),
    onPrimary = Color(n00plicateTokens.ColorOnPrimaryDark),
    onSecondary = Color(n00plicateTokens.ColorOnSecondaryDark),
    onBackground = Color(n00plicateTokens.ColorOnSurfaceDark),
    onSurface = Color(n00plicateTokens.ColorOnSurfaceDark),
    onError = Color(n00plicateTokens.ColorOnErrorDark)
)

fun n00plicateTypography(): n00plicateTypography = n00plicateTypography(
    h1 = n00plicateTokens.TypographyH1,
    h2 = n00plicateTokens.TypographyH2,
    h3 = n00plicateTokens.TypographyH3,
    h4 = n00plicateTokens.TypographyH4,
    h5 = n00plicateTokens.TypographyH5,
    h6 = n00plicateTokens.TypographyH6,
    body1 = n00plicateTokens.TypographyBody1,
    body2 = n00plicateTokens.TypographyBody2,
    button = n00plicateTokens.TypographyButton,
    caption = n00plicateTokens.TypographyCaption,
    overline = n00plicateTokens.TypographyOverline
)

fun n00plicateSpacing(): n00plicateSpacing = n00plicateSpacing(
    xxs = n00plicateTokens.SpacingXxs,
    xs = n00plicateTokens.SpacingXs,
    sm = n00plicateTokens.SpacingSm,
    md = n00plicateTokens.SpacingMd,
    lg = n00plicateTokens.SpacingLg,
    xl = n00plicateTokens.SpacingXl,
    xxl = n00plicateTokens.SpacingXxl
)
```

### Dynamic Theme Updates

Handle dynamic theme changes across platforms:

```kotlin
// design-system/src/commonMain/kotlin/com/n00plicate/design/theme/ThemeController.kt
package com.n00plicate.design.theme

import androidx.compose.runtime.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM
}

class ThemeController {
    private val _themeMode = MutableStateFlow(ThemeMode.SYSTEM)
    val themeMode: StateFlow<ThemeMode> = _themeMode

    private val _customColors = MutableStateFlow<n00plicateColors?>(null)
    val customColors: StateFlow<n00plicateColors?> = _customColors

    fun setThemeMode(mode: ThemeMode) {
        _themeMode.value = mode
        // Persist theme preference
        saveThemePreference(mode)
    }

    fun setCustomColors(colors: n00plicateColors) {
        _customColors.value = colors
    }

    fun resetCustomColors() {
        _customColors.value = null
    }

    private fun saveThemePreference(mode: ThemeMode) {
        // Platform-specific implementation
        when (Platform.current) {
            is Platform.Android -> saveAndroidThemePreference(mode)
            is Platform.IOS -> saveIOSThemePreference(mode)
            is Platform.Wasm -> saveWebThemePreference(mode)
            is Platform.Desktop -> saveDesktopThemePreference(mode)
        }
    }
}

@Composable
fun rememberThemeController(): ThemeController {
    return remember { ThemeController() }
}

@Composable
fun Dynamicn00plicateTheme(
    themeController: ThemeController = rememberThemeController(),
    content: @Composable () -> Unit
) {
    val themeMode by themeController.themeMode.collectAsState()
    val customColors by themeController.customColors.collectAsState()

    val isDarkTheme = when (themeMode) {
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
    }

    val colors = customColors ?: if (isDarkTheme) darkn00plicateColors() else lightn00plicateColors()

    n00plicateTheme(
        darkTheme = isDarkTheme,
        colors = colors,
        content = content
    )
}
```

## Platform-Specific Considerations

### Platform Detection and Adaptation

```kotlin
// shared/src/commonMain/kotlin/com/n00plicate/shared/Platform.kt
package com.n00plicate.shared

expect object Platform {
    val name: String
    val version: String
    val current: PlatformType
}

sealed class PlatformType {
    object Android : PlatformType()
    object IOS : PlatformType()
    object Wasm : PlatformType()
    object Desktop : PlatformType()
}

// Platform-specific implementations
// shared/src/androidMain/kotlin/com/n00plicate/shared/Platform.android.kt
actual object Platform {
    actual val name = "Android"
    actual val version = android.os.Build.VERSION.RELEASE
    actual val current = PlatformType.Android
}

// shared/src/iosMain/kotlin/com/n00plicate/shared/Platform.ios.kt
import platform.UIKit.UIDevice

actual object Platform {
    actual val name = "iOS"
    actual val version = UIDevice.currentDevice.systemVersion
    actual val current = PlatformType.IOS
}

// shared/src/wasmJsMain/kotlin/com/n00plicate/shared/Platform.wasm.kt
actual object Platform {
    actual val name = "Wasm"
    actual val version = js("navigator.userAgent") as String
    actual val current = PlatformType.Wasm
}
```

### Responsive Design System

```kotlin
// design-system/src/commonMain/kotlin/com/n00plicate/design/responsive/Breakpoints.kt
package com.n00plicate.design.responsive

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

object Breakpoints {
    val xs = 0.dp
    val sm = 576.dp
    val md = 768.dp
    val lg = 992.dp
    val xl = 1200.dp
    val xxl = 1400.dp
}

enum class ScreenSize {
    XS, SM, MD, LG, XL, XXL
}

@Composable
fun rememberScreenSize(): ScreenSize {
    val density = LocalDensity.current
    val screenWidth = with(density) {
        // Platform-specific screen width calculation
        getScreenWidth()
    }

    return when {
        screenWidth < Breakpoints.sm -> ScreenSize.XS
        screenWidth < Breakpoints.md -> ScreenSize.SM
        screenWidth < Breakpoints.lg -> ScreenSize.MD
        screenWidth < Breakpoints.xl -> ScreenSize.LG
        screenWidth < Breakpoints.xxl -> ScreenSize.XL
        else -> ScreenSize.XXL
    }
}

@Composable
expect fun getScreenWidth(): Dp

// Responsive modifier
@Composable
fun Modifier.responsive(
    xs: Modifier = Modifier,
    sm: Modifier = Modifier,
    md: Modifier = Modifier,
    lg: Modifier = Modifier,
    xl: Modifier = Modifier,
    xxl: Modifier = Modifier
): Modifier {
    val screenSize = rememberScreenSize()

    return when (screenSize) {
        ScreenSize.XS -> this.then(xs)
        ScreenSize.SM -> this.then(sm)
        ScreenSize.MD -> this.then(md)
        ScreenSize.LG -> this.then(lg)
        ScreenSize.XL -> this.then(xl)
        ScreenSize.XXL -> this.then(xxl)
    }
}
```

## iOS Platform Quirks

### Safe Area Handling

```kotlin
// design-system/src/iosMain/kotlin/com/n00plicate/design/platform/SafeArea.ios.kt
package com.n00plicate.design.platform

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import platform.UIKit.*

@Composable
actual fun rememberSafeAreaInsets(): PaddingValues {
    val safeAreaInsets = UIApplication.sharedApplication.keyWindow?.safeAreaInsets

    return PaddingValues(
        top = (safeAreaInsets?.top?.toFloat() ?: 0f).dp,
        bottom = (safeAreaInsets?.bottom?.toFloat() ?: 0f).dp,
        start = (safeAreaInsets?.left?.toFloat() ?: 0f).dp,
        end = (safeAreaInsets?.right?.toFloat() ?: 0f).dp
    )
}

@Composable
fun SafeAreaLayout(
    content: @Composable (PaddingValues) -> Unit
) {
    val safeAreaInsets = rememberSafeAreaInsets()
    content(safeAreaInsets)
}
```

### iOS-Specific Theme Adaptations

```kotlin
// design-system/src/iosMain/kotlin/com/n00plicate/design/theme/IOSTheme.ios.kt
package com.n00plicate.design.theme

import androidx.compose.runtime.Composable
import platform.UIKit.*

@Composable
fun IOSAdaptiven00plicateTheme(
    content: @Composable () -> Unit
) {
    // Detect iOS dynamic type settings
    val preferredContentSizeCategory = UIApplication.sharedApplication
        .preferredContentSizeCategory

    // Adapt typography based on iOS accessibility settings
    val adaptedTypography = n00plicateTypography().adaptForAccessibility(
        contentSizeCategory = preferredContentSizeCategory
    )

    // Detect iOS appearance mode
    val isDarkMode = UITraitCollection.currentTraitCollection
        .userInterfaceStyle == UIUserInterfaceStyleDark

    n00plicateTheme(
        darkTheme = isDarkMode,
        typography = adaptedTypography,
        content = content
    )
}

fun n00plicateTypography.adaptForAccessibility(
    contentSizeCategory: UIContentSizeCategory
): n00plicateTypography {
    val scaleFactor = when (contentSizeCategory) {
        UIContentSizeCategoryExtraSmall -> 0.8f
        UIContentSizeCategorySmall -> 0.9f
        UIContentSizeCategoryMedium -> 1.0f
        UIContentSizeCategoryLarge -> 1.1f
        UIContentSizeCategoryExtraLarge -> 1.2f
        UIContentSizeCategoryExtraExtraLarge -> 1.3f
        UIContentSizeCategoryExtraExtraExtraLarge -> 1.4f
        UIContentSizeCategoryAccessibilityMedium -> 1.6f
        UIContentSizeCategoryAccessibilityLarge -> 1.8f
        UIContentSizeCategoryAccessibilityExtraLarge -> 2.0f
        UIContentSizeCategoryAccessibilityExtraExtraLarge -> 2.2f
        UIContentSizeCategoryAccessibilityExtraExtraExtraLarge -> 2.4f
        else -> 1.0f
    }

    return copy(
        h1 = h1.copy(fontSize = h1.fontSize * scaleFactor),
        h2 = h2.copy(fontSize = h2.fontSize * scaleFactor),
        h3 = h3.copy(fontSize = h3.fontSize * scaleFactor),
        h4 = h4.copy(fontSize = h4.fontSize * scaleFactor),
        h5 = h5.copy(fontSize = h5.fontSize * scaleFactor),
        h6 = h6.copy(fontSize = h6.fontSize * scaleFactor),
        body1 = body1.copy(fontSize = body1.fontSize * scaleFactor),
        body2 = body2.copy(fontSize = body2.fontSize * scaleFactor),
        button = button.copy(fontSize = button.fontSize * scaleFactor),
        caption = caption.copy(fontSize = caption.fontSize * scaleFactor),
        overline = overline.copy(fontSize = overline.fontSize * scaleFactor)
    )
}
```

### iOS Navigation Integration

```kotlin
// design-system/src/iosMain/kotlin/com/n00plicate/design/navigation/IOSNavigation.ios.kt
package com.n00plicate.design.navigation

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import platform.UIKit.*

@Composable
fun IOSNavigationTheme(
    tintColor: UIColor? = null,
    barTintColor: UIColor? = null,
    content: @Composable () -> Unit
) {
    // Configure iOS navigation bar appearance
    val appearance = UINavigationBarAppearance().apply {
        configureWithOpaqueBackground()

        tintColor?.let {
            this.setTitleTextAttributes(mapOf(
                NSForegroundColorAttributeName to it
            ))
        }

        barTintColor?.let {
            this.backgroundColor = it
        }
    }

    UINavigationBar.appearance().apply {
        standardAppearance = appearance
        compactAppearance = appearance
        scrollEdgeAppearance = appearance
    }

    content()
}
```

## Wasm Platform Support

### Browser API Integration

```kotlin
// shared/src/wasmJsMain/kotlin/com/n00plicate/shared/Browser.wasm.kt
package com.n00plicate.shared

import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.events.Event

object BrowserAPI {
    fun setThemePreference(isDark: Boolean) {
        document.documentElement?.setAttribute("data-theme", if (isDark) "dark" else "light")
        window.localStorage.setItem("theme", if (isDark) "dark" else "light")
    }

    fun getSystemThemePreference(): Boolean {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    }

    fun observeSystemThemeChanges(callback: (Boolean) -> Unit) {
        val mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        mediaQuery.addEventListener("change") { event ->
            callback(mediaQuery.matches)
        }
    }

    fun getViewportSize(): Pair<Int, Int> {
        return Pair(
            window.innerWidth,
            window.innerHeight
        )
    }

    fun observeViewportChanges(callback: (Int, Int) -> Unit) {
        window.addEventListener("resize") {
            val (width, height) = getViewportSize()
            callback(width, height)
        }
    }
}
```

### Wasm-Specific Theme Implementation

```kotlin
// design-system/src/wasmJsMain/kotlin/com/n00plicate/design/theme/WasmTheme.wasm.kt
package com.n00plicate.design.theme

import androidx.compose.runtime.*
import com.n00plicate.shared.BrowserAPI

@Composable
fun WasmAdaptiven00plicateTheme(
    content: @Composable () -> Unit
) {
    var isDarkTheme by remember { mutableStateOf(BrowserAPI.getSystemThemePreference()) }

    // Listen for system theme changes
    LaunchedEffect(Unit) {
        BrowserAPI.observeSystemThemeChanges { isDark ->
            isDarkTheme = isDark
        }
    }

    // Update document theme attribute
    LaunchedEffect(isDarkTheme) {
        BrowserAPI.setThemePreference(isDarkTheme)
    }

    n00plicateTheme(
        darkTheme = isDarkTheme,
        content = content
    )
}

@Composable
actual fun getScreenWidth(): Dp {
    var screenWidth by remember { mutableStateOf(BrowserAPI.getViewportSize().first) }

    LaunchedEffect(Unit) {
        BrowserAPI.observeViewportChanges { width, _ ->
            screenWidth = width
        }
    }

    return screenWidth.dp
}
```

## React Native Integration

### New Architecture Support

```typescript
// react-native/src/design-system/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { tokens } from '@n00plicate/design-tokens/dist/mobile/tokens.json';

interface ThemeContextType {
  theme: 'light' | 'dark';
  tokens: typeof tokens;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');

  const theme = userTheme === 'system' ? systemColorScheme || 'light' : userTheme;

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (userTheme === 'system') {
        // Theme will update automatically via useColorScheme
      }
    });

    return () => subscription?.remove();
  }, [userTheme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setUserTheme(newTheme);
    // Persist theme preference
    // AsyncStorage.setItem('theme', newTheme);
  };

  const contextValue: ThemeContextType = {
    theme,
    tokens,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Fabric Renderer Integration

```typescript
// react-native/src/components/FabricButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../design-system/ThemeProvider';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onPress?: () => void;
}

export const FabricButton: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress
}) => {
  const { theme, tokens } = useTheme();

  const buttonStyles = StyleSheet.create({
    container: {
      borderRadius: tokens.border.radius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing[size],
      paddingVertical: tokens.spacing.small,
      minHeight: tokens.component.button.height[size],
      opacity: disabled ? 0.6 : 1,
      ...getVariantStyles(variant, theme, tokens)
    } as ViewStyle,

    text: {
      fontSize: tokens.typography.button.fontSize,
      fontWeight: tokens.typography.button.fontWeight,
      fontFamily: tokens.typography.button.fontFamily,
      ...getTextVariantStyles(variant, theme, tokens)
    } as TextStyle
  });

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyles.container,
        pressed && { opacity: 0.8 }
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={buttonStyles.text}>{title}</Text>
    </Pressable>
  );
};

function getVariantStyles(variant: string, theme: string, tokens: any): ViewStyle {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: tokens.color[theme].primary[500],
        borderWidth: 0
      };
    case 'secondary':
      return {
        backgroundColor: tokens.color[theme].secondary[500],
        borderWidth: 0
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: tokens.border.width.medium,
        borderColor: tokens.color[theme].primary[500]
      };
    default:
      return {};
  }
}

function getTextVariantStyles(variant: string, theme: string, tokens: any): TextStyle {
  switch (variant) {
    case 'primary':
    case 'secondary':
      return {
        color: tokens.color[theme].onPrimary
      };
    case 'outline':
      return {
        color: tokens.color[theme].primary[500]
      };
    default:
      return {};
  }
}
```

### New Architecture TurboModules

```typescript
// react-native/src/modules/DesignTokensModule.ts
import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getTokens(): Promise<string>;
  updateTokens(tokens: string): Promise<void>;
  getCurrentTheme(): Promise<string>;
  setTheme(theme: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DesignTokensModule');
```

## Performance Optimization

### Theme Caching

```kotlin
// design-system/src/commonMain/kotlin/com/n00plicate/design/cache/ThemeCache.kt
package com.n00plicate.design.cache

import androidx.compose.runtime.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlin.collections.mutableMapOf

object ThemeCache {
    private val colorCache = mutableMapOf<String, n00plicateColors>()
    private val typographyCache = mutableMapOf<String, n00plicateTypography>()

    fun getCachedColors(key: String): n00plicateColors? = colorCache[key]

    fun setCachedColors(key: String, colors: n00plicateColors) {
        colorCache[key] = colors
    }

    fun getCachedTypography(key: String): n00plicateTypography? = typographyCache[key]

    fun setCachedTypography(key: String, typography: n00plicateTypography) {
        typographyCache[key] = typography
    }

    fun clearCache() {
        colorCache.clear()
        typographyCache.clear()
    }
}

@Composable
fun cachedn00plicateColors(
    isDark: Boolean,
    customizations: Map<String, Any> = emptyMap()
): n00plicateColors {
    val cacheKey = "colors_${isDark}_${customizations.hashCode()}"

    return remember(cacheKey) {
        ThemeCache.getCachedColors(cacheKey) ?: run {
            val colors = if (isDark) darkn00plicateColors() else lightn00plicateColors()
            val customizedColors = applyCustomizations(colors, customizations)
            ThemeCache.setCachedColors(cacheKey, customizedColors)
            customizedColors
        }
    }
}
```

### Memory Management

```kotlin
// design-system/src/commonMain/kotlin/com/n00plicate/design/memory/MemoryManager.kt
package com.n00plicate.design.memory

import androidx.compose.runtime.*

class MemoryEfficientTheme {
    private val disposables = mutableListOf<DisposableEffect>()

    @Composable
    fun ProvideTheme(
        content: @Composable () -> Unit
    ) {
        // Track memory usage
        val memoryTracker = remember { MemoryTracker() }

        DisposableEffect(Unit) {
            memoryTracker.start()
            onDispose {
                memoryTracker.stop()
                clearCaches()
            }
        }

        content()
    }

    private fun clearCaches() {
        ThemeCache.clearCache()
        // Clear other caches
    }
}

class MemoryTracker {
    fun start() {
        // Platform-specific memory tracking
    }

    fun stop() {
        // Cleanup and report
    }
}
```

## Testing Strategies

### Platform-Specific Testing

```kotlin
// design-system/src/commonTest/kotlin/com/n00plicate/design/theme/ThemeTest.kt
package com.n00plicate.design.theme

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ThemeTest {
    @Test
    fun testLightThemeColors() {
        val lightColors = lightn00plicateColors()

        assertNotNull(lightColors.primary)
        assertNotNull(lightColors.background)
        assertNotNull(lightColors.surface)
    }

    @Test
    fun testDarkThemeColors() {
        val darkColors = darkn00plicateColors()

        assertNotNull(darkColors.primary)
        assertNotNull(darkColors.background)
        assertNotNull(darkColors.surface)
    }

    @Test
    fun testThemeTokenConsistency() {
        val lightColors = lightn00plicateColors()
        val darkColors = darkn00plicateColors()

        // Ensure both themes have same structure
        assertEquals(lightColors::class, darkColors::class)
    }
}

// Platform-specific tests
// design-system/src/iosTest/kotlin/com/n00plicate/design/theme/IOSThemeTest.kt
class IOSThemeTest {
    @Test
    fun testSafeAreaInsets() {
        // Test iOS-specific safe area handling
    }

    @Test
    fun testDynamicTypeSupport() {
        // Test iOS Dynamic Type integration
    }
}
```

## Next Steps

- [Tauri Desktop Integration](./tauri.md)
- [CI/CD Platform Testing](../cicd/platform-testing.md)
- [Performance Monitoring](../quality/performance.md)
- [Cross-Platform Design Patterns](../design/cross-platform.md)

---

_This documentation is updated with each Compose Multiplatform release and covers the latest platform-specific
features._
