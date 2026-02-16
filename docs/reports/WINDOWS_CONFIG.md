# 🪟 CONFIGURAÇÕES ESPECÍFICAS - WINDOWS 10 PRO

## 💻 ESPECIFICAÇÕES DO SISTEMA

**Sistema Operacional:** Windows 10 Pro (Build 19045)
**Processador:** Intel/AMD (recomendado 4+ cores)
**Memória RAM:** 8GB mínimo / 16GB recomendado
**Armazenamento:** SSD 256GB+ recomendado
**PowerShell:** v1.0 (padrão)

---

## ⚙️ CONFIGURAÇÕES OBRIGATÓRIAS

### 1. PowerShell Configuration

#### Perfil do PowerShell (`$PROFILE`)
```powershell
# Adicionar ao perfil do PowerShell
function diana { cd C:\Users\thier\Desktop\coorp\Diana-Corporacao-Senciente }
function senc { npm run senc $args }
function deploy { .\scripts\deploy.ps1 }

# Alias úteis
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name gs -Value git status
Set-Alias -Name ga -Value git add
```

#### Execução de Scripts
```powershell
# Permitir execução de scripts locais
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Variáveis de Ambiente

#### Sistema
```
NODE_ENV=development
UV_THREADPOOL_SIZE=128
SUPABASE_URL=[SEU_URL]
SUPABASE_ANON_KEY=[SUA_KEY]
```

#### Caminhos Importantes
```
Path += "C:\Program Files\Git\bin"
Path += "C:\Program Files\nodejs"
Path += "C:\Users\thier\AppData\Roaming\npm"
```

### 3. Git Configuration

#### Configurações Globais
```bash
git config --global user.name "Thierry Tasf"
git config --global user.email "thierrytasf7-stack@github.com"
git config --global core.autocrlf true
git config --global init.defaultBranch main
```

#### Git LFS (para arquivos grandes)
```bash
git lfs install
git lfs track "*.zip"
git lfs track "*.tar.gz"
```

### 4. Node.js Optimization

#### NPM Configuration
```bash
npm config set fund false
npm config set audit false
npm config set progress false
npm config set cache "C:\Users\thier\.npm-cache"
```

#### Package.json Scripts Locais
```json
{
  "scripts": {
    "dev:fast": "node --max-old-space-size=4096 node_modules/.bin/next dev",
    "build:optimized": "NODE_OPTIONS=--max-old-space-size=8192 npm run build"
  }
}
```

---

## 🚀 OTIMIZAÇÕES DE PERFORMANCE

### 1. Windows Performance

#### Desabilitar Serviços Desnecessários
```powershell
# Serviços que podem ser desabilitados
Stop-Service -Name "SysMain" -Force  # Superfetch
Stop-Service -Name "WSearch" -Force  # Windows Search
Set-Service -Name "SysMain" -StartupType Disabled
Set-Service -Name "WSearch" -StartupType Disabled
```

#### Otimização de Energia
- **Plano de energia:** Alto desempenho
- **Sleep:** Nunca (desenvolvimento)
- **Hibernação:** Desabilitada

### 2. Desenvolvimento Node.js

#### NPM Parallel Installation
```bash
# Instalar globalmente
npm install -g npm-run-all
npm install -g concurrently
```

#### Cache e Otimizações
```bash
# Limpar caches periodicamente
npm cache clean --force
npx clear-npx-cache
```

### 3. Supabase Local Development

#### Configuração WSL2 (Opcional mas Recomendado)
```powershell
# Instalar WSL2
wsl --install -d Ubuntu

# Configurar Docker Desktop para WSL2
# Settings > General > Use WSL2 based engine
```

---

## 🔧 FERRAMENTAS ESSENCIAIS

### 1. Desenvolvimento
- [x] **Node.js 18+**
- [x] **Git**
- [x] **Supabase CLI**
- [x] **Docker Desktop**
- [x] **VS Code/Cursor**

### 2. Utilitários Windows
- [x] **PowerShell 7** (opcional upgrade)
- [x] **Windows Terminal**
- [x] **Git Bash**
- [x] **7-Zip**

### 3. Monitoramento
- [x] **Task Manager** (monitorar recursos)
- [x] **Resource Monitor**
- [x] **Performance Monitor**

---

## 📁 ESTRUTURA DE DIRETÓRIOS OTIMIZADA

```
C:\Users\thier\
├── Desktop\
│   └── coorp\                          # Workspace principal
│       └── Diana-Corporacao-Senciente\ # Projeto Diana
├── .npm-cache\                         # Cache NPM personalizado
├── .supabase\                          # Config Supabase local
└── AppData\
    ├── Local\
    │   ├── Docker\                     # Dados Docker
    │   └── npm-cache\                  # Cache alternativo
    └── Roaming\
        └── npm\                        # Global packages
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### Problemas Comuns

#### 1. Permissões PowerShell
```powershell
# Executar como administrador
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope LocalMachine
```

#### 2. Node.js Memory Issues
```bash
# Aumentar limite de memória
node --max-old-space-size=8192 script.js
export NODE_OPTIONS="--max-old-space-size=8192"
```

#### 3. Portas Ocupadas
```powershell
# Verificar portas
netstat -ano | findstr :3000
# Matar processo
taskkill /PID <PID> /F
```

#### 4. Git LFS Issues
```bash
git lfs uninstall
git reset --hard HEAD~1
git lfs install
git lfs pull
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### Configuração Inicial
- [ ] PowerShell perfil configurado
- [ ] Variáveis de ambiente definidas
- [ ] Git configurado globalmente
- [ ] Node.js e NPM otimizados
- [ ] Docker Desktop instalado

### Otimizações
- [ ] Serviços desnecessários desabilitados
- [ ] Plano de energia em alto desempenho
- [ ] Cache NPM personalizado
- [ ] Git LFS configurado

### Segurança
- [ ] Windows Defender ativo
- [ ] Firewall configurado
- [ ] Backups automáticos
- [ ] Controle de versão ativo

---

**📅 Última Atualização:** Dezembro 2024
**🎯 Status:** Pronto para desenvolvimento Diana

> 💡 **Dica:** Execute `npm run senc doctor` para verificar se todas as configurações estão corretas.