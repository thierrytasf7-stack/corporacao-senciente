# Validadores de Consistência

## Propósito

Validadores garantem que inputs e decisões sejam consistentes com os axiomas da Truth Base.

## Uso

### Importação

```typescript
import { ConsistencyValidator, InputSource, validateInput } from './consistency-validator';
```

### Validação Rápida

```typescript
const result = await validateInput('usar docker para deployment', InputSource.AI);

if (!result.valid) {
  console.log('Violação detectada:', result.violations);
}
```

### Validação Completa

```typescript
const validator = new ConsistencyValidator();
await validator.initialize();

const result = await validator.validate(input, InputSource.AI);
console.log(validator.formatResult(result));

// Salvar log
await validator.saveValidationLog(result, 'Análise de proposta de arquitetura');
```

## Input Sources

- **CREATOR**: Inputs do Criador - sempre válidos (log apenas)
- **AI**: Inputs gerados por IA - validados contra axiomas
- **SYSTEM**: Inputs automáticos do sistema - validados

## Severidades

- **CRITICAL**: Violação de axioma - bloqueia execução
- **WARNING**: Inconsistência potencial - alerta mas permite
- **INFO**: Sugestão de melhoria - informativo

## Logs

Logs de validação são salvos em `validators/logs/` no formato JSON:

```json
{
  "valid": false,
  "source": "AI",
  "violations": [...],
  "timestamp": "2026-02-14T...",
  "context": "Análise de proposta"
}
```

## Integração

### Em Agents

Agents devem validar propostas antes de implementar:

```typescript
const result = await validateInput(proposal, InputSource.AI);
if (!result.valid) {
  // Ajustar proposta ou consultar Criador
}
```

### Em Workflows

Workflows podem incluir gate de validação:

```yaml
- step: validate_consistency
  tool: consistency_validator
  blocking: true  # Bloqueia em CRITICAL
```
