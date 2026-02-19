# Model-1-PES-C4: Arquitetura de Espaço (Layout Containers)

## 1. TECHNICAL SPECIFICATION (The Mission Hub)

### 1.1 Grid & Scale
- **Base Grid:** 8px. Tudo deve ser múltiplo de 8.
- **Max Width:** 1440px para desktops de comando.
- **Semantic Depth:** Camadas definidas por `backdrop-filter: blur(10px)` e opacidades de 0.8 a 0.9.

### 1.2 Layout Modules
- **Sidebar (The Arsenal):** Fixa, 240px de largura, `--color-abyss`.
- **Main View (The Field):** Flexível, com grades hexagonais invisíveis para alinhamento de cards N2.
- **Modals (Mission Containers):** Centralizados, nascidos por expansão fractal (M3).

## 2. IMPLEMENTATION GUIDE (Tailwind / CSS)

```html
<!-- Estrutura Base C4 -->
<div class="flex h-screen bg-abyss text-high-spec font-interface">
  <aside class="w-60 border-r-[0.5px] border-blueprint bg-abyss/90 backdrop-blur-xl">
    <!-- Navigation Items -->
  </aside>
  <main class="flex-1 overflow-auto p-8 grid grid-cols-12 gap-4">
    <!-- Grid Content -->
  </main>
</div>
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use scrolls de navegador visíveis. Use custom scrollbars em `--color-blueprint` com largura de 4px.
- **REGRA 2:** TODO container deve ter um padding mínimo de 16px (2x Grid).
- **REGRA 3:** NUNCA use bordas arredondadas orgânicas. O sistema é rígido (Radius Max: 4px).

## 4. COMPLIANCE CHECKLIST
- [ ] O layout utiliza o sistema de grade de 8px?
- [ ] As sidebars possuem o efeito de `backdrop-blur` de 10px?
- [ ] O z-index do Menu Radial P2 é superior a todos os outros elementos?

---
*Visual Arete: Order in space creates order in mind.*
