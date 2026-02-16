# 🚀 IMPLEMENTAÇÃO COMPLETA DO DASHBOARD - INSTRUÇÕES PARA AIDER

## 🎯 OBJETIVO

Tornar o dashboard AIOS 100% funcional com todas as customizações da Diana Corporação Senciente.

---

## 📋 CONTEXTO

### Estado Atual
- ✅ Fundação completa (tipos, config, env)
- ✅ 30 agentes definidos em TypeScript
- ✅ Configuração centralizada
- ❌ Componentes visuais (pendente)
- ❌ Integração backend (pendente)

### Objetivo Final
Dashboard 100% funcional com:
- 30 agentes visíveis
- Squad Matrix funcionando
- Métricas de holding
- Integração Aider
- Backend conectado

---

## 🔧 TAREFAS PARA IMPLEMENTAR

### TAREFA 1: Atualizar Hook de Agentes
**Arquivo:** `src/hooks/use-agents.ts`

**Objetivo:** Usar DIANA_AGENTS ao invés de agentes padrão

**Implementação:**
```typescript
import { useState, useEffect } from 'react';
import { DIANA_AGENTS, getAgentStats, type DianaAgent } from '@/types/diana-agents';
import { DIANA_CONFIG } from '@/lib/diana-config';

export function useAgents() {
  const [agents, setAgents] = useState<DianaAgent[]>(DIANA_AGENTS);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(getAgentStats());
  
  useEffect(() => {
    // Se backend estiver disponível, buscar dados reais
    const fetchAgents = async () => {
      if (!DIANA_CONFIG.backend.apiUrl) {
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`${DIANA_CONFIG.backend.apiUrl}/api/agents`);
        if (response.ok) {
          const data = await response.json();
          if (data.agents && Array.isArray(data.agents)) {
            setAgents(data.agents);
          }
        }
      } catch (error) {
        console.log('Using local DIANA_AGENTS (backend not available)');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, []);
  
  return { 
    agents, 
    loading, 
    stats,
    activeAgents: agents.filter(a => a.status === 'active'),
    plannedAgents: agents.filter(a => a.status === 'planned'),
  };
}
```

---

### TAREFA 2: Criar Componente de Estatísticas de Agentes
**Arquivo:** `src/components/agents/AgentStats.tsx`

**Objetivo:** Exibir estatísticas dos 30 agentes

**Implementação:**
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { getAgentStats } from '@/types/diana-agents';

export function AgentStats() {
  const stats = getAgentStats();
  
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Total de Agentes</h3>
        <p className="text-3xl font-bold">{stats.total}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Agentes Ativos</h3>
        <p className="text-3xl font-bold text-green-600">{stats.active}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Agentes Planejados</h3>
        <p className="text-3xl font-bold text-yellow-600">{stats.planned}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Nota Média</h3>
        <p className="text-3xl font-bold">{stats.avgNote.toFixed(1)}/10</p>
      </Card>
    </div>
  );
}
```

---

### TAREFA 3: Atualizar Página de Agentes
**Arquivo:** `src/app/(dashboard)/agents/page.tsx`

**Objetivo:** Exibir 30 agentes com estatísticas

**Implementação:**
```typescript
import { AgentStats } from '@/components/agents/AgentStats';
import { DIANA_CONFIG } from '@/lib/diana-config';

export default function AgentsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{DIANA_CONFIG.company.name}</h1>
        <p className="text-muted-foreground">
          {DIANA_CONFIG.agents.total} agentes especializados
        </p>
      </div>
      
      <AgentStats />
      
      {/* Resto da página de agentes */}
    </div>
  );
}
```

---

### TAREFA 4: Criar Componente de Métricas de Holding
**Arquivo:** `src/components/holding/HoldingMetrics.tsx`

**Objetivo:** Exibir métricas financeiras da holding

**Implementação:**
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DIANA_CONFIG, formatCurrency, calculateProgress } from '@/lib/diana-config';

export function HoldingMetrics() {
  const { financial, company } = DIANA_CONFIG;
  
  const progress2026 = calculateProgress(0, financial.revenueTarget2026);
  const progress2030 = calculateProgress(0, financial.revenueTarget2030);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Holding Autônoma - Dashboard Executivo</h2>
      
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Meta 2026
          </h3>
          <p className="text-2xl font-bold">{formatCurrency(financial.revenueTarget2026)}</p>
          <Progress value={progress2026} className="mt-2" />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Meta 2030
          </h3>
          <p className="text-2xl font-bold">{formatCurrency(financial.revenueTarget2030)}</p>
          <Progress value={progress2030} className="mt-2" />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Subsidiárias
          </h3>
          <p className="text-3xl font-bold">0/{financial.subsidiariesPlanned}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Autonomia
          </h3>
          <p className="text-3xl font-bold">{company.autonomyLevel}%</p>
          <Progress value={company.autonomyLevel} className="mt-2" />
        </Card>
      </div>
    </div>
  );
}
```

---

### TAREFA 5: Atualizar Página Principal
**Arquivo:** `src/app/(dashboard)/page.tsx`

**Objetivo:** Exibir métricas de holding na home

**Implementação:**
```typescript
import { HoldingMetrics } from '@/components/holding/HoldingMetrics';
import { AgentStats } from '@/components/agents/AgentStats';

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <HoldingMetrics />
      <AgentStats />
    </div>
  );
}
```

---

### TAREFA 6: Atualizar Layout com Branding Diana
**Arquivo:** `src/app/layout.tsx`

**Objetivo:** Adicionar nome da empresa e informações

**Implementação:**
```typescript
import { DIANA_CONFIG } from '@/lib/diana-config';

export const metadata = {
  title: `${DIANA_CONFIG.company.name} - Dashboard`,
  description: 'Painel Admin Executivo da Holding Autônoma',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO

1. ✅ Atualizar `use-agents.ts` hook
2. ✅ Criar `AgentStats.tsx` component
3. ✅ Criar `HoldingMetrics.tsx` component
4. ✅ Atualizar `agents/page.tsx`
5. ✅ Atualizar `page.tsx` (home)
6. ✅ Atualizar `layout.tsx`

---

## ✅ CRITÉRIOS DE SUCESSO

- [ ] Dashboard inicia sem erros
- [ ] 30 agentes visíveis
- [ ] Estatísticas corretas (11 ativos, 19 planejados)
- [ ] Métricas de holding exibidas
- [ ] Branding Diana presente
- [ ] TypeScript sem erros
- [ ] Build bem-sucedido

---

## 🚀 COMANDO PARA EXECUTAR

```bash
cd Diana-Corporacao-Senciente/aios-core-latest/apps/dashboard
aider --message "Implementar todas as tarefas do arquivo IMPLEMENTAR_DASHBOARD_COMPLETO.md. Seguir ordem de implementação. Garantir que dashboard fique 100% funcional com 30 agentes e métricas de holding."
```

---

**Criado por:** Kiro AI Assistant  
**Data:** 03/02/2026 00:40 UTC  
**Objetivo:** Dashboard 100% funcional
