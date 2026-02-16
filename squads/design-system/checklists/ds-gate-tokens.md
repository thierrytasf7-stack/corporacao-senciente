# Quality Gate: Design Tokens

## Pre-conditions
- [ ] DS name and version defined
- [ ] Brand inputs collected (colors, typography)

## Token Completeness
- [ ] Color primitives (neutrals + brand, 50-950 scale)
- [ ] Color semantics (primary, secondary, accent, success, warning, error, info)
- [ ] Color surfaces (background, surface, overlay)
- [ ] Color text (primary, secondary, disabled, inverse)
- [ ] Typography families (sans, serif, mono)
- [ ] Typography scale (xs through 5xl)
- [ ] Typography weights (light through bold)
- [ ] Typography line-heights (tight, normal, relaxed)
- [ ] Spacing scale (0 through 24/96px)
- [ ] Sizing scale (component heights xs-xl)
- [ ] Radius scale (none through full)
- [ ] Shadow scale (sm through xl)
- [ ] Border widths (thin, medium)
- [ ] Opacity scale
- [ ] Z-index scale (base through toast)
- [ ] Motion durations + easings
- [ ] Breakpoints (sm through 2xl)

## Token Quality
- [ ] All names kebab-case
- [ ] CSS vars prefixed --ds-
- [ ] Semantic tokens reference primitives (no hardcoded hex)
- [ ] Component tokens reference semantic (no hardcoded hex)
- [ ] No magic numbers without semantic meaning
- [ ] Scale is consistent (predictable progression)

## Output Formats
- [ ] CSS custom properties generated
- [ ] JSON (Style Dictionary compatible) generated
- [ ] Tailwind config generated
- [ ] SCSS variables generated (if needed)
