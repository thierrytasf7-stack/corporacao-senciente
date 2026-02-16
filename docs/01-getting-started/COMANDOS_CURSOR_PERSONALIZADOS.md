# Comandos Cursor Personalizados - Corporação Senciente

## 📋 Visão Geral

Comandos personalizados criados para facilitar o uso do sistema senciente e autônomo diretamente do Cursor IDE.

## 🚀 Comandos Disponíveis

### 1. Evoluir Agente
**Comando:** `Evoluir Agente`  
**Descrição:** Evoluir um agente específico (ex: marketing, copywriting)  
**Uso:** Seleciona o comando e informa o nome do agente

**O que faz:**
- Analisa gaps entre estado atual e utópico
- Gera tasks de evolução
- Cria issues no Jira (quando MCP disponível)
- Documenta em Confluence (quando MCP disponível)
- Atualiza fichas técnicas
- Commita mudanças

### 2. Evoluir Todos Agentes
**Comando:** `Evoluir Todos Agentes`  
**Descrição:** Evoluir todos os agentes automaticamente  
**Uso:** Executa autoevolução de todos os 30 agentes

### 3. Popular Conhecimento Marketing
**Comando:** `Popular Conhecimento Marketing`  
**Descrição:** Popular base de conhecimento do Marketing Agent  
**Uso:** Executa scraping e vetorização de conhecimento de marketing

### 4. Otimizar Campanhas
**Comando:** `Otimizar Campanhas`  
**Descrição:** Otimizar todas as campanhas automaticamente  
**Uso:** Executa otimização automática de campanhas Google Ads

### 5. Health Check Sistema
**Comando:** `Health Check Sistema`  
**Descrição:** Verificar saúde do sistema completo  
**Uso:** Verifica status de todos os componentes

### 6. Testar Marketing Agent
**Comando:** `Testar Marketing Agent`  
**Descrição:** Testar funcionalidades do Marketing Agent  
**Uso:** Executa testes das principais funcionalidades

### 7. Selecionar Agente Automaticamente
**Comando:** `Selecionar Agente Automaticamente`  
**Descrição:** Selecionar agente automaticamente para uma tarefa  
**Uso:** Informa a tarefa e o sistema decide qual agente usar

**Exemplo:**
```
Tarefa: "Criar campanha de marketing para novo produto"
→ Sistema analisa e seleciona: Marketing Agent (score: 0.85)
```

### 8. Verificar Alinhamento
**Comando:** `Verificar Alinhamento`  
**Descrição:** Verificar alinhamento com memória corporativa  
**Uso:** Informa uma pergunta e verifica se está alinhado com missão/valores

### 9. Board Meeting
**Comando:** `Board Meeting`  
**Descrição:** Reunião de mesa redonda sobre um tópico  
**Uso:** Informa um tópico e recebe opiniões de múltiplos agentes (Architect, Product, etc.)

### 10. Popular Conhecimento Copywriting
**Comando:** `Popular Conhecimento Copywriting`  
**Descrição:** Popular base de conhecimento do Copywriting Agent  
**Uso:** Executa scraping e vetorização de conhecimento de copywriting

## 📝 Como Usar

1. **Abrir Command Palette:** `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (Mac)
2. **Digitar:** "Project Commands" ou nome do comando
3. **Selecionar:** O comando desejado
4. **Preencher:** Inputs solicitados (se houver)
5. **Executar:** Comando roda automaticamente

## 🎯 Casos de Uso

### Evoluir um Agente Específico
```
1. Ctrl+Shift+P
2. "Evoluir Agente"
3. Informar: "marketing"
4. Sistema analisa, gera tasks, documenta e commita
```

### Decidir Qual Agente Usar
```
1. Ctrl+Shift+P
2. "Selecionar Agente Automaticamente"
3. Informar: "Criar campanha de marketing para novo produto"
4. Sistema analisa e retorna: Marketing Agent (score: 0.85)
```

### Otimizar Campanhas
```
1. Ctrl+Shift+P
2. "Otimizar Campanhas"
3. Sistema analisa performance e otimiza automaticamente
```

## 🔄 Integração com Sistema Senciente

Todos os comandos estão integrados com o sistema senciente:

- ✅ **Decisões são registradas** em `agent_logs`
- ✅ **Evoluções são documentadas** automaticamente
- ✅ **Commits são feitos** com mensagens descritivas
- ✅ **Issues são criadas** no Jira (quando MCP disponível)
- ✅ **Páginas são criadas** no Confluence (quando MCP disponível)

## 📊 Status

**Comandos Criados:** 10/10 ✅  
**Integração Senciente:** 100% ✅  
**Documentação:** Completa ✅

---

**Data:** 16/12/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Uso

















