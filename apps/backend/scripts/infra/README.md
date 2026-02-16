# 🖥️ Infraestrutura Multi-PC - Corporação Senciente

## Visão Geral

Esta pasta contém os scripts e configurações para implementar a **infraestrutura multi-PC distribuída** da Corporação Senciente. A arquitetura permite que múltiplos computadores especializados trabalhem em conjunto, criando um "swarm" inteligente de PCs.

## 🏗️ Arquitetura

```
🌐 Corporação Senciente 7.0 - Infraestrutura Multi-PC

├── 🧠 PC Central (Brain) - Coordenação e Decisão
│   ├── WSL2 + SSH ativo 24/7
│   ├── Scripts de infra aqui
│   └── Coordenação de swarm distribuído
│
├── 💼 PC Business - Marketing, Sales, Finance
│   ├── WSL2 + SSH para acesso remoto
│   ├── Agentes especializados em negócio
│   └── Processamento de dados empresariais
│
├── 🔧 PC Technical - Dev, Debug, Validation, DevEx
│   ├── WSL2 + SSH para desenvolvimento
│   ├── Ambiente de desenvolvimento completo
│   └── Especialização em código e arquitetura
│
└── ⚙️ PC Operations - Metrics, Security, Quality
    ├── WSL2 + SSH para monitoramento
    ├── Agentes de observabilidade e segurança
    └── Gestão operacional contínua
```

## 📁 Arquivos nesta pasta

### Scripts de Setup
- **`setup_pc_template.sh`** - Configuração automatizada de PCs secundários
- **`register_pc.sh`** - Registro de PCs no sistema central
- **`process_registration.js`** - Processamento de registros no PC Brain

### Configurações
- **`pc_specializations.json`** - Definição detalhada de cada especialização

### Documentação
- **`README.md`** - Este arquivo

## 🚀 Como Adicionar um Novo PC à Corporação

### Pré-requisitos

1. **Hardware mínimo** (depende da especialização):
   - CPU: 2+ cores
   - RAM: 4GB+ mínimo, 8GB+ recomendado
   - Disco: 25GB+ espaço livre
   - Windows 10/11 Pro ou Enterprise (para WSL2)

2. **Conectividade**:
   - Acesso à rede local
   - Conexão com o PC Brain
   - Portas 2222 (SSH) liberadas no firewall

3. **Permissões**:
   - Direitos de administrador no Windows
   - Acesso ao repositório Git da corporação

### Passo a Passo

#### 1. Preparar o PC

```bash
# Clonar o repositório da corporação
git clone https://github.com/your-org/corporacao-autonoma.git
cd corporacao-autonoma

# Navegar para a pasta de infraestrutura
cd scripts/infra
```

#### 2. Executar Setup Automático

```bash
# Executar como administrador no PowerShell
# Este comando instala WSL2, Ubuntu, SSH, dependências básicas
.\setup_pc_template.sh
```

O script irá:
- ✅ Verificar e instalar WSL2
- ✅ Configurar Ubuntu como distribuição padrão
- ✅ Instalar OpenSSH Server (porta 2222)
- ✅ Gerar par de chaves SSH
- ✅ Instalar Node.js, Python, Git
- ✅ Configurar firewall e rede
- ✅ Testar configuração completa

#### 3. Registrar no Sistema Central

```bash
# Executar dentro do WSL2 Ubuntu
cd scripts/infra
./register_pc.sh
```

O script irá:
- ✅ Coletar informações do PC
- ✅ Solicitar seleção de especialização
- ✅ Testar conectividade com PC Brain
- ✅ Registrar no banco de dados
- ✅ Configurar ferramentas específicas da especialização
- ✅ Criar arquivos de configuração locais

#### 4. Verificar Registro

Após o registro, verifique no PC Brain:
```bash
# No PC Brain, verificar registros processados
ls -la ~/pc_registrations/processed/
```

## 🎯 Especializações Disponíveis

### 🧠 Brain (PC Central)
- **Função**: Coordenação e decisão central
- **Ferramentas**: Node.js, Supabase, APIs
- **Requisitos**: IP fixo, alta disponibilidade

### 💼 Business
- **Função**: Marketing, vendas, finanças
- **Ferramentas**: Puppeteer, Pandas, Google Ads API
- **Agentes**: MarketingAgent, SalesAgent, FinancialAnalyst

