# Configuração da Infraestrutura Multi-PC

## Visão Geral

A Corporação Senciente opera em uma infraestrutura distribuída de múltiplos PCs, onde cada computador tem uma especialização específica. Esta arquitetura permite escalabilidade horizontal e redundância.

## Arquitetura

```
🌐 Corporação Senciente - Infraestrutura Multi-PC

├── 🧠 PC Central (Brain) - Coordenação e Decisão
│   ├── Hostname: brain-pc
│   ├── IP: 192.168.1.100
│   ├── Especialização: Coordenação geral
│   └── Serviços: Dashboard, API Central, Swarm Coordinator
│
├── 💼 PC Business - Marketing, Sales, Finance
│   ├── Hostname: business-pc
│   ├── IP: 192.168.1.101
│   ├── Especialização: Operações comerciais
│   └── Serviços: Ferramentas de marketing, CRM, análise financeira
│
├── 🔧 PC Technical - Dev, Debug, Validation, DevEx
│   ├── Hostname: technical-pc
│   ├── IP: 192.168.1.102
│   ├── Especialização: Desenvolvimento e qualidade
│   └── Serviços: IDE, testes automatizados, CI/CD
│
└── ⚙️ PC Operations - Metrics, Security, Quality
    ├── Hostname: operations-pc
    ├── IP: 192.168.1.103
    ├── Especialização: Observabilidade e segurança
    └── Serviços: Monitoramento, logs, segurança, backups
```

## Configuração do PC Central (Brain)

### Pré-requisitos

- Windows 10/11 Pro ou Enterprise
- WSL2 habilitado
- Acesso administrador
- Conexão de rede estável

### Instalação Automática

```powershell
# Executar como Administrador
.\scripts\infra\setup_wsl2_ssh.ps1 -SshPort 2222 -Username brain -Password corporacao2025
```

Este script irá:
1. ✅ Instalar WSL2 com Ubuntu
2. ✅ Configurar usuário `brain`
3. ✅ Instalar e configurar SSH na porta 2222
4. ✅ Gerar chaves SSH
5. ✅ Instalar Node.js e dependências
6. ✅ Configurar inicialização automática
7. ✅ Configurar firewall do Windows

### Verificação da Instalação

```bash
# Testar SSH local
ssh -p 2222 brain@localhost

# Verificar serviços
sudo systemctl status ssh
node --version
npm --version
```

## Configuração de PCs Secundários

### Business PC

```powershell
# Executar como Administrador
.\scripts\infra\setup_pc_secondary.ps1 -Specialization business -BrainHost "192.168.1.100" -SshPort 2222
```

**Ferramentas instaladas:**
- Node.js, Python, PostgreSQL client
- Ferramentas de marketing e automação comercial

### Technical PC

```powershell
# Executar como Administrador
.\scripts\infra\setup_pc_secondary.ps1 -Specialization technical -BrainHost "192.168.1.100" -SshPort 2222
```

**Ferramentas instaladas:**
- Node.js, Python, Git, Docker
- Java JDK, ferramentas de desenvolvimento
- CI/CD e testes automatizados

### Operations PC

```powershell
# Executar como Administrador
.\scripts\infra\setup_pc_secondary.ps1 -Specialization operations -BrainHost "192.168.1.100" -SshPort 2222
```

**Ferramentas instaladas:**
- Node.js, Python, Prometheus, Grafana
- Ferramentas de monitoramento e segurança

## Registro e Gerenciamento de PCs

### API de Gerenciamento

```bash
# Listar PCs registrados
curl http://localhost:3001/api/pcs

# Registrar PC manualmente
curl -X POST http://localhost:3001/api/pcs/register \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "business-pc",
    "ip": "192.168.1.101",
    "specialization": "business"
  }'

# Ver estatísticas
curl http://localhost:3001/api/pcs/stats
```

### CLI de Gerenciamento

```bash
# Registrar PC
node scripts/infra/pc_registry.js register business-pc business 192.168.1.101

# Listar PCs
node scripts/infra/pc_registry.js list

# Ver estatísticas
node scripts/infra/pc_registry.js stats
```

