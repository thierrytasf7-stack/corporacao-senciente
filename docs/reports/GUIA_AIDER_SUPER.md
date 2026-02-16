# 🚀 GUIA AIDER SUPER - Diana Corporação Senciente

**Arquivo:** `AIDER_SUPER.bat`  
**Versão:** 1.0.0  
**Data:** 2026-02-03

---

## 📋 O QUE É O AIDER SUPER?

O **AIDER_SUPER.bat** é um launcher completo e inteligente para o Aider que integra:

- ✅ **4 Modelos LLM** (Trinity, DeepSeek, Chimera, Qwen3)
- ✅ **Squad Matrix** (múltiplos agentes paralelos)
- ✅ **MCP Bridge** (integração com Kiro)
- ✅ **Auto-commits** (commits automáticos)
- ✅ **Verificações de ambiente** (Node.js, API keys, etc)
- ✅ **Menu interativo** (fácil de usar)

---

## 🚀 COMO USAR

### Opção 1: Duplo Clique (Mais Fácil)

1. Navegue até a pasta `Diana-Corporacao-Senciente`
2. Dê duplo clique em `AIDER_SUPER.bat`
3. Siga o menu interativo

### Opção 2: Linha de Comando

```cmd
cd Diana-Corporacao-Senciente
AIDER_SUPER.bat
```

---

## 📊 MENU INTERATIVO

### Passo 1: Verificações Iniciais

O script verifica automaticamente:
- ✅ Arquivo `.aider.conf.yml` existe
- ✅ Aider está instalado
- ✅ Node.js está instalado
- ✅ API Key está configurada

Se algo estiver faltando, o script avisa e para.

### Passo 2: Seleção de Modelo LLM

```
[3/6] Selecione o modelo LLM:

  1. Trinity Large Preview (127B) - PADRÃO
     → Arquitetura, design, raciocínio complexo

  2. DeepSeek R1 - RÁPIDO E GRÁTIS
     → Implementação rápida, código repetitivo

  3. T2 Chimera - BALANCEADO
     → Tarefas gerais, boa relação custo/benefício

  4. Qwen3 Coder 480B - ESPECIALISTA
     → Código complexo, otimização, 92+ linguagens

  5. Usar configuração padrão (.aider.conf.yml)

Digite sua escolha (1-5) [padrão: 1]:
```

**Recomendações:**
- **Opção 1 (Trinity):** Para decisões arquiteturais e design
- **Opção 2 (DeepSeek):** Para 80% das tarefas (grátis!)
- **Opção 3 (Chimera):** Para tarefas gerais
- **Opção 4 (Qwen3):** Para código complexo e otimização
- **Opção 5:** Usa o que está em `.aider.conf.yml`

### Passo 3: Funcionalidades Avançadas

```
[4/6] Funcionalidades avançadas:

  1. Modo Normal (recomendado)
  2. Modo Squad Matrix (múltiplos agentes paralelos)
  3. Modo MCP Bridge (integração com Kiro)
  4. Modo Completo (Squad + MCP + Auto-commits)

Digite sua escolha (1-4) [padrão: 1]:
```

**Descrição dos Modos:**

#### Modo 1: Normal
- Aider padrão
- Sem funcionalidades extras
- Recomendado para uso geral

#### Modo 2: Squad Matrix
- Múltiplos agentes trabalhando em paralelo
- Auto-commits ativado
- Dirty commits permitido
- Ideal para projetos grandes

#### Modo 3: MCP Bridge
- Integração com Kiro via MCP
- Map tokens aumentado (8192)
- MCP server iniciado automaticamente
- Ideal para usar com Kiro

#### Modo 4: Completo
- Todas as funcionalidades ativadas
- Squad Matrix + MCP Bridge + Auto-commits
- Máxima produtividade
- Recomendado para desenvolvimento intenso

### Passo 4: MCP Server (se necessário)

