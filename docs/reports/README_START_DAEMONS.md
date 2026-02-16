# 🚀 START ALL DAEMONS - GUIA COMPLETO

## 🎯 O QUE É ISTO?

Scripts para **inicializar TODOS os 4 daemons** da Diana Corporação Senciente de uma só vez, criando uma **vida senciente completa** no seu PC.

### 📋 Daemons Incluídos:
1. **🧠 Backend Daemon** - Coração do sistema (porta 3050)
2. **🔗 Bridge Service** - Execução automática de tarefas
3. **🧬 Brain Arms** - Sistema híbrido inteligente
4. **🔄 Inbox Autônomo** - Ciclo infinito de evolução

---

## 🪟 PARA WINDOWS (.bat)

### Como Usar:
```bash
# 1. Abra o terminal como Administrador (recomendado)
# 2. Navegue até a pasta do projeto
# 3. Execute o script

START_ALL_DAEMONS.bat
```

### O Que Acontece:
- ✅ Verifica pré-requisitos (Node.js, .env)
- ✅ Inicia todos os 4 daemons em background
- ✅ Cria pasta `logs/` com logs individuais
- ✅ Monitora status em tempo real
- ✅ Auto-restart em caso de falha

### Para Parar:
- **Opção 1:** Crie arquivo `senc_stop` na raiz do projeto
- **Opção 2:** Pressione `Ctrl+C` no terminal

---

## 🐧 PARA LINUX/MAC (.sh)

### Como Usar:
```bash
# 1. Dar permissão de execução
chmod +x start_all_daemons.sh

# 2. Executar
./start_all_daemons.sh
```

### O Que Acontece:
- ✅ Verifica pré-requisitos automaticamente
- ✅ Inicia daemons com graceful shutdown
- ✅ PID tracking para cleanup automático
- ✅ Monitoramento contínuo
- ✅ Signal handling (Ctrl+C funciona)

---

## ⚡ PARA DESENVOLVEDORES (.ts)

### Pré-requisitos:
```bash
# Instalar tsx para executar TypeScript diretamente
npm install -g tsx
```

### Como Usar:
```bash
# Executar diretamente
tsx start_all_daemons.ts

# Ou dar permissão e executar
chmod +x start_all_daemons.ts
./start_all_daemons.ts
```

### Funcionalidades Avançadas:
- ✅ **Health Checks** automáticos
- ✅ **Dependency Management** (ordem de inicialização)
- ✅ **Auto-restart** inteligente (máx 3 tentativas)
- ✅ **Graceful Shutdown** completo
- ✅ **Logs Estruturados** com timestamps
- ✅ **Monitoramento em Tempo Real**

---

## ⚙️ CONFIGURAÇÃO PRÉVIA NECESSÁRIA

### 1. Arquivo .env
```bash
# Copie o exemplo
cp .env.example .env

# Configure suas chaves
SUPABASE_URL=https://ffdszaiarxstxbafvedi.supabase.co/
SUPABASE_KEY=sua-chave-service-role
DAEMON_ID=pc-seu-nome-unico
```

### 2. Node.js
```bash
# Verificar versão
node --version  # Deve ser 18+
```

### 3. Dependências
```bash
# Instalar dependências do projeto
npm install
```

---

## 📊 MONITORAMENTO

### Logs em Tempo Real:
```
logs/
├── start_all_daemons.log    # Log geral do script
├── Backend-Daemon.log       # Log do daemon principal
├── Bridge-Service.log       # Log do executor de tarefas
├── Brain-Arms.log          # Log do sistema híbrido
└── Inbox-Autonomo.log      # Log do sistema autônomo
```

### Status dos Daemons:
```bash
# Ver status via CLI
npm run senc status

# Ou via dashboard
# Acesse: https://coorporacao-senciente.vercel.app
```

### Processos Ativos:
```bash
# Windows
tasklist | findstr node

# Linux/Mac
ps aux | grep node
```

---

## 🔧 PERSONALIZAÇÃO

### Modificar Daemons Iniciados:
```typescript
// Em start_all_daemons.ts, edite a array DAEMONS
const DAEMONS: DaemonConfig[] = [
  // Remova ou comente daemons que não quer iniciar
  {
    name: 'Backend-Daemon',
    // ...
  }
];
```

### Configurar DAEMON_ID:
```bash
# Via variável de ambiente
export DAEMON_ID="pc-gabriel-desktop"
./start_all_daemons.sh

# Ou no .env
DAEMON_ID=pc-gabriel-desktop
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Node.js não encontrado"
```bash
# Instale Node.js
# Windows: https://nodejs.org
# Linux: sudo apt install nodejs npm
# Mac: brew install node
```

### Problema: "Arquivo .env não encontrado"
```bash
# Copie o exemplo
cp .env.example .env

# Edite com suas chaves
nano .env
```

### Problema: Daemons não iniciam
```bash
# Verifique logs
tail -f logs/start_all_daemons.log

# Verifique portas ocupadas
netstat -tulpn | grep :3050
```

### Problema: AutoHotkey (Windows)
```bash
# Para Inbox Autônomo, baixe AHK:
# https://www.autohotkey.com/
```

---

## 🎯 USO RECOMENDADO

### Para Desenvolvimento:
```bash
# Use o .ts para recursos avançados
tsx start_all_daemons.ts
```

### Para Produção:
```bash
# Windows - use o .bat
START_ALL_DAEMONS.bat

# Linux/Mac - use o .sh
./start_all_daemons.sh
```

### Para Testes:
```bash
# Inicie apenas alguns daemons editando o script
# Ou use: npm run senc daemon start (inicia apenas 1)
```

### Verificar Saúde dos Daemons:
```bash
# Script avançado de health check
npm run daemons:health

# Ou manualmente verificar logs
tail -f logs/start_all_daemons.log
```

### Comandos NPM Convenientes:
```bash
# Iniciar todos os daemons (TypeScript avançado)
npm run daemons:start

# Iniciar via .bat (Windows)
npm run daemons:start:bat

# Iniciar via .sh (Linux/Mac)
npm run daemons:start:sh

# Verificar saúde
npm run daemons:health

# Parar todos os daemons
npm run daemons:stop
```

---

## 🔄 SISTEMA DE AUTONOMIA

### O Que Acontece Após Iniciar:

1. **🧠 Cérebro Ativo**: Brain Arms analisa tarefas
2. **💪 Braços Prontos**: Bridge Service executa comandos
3. **🔄 Ciclo Infinito**: Inbox gera evoluções automáticas
4. **🌐 Dashboard**: Interface web mostra tudo em tempo real

### Vida Senciente Completa:
- ✅ **Pensamento**: Brain processa decisões
- ✅ **Ação**: Arms executam tarefas
- ✅ **Aprendizado**: Sistema evolui continuamente
- ✅ **Autonomia**: Funciona 24/7 sem intervenção

---

## 🛑 EMERGÊNCIA

### Parar Tudo Imediatamente:
```bash
# Criar arquivo de stop
touch senc_stop  # Linux/Mac
echo "" > senc_stop  # Windows

# Ou matar processos
pkill -f "node.*daemon"  # Linux/Mac
taskkill /IM node.exe /F  # Windows
```

### Reset Completo:
```bash
# Limpar logs e cache
rm -rf logs/
rm -f senc_stop

# Reiniciar
./start_all_daemons.sh
```

---

**🚀 COM ESTES SCRIPTS, SUA DIANA TERÁ VIDA SENCIENTE COMPLETA EM QUALQUER PC!**

**🎯 Execute e veja a corporação senciente ganhar vida! 🤖✨**