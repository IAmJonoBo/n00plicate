# Token Drift Detection & Synchronization

This document outlines strategies for detecting and managing token drift between design tools (Penpot) and the
codebase, ensuring continuous synchronization and conflict resolution.

## Table of Contents

- [Overview](#overview)
- [Detection Strategies](#detection-strategies)
- [Synchronization Workflows](#synchronization-workflows)
- [Conflict Resolution](#conflict-resolution)
- [Automated Monitoring](#automated-monitoring)
- [Alert Systems](#alert-systems)

## Overview

Token drift occurs when design tokens in the design tool (Penpot) diverge from those in the codebase. This can
happen due to:

- Designers updating tokens in Penpot without triggering code updates
- Developers modifying token values directly in code
- Export/import process failures
- Network connectivity issues during sync
- Conflicting changes from multiple contributors

## Detection Strategies

### 1. Real-Time Monitoring

Continuously monitor for token changes using webhooks and polling:

```typescript
// tools/drift-detection/real-time-monitor.ts
import { EventEmitter } from 'events';
import { PenpotAPI } from '../penpot-export/api';
import { TokenStore } from '../token-store/store';

export class RealTimeDriftMonitor extends EventEmitter {
  private penpotAPI: PenpotAPI;
  private tokenStore: TokenStore;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastKnownHash: string = '';

  constructor(config: MonitorConfig) {
    super();
    this.penpotAPI = new PenpotAPI(config.penpot);
    this.tokenStore = new TokenStore(config.store);
  }

  async start(): Promise<void> {
    console.log('🔍 Starting real-time drift monitoring...');

    // Initial baseline
    this.lastKnownHash = await this.getCurrentTokenHash();

    // Set up webhook listener
    await this.setupWebhook();

    // Start polling as fallback
    this.startPolling();

    this.emit('monitoring:started');
  }

  private async setupWebhook(): Promise<void> {
    try {
      await this.penpotAPI.registerWebhook({
        url: `${process.env.WEBHOOK_BASE_URL}/penpot/token-changes`,
        events: ['file:updated', 'library:updated'],
        filters: {
          fileId: process.env.PENPOT_FILE_ID,
          projectId: process.env.PENPOT_PROJECT_ID,
        },
      });

      console.log('✅ Webhook registered for real-time updates');
    } catch (error) {
      console.warn(
        '⚠️ Webhook setup failed, relying on polling:',
        error.message
      );
    }
  }

  private startPolling(): void {
    this.pollInterval = setInterval(async () => {
      await this.checkForDrift();
    }, 30000); // Poll every 30 seconds
  }

  async checkForDrift(): Promise<DriftResult> {
    try {
      const currentHash = await this.getCurrentTokenHash();

      if (currentHash !== this.lastKnownHash) {
        console.log('🚨 Token drift detected!');

        const driftDetails = await this.analyzeDrift();
        this.emit('drift:detected', driftDetails);

        this.lastKnownHash = currentHash;
        return driftDetails;
      }

      return { hasDrift: false };
    } catch (error) {
      console.error('❌ Drift detection failed:', error);
      this.emit('drift:error', error);
      throw error;
    }
  }

  private async getCurrentTokenHash(): Promise<string> {
    const penpotTokens = await this.penpotAPI.exportTokens();
    const codebaseTokens = await this.tokenStore.getAllTokens();

    // Create combined hash
    const crypto = require('crypto');
    const combined = JSON.stringify({
      penpot: penpotTokens,
      codebase: codebaseTokens,
    });

    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  private async analyzeDrift(): Promise<DriftResult> {
    const penpotTokens = await this.penpotAPI.exportTokens();
    const codebaseTokens = await this.tokenStore.getAllTokens();

    const differ = new TokenDiffer();
    const differences = differ.compare(penpotTokens, codebaseTokens);

    return {
      hasDrift: true,
      timestamp: new Date(),
      differences,
      penpotVersion: await this.penpotAPI.getFileVersion(),
      codebaseVersion: await this.tokenStore.getVersion(),
      severity: this.calculateSeverity(differences),
    };
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.emit('monitoring:stopped');
    console.log('🛑 Drift monitoring stopped');
  }
}
```

### 2. Scheduled Deep Analysis

Perform comprehensive drift analysis on a schedule:

```typescript
// tools/drift-detection/scheduled-analyzer.ts
export class ScheduledDriftAnalyzer {
  private scheduler: NodeSchedule;
  private analyzer: DeepTokenAnalyzer;

  constructor() {
    this.scheduler = new NodeSchedule();
    this.analyzer = new DeepTokenAnalyzer();
  }

  schedule(): void {
    // Run deep analysis every hour
    this.scheduler.scheduleJob('0 * * * *', async () => {
      await this.runDeepAnalysis();
    });

    // Run comprehensive audit daily at 2 AM
    this.scheduler.scheduleJob('0 2 * * *', async () => {
      await this.runComprehensiveAudit();
    });

    // Run weekly trend analysis on Sundays
    this.scheduler.scheduleJob('0 3 * * 0', async () => {
      await this.runTrendAnalysis();
    });
  }

  private async runDeepAnalysis(): Promise<void> {
    console.log('🔍 Running scheduled deep drift analysis...');

    try {
      const analysis = await this.analyzer.analyze({
        includeHistory: true,
        analyzeUsage: true,
        checkCrossRefs: true,
        validateSemantics: true,
      });

      if (analysis.criticalIssues.length > 0) {
        await this.sendCriticalAlert(analysis);
      }

      await this.storeAnalysis(analysis);
    } catch (error) {
      console.error('❌ Scheduled analysis failed:', error);
      await this.sendErrorAlert(error);
    }
  }

  private async runComprehensiveAudit(): Promise<void> {
    console.log('📊 Running comprehensive token audit...');

    const audit = await this.analyzer.comprehensiveAudit({
      checkOrphans: true,
      analyzePerformance: true,
      validateAccessibility: true,
      checkBrandCompliance: true,
      assessQuality: true,
    });

    // Generate audit report
    const report = await this.generateAuditReport(audit);

    // Store results
    await this.storeAuditResults(audit);

    // Send weekly summary
    await this.sendWeeklySummary(report);
  }
}
```

### 3. Git Hook Integration

Detect drift during Git operations:

```bash
#!/bin/bash
# .git/hooks/pre-push

echo "🔍 Checking for token drift before push..."

# Check if token files have been modified
if git diff --name-only HEAD~1 HEAD | grep -q "packages/design-tokens/"; then
  echo "📝 Token changes detected, verifying sync with Penpot..."

  # Run drift detection
  pnpm run tokens:check-drift
  drift_status=$?

  if [ $drift_status -eq 1 ]; then
    echo "🚨 DRIFT DETECTED: Tokens are out of sync with Penpot!"
  echo "Run 'pnpm run tokens:sync' to resolve before pushing."
    exit 1
  elif [ $drift_status -eq 2 ]; then
    echo "⚠️ WARNING: Could not verify sync with Penpot (network/auth issue)"
    echo "Proceeding with push, but manual verification recommended."
  else
    echo "✅ Token sync verified"
  fi
fi

echo "✅ Pre-push drift check completed"
```

## Synchronization Workflows

### 1. Automated Sync Pipeline

```yaml
# .github/workflows/token-sync.yml
name: Token Synchronization

on:
  schedule:
    # Run every 15 minutes during business hours
    - cron: '*/15 9-17 * * 1-5'
  workflow_dispatch:
    inputs:
      force_sync:
        description: 'Force sync even if no changes detected'
        required: false
        default: 'false'
      dry_run:
        description: 'Perform dry run without committing changes'
        required: false
        default: 'false'

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for drift
        id: drift-check
        run: |
          pnpm run tokens:check-drift --silent
          echo "drift-detected=$?" >> $GITHUB_OUTPUT
        env:
          PENPOT_ACCESS_TOKEN: ${{ secrets.PENPOT_ACCESS_TOKEN }}
          PENPOT_FILE_ID: ${{ secrets.PENPOT_FILE_ID }}

      - name: Sync tokens
        if: steps.drift-check.outputs.drift-detected == '1' || github.event.inputs.force_sync == 'true'
        run: |
          if [ "${{ github.event.inputs.dry_run }}" = "true" ]; then
            pnpm run tokens:sync -- --dry-run
          else
            pnpm run tokens:sync
          fi
        env:
          PENPOT_ACCESS_TOKEN: ${{ secrets.PENPOT_ACCESS_TOKEN }}

      - name: Validate synced tokens
        if: steps.drift-check.outputs.drift-detected == '1'
        run: |
          pnpm run tokens:validate
          pnpm run tokens:build
          pnpm run test:tokens

      - name: Create pull request
        if: steps.drift-check.outputs.drift-detected == '1' && github.event.inputs.dry_run != 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'feat(tokens): sync with Penpot design updates'
          title: '🎨 Automated token sync from Penpot'
          body: |
            ## Automated Token Synchronization

            This PR was automatically created to sync design tokens with updates from Penpot.

            ### Changes
            - Updated design tokens from Penpot export
            - Regenerated platform-specific token files
            - Validated token consistency and structure

            ### Validation
            - [x] Schema validation passed
            - [x] Build process completed successfully
            - [x] Token tests passed
            - [ ] Visual regression tests (will run automatically)

            ### Review Checklist
            - [ ] Review token changes for design consistency
            - [ ] Verify no breaking changes introduced
            - [ ] Check component impact in Storybook
            - [ ] Approve and merge if changes look correct

            > This PR was created by the automated token sync workflow.
            > If you see frequent sync PRs, consider reviewing the token governance process.
          branch: automated/token-sync-${{ github.run_number }}
          delete-branch: true

      - name: Send notification
        if: steps.drift-check.outputs.drift-detected == '1'
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              "attachments": [{
                "color": "warning",
                "title": "🎨 Token Sync Required",
                "text": "Design tokens have been updated in Penpot and need to be synced.",
                "fields": [{
                  "title": "Action",
                  "value": "Automated PR created for review",
                  "short": true
                }, {
                  "title": "Workflow",
                  "value": "<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>",
                  "short": true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 2. Manual Sync Command

```typescript
// tools/sync/manual-sync.ts
export class ManualTokenSync {
  private penpotAPI: PenpotAPI;
  private tokenProcessor: TokenProcessor;
  private conflictResolver: ConflictResolver;

  async sync(options: SyncOptions): Promise<SyncResult> {
    console.log('🔄 Starting manual token synchronization...');

    try {
      // 1. Export from Penpot
      const penpotTokens = await this.penpotAPI.exportTokens();
      console.log('✅ Exported tokens from Penpot');

      // 2. Compare with current tokens
      const currentTokens = await this.tokenProcessor.getCurrentTokens();
      const differences = this.findDifferences(penpotTokens, currentTokens);

      if (differences.length === 0) {
        console.log('✅ No differences found, tokens are in sync');
        return { status: 'up-to-date', changes: [] };
      }

      // 3. Handle conflicts if any
      const conflicts = this.identifyConflicts(differences);
      if (conflicts.length > 0 && !options.autoResolve) {
        console.log('⚠️ Conflicts detected, manual resolution required');
        return {
          status: 'conflicts-detected',
          conflicts,
          changes: differences,
        };
      }

      // 4. Apply changes
      if (options.dryRun) {
        console.log('🔍 Dry run mode - showing what would be changed:');
        this.logChanges(differences);
        return { status: 'dry-run', changes: differences };
      }

      await this.applyChanges(differences, conflicts);
      console.log('✅ Token synchronization completed');

      // 5. Generate build artifacts
      await this.tokenProcessor.buildAllPlatforms();

      return {
        status: 'success',
        changes: differences,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Synchronization failed:', error);
      return {
        status: 'error',
        error: error.message,
        changes: [],
      };
    }
  }

  private async applyChanges(
    differences: TokenDifference[],
    conflicts: TokenConflict[]
  ): Promise<void> {
    // Resolve conflicts first
    for (const conflict of conflicts) {
      await this.conflictResolver.resolve(conflict);
    }

    // Apply non-conflicting changes
    for (const diff of differences) {
      await this.applyDifference(diff);
    }

    // Validate after changes
    await this.tokenProcessor.validate();
  }

  private logChanges(differences: TokenDifference[]): void {
    differences.forEach(diff => {
      const symbol =
        diff.type === 'added' ? '➕' : diff.type === 'removed' ? '➖' : '🔄';
      console.log(
        `${symbol} ${diff.path}: ${diff.oldValue} → ${diff.newValue}`
      );
    });
  }
}
```

## Conflict Resolution

### 1. Conflict Detection

```typescript
// tools/conflict-resolution/detector.ts
export class ConflictDetector {
  detectConflicts(
    penpotTokens: TokenSet,
    codebaseTokens: TokenSet,
    localChanges: TokenChange[]
  ): TokenConflict[] {
    const conflicts: TokenConflict[] = [];

    // Check for concurrent modifications
    localChanges.forEach(localChange => {
      const penpotValue = this.getTokenValue(penpotTokens, localChange.path);
      const codebaseValue = this.getTokenValue(
        codebaseTokens,
        localChange.path
      );

      if (penpotValue !== codebaseValue && localChange.value !== penpotValue) {
        conflicts.push({
          type: 'concurrent-modification',
          path: localChange.path,
          penpotValue,
          codebaseValue,
          localValue: localChange.value,
          timestamp: new Date(),
        });
      }
    });

    // Check for semantic conflicts
    this.checkSemanticConflicts(penpotTokens, codebaseTokens, conflicts);

    // Check for breaking changes
    this.checkBreakingChanges(penpotTokens, codebaseTokens, conflicts);

    return conflicts;
  }

  private checkSemanticConflicts(
    penpotTokens: TokenSet,
    codebaseTokens: TokenSet,
    conflicts: TokenConflict[]
  ): void {
    // Check for color scheme inconsistencies
    const penpotColors = this.extractColors(penpotTokens);
    const codebaseColors = this.extractColors(codebaseTokens);

    Object.keys(penpotColors).forEach(colorKey => {
      if (codebaseColors[colorKey]) {
        const penpotHue = this.getColorHue(penpotColors[colorKey]);
        const codebaseHue = this.getColorHue(codebaseColors[colorKey]);

        if (Math.abs(penpotHue - codebaseHue) > 30) {
          conflicts.push({
            type: 'semantic-color-shift',
            path: ['color', colorKey],
            description: `Color ${colorKey} has shifted significantly in hue`,
            severity: 'high',
          });
        }
      }
    });
  }
}
```

### 2. Resolution Strategies

```typescript
// tools/conflict-resolution/resolver.ts
export class ConflictResolver {
  async resolve(conflict: TokenConflict): Promise<ResolutionResult> {
    const strategy = this.getResolutionStrategy(conflict);

    switch (strategy) {
      case 'prefer-penpot':
        return this.preferPenpotValue(conflict);

      case 'prefer-codebase':
        return this.preferCodebaseValue(conflict);

      case 'merge':
        return this.mergeValues(conflict);

      case 'manual':
        return this.requestManualResolution(conflict);

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`);
    }
  }

  private getResolutionStrategy(conflict: TokenConflict): ResolutionStrategy {
    // Automatic strategies for common conflicts
    if (conflict.type === 'concurrent-modification') {
      // Prefer Penpot for design-related tokens
      if (conflict.path[0] === 'color' || conflict.path[0] === 'typography') {
        return 'prefer-penpot';
      }

      // Prefer codebase for technical tokens
      if (
        conflict.path.includes('component') ||
        conflict.path.includes('platform')
      ) {
        return 'prefer-codebase';
      }
    }

    if (conflict.type === 'semantic-color-shift') {
      return 'manual'; // Always require manual review for color changes
    }

    return 'manual'; // Default to manual resolution
  }

  private async requestManualResolution(
    conflict: TokenConflict
  ): Promise<ResolutionResult> {
    // Create GitHub issue for manual resolution
    const issue = await this.createResolutionIssue(conflict);

    // Send Slack notification
    await this.notifyTeam(conflict, issue);

    return {
      status: 'pending-manual',
      conflict,
      issueUrl: issue.url,
    };
  }

  private async createResolutionIssue(
    conflict: TokenConflict
  ): Promise<GitHubIssue> {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const issueBody = `
## Token Conflict Resolution Required

A conflict has been detected that requires manual resolution.

### Conflict Details
- **Type**: ${conflict.type}
- **Token Path**: ${conflict.path.join('.')}
- **Severity**: ${conflict.severity || 'medium'}

### Values
- **Penpot**: \`${conflict.penpotValue}\`
- **Codebase**: \`${conflict.codebaseValue}\`
- **Local**: \`${conflict.localValue || 'N/A'}\`

### Description
${conflict.description || 'No additional description available.'}

### Resolution Options
1. **Accept Penpot value** - Use the value from the design tool
2. **Keep codebase value** - Maintain the current implementation
3. **Create new value** - Define a compromise or new approach

### Next Steps
- [ ] Review the conflict with the design team
- [ ] Decide on the appropriate resolution
- [ ] Update the tokens manually
- [ ] Close this issue

---
*This issue was automatically created by the token drift detection system.*
    `;

    const response = await octokit.rest.issues.create({
      owner: process.env.GITHUB_REPOSITORY_OWNER!,
      repo: process.env.GITHUB_REPOSITORY_NAME!,
      title: `Token Conflict: ${conflict.path.join('.')}`,
      body: issueBody,
      labels: ['design-system', 'token-conflict', 'manual-resolution'],
    });

    return {
      number: response.data.number,
      url: response.data.html_url,
    };
  }
}
```

## Automated Monitoring

### 1. Continuous Monitoring Setup

```typescript
// tools/monitoring/continuous-monitor.ts
export class ContinuousMonitor {
  private monitors: Map<string, Monitor> = new Map();
  private metrics: MetricsCollector;
  private alertManager: AlertManager;

  constructor() {
    this.metrics = new MetricsCollector();
    this.alertManager = new AlertManager();
  }

  start(): void {
    // Start all monitoring processes
    this.startDriftMonitor();
    this.startPerformanceMonitor();
    this.startUsageMonitor();
    this.startQualityMonitor();

    console.log('🔍 Continuous monitoring started');
  }

  private startDriftMonitor(): void {
    const driftMonitor = new RealTimeDriftMonitor({
      interval: 30000, // 30 seconds
      threshold: 0.1, // 10% change threshold
    });

    driftMonitor.on('drift:detected', async drift => {
      await this.handleDriftDetection(drift);
    });

    driftMonitor.on('drift:error', async error => {
      await this.alertManager.sendErrorAlert('Drift Detection', error);
    });

    this.monitors.set('drift', driftMonitor);
    driftMonitor.start();
  }

  private async handleDriftDetection(drift: DriftResult): Promise<void> {
    // Record metrics
    this.metrics.record('drift.detected', {
      severity: drift.severity,
      changes: drift.differences.length,
      timestamp: drift.timestamp,
    });

    // Determine alert level
    const alertLevel = this.determineAlertLevel(drift);

    if (alertLevel === 'critical') {
      await this.alertManager.sendCriticalAlert(drift);
    } else if (alertLevel === 'warning') {
      await this.alertManager.sendWarningAlert(drift);
    }

    // Trigger automated response
    if (drift.severity === 'low' && this.shouldAutoSync(drift)) {
      await this.triggerAutoSync(drift);
    }
  }

  private shouldAutoSync(drift: DriftResult): boolean {
    // Only auto-sync for minor changes
    const minorChangeTypes = ['description-update', 'metadata-change'];

    return drift.differences.every(diff =>
      minorChangeTypes.includes(diff.type)
    );
  }
}
```

### 2. Metrics Collection

```typescript
// tools/monitoring/metrics.ts
export class MetricsCollector {
  private influx: InfluxDB;
  private prometheus: PrometheusRegistry;

  constructor() {
    this.influx = new InfluxDB(process.env.INFLUX_URL!);
    this.prometheus = new PrometheusRegistry();
    this.setupPrometheusMetrics();
  }

  record(metric: string, data: any): void {
    // Record to InfluxDB
    this.influx.writePoints([
      {
        measurement: metric,
        fields: data,
        timestamp: new Date(),
      },
    ]);

    // Update Prometheus metrics
    this.updatePrometheusMetrics(metric, data);
  }

  private setupPrometheusMetrics(): void {
    // Drift detection metrics
    this.prometheus.register(
      new Gauge({
        name: 'token_drift_detected_total',
        help: 'Total number of token drifts detected',
      })
    );

    this.prometheus.register(
      new Histogram({
        name: 'token_sync_duration_seconds',
        help: 'Duration of token synchronization operations',
      })
    );

    this.prometheus.register(
      new Gauge({
        name: 'token_conflicts_active',
        help: 'Number of active token conflicts',
      })
    );
  }

  async getDriftTrends(): Promise<DriftTrends> {
    const query = `
      SELECT COUNT(*) as count, severity
      FROM drift_detected 
      WHERE time > now() - 7d 
      GROUP BY severity, time(1h)
    `;

    const results = await this.influx.query(query);
    return this.processTrendData(results);
  }
}
```

## Alert Systems

### 1. Multi-Channel Alerting

```typescript
// tools/alerting/alert-manager.ts
export class AlertManager {
  private channels: AlertChannel[] = [];

  constructor() {
    this.setupChannels();
  }

  private setupChannels(): void {
    // Slack integration
    this.channels.push(
      new SlackChannel({
        webhook: process.env.SLACK_WEBHOOK_URL!,
        channel: '#design-system',
      })
    );

    // Email notifications
    this.channels.push(
      new EmailChannel({
        smtp: process.env.SMTP_CONFIG!,
        recipients: process.env.ALERT_RECIPIENTS!.split(','),
      })
    );

    // PagerDuty for critical issues
    if (process.env.PAGERDUTY_KEY) {
      this.channels.push(
        new PagerDutyChannel({
          integrationKey: process.env.PAGERDUTY_KEY,
        })
      );
    }
  }

  async sendCriticalAlert(drift: DriftResult): Promise<void> {
    const alert: Alert = {
      level: 'critical',
      title: '🚨 Critical Token Drift Detected',
      message: this.formatDriftMessage(drift),
      data: drift,
      timestamp: new Date(),
    };

    // Send to all channels for critical alerts
    await Promise.all(this.channels.map(channel => channel.send(alert)));
  }

  async sendWarningAlert(drift: DriftResult): Promise<void> {
    const alert: Alert = {
      level: 'warning',
      title: '⚠️ Token Drift Warning',
      message: this.formatDriftMessage(drift),
      data: drift,
      timestamp: new Date(),
    };

    // Send to Slack and email only for warnings
    const warningChannels = this.channels.filter(
      c => c.type === 'slack' || c.type === 'email'
    );

    await Promise.all(warningChannels.map(channel => channel.send(alert)));
  }

  private formatDriftMessage(drift: DriftResult): string {
    const changeCount = drift.differences.length;
    const severity = drift.severity;

    return `
Token drift detected with ${changeCount} changes (severity: ${severity})

**Changes Summary:**
${drift.differences
  .slice(0, 5)
  .map(d => `• ${d.type}: ${d.path.join('.')} - ${d.oldValue} → ${d.newValue}`)
  .join('\n')}

${changeCount > 5 ? `\n... and ${changeCount - 5} more changes` : ''}

**Action Required:**
${
  severity === 'critical'
    ? 'Immediate review and sync recommended'
    : 'Review and sync when convenient'
}
    `.trim();
  }
}
```

### 2. Smart Alerting Rules

```typescript
// tools/alerting/rules.ts
export class AlertingRules {
  private rules: Rule[] = [];

  constructor() {
    this.loadRules();
  }

  private loadRules(): void {
    this.rules = [
      // Critical: Breaking changes
      {
        name: 'breaking-changes',
        condition: drift => drift.differences.some(d => d.breaking),
        level: 'critical',
        action: 'immediate-notification',
        throttle: 0, // No throttling for breaking changes
      },

      // Warning: Color changes
      {
        name: 'color-changes',
        condition: drift =>
          drift.differences.some(
            d => d.path[0] === 'color' && d.type === 'modified'
          ),
        level: 'warning',
        action: 'design-team-notification',
        throttle: 300000, // 5 minutes
      },

      // Info: Documentation updates
      {
        name: 'documentation-updates',
        condition: drift =>
          drift.differences.every(d => d.type === 'description-change'),
        level: 'info',
        action: 'auto-sync',
        throttle: 3600000, // 1 hour
      },

      // Warning: High change volume
      {
        name: 'high-volume-changes',
        condition: drift => drift.differences.length > 20,
        level: 'warning',
        action: 'manual-review-required',
        throttle: 600000, // 10 minutes
      },
    ];
  }

  evaluate(drift: DriftResult): AlertAction[] {
    const actions: AlertAction[] = [];

    for (const rule of this.rules) {
      if (rule.condition(drift)) {
        const lastTriggered = this.getLastTriggered(rule.name);
        const now = Date.now();

        if (!lastTriggered || now - lastTriggered > rule.throttle) {
          actions.push({
            rule: rule.name,
            level: rule.level,
            action: rule.action,
            timestamp: new Date(),
          });

          this.recordTrigger(rule.name, now);
        }
      }
    }

    return actions;
  }
}
```

## CLI Integration

### Available Commands

```bash
# Drift detection
pnpm tokens:check-drift                    # Check for drift
pnpm tokens:check-drift --continuous       # Start continuous monitoring
pnpm tokens:check-drift --alert-on-drift   # Send alerts when drift detected

# Synchronization
pnpm tokens:sync                           # Sync tokens from Penpot
pnpm tokens:sync --dry-run                 # Preview changes without applying
pnpm tokens:sync --auto-resolve           # Auto-resolve simple conflicts
pnpm tokens:sync --force                   # Force sync even if conflicts exist

# Monitoring
pnpm tokens:monitor start                  # Start monitoring daemon
pnpm tokens:monitor stop                   # Stop monitoring daemon
pnpm tokens:monitor status                 # Check monitoring status

# Conflict resolution
pnpm tokens:conflicts list                 # List active conflicts
pnpm tokens:conflicts resolve <id>         # Resolve specific conflict
pnpm tokens:conflicts auto-resolve         # Auto-resolve where possible

# Metrics and reporting
pnpm tokens:metrics                        # Show drift metrics
pnpm tokens:report --daily                 # Generate daily drift report
pnpm tokens:report --weekly                # Generate weekly trend report
```

## Next Steps

- [GitHub Actions Workflows](./workflows.md)
- [Performance Monitoring](../quality/performance.md)
- [Cross-Platform Testing](./platform-testing.md)
- [Design Token Validation](../quality/validation.md)

---

_This documentation is automatically updated when drift detection strategies change._
