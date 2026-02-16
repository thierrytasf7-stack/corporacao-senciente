# 🖥️ Guia de Configuração - Infraestrutura Multi-PC

## Visão Geral

Este guia descreve como configurar a infraestrutura multi-PC da Corporação Senciente, estabelecendo a base para o swarm distribuído de computadores especializados.

## 📋 Pré-requisitos

- Windows 10/11 Pro ou Enterprise (para WSL2)
- Pelo menos 8GB RAM
- Pelo menos 50GB espaço em disco
- Conexão com internet

## 🚀 Instalação Passo a Passo

### Passo 1: Instalar WSL2

Abra o PowerShell como **Administrador** e execute:

```powershell
# Habilitar features do Windows
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Instalar WSL2 com Ubuntu
wsl --install -d Ubuntu
```

**Após a instalação, reinicie o computador.**

### Passo 2: Configurar Ubuntu

Após reiniciar, abra o Ubuntu no menu Iniciar e configure:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git python3 python3-pip nodejs npm

# Instalar SSH Server
sudo apt install -y openssh-server

# Configurar SSH (porta 2222, sem senha)
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Iniciar SSH
sudo systemctl enable ssh
sudo systemctl start ssh
```

### Passo 3: Detectar Especialização

Execute o script de detecção de especialização baseado no hardware:

```bash
# Detectar hardware
RAM_GB=$(free -g | grep Mem | awk '{print $2}')
CPU_CORES=$(nproc)
DISK_GB=$(df / | tail -1 | awk '{print int($2/1024/1024)}')

echo "Hardware detectado:"
echo "RAM: ${RAM_GB}GB"
echo "CPU Cores: ${CPU_CORES}"
echo "Disco: ${DISK_GB}GB"

# Lógica de especialização
if [ "$RAM_GB" -ge 32 ] && [ "$CPU_CORES" -ge 8 ]; then
    SPECIALIZATION="technical"
    echo "Especialização: TECHNICAL"
elif [ "$RAM_GB" -ge 16 ] && [ "$DISK_GB" -ge 512 ]; then
    SPECIALIZATION="business"
    echo "Especialização: BUSINESS"
else
    SPECIALIZATION="operations"
    echo "Especialização: OPERATIONS"
fi

# Salvar especialização
echo "$SPECIALIZATION" | sudo tee /etc/specialization
```

### Passo 4: Instalar Ferramentas por Especialização

#### Para PCs TECHNICAL:
```bash
sudo apt install -y build-essential gcc g++ make cmake \
    postgresql postgresql-contrib mysql-server redis-server \
    nginx htop iotop ncdu tree jq vim nano tmux screen \
    ansible terraform packer golang-go openjdk-17-jdk maven gradle
```

#### Para PCs BUSINESS:
```bash
sudo apt install -y postgresql postgresql-contrib mysql-server redis-server \
    nginx htop ncdu jq libreoffice pandoc texlive-latex-base

pip3 install pandas numpy matplotlib seaborn scikit-learn jupyter notebook \
    sqlalchemy requests beautifulsoup4 openpyxl
```

#### Para PCs OPERATIONS:
```bash
sudo apt install -y htop iotop ncdu tree jq vim nano tmux screen \
    postgresql-client mysql-client redis-tools nginx curl wget \
    rsync monit logrotate unattended-upgrades

sudo apt install -y clamav rkhunter chkrootkit aide
```

### Passo 5: Configurar Chaves SSH

```bash
# No Windows PowerShell, gerar chaves
ssh-keygen -t rsa -b 4096 -f $HOME\.ssh\corporacao_senciente -N "" -C "corporacao-senciente-$(hostname)"

# No Ubuntu, configurar authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copiar conteúdo da chave pública (.pub) para:
# ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Passo 6: Configurar Firewall

No Windows PowerShell como Administrador:

```powershell
# Abrir porta SSH
netsh advfirewall firewall add rule name="SSH WSL2" dir=in action=allow protocol=TCP localport=2222

# No Ubuntu
sudo ufw --force enable
sudo ufw allow 2222/tcp
```

