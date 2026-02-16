# Task: Create Tokens

> **Goal:** Definir ou atualizar os Design Tokens fundamentais (Cores, Tipografia, Espaçamento).
> **Role:** @ds-architect

## Instructions

1.  **Analyze Request:**
    *   Identificar se é criação inicial ou atualização.
    *   Ler `tokens/primitives.json` e `tokens/semantics.json` (se existirem).

2.  **Define Primitives:**
    *   Definir paleta de cores base (Brand, Neutral, State).
    *   Definir escala tipográfica (Font Family, Size, Weight, Line Height).
    *   Definir escala de espaçamento (4px grid base).

3.  **Define Semantics:**
    *   Mapear primitivos para semântica (ex: `color-text-primary` -> `neutral-900`).
    *   NUNCA usar valores raw na camada semântica.

4.  **Generate Files:**
    *   Escrever/Atualizar JSONs em `tokens/`.
    *   Gerar variáveis CSS/SCSS se necessário.

5.  **Validate:**
    *   Garantir contraste acessível nas combinações semânticas.
