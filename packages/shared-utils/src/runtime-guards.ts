/**
 * Runtime collision detection and guard-rails for design tokens
 * Prevents runtime conflicts between tokens, global variables, and platform-specific code
 */

interface CollisionReport {
  type: 'css-variable' | 'js-global' | 'import-path' | 'namespace';
  severity: 'error' | 'warning' | 'info';
  message: string;
  detected: string[];
  recommendations: string[];
}

interface RuntimeGuardConfig {
  enableCollisionDetection: boolean;
  enableImportPathValidation: boolean;
  enableNamespaceValidation: boolean;
  logLevel: 'error' | 'warning' | 'info';
  reportCallback?: (report: CollisionReport) => void;
}

class RuntimeGuards {
  private config: RuntimeGuardConfig;
  private reports: CollisionReport[] = [];

  constructor(config: Partial<RuntimeGuardConfig> = {}) {
    this.config = {
      enableCollisionDetection: true,
      enableImportPathValidation: true,
      enableNamespaceValidation: true,
      logLevel: 'warning',
      ...config,
    };

    if (typeof window !== 'undefined' && this.config.enableCollisionDetection) {
      this.initializeGuards();
    }
  }

  private initializeGuards(): void {
    // Monitor for CSS variable collisions
    this.detectCSSVariableCollisions();

    // Monitor for JavaScript global collisions
    this.detectJSGlobalCollisions();

    // Monitor for namespace violations
    this.detectNamespaceViolations();

    if (this.config.logLevel === 'info') {
      // Development mode logging - using console.warn is acceptable here
      console.warn('[RuntimeGuards] Collision detection initialized');
    }
  }

  private detectCSSVariableCollisions(): void {
    if (typeof document === 'undefined') return;

    const styleSheets = Array.from(document.styleSheets);
    const cssVariables = new Set<string>();
    const collisions: string[] = [];

    try {
      styleSheets.forEach((sheet) => {
        if (!sheet.href || sheet.href.includes(window.location.origin)) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach((rule) => {
              if (rule.type === CSSRule.STYLE_RULE) {
                const styleRule = rule as CSSStyleRule;
                const text = styleRule.cssText;

                // Check for non-ds prefixed CSS variables
                const variableMatches = text.match(/--([^d][^s]-[^:;]+)/g);
                if (variableMatches) {
                  variableMatches.forEach((variable) => {
                    if (cssVariables.has(variable)) {
                      collisions.push(variable);
                    } else {
                      cssVariables.add(variable);
                    }
                  });
                }
              }
            });
          } catch {
            // Skip stylesheets that can't be accessed (CORS restrictions)
            // This is expected behavior for external stylesheets
          }
        }
      });

      if (collisions.length > 0) {
        this.reportCollision({
          type: 'css-variable',
          severity: 'warning',
          message: 'Detected CSS variables without ds- prefix that may cause collisions',
          detected: collisions,
          recommendations: [
            'Ensure all design tokens use --ds-* prefix',
            'Update CSS variables to follow collision-safe naming',
            'Check for third-party CSS conflicts',
          ],
        });
      }
    } catch (error) {
      // Development warning for debugging - using console.warn is acceptable here
      console.warn('[RuntimeGuards] CSS variable collision detection failed:', error);
    }
  }

  private detectJSGlobalCollisions(): void {
    if (typeof window === 'undefined') return;

    const potentialConflicts: string[] = [];
    const knownGlobals = ['dsTokens', 'dsTheme', 'dsColors', 'dsTypography'];

    // Check for global variables that might conflict with ds* namespace
    Object.keys(window).forEach((key) => {
      if (key.startsWith('ds') && !knownGlobals.includes(key)) {
        potentialConflicts.push(key);
      }
    });

    if (potentialConflicts.length > 0) {
      this.reportCollision({
        type: 'js-global',
        severity: 'warning',
        message: 'Detected global variables in ds* namespace that may cause conflicts',
        detected: potentialConflicts,
        recommendations: [
          'Ensure only authorized design token globals use ds* prefix',
          'Check for third-party library conflicts',
          'Consider using module imports instead of globals',
        ],
      });
    }
  }

  private detectNamespaceViolations(): void {
    // This would be enhanced with build-time information about actual imports
    // For now, we'll check for deprecated patterns in the global scope

    const deprecatedPatterns = [
      'design-tokens/dist/',
      'tokens.dist.',
      'DesignTokens.', // Old non-prefixed patterns
    ];

    // Check if any of these patterns exist in global scope or error messages
    const violations = deprecatedPatterns.filter((pattern) => {
      try {
        return document.documentElement.innerHTML.includes(pattern);
      } catch {
        // DOM access might fail in some environments, return false safely
        return false;
      }
    });

    if (violations.length > 0) {
      this.reportCollision({
        type: 'namespace',
        severity: 'error',
        message: 'Detected usage of deprecated token import patterns',
        detected: violations,
        recommendations: [
          'Update imports to use libs/tokens/ paths',
          'Ensure all token references use ds- prefix',
          'Review migration guide for breaking changes',
        ],
      });
    }
  }

  private reportCollision(report: CollisionReport): void {
    this.reports.push(report);

    if (this.shouldLog(report.severity)) {
      let logMethod: 'error' | 'warn' | 'log';

      if (report.severity === 'error') {
        logMethod = 'error';
      } else if (report.severity === 'warning') {
        logMethod = 'warn';
      } else {
        logMethod = 'log';
      }

      // Runtime collision reporting - using console is acceptable here
      // eslint-disable-next-line no-console
      console[logMethod](`[RuntimeGuards] ${report.message}`, {
        type: report.type,
        detected: report.detected,
        recommendations: report.recommendations,
      });
    }

    if (this.config.reportCallback) {
      this.config.reportCallback(report);
    }
  }

  private shouldLog(severity: CollisionReport['severity']): boolean {
    const levels = { info: 0, warning: 1, error: 2 };
    const configLevel = levels[this.config.logLevel] || 1;
    const reportLevel = levels[severity] || 0;
    return reportLevel >= configLevel;
  }

  public getReports(): CollisionReport[] {
    return [...this.reports];
  }

  public clearReports(): void {
    this.reports = [];
  }

  public validateTokenImport(importPath: string): boolean {
    // Validate that import uses collision-safe paths
    const validMatchers = [
      (path: string) => path.includes('libs/tokens/'),
      (path: string) => path === '@n00plicate/design-tokens',
      (path: string) => path.startsWith('@n00plicate/design-tokens/'),
    ];

    const deprecatedPatterns = ['dist/', 'build/'];
    const isValid = validMatchers.some((matcher) => matcher(importPath));
    const isDeprecated = deprecatedPatterns.some((pattern) => importPath.includes(pattern));

    if (isDeprecated) {
      this.reportCollision({
        type: 'import-path',
        severity: 'error',
        message: 'Deprecated import path detected',
        detected: [importPath],
        recommendations: ['Update to use libs/tokens/ import path', 'Follow migration guide for proper imports'],
      });
      return false;
    }

    return isValid;
  }
}

// Export singleton instance for runtime use
export const runtimeGuards = new RuntimeGuards({
  enableCollisionDetection: process.env.NODE_ENV !== 'production',
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warning',
});

export default RuntimeGuards;
