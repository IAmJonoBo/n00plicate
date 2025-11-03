import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div
      style={{
        padding: 'var(--ds-spacing-lg, 1.5rem)',
        fontFamily: "var(--ds-typography-font-family-primary, 'Inter', system-ui, sans-serif)",
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--ds-typography-font-size-3xl, 2rem)',
          fontWeight: 'var(--ds-typography-font-weight-bold, 700)',
          color: 'var(--ds-color-neutral-900, #171717)',
          marginBottom: 'var(--ds-spacing-lg, 1.5rem)',
        }}
      >
        Design Token Documentation
      </h1>

      <p
        style={{
          fontSize: 'var(--ds-typography-font-size-lg, 1.125rem)',
          lineHeight: 'var(--ds-typography-line-height-relaxed, 1.75)',
          color: 'var(--ds-color-neutral-700, #404040)',
          marginBottom: 'var(--ds-spacing-xl, 2rem)',
        }}
      >
        This page demonstrates the design token pipeline documentation and implementation details.
      </p>

      <div
        style={{
          backgroundColor: 'var(--ds-color-background-secondary, #f5f5f5)',
          padding: 'var(--ds-spacing-lg, 1.5rem)',
          borderRadius: 'var(--ds-border-radius-lg, 0.5rem)',
          marginBottom: 'var(--ds-spacing-lg, 1.5rem)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--ds-typography-font-size-xl, 1.25rem)',
            fontWeight: 'var(--ds-typography-font-weight-semibold, 600)',
            marginBottom: 'var(--ds-spacing-md, 1rem)',
          }}
        >
          Available Token Categories
        </h2>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          <li style={{ marginBottom: 'var(--ds-spacing-sm, 0.5rem)' }}>
            🎨 <strong>Colors:</strong> Primary, secondary, neutral scales with semantic mappings
          </li>
          <li style={{ marginBottom: 'var(--ds-spacing-sm, 0.5rem)' }}>
            📏 <strong>Spacing:</strong> Consistent spacing scale from xs to 3xl
          </li>
          <li style={{ marginBottom: 'var(--ds-spacing-sm, 0.5rem)' }}>
            ✍️ <strong>Typography:</strong> Font families, sizes, weights, and line heights
          </li>
          <li style={{ marginBottom: 'var(--ds-spacing-sm, 0.5rem)' }}>
            🔄 <strong>Border Radius:</strong> Consistent rounding from xs to full
          </li>
          <li style={{ marginBottom: 'var(--ds-spacing-sm, 0.5rem)' }}>
            🎭 <strong>Shadows:</strong> Elevation system from sm to lg
          </li>
        </ul>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-md, 1rem)',
          marginBottom: 'var(--ds-spacing-lg, 1.5rem)',
        }}
      >
        <Link
          href="/"
          prefetch={true}
          style={{
            backgroundColor: 'var(--ds-color-primary-500, #3b82f6)',
            color: 'var(--ds-color-neutral-50, #fafafa)',
            padding: 'var(--ds-spacing-md, 1rem) var(--ds-spacing-lg, 1.5rem)',
            borderRadius: 'var(--ds-border-radius-md, 0.375rem)',
            textDecoration: 'none',
            fontWeight: 'var(--ds-typography-font-weight-medium, 500)',
            display: 'inline-block',
          }}
        >
          ← Back to Demo
        </Link>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--ds-color-border-default, #e5e5e5)',
          paddingTop: 'var(--ds-spacing-lg, 1.5rem)',
          fontSize: 'var(--ds-typography-font-size-sm, 0.875rem)',
          color: 'var(--ds-color-neutral-600, #525252)',
        }}
      >
        <p>
          This page demonstrates Qwik City's prefetching capabilities with <code>prefetch={true}</code> on navigation
          links, ensuring instant route transitions while maintaining design token consistency.
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Design Token Documentation - n00plicate Pipeline',
  meta: [
    {
      name: 'description',
      content: 'Documentation for the n00plicate design token pipeline implementation with Qwik City',
    },
  ],
};
