---
name: Pull Request
about: Create a pull request to contribute to n00plicate 2.0
title: '[type(scope): description]'
labels: ''
assignees: ''
---

## Summary

<!-- Brief description of what this PR accomplishes and why it's needed -->

## Implementation Plan Phase

<!-- Which phase of the n00plicate 2.0 implementation plan does this target? -->

- [ ] Phase 1: Core Infrastructure
- [ ] Phase 2: Token Orchestrator
- [ ] Phase 3: UI Kernel
- [ ] Phase 4: Platform Bridges
- [ ] Phase 5: Developer Experience
- [ ] Phase 6: Integration & Testing

## Type of Change

- [ ] 🚀 **feat**: New feature
- [ ] 🐛 **fix**: Bug fix
- [ ] 📚 **docs**: Documentation only changes
- [ ] 🎨 **style**: Code style changes (formatting, etc.)
- [ ] ♻️ **refactor**: Code refactoring
- [ ] ⚡ **perf**: Performance improvements
- [ ] ✅ **test**: Adding or updating tests
- [ ] 🔧 **chore**: Maintenance tasks

## Regression Prevention Checklist

### Pre-submission Requirements

- [ ] All tests pass locally (`pnpm nx run-many -t test`)
- [ ] Linting passes (`pnpm lint:workspace`)
- [ ] TypeScript checks pass (`pnpm typecheck`)
- [ ] Visual tests pass (`pnpm --filter design-system visual-test`)
- [ ] Module boundaries respected (no cross-module imports)

### Token System Compliance (if applicable)

- [ ] All new CSS tokens use `--ds-*` prefix
- [ ] All new JS tokens use `ds` prefix
- [ ] No deprecated `dist/` import paths used
- [ ] Token contract validation passes (`pnpm tokens:validate`)
- [ ] Visual regression tests updated if design tokens changed

### Breaking Changes Assessment

- [ ] **No breaking changes** - This PR is backward compatible
- [ ] **Breaking changes present** - Migration guide provided below
- [ ] **API changes documented** - Public interface changes explained
- [ ] **Token changes documented** - Design token changes listed

### Testing Coverage

- [ ] Unit tests added/updated for new functionality
- [ ] Integration tests added/updated if multiple modules affected
- [ ] Visual regression tests updated if UI components changed
- [ ] Storybook stories added/updated for new components
- [ ] E2E tests added/updated for critical user flows

### Documentation

- [ ] README updated if public API changed
- [ ] CHANGELOG entry added (if applicable)
- [ ] JSDoc/TSDoc comments added for new public functions
- [ ] Storybook documentation updated
- [ ] Implementation plan updated if architecture changed

## Testing Strategy

### Manual Testing Performed

<!-- Describe what manual testing was done -->

### Automated Testing

<!-- List the specific tests that cover this change -->

### Regression Risk Assessment

- **Risk Level**: Low / Medium / High
- **Affected Areas**:
- **Mitigation Strategy**:

## Performance Impact

- [ ] No performance impact expected
- [ ] Performance improvements included
- [ ] Potential performance regression (please explain and provide benchmarks)

## Security Considerations

- [ ] No security implications
- [ ] Security review completed
- [ ] Dependencies updated for security fixes

## Migration Guide (if breaking changes)

<!-- If this PR includes breaking changes, provide a clear migration guide -->

## Screenshots/Videos (if applicable)

<!-- Add screenshots or videos showing the changes, especially for UI changes -->

## Related Issues

<!-- Link any related issues, e.g., "Closes #123" or "Relates to #456" -->

## Additional Notes

<!-- Any additional information that reviewers should know -->

---

## Reviewer Checklist

### Code Quality

- [ ] Code follows project conventions and style guidelines
- [ ] Logic is clear and well-documented
- [ ] Error handling is appropriate
- [ ] No obvious security vulnerabilities
- [ ] Performance implications considered

### Architecture Compliance

- [ ] Aligns with n00plicate 2.0 implementation plan
- [ ] Respects module boundaries
- [ ] Follows token-first design principles
- [ ] Maintains API consistency

### Testing Validation

- [ ] All CI checks pass
- [ ] Test coverage is adequate
- [ ] Visual regression tests reviewed
- [ ] Manual testing performed if needed

### Documentation Review

- [ ] Code is self-documenting or well-commented
- [ ] Public API changes documented
- [ ] Breaking changes clearly communicated
