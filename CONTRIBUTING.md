# Contributing to n00plicate 2.0

Thanks for helping shape the next generation of n00plicate. The 2.0 rewrite is underway and every
contribution should move us closer to the architecture described in
[`docs/IMPLEMENTATION_PLAN_2.0.md`](docs/IMPLEMENTATION_PLAN_2.0.md).

## Code of Conduct

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md). Be kind, inclusive, and respectful.

## Before You Start

1. **Pick an issue** — Prioritise items labelled `n00plicate-2.0` on the “n00plicate 2.0 Delivery” project board.
2. **Declare the phase** — Mention the implementation plan phase your change targets (e.g. Phase 2 –
   Token Orchestrator).
3. **Fork and clone** —

```bash
 git clone https://github.com/YOUR_USERNAME/n00plicate.git
 cd n00plicate
 git remote add upstream https://github.com/IAmJonoBo/n00plicate.git
```

4. **Bootstrap once** — `./setup.sh` installs Node 22.20, pnpm 10.18.2, Husky hooks, and workspace deps.

## Local Development

- Keep `main` clean: `git checkout main && git pull upstream main`.
- Create focussed branches: `git checkout -b phase-2/token-schema-normaliser`.
- Use [Conventional Commit](https://www.conventionalcommits.org/) prefixes (`feat`, `fix`, `docs`,
  `refactor`, `test`, `chore`).
- Sync frequently: `git fetch upstream && git rebase upstream/main`.

## Quality Expectations

Run these before opening a pull request:

```bash
pnpm lint:workspace          # Biome (format + lint) followed by typed ESLint
pnpm typecheck              # Sequential workspace type-check via tsc
pnpm -r --workspace-root=false --workspace-concurrency=1 --if-present test     # Vitest unit suites
pnpm --filter design-system run visual-test
pnpm --filter design-system run test-storybook
```

> Use `pnpm -r --workspace-root=false --workspace-concurrency=1 --if-present lint test` if your change is scoped and you understand the impact. `pnpm
typecheck:nx` is available for troubleshooting but defaults to the less stable Nx project graph.

## Pull Request Process

- Use the structured [pull request template](.github/pull_request_template.md) and complete every relevant checkbox before
  requesting review. The template mirrors our regression gates, so unchecked items will block approval.
- Confirm your work is mapped to an implementation plan phase and call it out in the template.
- If any checkbox cannot be satisfied, replace it with a short justification that explains the risk and a mitigation plan.
- Highlight breaking changes clearly and add migration notes in both the template and the relevant documentation file.
- When updating design tokens or UI, attach screenshots or Loki diffs so reviewers can validate the visual impact quickly.
- Branch protection is automated; if you need to adjust required checks or review counts, update
  [`infra/branch-protection/main.json`](infra/branch-protection/main.json) and see
  [`docs/branch-protection.md`](docs/branch-protection.md) for details.

### Coding Standards

- **TypeScript everywhere**. Enable strict types and prefer interfaces for public APIs.
- **Token-first mindset**. UI contributions must consume generated tokens/adapters instead of hard-coded
  values.
- **Accessibility**. Components must satisfy Axe checks and pass Storybook interaction tests.
- **Composable architecture**. Additions to the UI kernel or adapters must be framework agnostic and
  respect the existing theme contracts.
- **Formatting**. Biome formats JS/TS/JSON; Prettier is reserved for HTML/Astro docs.
  `pnpm format:check` should pass without manual edits.

### Documentation

Every change must keep documentation current:

- Update the relevant section under [`docs/README.md`](docs/README.md).
- Note new behaviours in package READMEs.
- For architectural decisions, open or update an ADR.
- Mention documentation updates in the PR description.

## Pull Request Checklist

- [ ] Linked issue and phase reference
- [ ] Tests, lint, typecheck, and visual tests pass locally
- [ ] Documentation updated
- [ ] Screenshots or recordings supplied for UI changes
- [ ] Added or updated Storybook stories when touching components
- [ ] Added migration notes if the change affects public APIs or tokens

CI will re-run the quality gates; address any failures promptly. Maintainers may request design
reviews, additional tests, or documentation clarifications before merging.

## Release Notes & Changelog

We use Changesets for versioned packages. If your change affects published artefacts (design tokens,
UI kernel, adapters, CLI), run `pnpm changeset` and describe the impact succinctly.

## Need Help?

- Create a discussion in [GitHub Discussions](https://github.com/IAmJonoBo/n00plicate/discussions).
- Tag maintainers in the issue if you’re blocked.
- For docs gaps, file an issue with the `documentation` label—keeping references fresh is part of the
  2.0 push.

Thanks for contributing!
