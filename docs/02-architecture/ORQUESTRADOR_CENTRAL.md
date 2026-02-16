# Orquestrador Central - Coordenador Multi-Instância

## Visão Geral

O **Orquestrador Central** é o "cérebro" que coordena múltiplas empresas autônomas isoladas, permitindo:

- Monitoramento de todas as instâncias
- Compartilhamento seletivo de componentes/microservices
- Memória vetorial global agregada
- Coordenação cross-empresa

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│         COORDENADOR CENTRAL (Cérebro)               │
│  - Memória vetorial global                          │
│  - Catálogo de microservices                        │
│  - Permissões de compartilhamento                   │
│  - Rastreamento cross-empresa                       │
└───────────────┬─────────────────────────────────────┘
                │
    ┌───────────┼───────────┬───────────┐
    │           │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│Empresa│  │Empresa│  │Empresa│  │Empresa│
│   A   │  │   B   │  │   C   │  │   N   │
└───────┘  └───────┘  └───────┘  └───────┘
```

## Componentes

### 1. Core (`scripts/orchestrator/core.js`)

Coordenador central que:
- Inicializa e monitora todas as instâncias
- Executa ciclos de coordenação
- Detecta padrões cross-empresa
- Gerencia status geral

**Uso:**
```javascript
import { initializeCoordinator, startCoordinationLoop } from './scripts/orchestrator/core.js';

// Inicializar
await initializeCoordinator();

// Iniciar loop contínuo
await startCoordinationLoop(60000); // Intervalo de 60s
```

### 2. Instance Manager (`scripts/orchestrator/instance_manager.js`)

Gerencia instâncias (empresas):
- Lista empresas disponíveis
- Carrega contexto de cada empresa
- Valida configurações
- Obtém estatísticas

**Uso:**
```javascript
import { listInstances, loadInstanceContext } from './scripts/orchestrator/instance_manager.js';

// Listar todas
const instances = listInstances();

// Carregar contexto de uma
const context = await loadInstanceContext('empresa-a');
```

### 3. Component Catalog (`scripts/orchestrator/component_catalog.js`)

Catálogo de microservices reutilizáveis:
- Gerencia componentes disponíveis
- Rastreia origem e versões
- Estatísticas de uso

**Uso:**
```javascript
import { listComponents, addComponent } from './scripts/orchestrator/component_catalog.js';

// Listar componentes
const components = listComponents();

// Adicionar novo
addComponent({
  name: 'auth',
  description: 'Autenticação',
  sourceInstance: 'empresa-a',
  category: 'auth',
  path: 'microservices/auth',
});
```

### 4. Sharing Engine (`scripts/orchestrator/sharing_engine.js`)

Motor de compartilhamento:
- Detecta componentes compartilháveis
- Solicita permissão
- Copia/adapta entre empresas

**Uso:**
```javascript
import { shareComponent } from './scripts/orchestrator/sharing_engine.js';

// Compartilhar componente
await shareComponent('auth', 'empresa-a', 'empresa-b');
```

### 5. Global Memory (`scripts/orchestrator/global_memory.js`)

Memória vetorial global:
- Agrega aprendizados de todas empresas
- Busca cross-empresa
- Sugere compartilhamentos

**Uso:**
```javascript
import { addGlobalMemory, searchGlobalMemory } from './scripts/orchestrator/global_memory.js';

// Adicionar aprendizado
await addGlobalMemory({
  content: 'Solução que funcionou bem...',
  sourceInstance: 'empresa-a',
  category: 'solution',
  shared: true,
});

// Buscar
const results = await searchGlobalMemory('autenticação segura');
```

### 6. Sync Engine (`scripts/orchestrator/sync_bidirectional.js`)

Sincronização bidirecional:
- Detecta mudanças significativas
- Solicita permissão
- Propaga mudanças

**Uso:**
```javascript
import { syncInstanceChanges } from './scripts/orchestrator/sync_bidirectional.js';

// Sincronizar mudanças de uma instância
await syncInstanceChanges('empresa-a', {
  autoApprove: false,
  targetInstances: ['empresa-b', 'empresa-c'],
});
```

## Memória Vetorial Global

A memória global é armazenada em `orchestrator_global_memory` (Supabase):

- **content**: Texto do aprendizado
- **embedding**: Vetor 384d
- **source_instance**: Empresa origem
- **category**: pattern | solution | component | insight | best_practice
- **shared**: Se está disponível para compartilhamento

**Busca:**
```sql
SELECT * FROM match_global_memory(
  query_embedding := '[384d vector]',
  match_count := 5,
  filter_category := 'solution',
  only_shared := true
);
```

## Fluxo de Coordenação

```
1. Coordenador monitora todas empresas
   ↓
2. Detecta padrões/soluções interessantes
   ↓
3. Pergunta: "Empresa X tem solução Y. Copiar para Z?"
   ↓
4. Se aprovado: Copia componente/microservice
   ↓
5. Atualiza memória global com aprendizado
```

## Scripts NPM

```bash
# Criar nova instância
npm run instance:create <nome>

# Listar instâncias
npm run instance:list

# Clonar dados entre instâncias
npm run instance:clone <source> <target>
```

## Integração com Evolution Loop

O orquestrador pode ser integrado com `evolution_loop.js`:

```javascript
import { coordinator } from './scripts/orchestrator/index.js';

// Após cada iteração de evolução, agregar aprendizado
await coordinator.globalMemory.addGlobalMemory({
  content: aprendizado,
  sourceInstance: instanceName,
  category: 'insight',
});
```

## Segurança

- Dados isolados por padrão
- Compartilhamento apenas com permissão explícita
- Rastreamento de origem (qual empresa criou)
- Versionamento de componentes compartilhados
- RLS no Supabase para memória global

## Métricas

- Número de componentes compartilhados
- Taxa de reutilização de microservices
- Cross-empresa learning rate
- Eficiência do coordenador
- Estatísticas de memória global

## Próximos Passos

Ver documentação de robustização senciente para capacidades avançadas:
- Auto-percepção
- Evolução emergente
- Comunicação ecossistêmica
- Etc.

---

**Referências:**
- [ARQUITETURA_MULTI_INSTANCIA.md](ARQUITETURA_MULTI_INSTANCIA.md)
- [MICROSERVICES.md](MICROSERVICES.md)
- [ROBUSTIZACAO_SENCIENTE.md](ROBUSTIZACAO_SENCIENTE.md)

























