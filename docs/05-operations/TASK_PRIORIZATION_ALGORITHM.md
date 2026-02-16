# Algoritmo de Priorização de Tasks

## Visão Geral

O sistema de priorização de tasks da Corporação Senciente utiliza um algoritmo inteligente que considera dependências entre tasks, impacto no sistema e urgência temporal para determinar a ordem ideal de execução.

## Componentes do Algoritmo

### 1. Fatores de Priorização

#### Prioridade Base (0.0 - 1.0)
- **0.0**: Prioridade mínima (tasks de manutenção)
- **0.5**: Prioridade padrão (tasks normais)
- **1.0**: Prioridade máxima (tasks críticas)

#### Fatores Considerados:
1. **Número de Dependentes** (peso: 30%)
   - Tasks que muitas outras tasks dependem têm maior prioridade
   - Fórmula: `dependents_count * 0.3`

2. **Profundidade da Árvore de Dependências** (peso: 20%)
   - Tasks no início da cadeia de dependências têm prioridade
   - Fórmula: `dependency_depth * 0.2`

3. **Idade da Task** (peso: 10%)
   - Tasks mais antigas ganham prioridade gradual
   - Máximo de bônus: +0.1 após 7 dias

4. **Tipo de Task** (peso: 40%)
   - **Crítico/Segurança**: +0.4
   - **Deploy/Produção**: +0.3
   - **Testes**: +0.2
   - **Manutenção**: +0.1
   - **Desenvolvimento**: 0.0 (padrão)

### 2. Cálculo da Prioridade Final

```
prioridade_final = 0.5 + (dependentes * 0.3) + (profundidade * 0.2) + bonus_tipo + bonus_idade
prioridade_final = Math.min(1.0, Math.max(0.0, prioridade_final))
```

### 3. Sistema de Dependências

#### Tipos de Dependências:
- **Hard Dependencies**: Task B só pode executar após Task A ser concluída
- **Soft Dependencies**: Task B é beneficiada se Task A for executada primeiro, mas pode executar sem ela

#### Detecção de Ciclos:
- Algoritmo DFS (Depth-First Search) para detectar deadlocks
- Prevenção automática de dependências circulares
- Alerta quando ciclo é detectado

### 4. Ordenação Topológica

#### Algoritmo de Kahn:
1. Identificar tasks sem dependências (grau de entrada = 0)
2. Executar essas tasks
3. Remover arestas das tasks concluídas
4. Repetir até todas as tasks serem executadas
5. Se restarem tasks não executadas, há ciclo

## Implementação Técnica

### Classes Principais

#### `TaskDependencyManager`
- Gerencia relacionamentos entre tasks
- Calcula prioridades baseadas em dependências
- Detecta deadlocks

#### `TaskScheduler`
- Coordena execução considerando dependências
- Implementa algoritmo de priorização completo
- Fornece estatísticas do sistema

### Métodos Chave

```javascript
// Adicionar dependência
await dependencyManager.addDependency(taskId, dependencyId);

// Verificar se pode executar
const canExecute = await dependencyManager.canExecute(taskId);

// Calcular prioridade
const priority = await dependencyManager.calculatePriority(taskId);

// Obter ordem de execução
const executionOrder = await dependencyManager.getExecutionOrder(taskIds);

// Detectar deadlocks
const deadlocks = await dependencyManager.detectDeadlocks();
```

## Cenários de Exemplo

### Cenário 1: Pipeline de Deploy
```
Task A: Preparar ambiente (prioridade: 0.8)
├── Task B: Instalar dependências (prioridade: 0.9)
├── Task C: Configurar banco (prioridade: 0.9)
└── Task D: Executar testes (prioridade: 1.0)
    └── Task E: Deploy para produção (prioridade: 1.0)
```

**Ordem de execução**: A → B,C → D → E

### Cenário 2: Correção de Segurança Crítica
```
Task X: Correção de segurança (prioridade: 1.0) [INDEPENDENTE]
Task Y: Atualização de dependências (prioridade: 0.7)
```

**Ordem de execução**: X (segurança crítica) → Y

## Monitoramento e Métricas

### Métricas Coletadas:
- Número total de tasks
- Tasks por status (pending, in_progress, done, failed)
- Média de prioridade das tasks ativas
- Número de deadlocks detectados
- Tempo médio de execução por tipo de task

### Alertas Automáticos:
- Deadlocks detectados
- Tasks com prioridade > 0.9 não executadas por > 24h
- Aumento significativo no número de dependências

## Otimização Contínua

### Recalculo Automático:
- Após cada task concluída
- Diariamente às 2:00 AM
- Quando novas dependências são adicionadas

### Cache Inteligente:
- Cache de dependências por 5 minutos
- Invalidação automática quando dependências mudam
- Cache de prioridades por 10 minutos

## Troubleshooting

### Problemas Comuns:

#### 1. Task Não Executa
**Sintomas**: Task permanece em "pending" indefinidamente
**Causas**: Dependências não resolvidas
**Solução**: Verificar `canExecute()` e status das dependências

#### 2. Prioridades Inconsistentes
**Sintomas**: Tasks importantes com baixa prioridade
**Causas**: Cálculo incorreto de dependentes
**Solução**: Executar `recalculateAllPriorities()`

#### 3. Deadlock Detectado
**Sintomas**: Sistema alerta sobre ciclo de dependências
**Causas**: Dependências circulares criadas
**Solução**: Remover dependência problemática usando `removeDependency()`

## Testes e Validação

### Testes Automatizados:
- `test_task_dependencies.js`: Testa funcionalidades básicas
- `test_complex_priorization.js`: Testa cenários complexos
- Validação diária de integridade das dependências

### Cenários de Teste:
1. **Dependências simples**: A → B → C
2. **Dependências paralelas**: A → B,C → D
3. **Ciclos detectados**: A → B → C → A (deve falhar)
4. **Priorização complexa**: 8+ tasks com múltiplas dependências

## Conclusão

O algoritmo de priorização garante que:
- ✅ Tasks críticas são executadas primeiro
- ✅ Dependências são sempre respeitadas
- ✅ Deadlocks são prevenidos automaticamente
- ✅ Sistema se adapta dinamicamente
- ✅ Performance é otimizada continuamente

Este sistema transforma o gerenciamento de tasks de uma abordagem reativa para uma execução inteligente e proativa.
