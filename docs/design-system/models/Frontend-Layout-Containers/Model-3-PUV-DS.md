# Model-3-PUV-DS: Arquitetura Executiva (Layout Containers)

## 1. TECHNICAL SPECIFICATION (The Slide Frame)

### 1.1 Framework
- **Aspect Ratio:** Otimizado para 16:9 (Slides) e 19.5:9 (Mobile iPhone).
- **Containers:** Camadas de Glassmorphism com `z-index` para profundidade.
- **Padding:** 24px (3x Grid) para manter o respiro "Apple-like".

### 1.2 Semantic Layout
- **Top Section:** Identidade e Score.
- **Middle Section:** Rubrica e Ações Trinity.
- **Bottom Section:** Logs de Auditoria e Badges de Download.

## 2. IMPLEMENTATION GUIDE (Tailwind Grid)

```html
<div class="grid grid-rows-[auto_1fr_auto] h-full gap-6">
  <header class="p-4 border-b border-white/5">...</header>
  <main class="overflow-y-auto">...</main>
  <footer class="p-4 bg-surface/50">...</footer>
</div>
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use bordas pretas de 1px. Use apenas a borda de Glassmorphism ultra-sutil.
- **REGRA 2:** O conteúdo deve ser centralizado para visualização em apresentações.
- **REGRA 3:** Respiro lateral mínimo de 24px é obrigatório.

## 4. COMPLIANCE CHECKLIST
- [ ] O layout se adapta sem quebras entre o modo "Slide" e "Mobile"?
- [ ] O sistema de camadas (z-index) reflete a profundidade do Glassmorphism?

---
*PUV-DS: The layout is the stage for the verdict.*
