# Compose Multiplatform Theme Integration

Complete guide to integrating design tokens with Compose Multiplatform, including runtime theme
switching, iOS/Wasm considerations, and React Native interoperability.

## Table of Contents

- [Theme Setup](#theme-setup)
- [Runtime Theme Switching](#runtime-theme-switching)
- [Platform-Specific Considerations](#platform-specific-considerations)
- [React Native Interoperability](#react-native-interoperability)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Theme Setup

### Design Token Integration

The generated `Theme.kt` file from Style Dictionary provides the foundation for Compose theming:

```kotlin
// Generated from Style Dictionary: dist/compose/Theme.kt
package com.n00plicate.tokens

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object n00plicateTheme {
    // Colors - Primary Scale
    val ColorPrimary50 = Color(0xFFEFF6FF)
    val ColorPrimary100 = Color(0xFFDBEAFE)
    val ColorPrimary500 = Color(0xFF3B82F6)
    val ColorPrimary900 = Color(0xFF1E3A8A)

    // Colors - Semantic
    val ColorTextPrimary = Color(0xFF111827)
    val ColorTextSecondary = Color(0xFF6B7280)
    val ColorSurfacePrimary = Color(0xFFFAFAFA)
    val ColorSurfaceSecondary = Color(0xFFF3F4F6)

    // Spacing
    val SpacingXs = 4.dp
    val SpacingSm = 8.dp
    val SpacingMd = 16.dp
    val SpacingLg = 24.dp
    val SpacingXl = 32.dp

    // Typography
    val FontSizeXs = 12.sp
    val FontSizeBase = 16.sp
    val FontSizeXl = 20.sp
    val FontWeightNormal = FontWeight.Normal
    val FontWeightMedium = FontWeight.Medium
    val FontWeightBold = FontWeight.Bold

    // Border Radius
    val BorderRadiusSm = 4.dp
    val BorderRadiusMd = 8.dp
    val BorderRadiusLg = 12.dp
}
```

### Material 3 Theme Integration

```kotlin
// compose/theme/n00plicateTheme.kt - Complete theme setup
package com.n00plicate.compose.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.n00plicate.tokens.n00plicateTheme as Tokens

// Light color scheme
private val LightColorScheme = lightColorScheme(
    primary = Tokens.ColorPrimary500,
    onPrimary = Tokens.ColorPrimary50,
    primaryContainer = Tokens.ColorPrimary100,
    onPrimaryContainer = Tokens.ColorPrimary900,

    secondary = Tokens.ColorSecondary500,
    onSecondary = Tokens.ColorSecondary50,
    secondaryContainer = Tokens.ColorSecondary100,
    onSecondaryContainer = Tokens.ColorSecondary900,

    surface = Tokens.ColorSurfacePrimary,
    onSurface = Tokens.ColorTextPrimary,
    surfaceVariant = Tokens.ColorSurfaceSecondary,
    onSurfaceVariant = Tokens.ColorTextSecondary,

    background = Tokens.ColorSurfacePrimary,
    onBackground = Tokens.ColorTextPrimary,

    error = Tokens.ColorError500,
    onError = Tokens.ColorError50
)

// Dark color scheme
private val DarkColorScheme = darkColorScheme(
    primary = Tokens.ColorPrimary400,
    onPrimary = Tokens.ColorPrimary900,
    primaryContainer = Tokens.ColorPrimary800,
    onPrimaryContainer = Tokens.ColorPrimary100,

    secondary = Tokens.ColorSecondary400,
    onSecondary = Tokens.ColorSecondary900,
    secondaryContainer = Tokens.ColorSecondary800,
    onSecondaryContainer = Tokens.ColorSecondary100,

    surface = Tokens.ColorNeutral900,
    onSurface = Tokens.ColorNeutral100,
    surfaceVariant = Tokens.ColorNeutral800,
    onSurfaceVariant = Tokens.ColorNeutral300,

    background = Tokens.ColorNeutral900,
    onBackground = Tokens.ColorNeutral100,

    error = Tokens.ColorError400,
    onError = Tokens.ColorError900
)

// Typography based on design tokens
private val n00plicateTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = Tokens.FontWeightBold,
        fontSize = 57.sp,
        lineHeight = 64.sp
    ),
    displayMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = Tokens.FontWeightBold,
        fontSize = 45.sp,
        lineHeight = 52.sp
    ),
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = Tokens.FontWeightBold,
        fontSize = 32.sp,
        lineHeight = 40.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = Tokens.FontWeightMedium,
        fontSize = 22.sp,
        lineHeight = 28.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = Tokens.FontWeightNormal,
        fontSize = Tokens.FontSizeBase,
        lineHeight = 24.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = Tokens.FontWeightNormal,
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = Tokens.FontWeightMedium,
        fontSize = 14.sp,
        lineHeight = 20.sp
    )
)

@Composable
fun n00plicateTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = n00plicateTypography,
        content = content
    )
}
```

## Runtime Theme Switching

### Theme State Management

```kotlin
// compose/theme/ThemeManager.kt - Centralized theme management
package com.n00plicate.compose.theme

import androidx.compose.runtime.*
import androidx.compose.foundation.isSystemInDarkTheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM
}

class ThemeManager {
    private val _themeMode = MutableStateFlow(ThemeMode.SYSTEM)
    val themeMode: StateFlow<ThemeMode> = _themeMode.asStateFlow()

    private val _customColors = MutableStateFlow<Map<String, Color>>(emptyMap())
    val customColors: StateFlow<Map<String, Color>> = _customColors.asStateFlow()

    fun setThemeMode(mode: ThemeMode) {
        _themeMode.value = mode
    }

    fun toggleTheme() {
        _themeMode.value = when (_themeMode.value) {
            ThemeMode.LIGHT -> ThemeMode.DARK
            ThemeMode.DARK -> ThemeMode.LIGHT
            ThemeMode.SYSTEM -> ThemeMode.DARK
        }
    }

    fun updateCustomColor(key: String, color: Color) {
        _customColors.value = _customColors.value + (key to color)
    }

    fun resetCustomColors() {
        _customColors.value = emptyMap()
    }
}

// Global theme manager instance
val LocalThemeManager = staticCompositionLocalOf<ThemeManager> {
    error("ThemeManager not provided")
}

@Composable
fun ProvideThemeManager(
    themeManager: ThemeManager = remember { ThemeManager() },
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(
        LocalThemeManager provides themeManager,
        content = content
    )
}
```

### Dynamic Theme Composable

```kotlin
// compose/theme/Dynamicn00plicateTheme.kt - Theme with runtime switching
package com.n00plicate.compose.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.flow.collectAsState

@Composable
fun Dynamicn00plicateTheme(
    themeManager: ThemeManager = LocalThemeManager.current,
    content: @Composable () -> Unit
) {
    val themeMode by themeManager.themeMode.collectAsState()
    val customColors by themeManager.customColors.collectAsState()
    val isSystemDark = isSystemInDarkTheme()

    // Determine effective dark theme state
    val isDarkTheme = when (themeMode) {
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
        ThemeMode.SYSTEM -> isSystemDark
    }

    // Apply custom color overrides
    val baseColorScheme = if (isDarkTheme) DarkColorScheme else LightColorScheme
    val customColorScheme = applyCustomColors(baseColorScheme, customColors)

    // Animate theme transitions
    val animatedColorScheme by animateColorSchemeAsState(
        targetColorScheme = customColorScheme,
        animationSpec = tween(durationMillis = 300)
    )

    MaterialTheme(
        colorScheme = animatedColorScheme,
        typography = n00plicateTypography,
        content = content
    )
}

@Composable
private fun animateColorSchemeAsState(
    targetColorScheme: ColorScheme,
    animationSpec: AnimationSpec<Color> = tween()
): State<ColorScheme> {
    return remember(targetColorScheme) {
        derivedStateOf {
            ColorScheme(
                primary = animateColorAsState(
                    targetValue = targetColorScheme.primary,
                    animationSpec = animationSpec
                ).value,
                onPrimary = animateColorAsState(
                    targetValue = targetColorScheme.onPrimary,
                    animationSpec = animationSpec
                ).value,
                // ... animate all other colors
                // (For brevity, showing pattern for primary colors only)
            )
        }
    }
}

private fun applyCustomColors(
    baseScheme: ColorScheme,
    customColors: Map<String, Color>
): ColorScheme {
    return baseScheme.copy(
        primary = customColors["primary"] ?: baseScheme.primary,
        secondary = customColors["secondary"] ?: baseScheme.secondary,
        surface = customColors["surface"] ?: baseScheme.surface,
        // Apply other custom color overrides
    )
}
```

### Theme Switcher Component

```kotlin
// compose/components/ThemeSwitcher.kt - UI component for theme switching
package com.n00plicate.compose.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.n00plicate.compose.theme.*
import kotlinx.coroutines.flow.collectAsState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThemeSwitcher(
    modifier: Modifier = Modifier,
    themeManager: ThemeManager = LocalThemeManager.current
) {
    val currentTheme by themeManager.themeMode.collectAsState()

    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Theme",
                style = MaterialTheme.typography.titleMedium
            )

            // Theme mode selection
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ThemeMode.values().forEach { mode ->
                    FilterChip(
                        selected = currentTheme == mode,
                        onClick = { themeManager.setThemeMode(mode) },
                        label = {
                            Text(
                                text = when (mode) {
                                    ThemeMode.LIGHT -> "Light"
                                    ThemeMode.DARK -> "Dark"
                                    ThemeMode.SYSTEM -> "System"
                                }
                            )
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = when (mode) {
                                    ThemeMode.LIGHT -> Icons.Default.LightMode
                                    ThemeMode.DARK -> Icons.Default.DarkMode
                                    ThemeMode.SYSTEM -> Icons.Default.SettingsBrightness
                                },
                                contentDescription = null
                            )
                        }
                    )
                }
            }

            // Quick toggle button
            OutlinedButton(
                onClick = { themeManager.toggleTheme() },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = if (currentTheme == ThemeMode.DARK) {
                        Icons.Default.LightMode
                    } else {
                        Icons.Default.DarkMode
                    },
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Toggle Theme")
            }
        }
    }
}
```

## Platform-Specific Considerations

### iOS Platform Adaptations

```kotlin
// compose/platform/IOSThemeAdaptations.kt - iOS-specific theme handling
package com.n00plicate.compose.platform

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.systemBars
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import platform.UIKit.*

@Composable
fun IOSStatusBarTheme(
    colorScheme: ColorScheme,
    content: @Composable () -> Unit
) {
    // Update iOS status bar style based on theme
    LaunchedEffect(colorScheme.surface) {
        val isLightContent = isColorLight(colorScheme.surface)

        // Set status bar style
        UIApplication.sharedApplication.setStatusBarStyle(
            if (isLightContent) {
                UIStatusBarStyleLightContent
            } else {
                UIStatusBarStyleDarkContent
            }
        )

        // Update status bar background if needed
        val statusBarView = UIApplication.sharedApplication.windows
            .firstOrNull()?.rootViewController?.view?.subviews
            ?.firstOrNull { it.frame.origin.y == 0.0 && it.frame.size.height == 44.0 }

        statusBarView?.backgroundColor = UIColor.colorWithRed(
            red = colorScheme.surface.red.toDouble(),
            green = colorScheme.surface.green.toDouble(),
            blue = colorScheme.surface.blue.toDouble(),
            alpha = colorScheme.surface.alpha.toDouble()
        )
    }

    content()
}

private fun isColorLight(color: Color): Boolean {
    val luminance = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue)
    return luminance > 0.5
}

// iOS-specific safe area handling
@Composable
fun IOSSafeAreaTheme(
    content: @Composable () -> Unit
) {
    val systemBars = WindowInsets.systemBars

    // Handle iOS safe areas with Material 3
    content()
}
```

### WASM Platform Optimizations

```kotlin
// compose/platform/WASMThemeOptimizations.kt - WASM-specific optimizations
package com.n00plicate.compose.platform

import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import kotlinx.browser.document
import kotlinx.browser.window

@Composable
fun WASMThemeIntegration(
    colorScheme: ColorScheme,
    content: @Composable () -> Unit
) {
    // Sync with CSS custom properties for web integration
    LaunchedEffect(colorScheme) {
        syncWithCSSVariables(colorScheme)
        updateBrowserThemeColor(colorScheme.primary)
    }

    content()
}

private fun syncWithCSSVariables(colorScheme: ColorScheme) {
    val documentElement = document.documentElement

    // Update CSS custom properties to match Compose theme
    documentElement?.style?.setProperty("--color-primary", colorScheme.primary.toHexString())
    documentElement?.style?.setProperty("--color-surface", colorScheme.surface.toHexString())
    documentElement?.style?.setProperty("--color-on-surface", colorScheme.onSurface.toHexString())
    // ... update other CSS variables
}

private fun updateBrowserThemeColor(primaryColor: Color) {
    // Update browser theme color meta tag
    val themeColorMeta = document.querySelector("meta[name='theme-color']")
        ?: document.createElement("meta").apply {
            setAttribute("name", "theme-color")
            document.head?.appendChild(this)
        }

    themeColorMeta.setAttribute("content", primaryColor.toHexString())
}

private fun Color.toHexString(): String {
    val r = (red * 255).toInt().toString(16).padStart(2, '0')
    val g = (green * 255).toInt().toString(16).padStart(2, '0')
    val b = (blue * 255).toInt().toString(16).padStart(2, '0')
    return "#$r$g$b"
}

// WASM-specific performance optimizations
@Composable
fun rememberWASMOptimizedColors(
    baseColorScheme: ColorScheme
): ColorScheme {
    return remember(baseColorScheme) {
        // Pre-compute color variations for better WASM performance
        baseColorScheme.copy(
            // Cache computed colors to avoid repeated calculations
        )
    }
}
```

## React Native Interoperability

### Bridge Configuration

```kotlin
// compose/interop/ReactNativeBridge.kt - RN interoperability
package com.n00plicate.compose.interop

import androidx.compose.material3.ColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class ThemeColors(
    val primary: String,
    val primaryContainer: String,
    val surface: String,
    val onSurface: String,
    val background: String,
    val onBackground: String
)

class ReactNativeThemeBridge {
    companion object {
        fun exportThemeToReactNative(colorScheme: ColorScheme): String {
            val themeColors = ThemeColors(
                primary = colorScheme.primary.toHexString(),
                primaryContainer = colorScheme.primaryContainer.toHexString(),
                surface = colorScheme.surface.toHexString(),
                onSurface = colorScheme.onSurface.toHexString(),
                background = colorScheme.background.toHexString(),
                onBackground = colorScheme.onBackground.toHexString()
            )

            return Json.encodeToString(ThemeColors.serializer(), themeColors)
        }

        fun importThemeFromReactNative(jsonTheme: String): ColorScheme? {
            return try {
                val themeColors = Json.decodeFromString<ThemeColors>(jsonTheme)

                lightColorScheme(
                    primary = Color(android.graphics.Color.parseColor(themeColors.primary)),
                    primaryContainer = Color(android.graphics.Color.parseColor(themeColors.primaryContainer)),
                    surface = Color(android.graphics.Color.parseColor(themeColors.surface)),
                    onSurface = Color(android.graphics.Color.parseColor(themeColors.onSurface)),
                    background = Color(android.graphics.Color.parseColor(themeColors.background)),
                    onBackground = Color(android.graphics.Color.parseColor(themeColors.onBackground))
                )
            } catch (e: Exception) {
                null
            }
        }
    }
}

// Shared theme state between Compose and React Native
@Composable
fun SharedThemeProvider(
    initialTheme: String? = null,
    onThemeChange: (String) -> Unit = {},
    content: @Composable () -> Unit
) {
    var currentTheme by remember {
        mutableStateOf(
            initialTheme?.let {
                ReactNativeThemeBridge.importThemeFromReactNative(it)
            } ?: lightColorScheme()
        )
    }

    // Export theme changes back to React Native
    LaunchedEffect(currentTheme) {
        val exportedTheme = ReactNativeThemeBridge.exportThemeToReactNative(currentTheme)
        onThemeChange(exportedTheme)
    }

    MaterialTheme(
        colorScheme = currentTheme,
        content = content
    )
}

private fun Color.toHexString(): String {
    val argb = this.toArgb()
    return String.format("#%06X", 0xFFFFFF and argb)
}
```

## Performance Optimization

### Theme Caching

```kotlin
// compose/performance/ThemeCache.kt - Theme performance optimizations
package com.n00plicate.compose.performance

import androidx.compose.material3.ColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import java.util.concurrent.ConcurrentHashMap

object ThemeCache {
    private val colorSchemeCache = ConcurrentHashMap<String, ColorScheme>()
    private val colorCache = ConcurrentHashMap<Int, Color>()

    fun getCachedColorScheme(
        key: String,
        factory: () -> ColorScheme
    ): ColorScheme {
        return colorSchemeCache.getOrPut(key, factory)
    }

    fun getCachedColor(
        argb: Int
    ): Color {
        return colorCache.getOrPut(argb) { Color(argb) }
    }

    fun clearCache() {
        colorSchemeCache.clear()
        colorCache.clear()
    }
}

@Composable
fun rememberCachedColorScheme(
    isDark: Boolean,
    customColors: Map<String, Color> = emptyMap()
): ColorScheme {
    return remember(isDark, customColors) {
        val cacheKey = buildString {
            append(if (isDark) "dark" else "light")
            customColors.forEach { (key, color) ->
                append("_${key}=${color.value}")
            }
        }

        ThemeCache.getCachedColorScheme(cacheKey) {
            val baseScheme = if (isDark) DarkColorScheme else LightColorScheme
            applyCustomColors(baseScheme, customColors)
        }
    }
}

// Optimize color allocations
@Composable
fun rememberOptimizedColor(argb: Int): Color {
    return remember(argb) {
        ThemeCache.getCachedColor(argb)
    }
}
```

### Memory Management

```kotlin
// compose/performance/MemoryOptimizedTheme.kt - Memory optimizations
package com.n00plicate.compose.performance

import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Composable
fun MemoryOptimizedn00plicateTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    // Use DisposableEffect to clean up resources
    DisposableEffect(Unit) {
        onDispose {
            // Clean up theme cache when component is disposed
            System.gc() // Suggest garbage collection
        }
    }

    // Lazy initialization of color schemes
    val colorScheme by remember(darkTheme) {
        derivedStateOf {
            if (darkTheme) DarkColorScheme else LightColorScheme
        }
    }

    // Preload commonly used colors in background
    LaunchedEffect(colorScheme) {
        launch(Dispatchers.Default) {
            // Precompute derived colors to avoid runtime calculations
            precomputeDerivedColors(colorScheme)
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = n00plicateTypography,
        content = content
    )
}

private suspend fun precomputeDerivedColors(colorScheme: ColorScheme) {
    // Precompute commonly used color variations
    val computedColors = listOf(
        colorScheme.primary.copy(alpha = 0.1f),
        colorScheme.primary.copy(alpha = 0.2f),
        colorScheme.secondary.copy(alpha = 0.1f),
        // Add other commonly used variations
    )

    // Cache computed colors
    computedColors.forEach { color ->
        ThemeCache.getCachedColor(color.value.toInt())
    }
}
```

## Troubleshooting

### Common Issues and Solutions

#### Theme Not Updating

```kotlin
// Problem: Theme changes not reflected immediately
// Solution: Ensure proper state management

@Composable
fun DebuggableTheme(content: @Composable () -> Unit) {
    val themeManager = LocalThemeManager.current
    val themeMode by themeManager.themeMode.collectAsState()

    // Debug logging
    LaunchedEffect(themeMode) {
        println("Theme mode changed to: $themeMode")
    }

    Dynamicn00plicateTheme(content = content)
}
```

#### Performance Issues

```kotlin
// Problem: Theme switching causes performance drops
// Solution: Optimize color scheme creation

@Composable
fun PerformantTheme(
    darkTheme: Boolean,
    content: @Composable () -> Unit
) {
    // Memoize expensive operations
    val colorScheme = remember(darkTheme) {
        if (darkTheme) DarkColorScheme else LightColorScheme
    }

    // Avoid recreating typography on every recomposition
    val typography = remember { n00plicateTypography }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = typography,
        content = content
    )
}
```

#### Platform-Specific Color Issues

```kotlin
// Problem: Colors appear different on iOS vs Android
// Solution: Platform-specific color adjustments

expect fun adjustColorForPlatform(color: Color): Color

// Android implementation
actual fun adjustColorForPlatform(color: Color): Color = color

// iOS implementation
actual fun adjustColorForPlatform(color: Color): Color {
    // Adjust for iOS display characteristics
    return color.copy(
        red = (color.red * 0.95f).coerceIn(0f, 1f),
        green = (color.green * 0.95f).coerceIn(0f, 1f),
        blue = (color.blue * 0.95f).coerceIn(0f, 1f)
    )
}
```

This comprehensive guide ensures robust theme integration across all Compose Multiplatform targets
with optimal performance and platform-specific adaptations.
