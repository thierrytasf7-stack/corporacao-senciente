# Theme Specification: {THEME_NAME}

## Design System: {SYSTEM_NAME}
## Type: {THEME_TYPE} (light|dark|high-contrast|brand)
## Version: {VERSION}

---

## Token Remapping

### Surface Colors
| Semantic Token | Light Value | This Theme Value |
|---------------|-------------|-----------------|
| `--ds-color-background` | {light} | {this_theme} |
| `--ds-color-surface` | {light} | {this_theme} |
| `--ds-color-overlay` | {light} | {this_theme} |

### Text Colors
| Semantic Token | Light Value | This Theme Value |
|---------------|-------------|-----------------|
| `--ds-color-text-primary` | {light} | {this_theme} |
| `--ds-color-text-secondary` | {light} | {this_theme} |

### Interactive Colors
| Semantic Token | Light Value | This Theme Value |
|---------------|-------------|-----------------|
| `--ds-color-primary` | {light} | {this_theme} |

---

## Contrast Verification

| Pair | Ratio | WCAG AA | WCAG AAA |
|------|-------|---------|----------|
| text-primary / background | {ratio} | {pass/fail} | {pass/fail} |
| text-secondary / background | {ratio} | {pass/fail} | {pass/fail} |
| primary / background | {ratio} | {pass/fail} | {pass/fail} |

---

## Activation

### CSS Class
```css
[data-theme="{theme_name}"] { /* tokens */ }
```

### Media Query (auto)
```css
@media (prefers-color-scheme: {scheme}) { /* tokens */ }
```

### JavaScript
```js
document.documentElement.setAttribute('data-theme', '{theme_name}');
```

---

## Notes
- {additional_notes}
