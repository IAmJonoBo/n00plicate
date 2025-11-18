# n00plicate 2.0 Documentation Hub

This hub curates the documentation that matters for the n00plicate 2.0 rewrite. Start with the links in
“Begin Here”, then use the thematic sections to dive deeper into architecture, development, and
operations. Anything marked **Legacy** is retained temporarily for reference and will be migrated or
retired during the roll-out.

## Begin Here

- **Project Overview** — [`README.md`](../README.md)
- **Delivery Roadmap** — [`docs/IMPLEMENTATION_PLAN_2.0.md`](./IMPLEMENTATION_PLAN_2.0.md)
- **Sprint Roadmap** — [`docs/SPRINT_PLAN.md`](./SPRINT_PLAN.md)
- **Repository Structure** — [`docs/REPO_STRUCTURE.md`](./REPO_STRUCTURE.md)
- **Hands-on Guide** — [`docs/IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)
- **Contribution Guide** — [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- **Local Development** — [`DEVELOPMENT.md`](../DEVELOPMENT.md)

## Architecture & Governance

- **Core Principles & Decisions** — [`docs/ADR.md`](./ADR.md)
- **Token Contract Specification** — [`docs/TOKEN_CONTRACT_SPECIFICATION.md`](./TOKEN_CONTRACT_SPECIFICATION.md)
- **System Control Document (Legacy overview, to be merged into 2.0)** — [`docs/CONTROL_DOCUMENT.md`](./CONTROL_DOCUMENT.md)
- **Metrics & SLO Charter** — See
  [`docs/IMPLEMENTATION_PLAN_2.0.md`](./IMPLEMENTATION_PLAN_2.0.md#engineering-metrics--observability-pillars)
  for targets and dashboards

## 🎨 Design Education & Guidance (NEW!)

**Complete professional design education** — Transform into a frontier-grade UI design expert

- **📚 Design Guide Hub** — [`docs/design/README.md`](./design/README.md) — Start here for complete education
- **📖 Design Principles** — [`docs/design/DESIGN_PRINCIPLES.md`](./design/DESIGN_PRINCIPLES.md) — 10 core principles
- **📝 Typography System** — [`docs/design/TYPOGRAPHY_SYSTEM.md`](./design/TYPOGRAPHY_SYSTEM.md) — Fonts, pairing
- **🎨 Color Theory** — [`docs/design/COLOR_THEORY.md`](./design/COLOR_THEORY.md) — Harmony, psychology
- **📐 Layout Systems** — [`docs/design/LAYOUT_SYSTEMS.md`](./design/LAYOUT_SYSTEMS.md) — Grids, composition
- **♿ Accessibility** — [`docs/design/ACCESSIBILITY_GUIDE.md`](./design/ACCESSIBILITY_GUIDE.md) — WCAG compliance
- **🤖 AI Assistant** — [`docs/design/AI_DESIGN_ASSISTANT.md`](./design/AI_DESIGN_ASSISTANT.md) — AI-powered help
- **📐 Wireframing** — [`docs/design/WIREFRAMING_PROTOTYPING.md`](./design/WIREFRAMING_PROTOTYPING.md) — Prototype flow
- **🧩 Component Patterns** — [`docs/design/COMPONENT_PATTERNS.md`](./design/COMPONENT_PATTERNS.md) — UI patterns

### 150,000+ words | 500+ code examples | 8 comprehensive guides

## Design Tokens & Penpot Workflow

- **Token Pipeline Guide** — [`docs/DESIGN_TOKENS.md`](./DESIGN_TOKENS.md)
- **Penpot Workflow** — [`docs/PENPOT_WORKFLOW_GUIDE.md`](./PENPOT_WORKFLOW_GUIDE.md)
- **Token Orchestrator Reference** — _(coming in 2.0, see Implementation Plan Phase 2)_
- **Historical Migration Notes (Legacy)** — [`docs/DESIGN_TOKENS_MIGRATION.md`](./DESIGN_TOKENS_MIGRATION.md)

## Component System & Storybook

- **Design System Package** — [`packages/design-system/README.md`](../packages/design-system/README.md)
- **Storybook & Workflows** — [`docs/platforms/storybook.md`](./platforms/storybook.md)
- **UI Kernel & Adapters (2.0 targets)** — track progress in [`docs/IMPLEMENTATION_PLAN_2.0.md`](./IMPLEMENTATION_PLAN_2.0.md)

## Platform Guides

- **Web (Qwik)** — [`docs/web/qwik-performance.md`](./web/qwik-performance.md)
- **Mobile (React Native, Compose)** — [`docs/mobile/rn-new-arch.md`](./mobile/rn-new-arch.md), [`docs/mobile/compose-theme.md`](./mobile/compose-theme.md)
- **Desktop (Tauri)** — [`docs/desktop/tauri-security.md`](./desktop/tauri-security.md)

## Development Workflow & Tooling

- **Dependency Matrix** — [`Foundational Dependencies`](./IMPLEMENTATION_PLAN_2.0.md#foundational-dependencies)
  for phase-by-phase tooling, CLI, and licensing requirements.
- **Code Quality & Toolchain** — [`docs/CODE_QUALITY_PROTOCOL.md`](./CODE_QUALITY_PROTOCOL.md)
- **Automation & CI/CD** — [`docs/devops/ci-overview.md`](./devops/ci-overview.md)
- **Autofix & Linting** — [`docs/AUTOFIX_SYSTEM.md`](./AUTOFIX_SYSTEM.md), [`docs/IGNORE_PATTERNS_GUIDE.md`](./IGNORE_PATTERNS_GUIDE.md)
- **Testing Strategy** — [`docs/testing/comprehensive-testing.md`](./testing/comprehensive-testing.md)

## Operations & Deployment

- **Deployment Playbook** — [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Release Automation** — [`docs/cicd/advanced-pipeline-automation.md`](./cicd/advanced-pipeline-automation.md)
- **Token Drift Detection** — [`docs/cicd/token-drift-check.md`](./cicd/token-drift-check.md)

## Support & Troubleshooting

- **Troubleshooting Guide** — [`docs/TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)
- **Quality Checklist** — [`docs/DOCUMENTATION_PARITY_COMPLETE.md`](./DOCUMENTATION_PARITY_COMPLETE.md)

