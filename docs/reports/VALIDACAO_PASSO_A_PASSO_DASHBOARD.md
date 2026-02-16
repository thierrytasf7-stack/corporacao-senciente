# ✅ VALIDAÇÃO PASSO A PASSO - CUSTOMIZAÇÃO DASHBOARD DIANA

## 🎯 OBJETIVO

Este documento fornece **validação detalhada** para cada passo da customização do dashboard AIOS para a Diana Corporação Senciente.

---

## 📋 FASE 1: BACKUP E PREPARAÇÃO

### Passo 1.1: Criar Backup do Dashboard Original
**Comando:**
```bash
cp -r Diana-Corporacao-Senciente/aios-core-latest/apps/dashboard Diana-Corporacao-Senciente/aios-core-latest-backup/dashboard
```

**Validação:**
```bash
# Verificar se backup existe
ls -la Diana-Corporacao-Senciente/aios-core-latest-backup/dashboard

# Verificar tamanho (deve ser ~50MB)
du -sh Diana-Corporacao-Senciente/aios-core-latest-backup/dashboard
```

**Critérios de Sucesso:**
- [ ] Pasta `aios-core-latest-backup/dashboard` existe
- [ ] Tamanho similar ao original (~50MB)
- [ ] Todos os arquivos copiados (422 packages)

**Tempo:** 2 minutos

---

### Passo 1.2: Documentar Estado Original
**Ação:** Criar snapshot do estado atual

**Comando:**
```bash
cd Diana-Corporacao-Senciente/aios-core-latest/apps/dashboard
npm run typecheck > estado_original_typecheck.txt
npm run lint > estado_original_lint.txt
```

**Validação:**
```bash
# Verificar arquivos de estado
cat estado_original_typecheck.txt
cat estado_original_lint.txt
```

**Critérios de Sucesso:**
- [ ] Arquivo `estado_original_typecheck.txt` criado
- [ ] Arquivo `estado_original_lint.txt` criado
- [ ] Sem erros críticos no typecheck
- [ ] Warnings do lint documentados

**Tempo:** 2 minutos

---

### Passo 1.3: Validar Integridade do Código
**Ação:** Executar testes e verificar build

**Comando:**
```bash
cd Diana-Corporacao-Senciente/aios-core-latest/apps/dashboard
npm run build
```

**Validação:**
```bash
# Verificar se build foi bem-sucedido
ls -la .next/

# Verificar logs de build
cat .next/build-manifest.json
```

**Critérios de Sucesso:**
- [ ] Build completo sem erros
- [ ] Pasta `.next/` criada
- [ ] Manifest gerado corretamente
- [ ] Tamanho do build razoável (<100MB)

**Tempo:** 1 minuto

---

## 📋 FASE 2: CONFIGURAÇÃO DE AMBIENTE

### Passo 2.1: Criar .env.local
**Ação:** Criar arquivo de variáveis de ambiente

**Comando:**
```bash
cd Diana-Corporacao-Senciente/aios-core-latest/apps/dashboard
cat > .env.local << 'EOF'
# Backend Diana Corporação
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# OpenRouter Multi-Key
OPENROUTER_API_KEY=sk-or-v1-f93ca135...
OPENROUTER_API_KEY_FREE_1=sk-or-v1-ca6bf4f1...
OPENROUTER_API_KEY_FREE_2=sk-or-v1-f82d95cc...
OPENROUTER_API_KEY_FREE_3=sk-or-v1-3d37d687...
OPENROUTER_API_KEY_FREE_4=sk-or-v1-18578b96...
OPENROUTER_API_KEY_FREE_5=sk-or-v1-d7977115...

# Configurações Diana
NEXT_PUBLIC_COMPANY_NAME=Diana Corporação Senciente
NEXT_PUBLIC_HOLDING_MODE=true
NEXT_PUBLIC_TOTAL_AGENTS=30
NEXT_PUBLIC_SQUAD_MATRIX_ENABLED=true
EOF
```

**Validação:**
```bash
# Verificar se arquivo foi criado
cat .env.local

# Verificar se variáveis estão corretas
grep "NEXT_PUBLIC_COMPANY_NAME" .env.local
grep "OPENROUTER_API_KEY" .env.local
```

**Critérios de Sucesso:**
- [ ] Arquivo `.env.local` criado
- [ ] 6 API keys configuradas
- [ ] Variáveis Diana presentes
- [ ] URLs corretas (localhost:3001)

**Tempo:** 3 minutos

---

### Passo 2.2: Validar Conexão com Backend
**Ação:** Testar se backend está respondendo

**Comando:**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/agents

# Verificar status do backend
curl http://localhost:3001/api/status
```

**Validação:**
```bash
# Deve retornar JSON com agentes
curl -s http://localhost:3001/api/agents | jq '.agents | length'

