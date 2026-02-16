# Task: Audit Component

> **Goal:** Auditar um componente existente contra WCAG 2.2 AA.
> **Role:** @ds-blind-auditor

## Instructions

1.  **Simulate Vision Loss:**
    *   Analisar componente sem cor (grayscale).
    *   Verificar se informações são transmitidas apenas por cor.

2.  **Simulate Keyboard:**
    *   Garantir que todos elementos interativos são focáveis.
    *   Garantir que o foco é visível.
    *   Garantir ordem lógica de tabulação.

3.  **Simulate Screen Reader:**
    *   Verificar `aria-label`, `role`, `alt` texts.
    *   Verificar se estados (expanded, checked) são anunciados.

4.  **Report:**
    *   Listar violações com severidade (Critical, Serious, Moderate).
    *   Sugerir correções de código.
