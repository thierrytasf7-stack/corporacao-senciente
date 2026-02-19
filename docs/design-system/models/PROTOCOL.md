# Protocolo de Design Models - Squad Aesthetix (v2.1 - C4 Standard)

Este documento define o padrão **C4 (Command, Control, Communications, and Computers)** para todos os modelos da biblioteca. Um modelo só é considerado completo se seguir esta estrutura técnica.

## 1. Estrutura Obrigatória de um Modelo C4
Cada `Model-N-{NOME}.md` deve conter obrigatoriamente:

1.  **TECHNICAL SPECIFICATION:** Definição bruta de tokens, dimensões e geometria.
2.  **IMPLEMENTATION GUIDE:** Exemplos de código (Tailwind/React/CSS) e lógica de integração.
3.  **GUARDRAILS (A LEI):** Regras negativas (O que NÃO fazer) e positivas (O que SEMPRE fazer).
4.  **COMPLIANCE CHECKLIST:** Pontos de verificação para o `CEO-AUDIT` e `@qa`.

## 2. A Hierarquia de Dependência
- Todo modelo **DEVE** herdar cores e fontes de `Design-System-Primitives/Model-1`.
- Mudanças nas Primitivas exigem re-auditoria de todos os modelos dependentes.

## 3. O Guardrail Supremo
> "Se um componente não pode ser descrito por um token, ele não existe."
> Não são permitidos valores hardcoded (hex, px, ms) fora do arquivo de Primitivas.

---
*Visual Arete: In details we find perfection. In standards we find scale.*