# Deve retornar status OK
curl -s http://localhost:3001/api/status | jq '.status'
```

**Critérios de Sucesso:**
- [ ] Backend respondendo em localhost:3001
- [ ] Endpoint `/api/agents` retorna dados
- [ ] Endpoint `/api/status` retorna OK
- [ ] JSON válido retornado

**Tempo:** 2 minutos

---

### Passo 2.3: Testar API Keys OpenRouter
**Ação:** Validar se keys estão funcionando

**Comando:**
```bash
# Testar key principal
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"anthropic/claude-3.5-sonnet","messages":[{"role":"user","content":"test"}],"max_tokens":10}'

# Testar key gratuita 1
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY_FREE_1" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-2.0-flash-exp:free","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
```

**Validação:**
```bash
# Verificar resposta (deve conter "choices")
curl -s ... | jq '.choices'

# Verificar se não há erro de autenticação
curl -s ... | jq '.error'
```

**Critérios de Sucesso:**
- [ ] Key principal válida
- [ ] Pelo menos 3 keys gratuitas válidas
- [ ] Sem erros de autenticação
- [ ] Modelos respondendo

**Tempo:** 5 minutos

---

## 📋 FASE 3: CUSTOMIZAÇÃO DE AGENTES

### Passo 3.1: Atualizar mock-data.ts
**Ação:** Substituir agentes padrão por 30 customizados

**Arquivo:** `src/lib/mock-data.ts`

**Validação:**
```typescript
// Verificar se arquivo foi modificado
git diff src/lib/mock-data.ts

// Contar agentes
grep -c "{ id:" src/lib/mock-data.ts
// Deve retornar 30
```

**Critérios de Sucesso:**
- [ ] 30 agentes definidos
- [ ] 11 com status 'active'
- [ ] 19 com status 'planned'
- [ ] Notas corretas (0-10)

**Tempo:** 10 minutos

---

### Passo 3.2: Criar Tipos TypeScript
**Ação:** Definir tipos para agentes Diana

**Arquivo:** `src/types/diana-agents.ts`

**Código:**
```typescript
export interface DianaAgent {
  id: string;
  name: string;
  status: 'active' | 'planned' | 'deprecated';
  note: number; // 0-10
  documented: boolean;
  implemented: boolean;
  works: boolean;
  folder?: string;
  specialization?: string;
}

export const AGENT_CATEGORIES = {
  technical: ['architect', 'copywriting', 'devex', 'entity', 'finance', 'metrics', 'product', 'quality', 'research', 'training', 'validation'],
  business: ['strategy', 'operations', 'hr', 'brand', 'communication', 'customer_success', 'content_strategy', 'partnership'],
  security: ['security', 'legal', 'risk', 'compliance'],
  innovation: ['innovation', 'debug', 'development', 'analytics', 'automation', 'integration', 'optimization'],
} as const;
```

**Validação:**
```bash
# Verificar se arquivo foi criado
ls -la src/types/diana-agents.ts

# Verificar typecheck
npm run typecheck
```

**Critérios de Sucesso:**
- [ ] Arquivo `diana-agents.ts` criado
- [ ] Interface `DianaAgent` definida
- [ ] Categorias de agentes definidas
- [ ] Typecheck passando

**Tempo:** 10 minutos

---

### Passo 3.3: Atualizar Hook use-agents.ts
**Ação:** Modificar hook para usar agentes Diana

**Arquivo:** `src/hooks/use-agents.ts`

**Código:**
```typescript
import { useState, useEffect } from 'react';
import { DIANA_AGENTS } from '@/lib/mock-data';
import type { DianaAgent } from '@/types/diana-agents';

export function useAgents() {
  const [agents, setAgents] = useState<DianaAgent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch from backend or use mock data
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        setAgents(data.agents || DIANA_AGENTS);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        setAgents(DIANA_AGENTS); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, []);
  
  return { agents, loading };
}
```

**Validação:**
```bash
# Verificar se hook foi modificado
git diff src/hooks/use-agents.ts

