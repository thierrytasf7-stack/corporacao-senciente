# 🏛️ Harmonização Frontend: PROJECT ANALYSIS
**Rota:** `/analysis` | **Componente:** `src/pages/ProjectAnalysis/ProjectAnalysis.tsx`

Este documento consolida a análise técnica e funcional para a harmonização da aba **Análise & Diretrizes**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:**
Dados complexos vindos de `useProjectAnalysis()`. O backend parece retornar uma estrutura aninhada de fases e diretrizes.

### Schema Identificado
```typescript
interface ProjectAnalysisDTO {
  id: string;
  name: string;
  healthScore: number; // 0-100
  strategicAnalysis: string; // Texto longo (LLM output)
  currentPhase: {
    name: string;
    number: number;
    total: number;
    eta: string;
  };
  globalProgress: {
    percentage: number;
    deadline: string;
  };
  guidelines: {
    agent: string;      // ex: "@dev"
    directive: string;  // ex: "Prioritize refactoring"
  }[];
}
```
**Ação:** Garantir que o campo `strategicAnalysis` seja gerado por uma LLM no backend e cacheado, pois é custoso.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Leitura do Plano Estratégico
**Como** Stakeholder,
**Quero** ler a análise estratégica gerada pela IA sobre o projeto,
**Para** entender se estamos alinhados com os objetivos de negócio.

**Critérios de Aceite:**
- [ ] Exibir texto de análise estratégica em destaque.
- [ ] Mostrar fase atual e próximas fases (Roadmap Visual).
- [ ] Permitir forçar nova análise (Botão "Analisar estado atual").

### Story 2: Diretrizes para Agentes
**Como** Arquiteto de Sistema,
**Quero** ver quais instruções foram dadas aos agentes autônomos,
**Para** auditar o comportamento da "swarm".

---

## 3. 🎨 Product Manager (Design Atômico)

### Organismos (Extração Necessária)
O arquivo `ProjectAnalysis.tsx` é enorme. Quebrar em:
1.  `StrategicHeader`: Título e botão de ação.
2.  `ProjectHealthCard`: O card principal com score.
3.  `PhaseTimeline`: A linha do tempo vertical.
4.  `GuidelineTerminal`: A caixa preta com logs de diretrizes.

**Instrução:**
-   Isolar `GuidelineTerminal` pois será útil em outras telas de debug.
-   Padronizar as cores de progresso com o tema global (Cyan/Purple).

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Refatoração:** O componente tem +200 linhas. Extrair sub-componentes urgentemente para `src/components/organisms/analysis/*`.
2.  **Estado de Loading:** O "Fake Loading" de 2 segundos (`setTimeout`) no botão de análise deve ser substituído por um estado de loading real da requisição `refetch()`.
3.  **Tipagem:** Verificar se `useProjectAnalysis` retorna tipos estritos ou `any`. Se `any`, criar interface `ProjectAnalysis` em `src/types`.

---

## 5. 🖌️ UX Design (Refinamento)

-   **Timeline:** A linha vertical da timeline (`border-l-2`) as vezes quebra em mobile. Verificar responsividade.
-   **Contraste:** O texto cinza escuro sobre fundo preto no terminal (`text-[#94a3b8]`) pode ter baixo contraste. Clarear levemente para acessibilidade.
-   **Animação:** Adicionar transição suave quando o `strategicAnalysis` muda (fade in).
