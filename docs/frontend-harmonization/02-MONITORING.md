# 🏛️ Harmonização Frontend: MONITORING
**Rota:** `/monitor` | **Componente:** `src/pages/Monitoring/Monitoring.tsx`

Este documento consolida a análise técnica e instruções para a aba **Acompanhamento (Monitoring)**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:**
-   Usa `api.getCorporationMetrics()` para estatísticas gerais.
-   Usa `BridgeService.getAvailableHosts()` para contagem de hosts.
-   Usa `useRobustLog()` para fluxo de logs em tempo real.

### Schemas Identificados
```typescript
interface CorporationMetrics {
  llm: { totalCalls: number; };
  execution: { pendingActions: number; };
  alerts: any[];
}

interface LogEntry {
  id: string;
  source: string;  // ex: "Agent-Alpha"
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  timestamp: string; // ISO
}
```

### ⚠️ Pontos de Atenção
1.  **Log Overflow:** O código atual faz `logs.slice(0, 10)`. Se o array `logs` no hook `useRobustLog` crescer indefinidamente, causará *Memory Leak*. O Data Engineer deve garantir que o hook implemente um buffer circular (ex: manter max 1000 logs).
2.  **Duplicidade de Métricas:** `pendingActions` e `totalCalls` parecem redundantes com o Dashboard. Validar se a fonte é a mesma para evitar inconsistência de dados entre abas.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Monitoramento de Execução em Tempo Real
**Como** DevOps/Engenheiro,
**Quero** ver o log de execução dos agentes rolando em tempo real,
**Para** depurar erros e entender o raciocínio atual do sistema.

**Critérios de Aceite:**
- [ ] Exibir tabela com Source, Message, Status, Timestamp.
- [ ] Atualizar automaticamente (Live).
- [ ] Permitir pausar o stream de logs (Botão Pause/Play - *Novo Requisito*).
- [ ] Exibir contagem correta de Hosts conectados via Bridge.

### Story 2: Visualização de Infraestrutura (PC Dashboard)
**Como** Gestor de Infra,
**Quero** ver o status físico dos PCs conectados (CPU/RAM),
**Para** garantir que não há sobrecarga de hardware.

---

## 3. 🎨 Product Manager (Design Atômico)

### Organismos
-   `PCMonitorDashboard`: Organismo complexo importado. Verificar se ele é responsivo.
-   `LogTable`: A tabela de logs atual.
-   `StatCards`: Os cards superiores.

**Instrução:**
-   Transformar a tabela de logs em um componente reutilizável `LogTableViewer` com paginação e filtro por `level` (INFO/ERROR).
-   Padronizar os `StatCards` para usarem o mesmo `MetricCard` do Dashboard se possível, ou criar variante `MiniMetricCard`.

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Otimização de Renderização:** A tabela de logs redesenha a cada novo log. Usar `React.memo` na linha da tabela (`LogRow`).
2.  **Bridge Service:** Validar se `BridgeService.getAvailableHosts()` funciona em produção ou apenas local. Se falhar, tratar erro silenciosamente mostrando "0 Hosts".
3.  **Botão "NEW TASK":** O botão existe na UI mas não tem `onClick`. Conectar ao Modal de Criação de Tarefa ou remover se não for funcional.
4.  **Refatoração:** Remover a lógica de `slice(0, 10)` do render e mover para o seletor de dados ou para o hook, para garantir performance.

---

## 5. 🖌️ UX Design (Refinamento)

-   **Legibilidade:** Logs de erro (`bg-red-500/20`) são bons, mas logs de sucesso (`bg-green`) podem poluir visualmente se forem muitos. Considerar deixar logs normais (INFO) com cor neutra e reservar cores apenas para ERROR e WARN.
-   **Empty State:** A mensagem "No real-time logs detected" está boa. Adicionar um ícone de "Radar" ou "Antena" animado para indicar que o sistema está *escutando*.