# Testar hook no dashboard
npm run dev
# Abrir http://localhost:3002/agents
```

**Critérios de Sucesso:**
- [ ] Hook `useAgents` atualizado
- [ ] Fallback para mock data funcionando
- [ ] 30 agentes carregando
- [ ] Loading state correto

**Tempo:** 10 minutos

---

## 📋 FASE 4: INTEGRAÇÃO SQUAD MATRIX

### Passo 4.1: Criar Componente SquadMatrix
**Ação:** Criar componente para visualizar squads

**Arquivo:** `src/components/squads/SquadMatrix.tsx`

**Código:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Worker {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'error';
  currentTask?: string;
  progress?: number;
}

export function SquadMatrix() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  
  useEffect(() => {
    // Fetch squad matrix status
    const fetchWorkers = async () => {
      try {
        const response = await fetch('/api/squad-matrix/status');
        const data = await response.json();
        setWorkers(data.workers || []);
      } catch (error) {
        console.error('Failed to fetch workers:', error);
      }
    };
    
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 5000); // Update every 5s
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="grid grid-cols-5 gap-4">
      {workers.map(worker => (
        <Card key={worker.id} className="p-4">
          <h3 className="font-bold">{worker.name}</h3>
          <p className="text-sm text-muted-foreground">
            Status: {worker.status}
          </p>
          {worker.currentTask && (
            <p className="text-xs mt-2">{worker.currentTask}</p>
          )}
          {worker.progress !== undefined && (
            <div className="mt-2 h-2 bg-gray-200 rounded">
              <div 
                className="h-full bg-blue-500 rounded"
                style={{ width: `${worker.progress}%` }}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
```

**Validação:**
```bash
# Verificar se componente foi criado
ls -la src/components/squads/SquadMatrix.tsx

# Testar componente
npm run dev
# Abrir http://localhost:3002/squads
```

**Critérios de Sucesso:**
- [ ] Componente `SquadMatrix` criado
- [ ] 5 workers exibidos
- [ ] Status em tempo real (atualiza a cada 5s)
- [ ] Progress bars funcionando

**Tempo:** 20 minutos

---

### Passo 4.2: Criar Página /squads
**Ação:** Adicionar rota para Squad Matrix

**Arquivo:** `src/app/(dashboard)/squads/page.tsx`

**Código:**
```typescript
import { SquadMatrix } from '@/components/squads/SquadMatrix';

export default function SquadsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Squad Matrix</h1>
      <p className="text-muted-foreground mb-8">
        Múltiplas instâncias Aider paralelas sem filas - Ubiquidade do Intelecto
      </p>
      <SquadMatrix />
    </div>
  );
}
```

**Validação:**
```bash
# Verificar se página foi criada
ls -la src/app/\(dashboard\)/squads/page.tsx

# Testar rota
curl http://localhost:3002/squads
```

**Critérios de Sucesso:**
- [ ] Página `/squads` criada
- [ ] Título e descrição exibidos
- [ ] Componente SquadMatrix renderizado
- [ ] Rota acessível

**Tempo:** 10 minutos

---

### Passo 4.3: Integrar com Backend Squad Matrix
**Ação:** Conectar ao endpoint do backend

**Validação:**
```bash
# Verificar se backend tem endpoint
curl http://localhost:3001/api/squad-matrix/status

# Deve retornar JSON com workers
curl -s http://localhost:3001/api/squad-matrix/status | jq '.workers'
```

**Critérios de Sucesso:**
- [ ] Endpoint `/api/squad-matrix/status` existe
- [ ] Retorna array de workers
- [ ] Dados em tempo real
- [ ] Sem erros de CORS

**Tempo:** 15 minutos

---

## 📋 FASE 5: ESTRATÉGIA OPENROUTER MULTI-KEY

### Passo 5.1: Criar Componente ApiKeyRouter
**Ação:** Visualizar roteamento de API keys

**Arquivo:** `src/components/settings/ApiKeyRouter.tsx`

**Código:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ApiKey {
  id: string;
  type: 'paid' | 'free';
  model: string;
  usage: number;
  maxUsage: number;
  status: 'active' | 'rate_limited' | 'error';
}

