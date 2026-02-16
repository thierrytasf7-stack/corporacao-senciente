# 🌉 Aider MCP Bridge - Diana Corporação Senciente

Bridge MCP (Model Context Protocol) para integração do Aider com AIOS Squads.

## 📋 O que é?

Este bridge permite que o Kiro (e outros clientes MCP) executem comandos do Aider de forma programática, integrando-o com o sistema de squads da Diana Corporação Senciente.

## ✨ Funcionalidades

### Ferramentas MCP Disponíveis

1. **`aider_execute`** - Executa comando Aider com arquivos e prompt
   - Parâmetros: `files`, `prompt`, `model`, `auto_commit`
   - Exemplo: Refatorar código, adicionar features, corrigir bugs

2. **`aider_squad_execute`** - Executa tarefa usando squad context
   - Parâmetros: `task_type`, `files`, `description`, `squad_id`
   - Tipos: `refactor`, `test`, `document`, `fix`, `feature`

3. **`aider_status`** - Verifica status e configuração do Aider
   - Retorna: versão, workspace, squad context

4. **`aider_list_models`** - Lista modelos LLM disponíveis
   - Retorna: lista de modelos suportados pelo Aider

5. **`squad_create_context`** - Cria contexto de squad para workspace
   - Parâmetros: `squad_type`, `worker_id`, `tools`
   - Tipos: `developer`, `qa`, `documentation`, `security`

## 🚀 Instalação

### Pré-requisitos

1. **Node.js 18+**
   ```bash
   node --version
   ```

2. **Aider instalado**
   ```bash
   pip install aider-chat
   aider --version
   ```

3. **API Keys configuradas**
   - OpenRouter, Anthropic, ou OpenAI
   - Configure em `~/.aider.conf.yml` ou variáveis de ambiente

### Instalação do Bridge

```bash
# 1. Navegar para o diretório
cd Diana-Corporacao-Senciente/mcp/aider-bridge

# 2. Instalar dependências
npm install

# 3. Testar instalação
npm test
```

### Configuração no Kiro

1. **Copiar configuração MCP**
   ```bash
   # Windows
   copy mcp-config.json ..\..\..\.kiro\settings\mcp.json

   # Linux/Mac
   cp mcp-config.json ../../.kiro/settings/mcp.json
   ```

2. **Ou adicionar manualmente ao mcp.json existente:**
   ```json
   {
     "mcpServers": {
       "aider-bridge": {
         "command": "node",
         "args": ["index.js"],
         "cwd": "Diana-Corporacao-Senciente/mcp/aider-bridge",
         "env": {
           "AIDER_PATH": "aider",
           "WORKSPACE_ROOT": "Diana-Corporacao-Senciente"
         },
         "disabled": false,
         "autoApprove": [
           "aider_status",
           "aider_list_models",
           "squad_create_context"
         ]
       }
     }
   }
   ```

3. **Reiniciar Kiro** para carregar o servidor MCP

## 📖 Uso

### Exemplo 1: Refatorar código

```javascript
// Via Kiro MCP
{
  "tool": "aider_execute",
  "arguments": {
    "files": ["backend/services/task_queue.py"],
    "prompt": "Adicionar docstrings e type hints. Melhorar legibilidade.",
    "model": "claude-sonnet-4",
    "auto_commit": true
  }
}
```

### Exemplo 2: Criar testes

```javascript
{
  "tool": "aider_squad_execute",
  "arguments": {
    "task_type": "test",
    "files": ["backend/services/cerebro_orchestrator.py"],
    "description": "Criar testes unitários para CerebroOrchestrator"
  }
}
```

### Exemplo 3: Criar squad context

```javascript
{
  "tool": "squad_create_context",
  "arguments": {
    "squad_type": "developer",
    "worker_id": "dev_001",
    "tools": ["aider", "git", "python", "typescript"]
  }
}
```

### Exemplo 4: Verificar status

```javascript
{
  "tool": "aider_status",
  "arguments": {}
}
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Caminho do executável Aider
AIDER_PATH=aider

# Diretório raiz do workspace
WORKSPACE_ROOT=Diana-Corporacao-Senciente

# API Keys (opcional, se não estiver em ~/.aider.conf.yml)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
```

### Arquivo de Configuração Aider

Crie `~/.aider.conf.yml`:

```yaml
# Modelo padrão
model: claude-sonnet-4

# Auto-commit
auto-commits: true

# Formato de commit
commit-prompt: "AI: [AIDER] {description}"

# API Keys
openrouter-api-key: sk-or-v1-...
```

## 🎯 Integração com AIOS Squads

### Squad Context

O bridge cria automaticamente um arquivo `.squad_context.json` no workspace:

```json
{
  "worker_id": "developer_001",
  "squad_type": "developer",
  "description": "Squad developer - Worker developer_001",
  "tools": ["aider", "git", "python", "typescript"],
  "preferred_model": "claude-sonnet-4",
  "auto_commit": true,
  "created_at": "2026-02-03T12:00:00.000Z"
}
```

### Tipos de Squad

- **developer**: Desenvolvimento de código
- **qa**: Testes e qualidade
- **documentation**: Documentação
- **security**: Segurança e auditoria

### Tipos de Tarefa

- **refactor**: Refatoração de código
- **test**: Criação de testes
- **document**: Documentação
- **fix**: Correção de bugs
- **feature**: Novas funcionalidades

## 🧪 Testes

```bash
# Executar testes
npm test

# Testar manualmente
node index.js
```

### Teste Manual via stdio

```bash
# Iniciar servidor
node index.js

# Em outro terminal, enviar requisição MCP
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node index.js
```

## 📊 Monitoramento

### Logs

O bridge emite logs para `stderr`:

```
[Aider MCP] Server running on stdio
[Aider MCP] Executing: aider file.py --model claude-sonnet-4 --message "..."
[Aider MCP] Server error: ...
```

### Debug

```bash
# Modo debug
NODE_ENV=development node index.js
```

## 🔒 Segurança

### Auto-Approve

Ferramentas seguras são auto-aprovadas:
- `aider_status` - Apenas leitura
- `aider_list_models` - Apenas leitura
- `squad_create_context` - Apenas escrita de contexto

### Ferramentas que Requerem Aprovação

- `aider_execute` - Modifica código
- `aider_squad_execute` - Modifica código

## 🐛 Troubleshooting

### Aider não encontrado

```bash
# Instalar Aider
pip install aider-chat

# Verificar instalação
aider --version

# Adicionar ao PATH (Windows)
set PATH=%PATH%;C:\Python313\Scripts

# Adicionar ao PATH (Linux/Mac)
export PATH=$PATH:~/.local/bin
```

### MCP SDK não encontrado

```bash
# Instalar dependências
npm install

# Verificar instalação
npm list @modelcontextprotocol/sdk
```

### Erro de permissão

```bash
# Windows: Executar como administrador
# Linux/Mac: Adicionar permissão de execução
chmod +x index.js
```

## 📚 Referências

- [Aider Documentation](https://aider.chat/docs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [AIOS Squads](https://github.com/SynkraAI/aios-squads)
- [Diana Corporação Senciente](../../../README.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

MIT License - Diana Corporação Senciente

---

**Desenvolvido com ❤️ pela Diana Corporação Senciente**
