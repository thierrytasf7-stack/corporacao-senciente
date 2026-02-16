# Workflow START - Auto-cultivo e Evolução Autônoma

## Visão Geral

O Workflow START é o sistema que permite à corporação autônoma evoluir e se auto-cultivar continuamente. Ele executa ciclos completos de decisão, execução, validação e aprendizado.

## Modos de Operação

### Modo A: Automático (Loop Contínuo)

Executa continuamente em background sem intervenção humana:

```bash
node scripts/start_autocultivo.js auto
```

**Características:**
- Roda 24/7 em background
- Executa decisões automaticamente
- Valida e evolui continuamente
- Ideal para evolução contínua

### Modo B: Semi-automático (Com Feedback)

Executa decisões mas para para aprovação humana:

```bash
node scripts/start_autocultivo.js semi
```

**Características:**
- Executa boardroom
- Apresenta decisões e opções
- Aguarda aprovação humana
- Executa conforme escolha
- Feedback contínuo

## Fluxo do Workflow

```
1. Validar Checklist Pré-START
   ↓
2. Buscar Próximo Objetivo
   ↓
3. Boardroom (Agentes Decidem)
   ↓
4. Executar Decisão
   ↓
5. Validar Resultado
   ↓
6. Atualizar Memória e Evoluir
   ↓
7. Loop (volta ao passo 3)
```

## Checklist Pré-START

Antes de iniciar, o sistema valida:

- ✅ **Credenciais**: Variáveis de ambiente configuradas
- ✅ **RLS**: Conexão Supabase funcionando
- ✅ **Hooks**: Git hooks instalados
- ✅ **Seeds**: Memória corporativa populada

## Componentes

### `scripts/start_autocultivo.js`

Script principal que orquestra todo o workflow:

```javascript
import { executarStart } from './scripts/start_autocultivo.js';

await executarStart('auto'); // ou 'semi'
```

### `scripts/evolution_loop.js`

Loop de evolução contínua que mantém o sistema rodando:

```javascript
import { evolutionLoop } from './scripts/evolution_loop.js';

await evolutionLoop({
  mode: 'auto', // ou 'semi'
  objetivo: { key: 'AUP-123', summary: '...' },
  projectKey: 'AUP',
  spaceKey: 'AUP',
});
```

### `scripts/evolution_executor.js`

Executor que implementa as decisões do boardroom:

```javascript
import { evolutionExecutor } from './scripts/evolution_executor.js';

const resultado = await evolutionExecutor({
  decisao: { ... },
  objetivo: { ... },
  projectKey: 'AUP',
});
```

### `scripts/evolution_validator.js`

Validador que verifica resultados e alinhamento:

```javascript
import { evolutionValidator } from './scripts/evolution_validator.js';

const validacao = await evolutionValidator({
  resultado: { ... },
  objetivo: { ... },
});
```

## Uso

### Iniciar Workflow

```bash
# Modo automático
node scripts/start_autocultivo.js auto

# Modo semi-automático
node scripts/start_autocultivo.js semi
```

### Variáveis de Ambiente

```env
MODE=auto                    # Modo padrão (auto ou semi)
PROJECT_KEY=AUP             # Projeto Jira
SPACE_KEY=AUP               # Espaço Confluence
LOG_BOARDROOM=true          # Registrar decisões em agent_logs
```

## Integração

O workflow integra com:

- **Jira**: Cria e atualiza tasks automaticamente
- **Confluence**: Registra decisões e evolução
- **GitKraken**: Cria branches e PRs (se configurado)
- **Supabase**: Atualiza memória corporativa e agent_logs
- **Agentes**: Usa sistema de agentes com consciência corporativa

## Segurança e Guardrails

- Validação de alinhamento antes de executar
- Aprovação obrigatória para ações destrutivas (modo semi)
- RLS sempre respeitado
- Logs completos de todas as ações
- Rollback automático em caso de erro crítico

## Monitoramento

Use o dashboard para monitorar:

- Status do loop (rodando/parado)
- Iterações executadas
- Decisões tomadas
- Resultados das execuções
- Métricas de evolução

## Troubleshooting

### Loop não inicia

- Verificar checklist pré-START
- Verificar variáveis de ambiente
- Verificar conexão com Supabase

### Decisões não executam

- Verificar integração Jira/Confluence
- Verificar permissões API
- Verificar logs de erro

### Modo semi não mostra opções

- Verificar se modo está correto
- Verificar se boardroom gerou opções
- Verificar logs do evolution_loop

## Próximos Passos

1. Configurar modo desejado (auto/semi)
2. Executar workflow START
3. Monitorar via dashboard
4. Intervir quando necessário (modo semi)

























