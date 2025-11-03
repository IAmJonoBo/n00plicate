# Design Token Schema

**Version**: 2.0.0\
**Last Updated**: June 2025

This document defines the required naming conventions and structure for design tokens in the
n00plicate design system to prevent collisions across platforms.

## Namespace Requirements

All semantic tokens **must** be prefixed with the design system identifier to guarantee no
CSS variables or platform constants ever collide with third-party libraries.

### Prefix Pattern

- **CSS/Web**: `ds-` (kebab-case)
- **JavaScript/TypeScript**: `ds` (camelCase)
- **Kotlin/Compose**: `Ds` (PascalCase)
- **Dart/Flutter**: `Ds` (PascalCase)

### Token Structure

Tokens must follow the pattern: `{prefix}.{type}.{purpose}.{variant?}`

```json
{
  "$description": "Base design tokens for the n00plicate design system",
  "color": {
    "$type": "color",
    "$description": "Color palette tokens",
    "primary": {
      "$description": "Primary brand color palette",
      "50": {
        "$value": "#eff6ff",
        "$type": "color",
        "$description": "Lightest primary color"
      },
      "500": {
        "$value": "#3b82f6",
        "$type": "color",
        "$description": "Base primary color"
      }
    }
  },
  "spacing": {
    "$type": "dimension",
    "$description": "Spacing scale tokens",
    "xs": {
      "$value": "0.25rem",
      "$type": "dimension",
      "$description": "Extra small spacing"
    }
  }
}
```

## Platform-Specific Overrides

Platform-specific tokens override base tokens using the same naming structure but with platform-appropriate units:

### Web Platform (`tokens/platforms/web.json`)

```json
{
  "$description": "Web platform specific token overrides",
  "typography": {
    "fontSize": {
      "xs": {
        "$value": "0.75rem",
        "$type": "dimension",
        "$description": "Extra small font size (12px)"
      }
    }
  }
}
```

### Mobile Platform (`tokens/platforms/mobile.json`)

```json
{
  "$description": "Mobile platform specific token overrides",
  "typography": {
    "fontSize": {
      "xs": {
        "$value": "12dp",
        "$type": "dimension",
        "$description": "Extra small font size for mobile"
      }
    }
  }
}
```

## Output Examples

### CSS (Web)

```css
:root {
  --ds-color-primary-50: #eff6ff;
  --ds-color-primary-500: #3b82f6;
  --ds-spacing-xs: 0.25rem;
  --ds-typography-font-size-xs: 0.75rem;
}
```

### Kotlin (Compose)

```kotlin
package ds.theme

object DsTokens {
  object Color {
    val PRIMARY_50 = Color(0xFFeff6ff)
    val PRIMARY_500 = Color(0xFF3b82f6)
  }
  object Spacing {
    val XS = 4.dp
  }
}
```

### Dart (Flutter)

```dart
class DsTokens {
  static const primary_50 = Color(0xFFeff6ff);
  static const primary_500 = Color(0xFF3b82f6);
  static const spacing_xs = 4.0;
}
```

## Validation Rules

1. **Prefix enforcement**: All semantic tokens must use the `ds` prefix
2. **Type locking**: Token type and purpose must remain consistent across platforms
3. **W3C compliance**: All tokens must follow W3C-DTCG specification
4. **Platform units**: Use appropriate units for each platform (rem/px for web, dp for mobile)

## Anti-Patterns

❌ **Avoid**: Tokens without prefixes

```json
{
  "primary": "#3b82f6" // Will collide with third-party libraries
}
```

❌ **Avoid**: Inconsistent naming across platforms

```json
{
  "color-primary": "#3b82f6", // Web
  "primaryColor": "#3b82f6" // Mobile - inconsistent naming
}
```

✅ **Correct**: Consistent prefixed naming

```json
{
  "color": {
    "primary": {
      "500": {
        "$value": "#3b82f6",
        "$type": "color"
      }
    }
  }
}
```

## References

- [W3C Design Tokens Community Group Format](https://design-tokens.github.io/community-group/format/)
- [Style Dictionary Token Structure](https://amzn.github.io/style-dictionary/#/tokens)
- [Platform Integration Guides](../platforms/README.md)
