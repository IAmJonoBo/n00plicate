# 📐 Wireframing & Prototyping Guide

> **Create wireframes and interactive prototypes from concept to production**

## Overview

Wireframing and prototyping are essential steps in the design process. This guide covers how to use n00plicate's
tools to create low-fidelity wireframes, build interactive prototypes, and validate designs before development.

## Table of Contents

1. [Understanding Wireframes vs Prototypes](#understanding-wireframes-vs-prototypes)
2. [Wireframe Component Library](#wireframe-component-library)
3. [Building Wireframes](#building-wireframes)
4. [Creating Prototypes](#creating-prototypes)
5. [Interaction Patterns](#interaction-patterns)
6. [User Testing](#user-testing)
7. [Handoff to Development](#handoff-to-development)

## Understanding Wireframes vs Prototypes

### Wireframes

**Purpose**: Structure, layout, and content hierarchy
**Fidelity**: Low (grayscale, placeholders, basic shapes)
**Speed**: Fast to create and iterate
**When**: Early ideation, exploring concepts

```typescript
// Wireframe characteristics
const wireframe = {
  colors: 'Grayscale only',
  typography: 'Simple, single font',
  images: 'Placeholder boxes',
  interaction: 'None or minimal',
  detail: 'Low - focus on structure',
  purpose: 'Communicate layout and hierarchy',
};
```

### Prototypes

**Purpose**: Test interactions, flows, and usability
**Fidelity**: Medium to high (realistic styling, interactions)
**Speed**: Slower but more thorough
**When**: Validating concepts, user testing, stakeholder demos

```typescript
// Prototype characteristics
const prototype = {
  colors: 'Brand colors, realistic styling',
  typography: 'Actual fonts and scales',
  images: 'Representative content',
  interaction: 'Clickable, animated, responsive',
  detail: 'High - close to final product',
  purpose: 'Test and validate user experience',
};
```

## Wireframe Component Library

n00plicate provides low-fidelity components optimized for rapid wireframing.

### Basic Wireframe Components

```typescript
import {
  WireBox,
  WireText,
  WireImage,
  WireButton,
  WireInput,
  WireCard,
  WireNav,
} from '@n00plicate/wireframe-kit';

// Simple wireframe page
export const WireframePage = component$(() => {
  return (
    <>
      {/* Navigation */}
      <WireNav items={['Home', 'About', 'Products', 'Contact']} />

      {/* Hero section */}
      <WireBox padding="3xl" textAlign="center">
        <WireText size="4xl" weight="bold">
          Hero Heading
        </WireText>
        <WireText size="lg">
          Supporting text goes here
        </WireText>
        <WireButton size="lg">Primary Action</WireButton>
      </WireBox>

      {/* Content grid */}
      <WireBox padding="xl">
        <Grid columns={3} gap="lg">
          <WireCard>
            <WireImage aspectRatio="16:9" />
            <WireText size="xl" weight="semibold">Card Title</WireText>
            <WireText>Card description text</WireText>
            <WireButton variant="secondary">Learn More</WireButton>
          </WireCard>
          {/* More cards... */}
        </Grid>
      </WireBox>
    </>
  );
});
```

### Wireframe Component API

#### WireBox

Container with configurable spacing and alignment.

```typescript
<WireBox
  padding="lg"          // xs, sm, md, lg, xl, 2xl, 3xl
  margin="md"
  gap="sm"
  direction="column"    // row, column
  align="center"        // start, center, end, stretch
  justify="space-between" // start, center, end, space-between, space-around
>
  {children}
</WireBox>
```

#### WireText

Text placeholders with size and weight options.

```typescript
<WireText
  size="lg"             // xs, sm, base, lg, xl, 2xl, 3xl, 4xl
  weight="semibold"     // normal, medium, semibold, bold
  lines={3}             // Number of placeholder lines
  width="full"          // full, 3/4, 1/2, 1/4
>
  Optional text content
</WireText>
```

#### WireImage

Image placeholder with aspect ratio.

```typescript
<WireImage
  aspectRatio="16:9"    // 1:1, 4:3, 16:9, 21:9, custom
  width="full"
  label="Product photo"  // Optional label
/>
```

#### WireButton

Button placeholder with variants.

```typescript
<WireButton
  variant="primary"     // primary, secondary, tertiary, ghost
  size="md"             // sm, md, lg
  fullWidth={false}
  icon="arrow-right"    // Optional icon
>
  Button Text
</WireButton>
```

#### WireInput

Form input placeholders.

```typescript
<WireInput
  type="text"           // text, email, password, number, select, textarea
  label="Email address"
  placeholder="user@example.com"
  required={true}
  helperText="We'll never share your email"
/>
```

#### WireCard

Card container with header and footer areas.

```typescript
<WireCard
  hasImage={true}
  hasHeader={true}
  hasFooter={true}
>
  <WireCardHeader>
    <WireText size="xl" weight="semibold">Card Title</WireText>
  </WireCardHeader>

  <WireCardBody>
    <WireImage aspectRatio="16:9" />
    <WireText lines={3}>Card description</WireText>
  </WireCardBody>

  <WireCardFooter>
    <WireButton variant="secondary">Action</WireButton>
  </WireCardFooter>
</WireCard>
```

## Building Wireframes

### Page Structure Wireframe

```typescript
export const HomeWireframe = component$(() => {
  return (
    <WireframePage>
      {/* Header */}
      <WireHeader>
        <WireLogo />
        <WireNav items={['Features', 'Pricing', 'About', 'Contact']} />
        <WireButton variant="primary">Sign Up</WireButton>
      </WireHeader>

      {/* Hero */}
      <WireSection padding="3xl" centered>
        <WireText size="5xl" weight="bold" width="3/4">
          Main Value Proposition
        </WireText>
        <WireText size="xl" width="1/2" lines={2}>
          Supporting description text
        </WireText>
        <WireBox gap="md" direction="row">
          <WireButton size="lg" variant="primary">
            Get Started
          </WireButton>
          <WireButton size="lg" variant="secondary">
            Learn More
          </WireButton>
        </WireBox>
        <WireImage aspectRatio="16:9" width="3/4" label="Hero image" />
      </WireSection>

      {/* Features Grid */}
      <WireSection padding="2xl">
        <WireText size="3xl" weight="bold" centered>
          Features
        </WireText>

        <Grid columns={3} gap="lg">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <WireCard key={i}>
              <WireIcon size="2xl" />
              <WireText size="xl" weight="semibold">
                Feature {i}
              </WireText>
              <WireText lines={3}>
                Feature description
              </WireText>
            </WireCard>
          ))}
        </Grid>
      </WireSection>

      {/* CTA Section */}
      <WireSection padding="2xl" background="subtle" centered>
        <WireText size="3xl" weight="bold">
          Ready to Get Started?
        </WireText>
        <WireButton size="lg" variant="primary">
          Sign Up Now
        </WireButton>
      </WireSection>

      {/* Footer */}
      <WireFooter>
        <Grid columns={4} gap="lg">
          <WireBox>
            <WireText weight="semibold">Product</WireText>
            <WireNav vertical items={['Features', 'Pricing', 'Updates']} />
          </WireBox>
          <WireBox>
            <WireText weight="semibold">Company</WireText>
            <WireNav vertical items={['About', 'Blog', 'Careers']} />
          </WireBox>
          <WireBox>
            <WireText weight="semibold">Resources</WireText>
            <WireNav vertical items={['Docs', 'Support', 'API']} />
          </WireBox>
          <WireBox>
            <WireText weight="semibold">Legal</WireText>
            <WireNav vertical items={['Privacy', 'Terms', 'Security']} />
          </WireBox>
        </Grid>
      </WireFooter>
    </WireframePage>
  );
});
```

### Form Wireframe

```typescript
export const CheckoutFormWireframe = component$(() => {
  return (
    <WireForm>
      {/* Personal Information */}
      <WireFieldset legend="Personal Information">
        <WireInput type="text" label="Full Name" required />
        <WireInput type="email" label="Email" required />
        <WireInput type="tel" label="Phone" />
      </WireFieldset>

      {/* Shipping Address */}
      <WireFieldset legend="Shipping Address">
        <WireInput type="text" label="Street Address" required />
        <Grid columns={2} gap="md">
          <WireInput type="text" label="City" required />
          <WireInput type="text" label="State" required />
        </Grid>
        <Grid columns={2} gap="md">
          <WireInput type="text" label="ZIP Code" required />
          <WireInput type="select" label="Country" required />
        </Grid>
      </WireFieldset>

      {/* Payment */}
      <WireFieldset legend="Payment Information">
        <WireInput type="text" label="Card Number" required />
        <Grid columns={2} gap="md">
          <WireInput type="text" label="Expiry (MM/YY)" required />
          <WireInput type="text" label="CVV" required />
        </Grid>
      </WireFieldset>

      {/* Actions */}
      <WireBox direction="row" justify="space-between">
        <WireButton variant="secondary">Back</WireButton>
        <WireButton variant="primary">Complete Purchase</WireButton>
      </WireBox>
    </WireForm>
  );
});
```

### Mobile Wireframe

```typescript
export const MobileAppWireframe = component$(() => {
  return (
    <WireMobileFrame device="iphone">
      {/* Status Bar */}
      <WireStatusBar />

      {/* Navigation Bar */}
      <WireNavBar
        left={<WireIcon name="menu" />}
        title="App Title"
        right={<WireIcon name="notifications" />}
      />

      {/* Content */}
      <WireScrollView>
        <WireBox padding="lg" gap="md">
          <WireCard>
            <WireImage aspectRatio="16:9" />
            <WireText size="lg" weight="semibold">Card Title</WireText>
            <WireText lines={2}>Card description</WireText>
          </WireCard>
          {/* More content */}
        </WireBox>
      </WireScrollView>

      {/* Tab Bar */}
      <WireTabBar items={[
        { icon: 'home', label: 'Home', active: true },
        { icon: 'search', label: 'Search' },
        { icon: 'heart', label: 'Favorites' },
        { icon: 'user', label: 'Profile' },
      ]} />
    </WireMobileFrame>
  );
});
```

## Creating Prototypes

Prototypes add interaction, realistic content, and visual polish to wireframes.

### Prototype Component Library

```typescript
import {
  PrototypeButton,
  PrototypeCard,
  PrototypeModal,
  PrototypeDrawer,
  PrototypeToast,
  usePrototypeState,
} from '@n00plicate/prototype-kit';

export const InteractivePrototype = component$(() => {
  const state = usePrototypeState({
    modalOpen: false,
    drawerOpen: false,
    selectedItem: null,
  });

  return (
    <>
      {/* Interactive elements */}
      <PrototypeButton
        variant="primary"
        onClick$={() => state.modalOpen = true}
        animation="scale"
      >
        Open Modal
      </PrototypeButton>

      {/* Modal with transitions */}
      <PrototypeModal
        isOpen={state.modalOpen}
        onClose$={() => state.modalOpen = false}
        animation="fade-scale"
        backdrop="blur"
      >
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
        <PrototypeButton onClick$={() => state.modalOpen = false}>
          Close
        </PrototypeButton>
      </PrototypeModal>

      {/* Interactive cards */}
      {items.map((item) => (
        <PrototypeCard
          key={item.id}
          isSelected={state.selectedItem === item.id}
          onClick$={() => state.selectedItem = item.id}
          hoverEffect="lift"
          activeEffect="press"
        >
          <img src={item.image} alt={item.title} />
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </PrototypeCard>
      ))}
    </>
  );
});
```

### Animation & Transitions

```typescript
import { animate, stagger } from '@n00plicate/prototype-animations';

// Animate on mount
export const AnimatedList = component$(() => {
  useVisibleTask$(({ cleanup }) => {
    const items = document.querySelectorAll('.list-item');

    animate(
      items,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.3, delay: stagger(0.1) }
    );
  });

  return (
    <ul>
      {items.map((item) => (
        <li class="list-item">{item}</li>
      ))}
    </ul>
  );
});

// Interactive animations
export const AnimatedButton = component$(() => {
  const handleClick = $(() => {
    const button = document.querySelector('.animated-button');

    animate(
      button,
      { scale: [1, 0.95, 1.05, 1] },
      { duration: 0.3 }
    );
  });

  return (
    <button class="animated-button" onClick$={handleClick}>
      Click Me
    </button>
  );
});
```

### State Management

```typescript
import { usePrototypeStore } from '@n00plicate/prototype-kit';

// Global prototype state
export const prototypeStore = usePrototypeStore({
  user: {
    isAuthenticated: false,
    name: '',
  },
  cart: {
    items: [],
    total: 0,
  },
  ui: {
    sidebarOpen: false,
    theme: 'light',
  },
});

// Component using prototype state
export const Header = component$(() => {
  const store = prototypeStore;

  return (
    <header>
      <button onClick$={() => store.ui.sidebarOpen = !store.ui.sidebarOpen}>
        Menu
      </button>

      {store.user.isAuthenticated ? (
        <span>Welcome, {store.user.name}</span>
      ) : (
        <button onClick$={() => store.user.isAuthenticated = true}>
          Sign In
        </button>
      )}

      <span>Cart: {store.cart.items.length} items</span>
    </header>
  );
});
```

## Interaction Patterns

Common interaction patterns for prototypes.

### Click/Tap Interactions

```typescript
// Button click
<PrototypeButton
  onClick$={() => handleAction()}
  feedback="ripple"     // ripple, scale, lift
  haptic={true}         // Mobile haptic feedback
>
  Click Me
</PrototypeButton>

// Card selection
<PrototypeCard
  onSelect$={() => selectCard(id)}
  selected={isSelected}
  selectionStyle="border" // border, background, scale
>
  Card content
</PrototypeCard>
```

### Hover Effects

```typescript
<PrototypeCard
  onHoverStart$={() => setHovered(true)}
  onHoverEnd$={() => setHovered(false)}
  hoverAnimation="lift"    // lift, scale, glow, none
>
  Hover over me
</PrototypeCard>
```

### Drag & Drop

```typescript
import { useDraggable, useDropZone } from '@n00plicate/prototype-kit';

export const DragDropExample = component$(() => {
  const { dragProps, isDragging } = useDraggable({
    id: 'item-1',
    data: { type: 'card' },
  });

  const { dropProps, isOver } = useDropZone({
    onDrop: (data) => handleDrop(data),
    accept: ['card'],
  });

  return (
    <>
      <div {...dragProps} class={isDragging ? 'dragging' : ''}>
        Drag me
      </div>

      <div {...dropProps} class={isOver ? 'drop-target' : ''}>
        Drop zone
      </div>
    </>
  );
});
```

### Form Validation

```typescript
import { usePrototypeForm } from '@n00plicate/prototype-kit';

export const PrototypeForm = component$(() => {
  const form = usePrototypeForm({
    fields: {
      email: {
        value: '',
        rules: ['required', 'email'],
        error: '',
      },
      password: {
        value: '',
        rules: ['required', 'minLength:8'],
        error: '',
      },
    },
  });

  return (
    <form onSubmit$={form.handleSubmit}>
      <input
        type="email"
        value={form.fields.email.value}
        onInput$={(e) => form.setField('email', e.target.value)}
        aria-invalid={!!form.fields.email.error}
      />
      {form.fields.email.error && (
        <span role="alert">{form.fields.email.error}</span>
      )}

      <button type="submit" disabled={!form.isValid}>
        Submit
      </button>
    </form>
  );
});
```

### Navigation Transitions

```typescript
import { usePrototypeRouter } from '@n00plicate/prototype-kit';

export const PrototypeApp = component$(() => {
  const router = usePrototypeRouter({
    routes: [
      { path: '/', component: HomePage },
      { path: '/about', component: AboutPage },
      { path: '/products/:id', component: ProductPage },
    ],
    transition: 'fade', // fade, slide, scale
  });

  return (
    <>
      <nav>
        <a onClick$={() => router.navigate('/')}>Home</a>
        <a onClick$={() => router.navigate('/about')}>About</a>
      </nav>

      <main>
        {router.currentComponent}
      </main>
    </>
  );
});
```

## User Testing

### Adding Annotations

```typescript
import { PrototypeAnnotation } from '@n00plicate/prototype-kit';

<PrototypeAnnotation
  position="top-right"
  label="User Test Note"
  color="warning"
>
  This interaction needs testing with users
</PrototypeAnnotation>
```

### Recording User Sessions

```typescript
import { enableSessionRecording } from '@n00plicate/prototype-kit';

// Enable session recording
enableSessionRecording({
  recordClicks: true,
  recordScrolls: true,
  recordFormInputs: false, // Privacy
  recordMouseMovement: true,
  exportFormat: 'json',
});

// Export session data
const sessionData = exportSessionRecording();
console.log(sessionData);
// {
//   duration: 180000, // 3 minutes
//   clicks: [...],
//   scrolls: [...],
//   paths: [...],
// }
```

### A/B Testing

```typescript
import { usePrototypeVariant } from '@n00plicate/prototype-kit';

export const ButtonTest = component$(() => {
  const variant = usePrototypeVariant('button-test', {
    variants: ['control', 'large', 'animated'],
    weights: [0.33, 0.33, 0.34],
  });

  return (
    <>
      {variant === 'control' && (
        <button>Standard Button</button>
      )}
      {variant === 'large' && (
        <button style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
          Large Button
        </button>
      )}
      {variant === 'animated' && (
        <PrototypeButton animation="pulse">
          Animated Button
        </PrototypeButton>
      )}
    </>
  );
});
```

## Handoff to Development

### Exporting Specifications

```bash
# Export prototype specifications
$ n00plicate prototype export --format=specs

Exporting specifications...

✓ Component inventory
✓ Interaction flows
✓ Animation timing
✓ State management
✓ Responsive breakpoints

Generated files:
- specs/components.json
- specs/interactions.json
- specs/animations.json
- specs/states.json
```

### Generate Code from Prototype

```bash
# Convert prototype to production code
$ n00plicate prototype codegen --input=prototype.tsx --output=src/components

Analyzing prototype...

✓ Converted 12 components
✓ Generated TypeScript types
✓ Applied design tokens
✓ Added accessibility features
✓ Created tests

Next steps:
1. Review generated code
2. Customize as needed
3. Run tests: pnpm test
```

### Documentation Export

```typescript
// Auto-generate documentation
import { exportPrototypeSpecs } from '@n00plicate/prototype-kit';

const specs = exportPrototypeSpecs({
  includeInteractions: true,
  includeStates: true,
  includeAnimations: true,
  format: 'markdown',
});

// Generates detailed documentation:
// - Component hierarchy
// - Interaction flows
// - State management
// - Animation specifications
// - Responsive behavior
```

## Best Practices

### Wireframing

✅ Focus on structure, not style
✅ Use consistent placeholder content
✅ Test multiple layout options quickly
✅ Get feedback early and often
✅ Document key decisions

❌ Don't add too much detail
❌ Don't use final colors/images
❌ Don't skip straight to prototyping

### Prototyping

✅ Use realistic content
✅ Make key interactions work
✅ Test on target devices
✅ Focus on critical user flows
✅ Document edge cases

❌ Don't prototype everything
❌ Don't confuse prototype with production
❌ Don't skip wireframing phase

## Further Reading

- 📖 [Design Principles Guide](./DESIGN_PRINCIPLES.md)
- 📝 [Component Patterns](./COMPONENT_PATTERNS.md)
- 🎨 [Design Tokens](../DESIGN_TOKENS.md)
- ♿ [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)

---

**Need help?** Check the [Troubleshooting Guide](../TROUBLESHOOTING.md) or [open an issue](https://github.com/IAmJonoBo/n00plicate/issues/new).
