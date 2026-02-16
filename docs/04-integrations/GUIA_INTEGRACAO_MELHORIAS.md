# 📘 Guia de Integração das Melhorias

Como integrar os novos módulos (logger, error handler, validação, etc.) nos scripts existentes.

## 1. Logger Estruturado

### Importação Básica
```javascript
import { logger } from './utils/logger.js';
```

### Uso Básico
```javascript
logger.info('Mensagem informativa');
logger.warn('Aviso');
logger.error('Erro', { metadata: { campo: 'valor' } });
logger.debug('Debug (só aparece se LOG_LEVEL=DEBUG)');
```

### Logger com Contexto
```javascript
const childLogger = logger.child({ 
  module: 'meu-modulo',
  operation: 'minha-operacao',
});

childLogger.info('Mensagem com contexto automático');
```

## 2. Error Handler

### Importação
```javascript
import { 
  withErrorHandling,
  retryWithBackoff,
  ErrorTypes 
} from './utils/error_handler.js';
```

### Wrapper Automático
```javascript
// Antes
async function minhaFuncao() {
  // código
}

// Depois
const minhaFuncao = withErrorHandling(async () => {
  // código
}, {
  module: 'meu-modulo',
  operation: 'minha-operacao',
});
```

### Retry com Backoff
```javascript
const resultado = await retryWithBackoff(async () => {
  return await chamadaAPI();
}, {
  maxRetries: 3,
  retryableErrors: [ErrorTypes.NETWORK, ErrorTypes.TIMEOUT],
});
```

## 3. Validação de Configuração

### Importação
```javascript
import { 
  validateCerebroConfig,
  validateOrgaoConfig,
  printValidationResult 
} from './utils/config_validator.js';
```

### Uso no Início do Script
```javascript
// Validar configuração
const configResult = validateCerebroConfig();
if (!configResult.valid) {
  logger.error('Configuração inválida', { errors: configResult.errors });
  printValidationResult(configResult);
  process.exit(1);
}

if (configResult.warnings.length > 0) {
  logger.warn('Avisos na configuração', { warnings: configResult.warnings });
}
```

## 4. Métricas

### Importação
```javascript
import { metrics, measurePerformance } from './utils/metrics.js';
```

### Contadores
```javascript
metrics.increment('operacoes_processadas');
metrics.increment('erros', 5); // incrementa por 5
```

### Performance
```javascript
const startTime = Date.now();
// ... operação ...
const duration = Date.now() - startTime;
metrics.recordPerformance('nome_operacao', duration, {
  success: true,
  customField: 'valor',
});
```

### Wrapper de Performance
```javascript
const minhaFuncao = measurePerformance('minha_operacao', async () => {
  // código
});
```

### API Calls
```javascript
const startTime = Date.now();
const response = await fetch(url);
const duration = Date.now() - startTime;
metrics.recordAPICall('servico-api', response.status, duration);
```

## 5. Security Validator

### Importação
```javascript
import {
  sanitizeString,
  validateEmail,
  validateURL,
  validateSafeId,
  rateLimiter,
} from './utils/security_validator.js';
```

### Sanitização
```javascript
const inputSeguro = sanitizeString(userInput);
const objetoSeguro = sanitizeObject(userObject);
```

### Validação
```javascript
const emailResult = validateEmail(email);
if (!emailResult.valid) {
  throw new Error(emailResult.reason);
}

const idResult = validateSafeId(id);
if (!idResult.valid) {
  return { error: idResult.reason };
}
```

### Rate Limiting
```javascript
const limit = rateLimiter.check(userId);
if (!limit.allowed) {
  throw new Error('Rate limit excedido');
}
```

## 6. Health Checks

### Importação
```javascript
import { 
  checkSystemHealth,
  checkSupabaseHealth,
  printHealthCheckResults 
} from './utils/health_check.js';
```

### Uso
```javascript
const health = await checkSystemHealth();
if (health.status !== 'healthy') {
  logger.warn('Sistema degradado', { health });
}
```

## Exemplo Completo de Integração

```javascript
import { logger } from './utils/logger.js';
import { metrics } from './utils/metrics.js';
import { validateCerebroConfig } from './utils/config_validator.js';
import { withErrorHandling, retryWithBackoff } from './utils/error_handler.js';
import { sanitizeString } from './utils/security_validator.js';

// Validar configuração no início
const configResult = validateCerebroConfig();
if (!configResult.valid) {
  logger.error('Config inválida', { errors: configResult.errors });
  process.exit(1);
}

const log = logger.child({ module: 'meu-script' });

// Função com error handling e métricas
const processarDados = withErrorHandling(async (input) => {
  log.info('Processando dados', { inputLength: input.length });
  
  // Sanitização
  const sanitized = sanitizeString(input);
  
  // Operação com retry
  const resultado = await retryWithBackoff(async () => {
    return await chamadaAPI(sanitized);
  });
  
  // Métricas
  metrics.increment('dados_processados');
  metrics.recordPerformance('processar_dados', Date.now() - start);
  
  log.info('Processamento concluído', { resultado });
  return resultado;
}, {
  module: 'meu-script',
  operation: 'processar_dados',
});

// Execução
async function main() {
  try {
    const resultado = await processarDados('entrada');
    console.log('Sucesso:', resultado);
  } catch (error) {
    log.error('Falha no processamento', { error: error.message });
    process.exit(1);
  }
}

main();
```

## Padrões Recomendados

1. **Sempre validar config no início** do script
2. **Usar logger em vez de console.log** para logs estruturados
3. **Envolver operações críticas** com `withErrorHandling`
4. **Usar retry** para operações de rede
5. **Registrar métricas** em operações importantes
6. **Sanitizar inputs** antes de processar
7. **Usar child loggers** para contexto

## Ver Exemplo Completo

Execute:
```bash
node scripts/exemplo_integracao_melhorias.js
```

---

**Última atualização:** 2025-01-13

























