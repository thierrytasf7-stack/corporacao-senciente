# Component Specification: {COMPONENT_NAME}

## Design System: {SYSTEM_NAME}
## Tier: {TIER} ({TIER_NAME})
## Version: {VERSION}

---

## Overview
{brief_description}

---

## Props API

```typescript
interface {COMPONENT_NAME}Props {
  variant?: {variants_union};
  size?: {sizes_union};
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | {type} | {default} | No | {desc} |

---

## Variants

| Variant | Use When | Preview |
|---------|----------|---------|
| primary | Main CTA, high emphasis | {visual} |

---

## Sizes

| Size | Height | Font Size | Padding |
|------|--------|-----------|---------|
| sm | 32px | 14px | 8px 12px |
| md | 40px | 16px | 10px 16px |
| lg | 48px | 18px | 12px 24px |

---

## States

| State | Token Changes | Trigger |
|-------|--------------|---------|
| default | - | Initial render |
| hover | bg: {hover_bg} | Mouse over |
| active | bg: {active_bg} | Mouse down |
| focus | ring: {focus_ring} | Tab focus |
| disabled | opacity: 0.5 | disabled prop |
| loading | spinner + aria-busy | loading prop |

---

## Tokens Used

| Token | Property | Value |
|-------|----------|-------|
| `--ds-{component}-bg` | background | {value} |

---

## Accessibility

- **Role:** {role}
- **ARIA:** {aria_attributes}
- **Keyboard:** {keyboard_interactions}
- **Screen Reader:** {sr_behavior}

---

## Usage Examples

### Basic
```tsx
<{COMPONENT_NAME} variant="primary">Label</{COMPONENT_NAME}>
```

### With Icon
```tsx
<{COMPONENT_NAME} variant="secondary">
  <Icon name="save" /> Save
</{COMPONENT_NAME}>
```

---

## Do / Don't

| Do | Don't |
|----|-------|
| {do_example} | {dont_example} |

---

## Composition

```tsx
{composition_example}
```
