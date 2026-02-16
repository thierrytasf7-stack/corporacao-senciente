# AIOS + AIDER - Sistema Agentico de Desenvolvimento

> 🚀 Desenvolvimento com IA Gratuita via OpenRouter + Aider CLI

## Overview

**AIOS + AIDER** é um sistema integrado que combina:
- **AIOS Core**: Framework de orquestração de agentes IA
- **Aider CLI**: Editor de código assistido por IA
- **OpenRouter Free Models**: Modelos LLM gratuitos de alta qualidade

Use para desenvolvimento **sem custos** mantendo qualidade profissional.

## Quick Start

### 1. Configurar API Key

```bash
# Obter chave gratuita em: https://openrouter.ai
export OPENROUTER_API_KEY=sk-or-v1-...
```

**Windows:**
```batch
set OPENROUTER_API_KEY=sk-or-v1-...
```

### 2. Iniciar Sistema

```bash
cd aios-core
./start-aios-aider.bat
```

### 3. Ver Agentes

```
/agents
```

Escolha um agente com `/1`, `/2`, etc., ou `/agent <nome>`

## Modelos Disponíveis (Gratuitos)

| Modelo | Contexto | Melhor Para |
|--------|----------|-------------|
| `arcee-ai/trinity-large-preview:free` | ~4k tokens | **Padrão** - Tarefas gerais |
| `qwen/qwen2.5-7b-instruct:free` | ~8k tokens | Mais contexto, análises |
| `deepseek/deepseek-r1-distill-qwen-1.5b:free` | ~4k tokens | Debugging, lógica |

## Estrutura do Projeto

```
AIDER-AIOS/
├── aios-core/                          # Core do sistema
│   ├── aider_aios_wrapper.py            # Wrapper principal (injeção AIOS)
│   ├── start-aios-aider.bat             # Script de inicialização
│   ├── .aios-core/                      # Framework AIOS
│   │   ├── core/                        # Orquestração
│   │   ├── development/agents/          # Agentes AIOS
│   │   └── squad-command.py             # Interface de squads
│   ├── squads/                          # Squads especializados
│   │   └── aider-squad/                 # Squad de otimização Aider
│   │       ├── agents/
│   │       │   ├── aider-dev.md
│   │       │   └── aider-optimizer.md
│   │       └── data/optimization-guide.md
│   └── package.json                     # Dependências Node.js
├── aios-squads-main/                   # Squads adicionais
├── mcp-ecosystem-main/                 # MCP ecosystem
└── README.md                            # Este arquivo
```

## Agentes Principais

### 🤖 Agentes AIOS Natively Integrated

Todos os 12 agentes do AIOS Core estão disponíveis:

- `@analyst` - Análise de requisitos
- `@architect` - Design técnico
- `@dev` - Implementação
- `@pm` - Product Management
- `@po` - Product Owner
- `@qa` - Quality Assurance
- `@sm` - Scrum Master
- `@ux-design-expert` - UX/UI
- E mais...

### ⚡ Squad Especializado: aider-squad

Agentes especializados em otimização com modelos gratuitos:

- **aider-dev**: Desenvolvimento via Aider
- **aider-optimizer**: Otimização de tokens e prompts

## Comandos Principais

### Agentes

```
/agents                     # Listar todos os agentes
/agent architect            # Ativar agente específico
/1, /2, /3...              # Ativar por número
```

### Aider (Nativo)

```
/add <arquivo>             # Adicionar arquivo ao contexto
/drop <arquivo>            # Remover do contexto
/diff                      # Ver mudanças pendentes
/commit                    # Fazer commit
/undo                      # Desfazer última mudança
/help                      # Ajuda Aider
```

### Squads

```
/squad list                # Ver squads disponíveis
/squad aider-squad         # Ativar squad
```

## Workflow Recomendado

```
1. /agents                 ← Ver agentes disponíveis
2. /agent architect        ← Ativar agente específico
3. "Descreva seu projeto"  ← Pedir análise
4. /add src/main.py        ← Adicionar arquivo
5. "Implemente função X"   ← Pedir mudança
6. /diff                   ← Verificar mudanças
7. /commit                 ← Salvar
8. /drop src/main.py       ← Liberar contexto
```

## Otimização para Modelos Gratuitos

### 1. Um Arquivo Por Vez

```bash
# ✅ CORRETO
/add src/main.py
"Adicione função sum(a, b)"
/commit
/drop src/main.py
/add src/utils.py

# ❌ ERRADO
/add src/main.py
/add src/utils.py
/add src/config.py
```

### 2. Prompts Curtos e Diretos

```
# ✅ CORRETO
"Adicione função sum(a, b) -> int"

# ❌ ERRADO
"Eu gostaria que você pudesse criar uma função que seja capaz de..."
```

