# Token Specification: {CATEGORY}

## Design System: {SYSTEM_NAME}
## Version: {VERSION}
## Last Updated: {DATE}

---

## Primitive Tokens

| Token | Value | Preview |
|-------|-------|---------|
| `--ds-{category}-{name}` | {value} | {visual} |

---

## Semantic Tokens

| Token | References | Usage |
|-------|-----------|-------|
| `--ds-{semantic}` | `var(--ds-{primitive})` | {description} |

---

## Component Tokens

| Token | References | Component |
|-------|-----------|-----------|
| `--ds-{component}-{property}` | `var(--ds-{semantic})` | {component_name} |

---

## Scale Visualization

```
{visual_scale_representation}
```

---

## Usage Examples

### CSS
```css
.element {
  property: var(--ds-{token-name});
}
```

### Tailwind
```html
<div class="{tailwind-class}">...</div>
```

---

## Notes
- {additional_notes}
