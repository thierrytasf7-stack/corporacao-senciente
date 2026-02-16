---
name: windows-debug
description: Padrões de debugging específicos para Windows + Claude Code.
  Ativa quando há erros de path, PowerShell, encoding, permissões,
  ou problemas nativos Windows no projeto Diana.
---

# Windows Debug — Debugging Nativo Windows

## Problemas Comuns e Soluções

### 1. Bash Tool + PowerShell Variables
**Problema:** `$_` e `$env:VAR` são interpretados como bash vars.
**Solução:** Escrever script .ps1 e executar:
```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File script.ps1
```

### 2. Path Separators
**Problema:** `/` vs `\` inconsistente.
**Solução:** Usar `/` no código JS/TS (Node normaliza). Usar `\` apenas em PowerShell e .bat.

### 3. Long Paths (>260 chars)
**Problema:** `ENAMETOOLONG` em node_modules profundos.
**Solução:**
```powershell
# Habilitar long paths (admin)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1
```

### 4. Encoding UTF-8
**Problema:** Caracteres corrompidos em output.
**Solução:**
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
chcp 65001
```

### 5. Process Lock (file in use)
**Problema:** `EBUSY` ou `EPERM` ao editar arquivo.
**Diagnóstico:**
```powershell
# Encontrar quem está usando o arquivo
handle.exe "nome-do-arquivo"
# Ou via PowerShell
Get-Process | Where-Object { $_.Modules.FileName -like "*nome*" }
```

### 6. PM2 no Windows
**Problema:** PM2 não inicia como serviço.
**Solução:**
```bash
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

### 7. Git Bash vs PowerShell
| Operação | Git Bash | PowerShell |
|----------|----------|------------|
| Paths | `/c/Users/...` | `C:\Users\...` |
| Vars | `$VAR` | `$env:VAR` |
| Pipes | `|` (text) | `|` (objects) |
| Glob | `*.js` funciona | `Get-ChildItem *.js` |

### 8. Node.js Native Modules
**Problema:** `node-gyp` falha no build.
**Solução:**
```bash
npm install --global windows-build-tools
# Ou instalar Visual Studio Build Tools manualmente
```

## Debug Pattern para Claude Code
1. Primeiro identifique: é erro de **path**, **encoding**, **permissão** ou **processo**?
2. Verifique se o comando funciona em PowerShell vs Git Bash
3. Para scripts complexos, SEMPRE escreva .ps1 e execute via `powershell.exe -File`
4. Nunca use `$_` em comandos inline do Bash tool
