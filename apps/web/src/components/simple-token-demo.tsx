import { component$ } from '@builder.io/qwik';

/**
 * Simple Token Demo Component - demonstrates design token integration with Qwik City
 * Uses CSS variables directly without Vanilla Extract to avoid SSR configuration issues
 *
 * This component showcases the collision-prevention architecture with ds- prefixed tokens
 * as documented in USER_GUIDE.md section 10.1
 */
export const SimpleTokenDemo = component$(() => {
  return (
    <div
      style={{
        padding: 'var(--ds-spacing-lg, 1.5rem)',
        backgroundColor: 'var(--ds-color-neutral-50, #fafafa)',
        border: '1px solid var(--ds-color-neutral-200, #e5e5e5)',
        borderRadius: 'var(--ds-border-radius-lg, 0.5rem)',
        boxShadow: 'var(--ds-shadow-md, 0px 4px 6px -1px rgba(0, 0, 0, 0.1))',
        fontFamily: "var(--ds-typography-font-family-primary, 'Inter', system-ui, sans-serif)",
        maxWidth: '600px',
        margin: '2rem auto',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--ds-typography-font-size-2xl, 1.5rem)',
          fontWeight: 'var(--ds-typography-font-weight-bold, 700)',
          color: 'var(--ds-color-neutral-900, #171717)',
          marginBottom: 'var(--ds-spacing-md, 1rem)',
        }}
      >
        Design Token Integration Demo
      </h2>

      <p
        style={{
          fontSize: 'var(--ds-typography-font-size-base, 1rem)',
          lineHeight: 'var(--ds-typography-line-height-normal, 1.5)',
          color: 'var(--ds-color-neutral-700, #404040)',
          marginBottom: 'var(--ds-spacing-lg, 1.5rem)',
        }}
      >
        This component demonstrates the n00plicate design token pipeline working with Qwik City. All colors, spacing,
        typography, and effects use CSS variables generated from Penpot design tokens with the collision-safe{' '}
        <code>ds-</code> prefix.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-md, 1rem)',
          flexWrap: 'wrap',
          marginBottom: 'var(--ds-spacing-lg, 1.5rem)',
        }}
      >
        <button
          type="button"
          style={{
            backgroundColor: 'var(--ds-color-primary-500, #3b82f6)',
            color: 'var(--ds-color-neutral-50, #fafafa)',
            padding: 'var(--ds-spacing-md, 1rem)',
            borderRadius: 'var(--ds-border-radius-md, 0.375rem)',
            border: 'none',
            fontSize: 'var(--ds-typography-font-size-base, 1rem)',
            fontWeight: 'var(--ds-typography-font-weight-medium, 500)',
            cursor: 'pointer',
          }}
        >
          Primary Button
        </button>

        <button
          type="button"
          style={{
            backgroundColor: 'var(--ds-color-secondary-500, #22c55e)',
            color: 'var(--ds-color-neutral-50, #fafafa)',
            padding: 'var(--ds-spacing-md, 1rem)',
            borderRadius: 'var(--ds-border-radius-md, 0.375rem)',
            border: 'none',
            fontSize: 'var(--ds-typography-font-size-base, 1rem)',
            fontWeight: 'var(--ds-typography-font-weight-medium, 500)',
            cursor: 'pointer',
          }}
        >
          Secondary Button
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'var(--ds-color-background-tertiary, #e5e5e5)',
          padding: 'var(--ds-spacing-md, 1rem)',
          borderRadius: 'var(--ds-border-radius-md, 0.375rem)',
          fontSize: 'var(--ds-typography-font-size-sm, 0.875rem)',
          color: 'var(--ds-color-neutral-600, #525252)',
        }}
      >
        <strong>Token Examples:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
          <li>
            Colors: <code>--ds-color-primary-500</code>
          </li>
          <li>
            Spacing: <code>--ds-spacing-md</code>
          </li>
          <li>
            Typography: <code>--ds-typography-font-size-base</code>
          </li>
          <li>
            Border Radius: <code>--ds-border-radius-md</code>
          </li>
          <li>
            Shadows: <code>--ds-shadow-md</code>
          </li>
        </ul>
      </div>
    </div>
  );
});