### 3. Commits Frequentes

```
Após CADA mudança:
/diff
/commit
```

### 4. Liberar Contexto

```
/drop arquivo.py  ← Após terminar
```

## Configuração Avançada

### Usar Modelo Diferente

Edite `start-aios-aider.bat` e mude a linha:

```batch
--model openrouter/qwen/qwen2.5-7b-instruct:free
```

### Aumentar Contexto

```batch
--max-chat-history-tokens 4096  ← Padrão é 2048
```

### Usar Squad Específico

```
/agent aider-optimizer
"Como otimizar meu prompt?"
```

## Troubleshooting

### "Resposta cortada"
- Contexto cheio
- Use `/drop` em arquivos não necessários
- Reduza tamanho do arquivo

### "Não entendeu o pedido"
- Prompt muito vago
- Seja mais específico
- Referencie linhas: "Na linha 42, troque X por Y"

### "Mudança errada"
- Use `/undo` imediatamente
- Reformule o pedido
- Use `/agent architect` para revisar

### API Key não funciona
- Verificar valor em `start-aios-aider.bat`
- Regenerar chave em https://openrouter.ai
- Testar com `curl` antes

## Comparação: Claude Code vs AIOS+Aider

| Aspecto | Claude Code | AIOS+Aider |
|---------|------------|-----------|
| **Custo** | Pago | **Gratuito** |
| **Contexto** | Grande (200k) | Limitado (4-8k) |
| **Qualidade** | Excelente | Boa |
| **IDE** | VS Code, etc | **Terminal** |
| **Uso** | Projetos grandes | Tarefas pontuais |

## Quando Usar Cada Um

### ✅ Use AIOS+Aider para:
- Tarefas pequenas e pontuais
- Correções rápidas
- Quando não quer gastar tokens
- Desenvolvimento exploratório

### ❌ Prefira Claude Code para:
- Projetos complexos
- Muito contexto necessário
- Qualidade crítica
- Refatorações grandes

## Documentação Completa

- **Guia de Otimização**: `aios-core/squads/aider-squad/data/optimization-guide.md`
- **README Aider Squad**: `aios-core/squads/aider-squad/README.md`
- **AIOS Core**: `aios-core/README.md`

## Suporte

### Verificar Status

```bash
cd aios-core
node scripts/doctor.js
```

### Reinstalar Dependências

```bash
cd aios-core
npm install
```

### Debug

```bash
set AIOS_DEBUG=true
./start-aios-aider.bat
```

## Exemplos de Uso

### Exemplo 1: Criar Função Simples

```
$ /agent dev
$ /add src/math.py
$ "Adicione função fibonacci(n: int) -> list"
$ /diff
$ /commit
$ /drop src/math.py
```

### Exemplo 2: Debug com Especialista

```
$ /agent architect
$ /add src/complex-logic.py
$ "Revise a lógica da função process_data na linha 50"
$ /add tests/test.py
$ "Sugira testes para validar"
```

### Exemplo 3: Otimizar Tokens

```
$ /agent aider-optimizer
$ "Como otimizar meu prompt para economizar tokens?"
$ "Tenho 4 arquivos, contexto está cheio"
```

## Notas Importantes

1. **Chaves Sensíveis**: As chaves no `start-aios-aider.bat` são de teste. Substitua pelas suas próprias.

2. **OpenRouter Limits**: Modelos gratuitos têm rate limits. Aguarde entre requisições se necessário.

3. **Qualidade**: Modelos gratuitos são bons, mas não tão poderosos quanto Claude/GPT-4. Seja específico nos prompts.

4. **Git Integration**: Aider rastreia tudo em Git. Faça commits frequentes.

5. **MCP Ecosystem**: MCPs adicionais estão disponíveis em `mcp-ecosystem-main/`.

## Roadmap

- [ ] GUI Dashboard para gerenciar squads
- [ ] Integração com Hugging Face Models
- [ ] Suporte a múltiplas linguas
- [ ] Plugin para VS Code
- [ ] API REST para integração

---

**Versão**: 1.0.0
**Status**: Pronto para produção
**Mantido por**: AIOS Framework Team
**Licença**: MIT

---

## Como Começar Agora

```bash
# 1. Instalar dependências
cd aios-core && npm install

# 2. Configurar chave
set OPENROUTER_API_KEY=sk-or-v1-...

# 3. Iniciar
./start-aios-aider.bat

# 4. Explorar
/agents
/agent dev
"Crie um arquivo hello.py com função que printa hello world"
```

**Pronto! Você tem um sistema de desenvolvimento agentico gratuito funcionando.** 🚀