### Passo 7: Instalar ZeroTier (Opcional)

Para conectividade P2P entre PCs:

```bash
# Instalar ZeroTier
curl -s https://install.zerotier.com | sudo bash

# O ID da rede será fornecido pelo PC Central (Brain)
```

## 🧠 Configuração do PC Central (Brain)

O PC Central coordena toda a corporação. Execute estes passos adicionais:

### 1. Instalar Ferramentas de Coordenação

```bash
# No Ubuntu do PC Brain
sudo apt install -y postgresql postgresql-contrib redis-server nginx

# Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gerenciar processos
sudo npm install -g pm2
```

### 2. Configurar Banco de Dados

```bash
# Iniciar PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Criar banco da corporação
sudo -u postgres createdb corporacao_senciente
sudo -u postgres psql -c "CREATE USER corporacao WITH PASSWORD 'senciente2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE corporacao_senciente TO corporacao;"
```

### 3. Configurar Monitoramento

```bash
# Instalar ferramentas de monitoramento
sudo apt install -y prometheus prometheus-node-exporter grafana

# Configurar Prometheus
sudo systemctl enable prometheus prometheus-node-exporter
sudo systemctl start prometheus prometheus-node-exporter
```

## 🔗 Conectando PCs Secundários

### 1. Registrar PC no Sistema Central

Execute o script de registro:

```bash
# No PC secundário, no Ubuntu
node scripts/infra/register_pc.sh
```

### 2. Configurar ZeroTier

```powershell
# No Windows do PC secundário
.\register_zerotier.ps1 -NetworkId <ID_DA_REDE_CORPORACAO>
```

### 3. Testar Conectividade

```bash
# Testar SSH com PC Brain
ssh -p 2222 ubuntu@<IP_PC_BRAIN> "echo 'Conectividade OK'"

# Testar comunicação via ZeroTier
ping <IP_ZEROTIER_PC_BRAIN>
```

## 📊 Verificação da Configuração

Execute os testes para validar a configuração:

```bash
# Testar infraestrutura básica
node scripts/infra/test_fase_0.5_complete.js run
```

### Checklist de Validação

- [ ] WSL2 instalado e funcionando
- [ ] Ubuntu configurado e atualizado
- [ ] SSH Server ativo na porta 2222
- [ ] Chaves SSH configuradas
- [ ] Firewall configurado
- [ ] Especialização detectada e aplicada
- [ ] Ferramentas específicas instaladas
- [ ] ZeroTier instalado (opcional)
- [ ] Registro no PC Central realizado
- [ ] Conectividade testada
- [ ] Testes de validação passando

## 🚨 Troubleshooting

### Problema: WSL não instala
**Solução:** Verifique se tem Windows 10/11 Pro e virtualização habilitada na BIOS.

### Problema: SSH não conecta
**Solução:**
```bash
# Verificar status do SSH
sudo systemctl status ssh

# Verificar configuração
sudo sshd -t

# Reiniciar SSH
sudo systemctl restart ssh
```

### Problema: Firewall bloqueando
**Solução:**
```powershell
# Windows Firewall - permitir porta 2222
netsh advfirewall firewall show rule name="SSH WSL2"

# Ubuntu UFW
sudo ufw status
```

### Problema: ZeroTier não conecta
**Solução:**
```bash
# Verificar status
sudo zerotier-cli status

# Listar redes
sudo zerotier-cli listnetworks

# Verificar se foi aprovado na rede
```

## 📈 Próximos Passos

Após configurar a infraestrutura:

1. **Fase 2**: Implementar arquitetura Chat/IDE
2. **Fase 3**: CLI unificado e UX
3. **Fase 4**: Sistema híbrido de autonomia
4. **Fase 5**: Testes e validação
5. **Fase 6**: Documentação final

## 📞 Suporte

Para problemas específicos, consulte:
- `docs/01-getting-started/TROUBLESHOOTING.md`
- `scripts/infra/README.md`
- Issues no repositório

---

*Guia criado automaticamente pela Corporação Senciente - $(date)*