## Comunicação Entre PCs

### SSH Automático

Cada PC secundário configura acesso SSH automático ao PC Central:

```bash
# Acesso direto (configurado automaticamente)
ssh -p 2222 brain@192.168.1.100

# Copiar arquivos
scp -P 2222 arquivo.txt brain@192.168.1.100:/home/brain/
```

### API de Comunicação

```javascript
// Executar comando remoto via API
const response = await fetch('/api/pcs/business-pc/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'npm run build',
    timeout: 300000
  })
});
```

## Monitoramento e Health Checks

### Health Checks Automáticos

O sistema executa health checks a cada 30 segundos:

- ✅ Verificação de conectividade SSH
- ✅ Status dos serviços essenciais
- ✅ Utilização de recursos (CPU, memória)
- ✅ Disponibilidade da API

### Dashboard de Monitoramento

Acesse o dashboard em `http://localhost:3000` para visualizar:

- 📊 Status de todos os PCs conectados
- 🔄 Atividade em tempo real
- 📈 Métricas de performance
- 🚨 Alertas e problemas

## Segurança

### Configurações de Segurança

1. **SSH Keys**: Autenticação por chave, não senha
2. **Firewall**: Regras específicas para portas necessárias
3. **Isolamento**: Cada PC tem seu próprio usuário e permissões
4. **Monitoramento**: Logs de acesso e atividades

### Backup e Recuperação

```bash
# Backup de configurações
node scripts/infra/backup_pc_configs.js

# Restauração
node scripts/infra/restore_pc_configs.js backup-2025-12-19.tar.gz
```

## Troubleshooting

### Problemas Comuns

#### SSH não conecta

```bash
# Verificar status do SSH
sudo systemctl status ssh

# Reiniciar SSH
sudo systemctl restart ssh

# Verificar portas abertas
netstat -tlnp | grep :22
```

#### PC não registra

```bash
# Verificar conectividade com Brain
ping 192.168.1.100

# Testar API do Brain
curl http://192.168.1.100:3001/api/pcs/stats

# Verificar logs
tail -f logs/pc_registry.log
```

#### Performance degradada

```bash
# Verificar uso de recursos
htop
df -h
free -h

# Reiniciar serviços
sudo systemctl restart corporacao
```

## Expansão da Infraestrutura

### Adicionando Novo PC

1. **Preparar hardware**: Instalar Windows e habilitar WSL2
2. **Executar configuração**: Usar script apropriado por especialização
3. **Registrar no sistema**: Via API ou CLI
4. **Configurar especialização**: Instalar ferramentas específicas
5. **Testar integração**: Verificar comunicação e funcionalidades

### Balanceamento de Carga

O sistema suporta balanceamento automático:

- 🔄 Distribuição de tasks por especialização
- ⚖️ Monitoramento de carga por PC
- 🔀 Migração automática quando necessário
- 📊 Relatórios de utilização

## Manutenção

### Atualizações Automáticas

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade

# Atualizar Node.js
npm install -g npm@latest
npm update -g

# Reiniciar serviços
sudo systemctl restart corporacao
```

### Limpeza e Otimização

```bash
# Limpar logs antigos
find /var/log -name "*.log" -mtime +30 -delete

# Otimizar banco de dados
node scripts/maintenance/optimize_database.js

# Verificar integridade
node scripts/health/full_health_check.js
```

## Documentação Relacionada

- [PC_CENTRAL_SETUP.md](../01-getting-started/PC_CENTRAL_SETUP.md) - Configuração detalhada do PC Central
- [MULTI_PC_ARCHITECTURE.md](../02-architecture/MULTI_PC_ARCHITECTURE.md) - Arquitetura técnica completa
- [MULTI_PC_CONTROL.md](MULTI_PC_CONTROL.md) - Interface de controle remoto

---

**Última atualização:** 2025-12-19
**Status:** ✅ Documentação completa e validada








