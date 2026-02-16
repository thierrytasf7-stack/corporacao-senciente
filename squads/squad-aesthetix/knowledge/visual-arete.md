# Visual Arete Manifesto (The Arete Visual)

## 1. Princípio da Atomicidade
Todo o universo visual é composto por átomos.
- **Átomos:** Cores, Espaçamentos, Fontes (Tokens).
- **Moléculas:** Botões, Cards, Inputs.
- **Organismos:** Formulários, Cards com ações.
- **Templates:** Páginas, Layouts.
- **Páginas:** Instâncias reais.

## 2. Lei da Acessibilidade (WCAG 2.2 AA)
NADA é aprovado sem checagem WCAG 2.2 AA automatizada.
- Contraste mínimo de 4.5:1 para texto normal.
- Foco visível em todos os elementos interativos.
- Semântica HTML rigorosa (`<button>`, não `<div onClick>`).
- Labels associados corretamente.

## 3. Santidade dos Tokens
Cores, espaçamentos e tipografia NUNCA são hardcoded.
- PROIBIDO: `hex`, `px`, `rem` soltos.
- OBRIGATÓRIO: `var(--color-primary-500)`, `var(--spacing-md)`, `var(--font-size-base)`.
- Justificativa: Tokens permitem mudanças globais instantâneas. Hardcoding cria dívida técnica visual.

## 4. Movimento com Significado
Animações devem guiar a atenção, nunca decorar.
- Duração máxima de 300ms para interações.
- Easing natural (`ease-out` para entrada, `ease-in` para saída).
- Respeitar `prefers-reduced-motion`.

## 5. Arquitetura CSS
- **Utility-First:** Use classes utilitárias para layout e espaçamento.
- **Component-First:** Use classes de componente para estrutura e comportamento.
- **BEM (Block Element Modifier):** Se usar CSS/SCSS puro.
- **Tailwind:** Se usar Tailwind, use `@apply` apenas para abstrações complexas.