## Legacy / Pending Review

The following documents are from n00plicate 1.x. Keep them handy while rewriting, but prefer the 2.0
sources above. Anything not referenced here is slated for archival.

- [`docs/ADVANCED_DOCUMENTATION_SUMMARY.md`](./ADVANCED_DOCUMENTATION_SUMMARY.md)
- [`docs/DOCUMENTATION_COMPLETION_SUMMARY.md`](./DOCUMENTATION_COMPLETION_SUMMARY.md)
- [`docs/COLLISION_PREVENTION.md`](./COLLISION_PREVENTION.md) & [`docs/COLLISION_PREVENTION_EXAMPLES.md`](./COLLISION_PREVENTION_EXAMPLES.md)
- [`docs/QUALITY`](./quality) subtree (to merge into the new quality chapter)
- [`docs/development/advanced-workflows.md`](./development/advanced-workflows.md)
- [`docs/onboarding/advanced-contributor-guide.md`](./onboarding/advanced-contributor-guide.md)

Please open an issue for any missing or outdated documentation so we can prune this section as the
2.0 rewrite progresses.

### Release Process

- **[Release Workflow](../CONTRIBUTING.md#submitting-changes)** - How releases are created and published
- **[Versioning Strategy](./DEPLOYMENT.md#package-publishing)** - Semantic versioning approach

### Deployment Targets

- **[NPM Packages](./DEPLOYMENT.md#package-publishing)** - Publishing to npm registry
- **[Storybook Deployment](./DEPLOYMENT.md#storybook-deployment)** - Documentation site deployment
- **[CI/CD Pipeline](./DEPLOYMENT.md#cicd-pipeline)** - Automated deployment workflow

## 🛠️ Development Workflows

### Local Development

- **[Development Setup](../DEVELOPMENT.md#quick-start)** - Getting started locally
- **[Development Tools](../scripts/setup-dx.sh)** - Developer experience tools
- **[Apple Cleaning](../APPLE_CLEANING.md)** - macOS-specific setup

### Component Development

- **[Adding New Components](../packages/design-system/README.md#adding-new-components)** - Component creation workflow
- **[Token Integration](../packages/design-tokens/README.md#integration-with-penpot)** - Using design tokens

## 📊 Monitoring and Analytics

### Performance

- **[Bundle Analysis](./DEPLOYMENT.md#performance-monitoring)** - Bundle size monitoring
- **[Performance Guidelines](../packages/design-system/README.md#performance)** - Optimization best practices

### Health Monitoring

- **[Health Checks](./DEPLOYMENT.md#monitoring-and-maintenance)** - System health monitoring
- **[Rollback Procedures](./DEPLOYMENT.md#rollback-procedures)** - Emergency response

## 🤝 Community and Support

### Getting Help

- **[GitHub Issues](https://github.com/n00tropic/n00plicate/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/n00tropic/n00plicate/discussions)** - Community discussions
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common problems and solutions

### Contributing

- **[Contribution Guidelines](../CONTRIBUTING.md)** - How to contribute
- **[Code of Conduct](../CONTRIBUTING.md#code-of-conduct)** - Community standards
- **[Pull Request Template](../.github/pull_request_template.md)** - PR guidelines

## 📋 Checklists and Templates

### Development Checklists

- **[Pre-commit Checklist](../CONTRIBUTING.md#submitting-changes)** - Before committing code
- **[Component Checklist](../packages/design-system/README.md#contributing)** - Creating new components
- **[Release Checklist](./DEPLOYMENT.md#deployment-checklist)** - Before releasing

### Templates

- **[ADR Template](./ADR.md#adr-template)** - Architecture decision template
- **[Component Template](../packages/design-system/README.md#adding-new-components)** - New component template

## 🔗 External Resources

### Learning Resources

- **[Nx Documentation](https://nx.dev/docs)** - Monorepo management
- **[Qwik Documentation](https://qwik.builder.io/)** - Component framework
- **[Style Dictionary](https://amzn.github.io/style-dictionary/)** - Design token transformation
- **[Storybook Documentation](https://storybook.js.org/docs)** - Component documentation

### Standards and Specifications

- **[W3C Design Token Community Group](https://www.w3.org/community/design-tokens/)** - Token standards
- **[WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)** - Accessibility standards
- **[Semantic Versioning](https://semver.org/)** - Version numbering

## 📝 Documentation Maintenance

### Updating Documentation

1. **Edit Source Files**: Update markdown files in respective locations
2. **Test Changes**: Verify links and formatting
3. **Update Index**: Add new documentation to this index
4. **Submit PR**: Follow the standard contribution process

### Documentation Standards

- **Markdown Format**: Use standard markdown syntax
- **Link Validation**: Ensure all links are functional
- **Code Examples**: Include working code samples
- **Screenshots**: Use current UI screenshots
- **Accessibility**: Ensure documentation is accessible

---

**Last Updated**: June 2025

**Need help?** Check the [troubleshooting guide](./TROUBLESHOOTING.md) or [open an issue](https://github.com/n00tropic/n00plicate/issues/new).
