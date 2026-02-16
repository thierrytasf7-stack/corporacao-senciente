---
task: Audit Accessibility (WCAG)
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do sistema (opcional)
  - component_name: Nome do componente (opcional)
Saida: |
  - accessibility_audit_report: Relatorio completo de auditoria WCAG AA
Checklist:
  - "[ ] Validar nome do sistema/componente"
  - "[ ] Auditar contraste de cores (WCAG AA)"
  - "[ ] Verificar elementos interativos (foco, teclado)"
  - "[ ] Testar leitores de tela (ARIA roles, labels)"
  - "[ ] Validar preferencias de movimento (reduced-motion)"
  - "[ ] Testar responsividade (zoom, touch targets)"
  - "[ ] Gerar relatorio com findings e remediacoes"
---

# Task: Audit Accessibility (WCAG)

## Metadata
- **id:** ds-audit-accessibility
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name OR component_name
- **outputs:** Accessibility audit report

## Description
Audita acessibilidade WCAG AA de tokens, componentes e temas do Design System.

## Audit Checks

### Color & Contrast
- [ ] Text/background contrast >= 4.5:1 (normal text)
- [ ] Text/background contrast >= 3:1 (large text >= 18px)
- [ ] UI component contrast >= 3:1 (borders, icons)
- [ ] Focus indicator contrast >= 3:1
- [ ] Color not the only differentiator (success/error uses icons too)

### Interactive Elements
- [ ] All interactive elements focusable via Tab
- [ ] Focus order logical (top-to-bottom, left-to-right)
- [ ] Focus indicator visible (ring, outline)
- [ ] Escape closes modals/popups
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate menus/tabs

### Screen Reader
- [ ] ARIA roles appropriate
- [ ] ARIA labels on icon-only buttons
- [ ] Form inputs have associated labels
- [ ] Error messages announced (aria-live)
- [ ] Images have alt text
- [ ] Decorative elements have aria-hidden

### Motion
- [ ] prefers-reduced-motion respected
- [ ] No auto-playing animations > 5s
- [ ] No flashing content > 3 flashes/second

### Responsive
- [ ] Content readable at 200% zoom
- [ ] Touch targets >= 44x44px (mobile)
- [ ] No horizontal scroll at 320px width

## Quality Criteria
- [ ] All WCAG 2.1 Level AA criteria checked
- [ ] Contrast ratios numerically verified
- [ ] Keyboard navigation tested per component
- [ ] Findings with remediation steps
