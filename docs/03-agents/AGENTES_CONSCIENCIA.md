# Agentes com Consciência Corporativa

## Visão Geral

Sistema de agentes que "pensam como Aupoeises" através da consciência corporativa carregada da memória vetorial. Cada agente tem acesso à missão, valores, guardrails e objetivos da empresa, garantindo decisões alinhadas.

## Estrutura

```
scripts/agents/
├── consciencia_corporativa.js  # Módulo de consciência (busca memória vetorial)
├── agent_base.js               # Classe base para todos os agentes
└── index.js                    # Exports e factory functions
```

## Módulo de Consciência

### `consciencia_corporativa.js`

**Funções principais:**

- `buscarMemoriaCorporativa(query, categories, limit)` - Busca memórias relevantes
- `obterMissao()` - Obtém missão da empresa
- `obterValoresEGuardrails()` - Obtém valores e guardrails
- `obterObjetivosLongoPrazo()` - Obtém objetivos de longo prazo
- `obterConscienciaCompleta(contexto)` - Obtém tudo de uma vez
- `gerarPromptSystem(role, contexto)` - Gera prompt system para agentes
- `validarAlinhamento(decisao, threshold)` - Valida se decisão está alinhada

**Exemplo:**

```javascript
import { obterConscienciaCompleta } from './agents/index.js';

const consciencia = await obterConscienciaCompleta('implementar login social');

console.log(consciencia.missao);
console.log(consciencia.valores);
console.log(consciencia.memoriasRelevantes);
```

## Agentes Disponíveis

### Architect (CTO)
- **Foco:** Segurança, arquitetura, RLS, custos/latência
- **Tom:** Crítico, prioriza segurança

### Product (Visionário)
- **Foco:** Valor para usuário, UX, inovação
- **Tom:** Agressivo em UX, propõe inovação

### Dev (Desenvolvedor)
- **Foco:** Execução, qualidade, testes, performance
- **Tom:** Balance velocidade e qualidade

### DevEx
- **Foco:** Automação, onboarding, DX
- **Tom:** Facilitador, automação primeiro

### Metrics
- **Foco:** DORA, custos LLM, observabilidade
- **Tom:** Data-driven, otimização

### Entity
- **Foco:** Cadastros, autorizações, compliance
- **Tom:** Organizador, segurança de acesso

## Uso

### Criar um Agente

```javascript
import { criarAgente } from './agents/index.js';

const architect = criarAgente('architect');
```

### Gerar Opinião

```javascript
const topic = 'Implementar sistema de autocura de código';

const resultado = await architect.analisarERegistrar(topic);

console.log(resultado.opiniao);
console.log(resultado.validacao);
```

### Validar Alinhamento

```javascript
const decisao = 'Vamos implementar login social sem 2FA por enquanto';

const validacao = await architect.validarDecisao(decisao);

if (!validacao.alinhado) {
  console.warn('Decisão não alinhada!', validacao.aviso);
}
```

### Usar Todos os Agentes

```javascript
import { criarTodosAgentes } from './agents/index.js';

const agentes = criarTodosAgentes();

const topic = 'Implementar feature X';

const [arch, prod, dev] = await Promise.all([
  agentes.architect.gerarOpiniao(topic),
  agentes.product.gerarOpiniao(topic),
  agentes.dev.gerarOpiniao(topic),
]);

console.log('Architect:', arch);
console.log('Product:', prod);
console.log('Dev:', dev);
```

## Integração com Boardroom

Os agentes podem ser usados no boardroom existente:

```javascript
import { criarTodosAgentes } from './agents/index.js';

const agentes = criarTodosAgentes();
const topic = process.argv[2] || 'Implementar feature';

const [archOpinion, prodOpinion, devOpinion] = await Promise.all([
  agentes.architect.analisarERegistrar(topic),
  agentes.product.analisarERegistrar(topic),
  agentes.dev.analisarERegistrar(topic),
]);

// Usar opiniões para síntese final...
```

## Validação de Alinhamento

Cada agente valida automaticamente se suas decisões estão alinhadas com valores corporativos:

```javascript
const resultado = await architect.analisarERegistrar(topic);

if (resultado.validacao.alinhado) {
  console.log('✅ Decisão alinhada com valores');
} else {
  console.warn('⚠️ Decisão pode não estar alinhada:', resultado.validacao.aviso);
}
```

## Registro de Decisões

Quando `LOG_BOARDROOM=true` no env, as decisões são registradas em `agent_logs`:

```javascript
await architect.registrarDecisao('Opinião sobre feature X', embeddingVector);
```

## Configuração

### Variáveis de Ambiente

```env
# LLM
GROK_API_KEY=...
GEMINI_API_KEY=...  # Fallback
GROK_MODEL=grok-beta
GEMINI_MODEL=gemini-1.5-flash

# Supabase (para memória vetorial)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Embeddings
MCP_EMBEDDING_MODEL=Xenova/bge-small-en-v1.5

# Logging
LOG_BOARDROOM=true  # Registra decisões em agent_logs
```

## Teste

```bash
node scripts/test_agentes_consciencia.js
```

Isso testa:
1. Consciência corporativa (busca memória vetorial)
2. Agentes gerando opiniões (se LLM configurado)
3. Validação de alinhamento

## Próximos Passos

1. ✅ Módulo de consciência criado
2. ✅ Agentes base criados
3. ⏳ Integrar com boardroom existente
4. ⏳ Adicionar mais agentes (DevEx, Metrics, Entity)
5. ⏳ Melhorar validação de alinhamento
6. ⏳ Adicionar métricas de qualidade de decisões

























