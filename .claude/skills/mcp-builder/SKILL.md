---
name: mcp-builder
description: Guia para criar MCP (Model Context Protocol) servers de alta qualidade.
  Ativa quando o usuário quer criar um novo MCP server, integrar API externa,
  ou conectar serviço que não tem MCP pronto.
---

# MCP Builder — Criador de MCP Servers

## O que é um MCP Server
Um MCP server expõe ferramentas (tools), recursos (resources) e prompts ao Claude Code via protocolo padronizado. Permite integrar qualquer API ou serviço externo.

## Tipos de MCP Server

### stdio (Local)
```json
{
  "mcpServers": {
    "meu-server": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": { "API_KEY": "..." }
    }
  }
}
```

### SSE (Remoto)
```json
{
  "mcpServers": {
    "meu-server": {
      "url": "https://meu-server.com/mcp"
    }
  }
}
```

## Estrutura Mínima (TypeScript/Node)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({ name: "meu-mcp", version: "1.0.0" }, {
  capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "minha_ferramenta",
    description: "O que faz",
    inputSchema: {
      type: "object",
      properties: {
        param1: { type: "string", description: "Descrição" }
      },
      required: ["param1"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "minha_ferramenta") {
    const result = await fazAlgo(request.params.arguments.param1);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Checklist de Qualidade
- [ ] Descrições claras para cada tool (o Claude usa para decidir quando chamar)
- [ ] Input schemas com tipos e descrições
- [ ] Error handling robusto (nunca crashar o process)
- [ ] Timeouts em chamadas externas
- [ ] Logs para stderr (não stdout — stdout é o protocolo)
- [ ] Sem secrets hardcoded (usar env vars)

## Registro no Projeto
Adicionar em `.claude/settings.json` ou `.claude/settings.local.json`:
```json
{
  "permissions": { "allow": ["mcp__meu-server__*"] },
  "mcpServers": {
    "meu-server": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

## Padrões AIOS
- MCP management é responsabilidade exclusiva do `@devops`
- Preferir tools nativas do Claude Code sobre MCP para operações locais
- MCP é para integrações EXTERNAS que não têm tool nativa