export function ApiKeyRouter() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('/api/openrouter/keys');
        const data = await response.json();
        setKeys(data.keys || []);
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
      }
    };
    
    fetchKeys();
    const interval = setInterval(fetchKeys, 10000); // Update every 10s
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Estratégia de Roteamento</h2>
      <p className="text-muted-foreground">
        1 key paga + 5 keys gratuitas | Round-robin automático
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {keys.map(key => (
          <Card key={key.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{key.id}</h3>
              <Badge variant={key.type === 'paid' ? 'default' : 'secondary'}>
                {key.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Modelo: {key.model}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uso: {key.usage}/{key.maxUsage}</span>
                <span>{Math.round((key.usage / key.maxUsage) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div 
                  className={`h-full rounded ${
                    key.status === 'active' ? 'bg-green-500' :
                    key.status === 'rate_limited' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${(key.usage / key.maxUsage) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              Status: {key.status}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Validação:**
```bash
# Verificar se componente foi criado
ls -la src/components/settings/ApiKeyRouter.tsx

# Testar componente
npm run dev
# Abrir http://localhost:3002/settings
```

**Critérios de Sucesso:**
- [ ] Componente `ApiKeyRouter` criado
- [ ] 6 keys exibidas (1 paid + 5 free)
- [ ] Uso em tempo real
- [ ] Progress bars coloridas por status

**Tempo:** 30 minutos

---

## 📋 FASE 6: MÉTRICAS DE HOLDING AUTÔNOMA

### Passo 6.1: Criar Componente HoldingDashboard
**Ação:** Dashboard executivo com métricas financeiras

**Arquivo:** `src/components/dashboard/HoldingDashboard.tsx`

**Código:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HoldingMetrics {
  revenueActual: number;
  revenueTarget2026: number;
  revenueTarget2030: number;
  subsidiariesActive: number;
  subsidiariesPlanned: number;
  pcsManaged: number;
  autonomyLevel: number;
}

export function HoldingDashboard() {
  const [metrics, setMetrics] = useState<HoldingMetrics>({
    revenueActual: 0,
    revenueTarget2026: 500000,
    revenueTarget2030: 1000000000,
    subsidiariesActive: 0,
    subsidiariesPlanned: 5,
    pcsManaged: 3,
    autonomyLevel: 95,
  });
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/holding/metrics');
        const data = await response.json();
        setMetrics(data.metrics || metrics);
      } catch (error) {
        console.error('Failed to fetch holding metrics:', error);
      }
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const revenueProgress2026 = (metrics.revenueActual / metrics.revenueTarget2026) * 100;
  const revenueProgress2030 = (metrics.revenueActual / metrics.revenueTarget2030) * 100;
  const subsidiariesProgress = (metrics.subsidiariesActive / metrics.subsidiariesPlanned) * 100;
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Holding Autônoma - Dashboard Executivo</h2>
      
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Receita Atual
          </h3>
          <p className="text-3xl font-bold">{formatCurrency(metrics.revenueActual)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Meta 2026: {formatCurrency(metrics.revenueTarget2026)}
          </p>
          <Progress value={revenueProgress2026} className="mt-2" />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Subsidiárias
          </h3>
          <p className="text-3xl font-bold">
            {metrics.subsidiariesActive}/{metrics.subsidiariesPlanned}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Ativas / Planejadas
          </p>
          <Progress value={subsidiariesProgress} className="mt-2" />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            PCs Gerenciadas
          </h3>
          <p className="text-3xl font-bold">{metrics.pcsManaged}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Meta 2026: 10-20 PCs
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Autonomia
          </h3>
          <p className="text-3xl font-bold">{metrics.autonomyLevel}%</p>
          <p className="text-xs text-muted-foreground mt-2">
            Operação 24/7
          </p>
          <Progress value={metrics.autonomyLevel} className="mt-2" />
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Visão 2030</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Receita Meta 2030:</span>
            <span className="font-bold">{formatCurrency(metrics.revenueTarget2030)}</span>
          </div>
          <Progress value={revenueProgress2030} />
          <p className="text-xs text-muted-foreground">
            Progresso: {revenueProgress2030.toFixed(4)}%
          </p>
        </div>
      </Card>
    </div>
  );
}
```

**Validação:**
```bash
# Verificar se componente foi criado
ls -la src/components/dashboard/HoldingDashboard.tsx

# Testar componente
npm run dev
# Abrir http://localhost:3002/
```

**Critérios de Sucesso:**
- [ ] Componente `HoldingDashboard` criado
- [ ] 4 cards de métricas exibidos
- [ ] Progress bars funcionando
- [ ] Formatação de moeda correta (R$)
- [ ] Atualização a cada 30s

**Tempo:** 40 minutos

---

## 📋 RESUMO DE VALIDAÇÃO

### Checklist Geral
- [ ] FASE 1: Backup criado e validado
- [ ] FASE 2: Ambiente configurado e testado
- [ ] FASE 3: 30 agentes customizados funcionando
- [ ] FASE 4: Squad Matrix integrado
- [ ] FASE 5: API keys roteando corretamente
- [ ] FASE 6: Métricas de holding exibidas

### Próximas Fases (7-10)
- [ ] FASE 7: Integração Aider Terminal
- [ ] FASE 8: Backend customizado (50+ endpoints)
- [ ] FASE 9: UI/UX refinamento
- [ ] FASE 10: Testes e validação final

### Tempo Total Estimado
**Fases 1-6:** ~2 horas e 40 minutos  
**Fases 7-10:** ~2 horas e 45 minutos  
**Total:** ~5 horas e 25 minutos

---

**Status:** ⏸️ AGUARDANDO APROVAÇÃO PARA INICIAR  
**Criado por:** Kiro AI Assistant  
**Data:** 02/02/2026 23:50 UTC  
**Versão:** 1.0
