# 🚀 Guia de Instalação Completa - ByteRover

## 📋 Pré-requisitos

Para configurar o ByteRover neste PC, você precisa instalar:

1. **Node.js** (versão 18 ou superior)
2. **Python** (versão 3.10 ou superior)
3. **npm** (vem com Node.js)
4. **pip** (vem com Python)

---

## 1️⃣ Instalar Node.js

### Opção A: Download Manual (Recomendado)

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support)
3. Execute o instalador
4. **IMPORTANTE**: Marque a opção "Add to PATH" durante a instalação
5. Reinicie o terminal após a instalação

### Opção B: Via Chocolatey (se você tem Chocolatey instalado)

```powershell
choco install nodejs-lts
```

### Verificar Instalação

Abra um novo terminal PowerShell e execute:

```powershell
node --version
npm --version
```

Você deve ver algo como:
```
v20.11.0
10.2.4
```

---

## 2️⃣ Instalar Python

### Opção A: Microsoft Store (Recomendado para Windows)

1. Abra a Microsoft Store
2. Procure por "Python 3.12" ou "Python 3.11"
3. Clique em "Instalar"
4. Aguarde a instalação concluir

### Opção B: Download Manual

1. Acesse: https://www.python.org/downloads/
2. Baixe a versão mais recente (3.10+)
3. Execute o instalador
4. **IMPORTANTE**: Marque "Add Python to PATH" durante a instalação
5. Reinicie o terminal após a instalação

### Verificar Instalação

Abra um novo terminal PowerShell e execute:

```powershell
python --version
pip --version
```

Você deve ver algo como:
```
Python 3.12.0
pip 24.0
```

---

## 3️⃣ Instalar Dependências do Projeto

### 3.1 Dependências Node.js

Abra o terminal PowerShell na pasta do projeto e execute:

```powershell
cd "C:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente"
npm install
```

Isso instalará todas as dependências listadas no `package.json`, incluindo:
- `@modelcontextprotocol/sdk` (para o servidor MCP)
- `@supabase/supabase-js` (para integração com Supabase)
- `@xenova/transformers` (para embeddings)
- E todas as outras dependências necessárias

**Tempo estimado**: 5-15 minutos dependendo da conexão

### 3.2 Dependências Python

No mesmo terminal, execute:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Isso instalará:
- `crewai` (framework de multi-agentes)
- `langchain` e `langgraph` (orquestração de workflows)
- `langfuse` (observabilidade)
- `qdrant-client` (cliente para banco vetorial)

**Tempo estimado**: 5-10 minutos

---

## 4️⃣ Verificar Configuração ByteRover MCP

O ByteRover MCP Server já está configurado no arquivo `mcp.json`. Verifique se está correto:

```json
{
  "mcpServers": {
    "byterover-mcp-server": {
      "command": "node",
      "args": [
        "scripts/mcp/byterover_mcp_server.js"
      ]
    }
  }
}
```

---

## 5️⃣ Testar Instalação

### Teste 1: Verificar Node.js e dependências

```powershell
node --version
npm list --depth=0
```

### Teste 2: Verificar Python e dependências

```powershell
python --version
pip list | Select-String "crewai|langchain|langfuse"
```

### Teste 3: Testar ByteRover

```powershell
node test_byterover.js
```

Se tudo estiver funcionando, você verá mensagens de sucesso.

---

## 6️⃣ Iniciar ByteRover MCP Server

Para iniciar o servidor MCP do ByteRover:

```powershell
node scripts/mcp/byterover_mcp_server.js
```

O servidor estará pronto para receber conexões MCP.

---

## 🐛 Solução de Problemas

### Problema: "node não é reconhecido"

**Solução:**
1. Verifique se Node.js está instalado
2. Reinicie o terminal completamente
3. Verifique se Node.js está no PATH:
   ```powershell
   $env:Path -split ';' | Select-String "node"
   ```
4. Se não estiver, adicione manualmente ao PATH:
   - Abra "Variáveis de Ambiente" no Windows
   - Adicione `C:\Program Files\nodejs\` ao PATH do sistema

### Problema: "python não é reconhecido"

**Solução:**
1. Verifique se Python está instalado
2. Reinicie o terminal completamente
3. Tente usar `py` em vez de `python`:
   ```powershell
   py --version
   py -m pip install -r requirements.txt
   ```

### Problema: Erro ao instalar dependências Node.js

**Solução:**
1. Limpe o cache do npm:
   ```powershell
   npm cache clean --force
   ```
2. Delete a pasta `node_modules` e `package-lock.json`:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   ```
3. Tente instalar novamente:
   ```powershell
   npm install
   ```

### Problema: Erro ao instalar dependências Python

**Solução:**
1. Atualize o pip:
   ```powershell
   python -m pip install --upgrade pip
   ```
2. Tente instalar uma dependência por vez para identificar o problema
3. Se houver erro de permissão, use:
   ```powershell
   python -m pip install --user -r requirements.txt
   ```

### Problema: ByteRover MCP não inicia

**Solução:**
1. Verifique se todas as dependências estão instaladas:
   ```powershell
   npm list @modelcontextprotocol/sdk
   ```
2. Verifique se o arquivo `scripts/mcp/byterover_mcp_server.js` existe
3. Verifique os logs de erro no terminal

---

## ✅ Checklist de Instalação

Marque cada item conforme completa:

- [ ] Node.js instalado e funcionando (`node --version`)
- [ ] npm instalado e funcionando (`npm --version`)
- [ ] Python instalado e funcionando (`python --version`)
- [ ] pip instalado e funcionando (`pip --version`)
- [ ] Dependências Node.js instaladas (`npm install` concluído)
- [ ] Dependências Python instaladas (`pip install -r requirements.txt` concluído)
- [ ] ByteRover MCP configurado no `mcp.json`
- [ ] Teste do ByteRover passou (`node test_byterover.js`)

---

## 🎉 Pronto!

Após completar todos os passos acima, o ByteRover estará totalmente configurado e pronto para uso!

**Próximos passos:**
1. Configure as variáveis de ambiente no arquivo `.env` (se necessário)
2. Inicie o servidor MCP: `node scripts/mcp/byterover_mcp_server.js`
3. Comece a usar o ByteRover!

---

**Última atualização**: Janeiro 2025
