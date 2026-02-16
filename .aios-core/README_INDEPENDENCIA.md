# AIOS-Core - Sistema Independente

## 🎯 Objetivo

Tornar o AIOS-Core **completamente independente** de ferramentas externas (Kiro, Aider, Cursor, etc), permitindo que execute workflows e agentes de forma autônoma.

## 🏗️ Arquitetura de Independência

```
.aios-core/
├── bin/
│   └── aios-core.js          # CLI independente
├── cli/
│   ├── agents/
│   │   └── agent-executor.js # Executor de agentes LLM
│   └── commands/
│       └── workflow.js       # Comando workflow
├── workflow-intelligence/
│   └── refactor-metricas.yaml # Workflow configurado
├── .env                      # Configuração de API keys
└── README_INDEPENDENCIA.md   # Este arquivo
```

## 🚀 Como Usar (Independente)

### 1. Configurar API Key

```bash
cd Diana-Corporacao-Senciente/.aios-core
cp .env.example .env
# Editar .env e adicionar OPENROUTER_API_KEY
```

### 2. Instalar Dependências

```bash
npm install node-fetch
```

### 3. Executar Workflow

```bash
# Listar workflows disponíveis
node bin/aios-core.js workflow list

# Executar workflow de refatoração
node bin/aios-core.js workflow run refactor-metricas
```

## 🤖 Como Funciona

### Agent Executor

O `agent-executor.js` é o coração da independência:

1. **Carrega contexto**: Lê documentos de referência e originais
2. **Constrói prompt**: Cria prompt estruturado para o LLM
3. **Chama LLM**: Usa OpenRouter API para executar Claude 3.5 Sonnet
4. **Processa resposta**: Valida e salva o documento refatorado

### Workflow Command

O `workflow.js` orquestra a execução:

1. **Carrega workflow YAML**: Lê configuração do workflow
2. **Executa tasks sequencialmente**: Processa cada documento
3. **Valida resultados**: Verifica estrutura dos documentos gerados
4. **Gera relatório**: Cria relatório de execução

## 📋 Workflow: refactor-metricas

### Tasks

1. **refactor-05**: Cérebro - Nexus de Comando
2. **refactor-06**: Cognitiva - Grande Livro de Encargos
3. **refactor-07**: Corpo - Interface de Realidade
4. **refactor-08**: Metabolismo - Geometria do Valor

### Estrutura Aplicada

- 23 níveis de evolução vertical
- Tabelas com 10 tasks por nível
- Arquitetura Atômica (Átomo, Molécula, Organismo, Sistema)
- Emojis: 🧬 🏛️ 👁️ 🏁
- Linguagem poética e filosófica

## 🔧 Configuração

### core-config.yaml

```yaml
version: 4.31.0
project_name: Corporação Senciente

agents:
  default_model: claude-3.5-sonnet
  default_temperature: 0.3
  
workflows:
  max_concurrent: 1
  timeout: 600
```

### .env

```bash
OPENROUTER_API_KEY=sk-or-v1-...
AIOS_DEFAULT_MODEL=claude-3.5-sonnet
AIOS_DEFAULT_TEMPERATURE=0.3
AIOS_MAX_TOKENS=8000
```

## 🎓 Exemplo de Uso

```bash
# 1. Configurar
cd Diana-Corporacao-Senciente/.aios-core
cp .env.example .env
nano .env  # Adicionar API key

# 2. Instalar dependências
npm install node-fetch

# 3. Executar
node bin/aios-core.js workflow run refactor-metricas

# 4. Verificar resultados
ls -la ../METRICAS_DIRECAO_EVOLUCAO/
```

## 📊 Validação

O sistema valida automaticamente:

- ✅ 23 níveis presentes
- ✅ Tabelas com estrutura correta
- ✅ Emojis incluídos
- ✅ Título e seções principais

## 🔄 Integração com Kiro

Kiro pode **orquestrar** o AIOS-Core, mas o AIOS-Core **não depende** do Kiro:

```python
# Kiro chama AIOS-Core
subprocess.run([
    'node',
    '.aios-core/bin/aios-core.js',
    'workflow',
    'run',
    'refactor-metricas'
])
```

## 🎯 Próximos Passos

1. ✅ Agent Executor implementado
2. ✅ Workflow Command atualizado
3. ✅ CLI independente criado
4. ⏳ Testar execução completa
5. ⏳ Refinar validação de estrutura
6. ⏳ Adicionar retry logic
7. ⏳ Implementar logging avançado

## 📝 Notas

- **Independência**: AIOS-Core não precisa de Kiro, Aider ou Cursor
- **Orquestração**: Kiro pode orquestrar, mas não é obrigatório
- **Autonomia**: Sistema pode rodar sozinho via CLI
- **Extensibilidade**: Fácil adicionar novos agentes e workflows

## 🔌 Interfaces de Interação

O AIOS-Core pode ser acessado através de **múltiplas interfaces**:

1. **💬 WhatsApp**: Comandos via mensagens (`/aios workflow run refactor-metricas`)
2. **🖥️ CLI**: Aider, Claude Code ou direto (`node bin/aios-core.js workflow run`)
3. **🌐 Frontend**: Mission Control web interface

**Documentação completa**: Ver `INTERFACES_INTERACAO.md`

---

**Status**: ✅ Sistema independente implementado
**Interfaces**: ✅ WhatsApp, CLI, Frontend documentadas
**Próximo**: Testar execução completa do workflow
