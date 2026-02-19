# Model-2-Vibrant-Tech: Arquitetura Minimalista (Containers)

## 1. TECHNICAL SPECIFICATION (The Framework)

### 1.1 Layout Grid
- **Desktop:** 12 colunas, 1440px max-width.
- **Mobile:** 4 colunas, 360px base.
- **Radius Master:** 16px para containers principais.

### 1.2 Navigation Hub
- **Sidebar:** 260px, background `#121212`, ícones com label Montserrat 14px.
- **Top Bar:** Blur de 10px, borda inferior de 0.5px em cinza 700.

## 2. IMPLEMENTATION GUIDE (Tailwind Grid)

```html
<div class="grid grid-cols-12 gap-6 p-8 bg-neutral-900 min-h-screen">
  <nav class="col-span-3 bg-neutral-800 rounded-2xl p-6 shadow-xl">
    <!-- Nav Items -->
  </nav>
  <main class="col-span-9 bg-neutral-800 rounded-2xl p-8 shadow-xl">
    <!-- Main Content -->
  </main>
</div>
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use layouts que não sejam baseados em 8px.
- **REGRA 2:** Sidebars e Modais devem ter `shadow-2xl` para criar profundidade sobre o fundo preto.
- **REGRA 3:** O espaço negativo é um componente; use-o para separar módulos, não bordas.

## 4. COMPLIANCE CHECKLIST
- [ ] O layout é mobile-first?
- [ ] O radius de 16px é aplicado consistentemente nos grandes blocos?

---
*Eutaxia: Structure is the quiet strength of design.*