### 🔧 Technical
- **Função**: Desenvolvimento e testes
- **Ferramentas**: Docker, ESLint, Jest, CI/CD
- **Agentes**: DevAgent, TestAgent, DevOpsAgent

### ⚙️ Operations
- **Função**: Monitoramento e segurança
- **Ferramentas**: Prometheus, ELK Stack, Fail2Ban
- **Agentes**: MonitoringAgent, SecurityAgent

## 🔧 Manutenção e Operação

### Heartbeat (Manter PC Ativo)

```bash
# Executar periodicamente para manter status ativo
./heartbeat.sh
```

### Atualizar Especialização

```bash
# Para mudar a especialização de um PC
./register_pc.sh  # Executar novamente e escolher nova especialização
```

### Remover PC do Sistema

```bash
# No PC Brain, executar:
node scripts/infra/process_registration.js --unregister hostname-do-pc
```

## 🐛 Troubleshooting

### Problemas Comuns

#### "WSL2 não está instalado"
```bash
# Verificar status do WSL
wsl --list --verbose

# Instalar WSL2 manualmente
wsl --install -d Ubuntu
```

#### "Falha na conexão SSH com Brain"
```bash
# Testar conectividade básica
ping brain-hostname

# Verificar se SSH está rodando no Brain
ssh -p 2222 brain-user@brain-hostname "echo 'Brain reachable'"

# Verificar chaves SSH
ls -la ~/.ssh/
cat ~/.ssh/authorized_keys
```

#### "Registro não processado"
```bash
# Verificar arquivos de registro pendentes no Brain
ls -la ~/pc_registrations/

# Processar manualmente
node scripts/infra/process_registration.js ~/pc_registrations/pc_registration.json
```

#### "Ferramentas da especialização não instaladas"
```bash
# Re-executar configuração de especialização
./register_pc.sh --reconfigure
```

### Logs e Debug

```bash
# Ver logs do setup
tail -f /var/log/syslog | grep ssh

# Ver status dos serviços
sudo systemctl status ssh

# Testar aplicações instaladas
node --version
python3 --version
git --version
```

## 📊 Monitoramento

### Ver Status de Todos os PCs

```bash
# No PC Brain, verificar status via API
curl http://localhost:3000/api/pcs/status
```

### Métricas por PC

- **CPU/Memória**: `htop` ou `top`
- **Disco**: `df -h`
- **Rede**: `iftop` ou `iptraf`
- **Processos**: `ps aux | grep node`

## 🔒 Segurança

### Recomendações

1. **Use sempre autenticação por chave SSH** (nunca senha)
2. **Mantenha chaves privadas seguras** (não compartilhe)
3. **Configure firewall** para bloquear portas desnecessárias
4. **Atualize regularmente** o sistema e aplicações
5. **Monitore logs** de acesso e atividades suspeitas

### Configurações de Segurança

```bash
# SSH hardening (no /etc/ssh/sshd_config)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no

# Reiniciar SSH após mudanças
sudo systemctl restart ssh
```

## 📈 Escalabilidade

### Adicionando Mais PCs

1. **Prepare hardware** conforme requisitos da especialização
2. **Execute setup** (`setup_pc_template.sh`)
3. **Registre no sistema** (`register_pc.sh`)
4. **Configure balanceamento** (automático via Swarm Coordinator)

### Limites Recomendados

- **Business PCs**: Até 5 (dependendo da carga de marketing)
- **Technical PCs**: Até 10 (para desenvolvimento paralelo)
- **Operations PCs**: Até 3 (para redundância de monitoramento)

## 🤝 Contribuição

### Desenvolvimento

```bash
# Para modificar scripts
cd scripts/infra

# Testar mudanças localmente
bash setup_pc_template.sh --dry-run

# Commitar mudanças
git add .
git commit -m "feat: melhorar setup de PCs secundários"
```

### Testes

```bash
# Testar scripts em VM isolada
# Usar VirtualBox/VMware para testar setup completo

# Validar configurações
node test_pc_setup.js
```

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique este README
2. Consulte logs em `/var/log/`
3. Abra issue no repositório
4. Contate o time de Operations

**Mantenedor**: Corporação Senciente - Infraestrutura Team
**Versão**: 1.0
**Última atualização**: 2025-01-19






