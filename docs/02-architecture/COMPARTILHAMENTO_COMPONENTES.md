# Compartilhamento de Componentes

## Visão Geral

Sistema que permite compartilhamento seletivo de componentes/microservices entre empresas, com controle de permissões e rastreamento.

## Fluxo de Compartilhamento

```
Empresa A cria componente interessante
  ↓
Coordenador detecta
  ↓
Solicita permissão: "Compartilhar com outras empresas?"
  ↓
Se aprovado:
  - Adiciona ao catálogo global
  - Oferece para outras empresas
  - Empresa B pode escolher usar
```

## Detecção Automática

O coordenador monitora e detecta:

- Novos microservices criados
- Soluções que funcionaram bem
- Padrões interessantes
- Melhorias significativas

**Exemplo:**
```javascript
import { detectShareableComponents } from './scripts/orchestrator/sharing_engine.js';

const shareable = await detectShareableComponents('empresa-a');
```

## Permissão de Compartilhamento

### Opções de Permissão

1. **Automático** - Compartilha automaticamente (regras configuráveis)
2. **Solicitar aprovação** - Pergunta antes de compartilhar
3. **Manual** - Apenas quando explicitamente solicitado

### Solicitar Permissão

```javascript
import { requestSharingPermission } from './scripts/orchestrator/sharing_engine.js';

const approved = await requestSharingPermission(
  {
    instanceName: 'empresa-a',
    type: 'component',
    componentName: 'auth',
    description: 'Microservice de autenticação JWT',
  },
  ['empresa-b', 'empresa-c']
);
```

## Compartilhamento Manual

### Compartilhar Componente

```javascript
import { shareComponent } from './scripts/orchestrator/sharing_engine.js';

// Compartilhar componente específico
await shareComponent('auth', 'empresa-a', 'empresa-b');
```

### Sincronizar Mudanças

```javascript
import { syncInstanceChanges } from './scripts/orchestrator/sync_bidirectional.js';

// Sincronizar todas mudanças de uma instância
await syncInstanceChanges('empresa-a', {
  autoApprove: false,
  targetInstances: null, // null = todas as outras
});
```

## Memória Global

Componentes compartilhados também podem ser adicionados à memória vetorial global:

```javascript
import { addGlobalMemory } from './scripts/orchestrator/global_memory.js';

await addGlobalMemory({
  content: 'Solução de autenticação JWT que funcionou bem...',
  sourceInstance: 'empresa-a',
  category: 'solution',
  shared: true, // Disponível para todas empresas
});
```

## Rastreamento

### Origem

Cada componente rastreia:
- **sourceInstance** - Qual empresa criou
- **createdAt** - Quando foi criado
- **usageCount** - Quantas vezes foi usado
- **lastUsed** - Última vez que foi usado

### Estatísticas

```javascript
import { getCatalogStats } from './scripts/orchestrator/component_catalog.js';

const stats = getCatalogStats();
console.log(stats.mostUsed); // Componentes mais usados
console.log(stats.bySource); // Por empresa origem
```

## Versionamento

Componentes compartilhados podem ter versões:

```javascript
addComponent({
  name: 'auth',
  version: '1.2.0', // Nova versão
  sourceInstance: 'empresa-a',
  // ...
});
```

O coordenador pode:
- Sugerir atualização para outras empresas
- Manter múltiplas versões
- Rastrear compatibilidade

## Segurança

### Isolamento

- Dados sempre isolados por empresa
- Configurações por empresa
- Apenas código compartilhado

### Permissões

- Compartilhamento requer permissão explícita
- Rastreamento de origem obrigatório
- Logs de todos compartilhamentos

### Privacidade

- Empresa pode recusar compartilhamento
- Empresa pode remover componente compartilhado
- Dados sensíveis nunca compartilhados

## Exemplo Completo

```javascript
import {
  addComponent,
  shareComponent,
  syncInstanceChanges,
} from './scripts/orchestrator/index.js';

// 1. Empresa A cria microservice
addComponent({
  name: 'payment',
  description: 'Gateway de pagamento',
  sourceInstance: 'empresa-a',
  category: 'payment',
  path: 'microservices/payment',
});

// 2. Coordenador detecta e sugere compartilhamento
// (automaticamente ou manualmente)

// 3. Compartilhar com Empresa B
await shareComponent('payment', 'empresa-a', 'empresa-b');

// 4. Ou sincronizar todas mudanças
await syncInstanceChanges('empresa-a', {
  autoApprove: true,
});
```

## Boas Práticas

1. **Documentar bem** - Componente precisa ser entendível
2. **Testar antes** - Validar que funciona antes de compartilhar
3. **Configurações isoladas** - Não hardcode valores específicos
4. **Versionar** - Usar versionamento semântico
5. **Rastrear uso** - Monitorar impacto do compartilhamento

---

**Referências:**
- [ORQUESTRADOR_CENTRAL.md](ORQUESTRADOR_CENTRAL.md)
- [MICROSERVICES.md](MICROSERVICES.md)
- [MEMORIA_GLOBAL.md](MEMORIA_GLOBAL.md)

























