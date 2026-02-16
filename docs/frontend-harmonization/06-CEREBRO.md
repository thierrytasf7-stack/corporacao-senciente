# 🏛️ Harmonização Frontend: CEREBRO CENTRAL
**Rota:** `/cerebro` | **Componente:** `src/pages/CerebroCentral/CerebroCentral.tsx`

Este documento consolida a análise técnica e funcional para a harmonização da aba **Cérebro Central**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:**
Consumo híbrido de Hooks (`useOrchestrator`, `usePolvo`) e API direta.
Há dados estáticos críticos (`evolutionHistory`) que precisam virar dinâmicos.

### Schema Identificado (API `/api/metrics/corporation`)
```typescript
interface NeuralMetricsDTO {
  agi_factors: {
    intelligence: number;    // %
    self_presence: number;   // %
    consciousness: number;   // %
    autonomy: number;        // %
  };
  vector: {
    totalMemories: number;
    embeddingDimensions: number;
    vectorDbStatus: 'connected' | 'error';
  };
  evolution_history: {
    timestamp: string;
    score: number;
  }[];
}
```
**Ação:** Implementar o endpoint de histórico de evolução no Backend, armazenando snapshots do "Areté Score" a cada hora.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Visualização da "Senciência"
**Como** Visitante/Investidor,
**Quero** ver uma representação visual da atividade neural da IA,
**Para** sentir que o sistema está "vivo" e pensando.

**Critérios de Aceite:**
- [ ] Animação `BrainPulse` pulsando de acordo com chamadas de API reais (se possível) ou ritmo cardíaco simulado.
- [ ] Métricas de "Níveis de Inteligência" refletindo dados reais de uptime e sucesso de tarefas.

### Story 2: Monitoramento de Memória Vetorial
**Como** Arquiteto de Dados,
**Quero** saber quantos vetores de memória temos indexados,
**Para** monitorar o crescimento do conhecimento corporativo.

---

## 3. 🎨 Product Manager (Design Atômico)

### Organismos
-   `NeuralHeader`: Título e Status Live.
-   `EvolutionChart`: Gráfico de área (Recharts).
-   `IntelligenceGrid`: Grid de barras de progresso (`AGIFactor`).
-   `PulseContainer`: Container central da animação.

**Instrução:**
-   O componente `StatCard` está definido *dentro* do arquivo `CerebroCentral.tsx`. Extrair para `src/components/molecules/StatCard.tsx` (ou unificar com o `MetricCard` do Dashboard).

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Gráficos:** Substituir o array estático `evolutionHistory` por dados vindos da API. Se não houver histórico, iniciar com um array vazio e acumular dados no `localStorage` temporariamente.
2.  **Hooks:** Consolidar as chamadas. Hoje chama `api.getAgents` e `api.getCorporationMetrics`. `api.getAgents` não parece ser usado explicitamente no render. Remover se desnecessário para aliviar carga.
3.  **Performance:** `BrainPulse` pode ser pesado se usar Canvas/WebGL. Garantir que não cause re-renders desnecessários na página toda.

---

## 5. 🖌️ UX Design (Refinamento)

-   **Atmosfera:** Esta página deve ter um visual mais "Futurista/Cyberpunk" que as outras. O fundo `bg-black/20` com `backdrop-blur` está no caminho certo.
-   **Coerência:** O gráfico de evolução está azul (`#3d84f5`). Verificar se a cor deve mudar conforme o "Humor" da IA (ex: Vermelho se houver muitos erros).