Se você escolheu Modo 3 ou 4, o script:
1. Verifica se `mcp/aider-bridge/index.js` existe
2. Inicia o MCP server em background
3. Aguarda 2 segundos para o server inicializar

### Passo 5: Resumo da Configuração

O script mostra um resumo antes de iniciar:
```
[6/6] Resumo da configuração:

  Modelo Principal: Trinity Large Preview (127B)
  Identificador: openrouter/arcee-ai/trinity-large-preview
  Weak Model: openrouter/deepseek/deepseek-r1
  Modo: Normal
  API Key: Configurada ✅
  Git Repo: Detectado ✅
```

### Passo 6: Execução

O Aider é iniciado com todas as configurações selecionadas!

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### Variáveis de Ambiente

O script carrega automaticamente do arquivo `.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

Se não encontrar, usa a variável de ambiente do sistema.

### Flags Adicionadas por Modo

| Modo | Flags |
|------|-------|
| Normal | Nenhuma |
| Squad Matrix | `--auto-commits --dirty-commits` |
| MCP Bridge | `--map-tokens 8192` |
| Completo | `--auto-commits --dirty-commits --map-tokens 8192` |

### Comando Final Executado

**Exemplo (Modo Normal com Trinity):**
```cmd
aider --model openrouter/arcee-ai/trinity-large-preview --weak-model openrouter/deepseek/deepseek-r1
```

**Exemplo (Modo Completo com Qwen3):**
```cmd
aider --model openrouter/qwen/qwen-3-coder-480b --weak-model openrouter/deepseek/deepseek-r1 --auto-commits --dirty-commits --map-tokens 8192
```

---

## 💡 EXEMPLOS DE USO

### Exemplo 1: Implementação Rápida (DeepSeek)

```
1. Execute AIDER_SUPER.bat
2. Escolha opção 2 (DeepSeek R1)
3. Escolha opção 1 (Modo Normal)
4. No Aider: /add backend/api/users.js
5. Digite: "Crie um CRUD completo para usuários"
```

**Custo:** $0 (grátis!)

### Exemplo 2: Arquitetura Complexa (Trinity)

```
1. Execute AIDER_SUPER.bat
2. Escolha opção 1 (Trinity)
3. Escolha opção 1 (Modo Normal)
4. No Aider: /add backend/
5. Digite: "Refatore para arquitetura hexagonal com DDD"
```

**Custo:** ~$0.50-1.00

### Exemplo 3: Projeto Grande (Squad Matrix)

```
1. Execute AIDER_SUPER.bat
2. Escolha opção 3 (Chimera)
3. Escolha opção 2 (Modo Squad Matrix)
4. No Aider: /add frontend/ backend/
5. Digite: "Implemente autenticação OAuth2 completa"
```

**Custo:** ~$0.30-0.50

### Exemplo 4: Integração com Kiro (MCP Bridge)

```
1. Execute AIDER_SUPER.bat
2. Escolha opção 1 (Trinity)
3. Escolha opção 3 (Modo MCP Bridge)
4. Kiro pode agora usar o Aider via MCP
```

**Custo:** Variável

### Exemplo 5: Desenvolvimento Intenso (Modo Completo)

```
1. Execute AIDER_SUPER.bat
2. Escolha opção 4 (Qwen3 Coder)
3. Escolha opção 4 (Modo Completo)
4. No Aider: /add src/
5. Digite: "Otimize todos os algoritmos para O(log n)"
```

**Custo:** ~$2-3

---

## 🐛 TROUBLESHOOTING

### Erro: "Arquivo .aider.conf.yml não encontrado"

**Causa:** Script não está sendo executado no diretório correto

**Solução:**
```cmd
cd Diana-Corporacao-Senciente
AIDER_SUPER.bat
```

### Erro: "Aider não está instalado"

**Causa:** Aider não está no PATH

**Solução:**
```cmd
pip install aider-chat
```

### Erro: "Node.js não está instalado"

**Causa:** Node.js não está instalado (necessário para MCP)

**Solução:**
1. Baixe Node.js: https://nodejs.org/
2. Instale e reinicie o terminal

### Erro: "OPENROUTER_API_KEY não está configurada"

**Causa:** API key não encontrada

**Solução:**
1. Crie arquivo `.env` na pasta `Diana-Corporacao-Senciente`
2. Adicione: `OPENROUTER_API_KEY=sk-or-v1-...`

### Aviso: "MCP Server não encontrado"

**Causa:** Arquivo `mcp/aider-bridge/index.js` não existe

**Solução:**
- Se não precisa de MCP, escolha Modo 1 ou 2
- Se precisa, verifique se o MCP bridge está instalado

---

## 📊 COMPARAÇÃO DE MODOS

| Recurso | Normal | Squad Matrix | MCP Bridge | Completo |
|---------|--------|--------------|------------|----------|
| Modelo LLM | ✅ | ✅ | ✅ | ✅ |
| Weak Model | ✅ | ✅ | ✅ | ✅ |
| Auto-commits | ❌ | ✅ | ❌ | ✅ |
| Dirty commits | ❌ | ✅ | ❌ | ✅ |
| Map tokens | 4096 | 4096 | 8192 | 8192 |
| MCP Server | ❌ | ❌ | ✅ | ✅ |
| Agentes paralelos | ❌ | ✅ | ❌ | ✅ |
| Integração Kiro | ❌ | ❌ | ✅ | ✅ |

---

## 💰 ESTIMATIVA DE CUSTOS

### Por Modelo (1000 linhas de código)

| Modelo | Custo Estimado | Tempo |
|--------|----------------|-------|
| DeepSeek R1 | $0 (grátis) | 2-3 min |
| T2 Chimera | ~$0.10-0.20 | 1-2 min |
| Trinity (127B) | ~$0.30-0.50 | 1-2 min |
| Qwen3 (480B) | ~$0.80-1.20 | 1-2 min |

### Por Modo (sessão de 1 hora)

| Modo | Custo Estimado | Produtividade |
|------|----------------|---------------|
| Normal | $0.50-1.00 | 100% |
| Squad Matrix | $0.80-1.50 | 150% |
| MCP Bridge | $0.60-1.20 | 120% |
| Completo | $1.00-2.00 | 200% |

---

## 🎯 RECOMENDAÇÕES

### Para Iniciantes
- **Modelo:** DeepSeek R1 (opção 2)
- **Modo:** Normal (opção 1)
- **Custo:** $0

### Para Desenvolvimento Geral
- **Modelo:** T2 Chimera (opção 3)
- **Modo:** Normal (opção 1)
- **Custo:** ~$0.50/hora

### Para Arquitetura
- **Modelo:** Trinity (opção 1)
- **Modo:** Normal (opção 1)
- **Custo:** ~$1.00/hora

### Para Código Complexo
- **Modelo:** Qwen3 Coder (opção 4)
- **Modo:** Squad Matrix (opção 2)
- **Custo:** ~$2.00/hora

### Para Máxima Produtividade
- **Modelo:** Trinity ou Qwen3
- **Modo:** Completo (opção 4)
- **Custo:** ~$2-3/hora

---

## 🔗 LINKS ÚTEIS

- **Aider Docs:** https://aider.chat/docs/
- **OpenRouter Models:** https://openrouter.ai/models
- **MCP Protocol:** https://modelcontextprotocol.io/

---

## ✅ CHECKLIST DE USO

Antes de executar o AIDER_SUPER.bat:

- [ ] Estou no diretório `Diana-Corporacao-Senciente`
- [ ] Aider está instalado (`aider --version`)
- [ ] Node.js está instalado (`node --version`)
- [ ] API Key está configurada (arquivo `.env`)
- [ ] Git repo está inicializado
- [ ] Sei qual modelo quero usar
- [ ] Sei qual modo quero usar

---

**Pronto para usar!** 🚀

Execute `AIDER_SUPER.bat` e comece a desenvolver com IA de forma profissional!
