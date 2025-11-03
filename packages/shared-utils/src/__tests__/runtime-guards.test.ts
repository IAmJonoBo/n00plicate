import { describe, expect, it } from 'vitest';

import RuntimeGuards from '../runtime-guards.js';

describe('RuntimeGuards.validateTokenImport', () => {
  const createGuards = () =>
    new RuntimeGuards({
      enableCollisionDetection: false,
      enableImportPathValidation: true,
      enableNamespaceValidation: false,
    });

  it('accepts libs tokens import paths', () => {
    const guards = createGuards();
    expect(guards.validateTokenImport('libs/tokens/theme.css')).toBe(true);
  });

  it('accepts bare @n00plicate/design-tokens scope', () => {
    const guards = createGuards();
    expect(guards.validateTokenImport('@n00plicate/design-tokens')).toBe(true);
  });

  it('accepts scoped subpath imports', () => {
    const guards = createGuards();
    expect(guards.validateTokenImport('@n00plicate/design-tokens/css')).toBe(true);
  });

  it('rejects dist-based scoped imports', () => {
    const guards = createGuards();
    expect(guards.validateTokenImport('@n00plicate/design-tokens/dist/theme.css')).toBe(false);
  });

  it('rejects legacy dist paths', () => {
    const guards = createGuards();
    expect(guards.validateTokenImport('dist/tokens/index.js')).toBe(false);
  });
});
