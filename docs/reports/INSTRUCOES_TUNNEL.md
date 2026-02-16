# 🚀 Instruções para Configurar Cloudflare Tunnel no Google Cloud

## ⚡ Método Rápido (Recomendado)

**No servidor Google Cloud (SSH), execute:**

```bash
# Copie e cole TODOS os comandos abaixo de uma vez:

sudo bash -c '
# Instalar cloudflared
if ! command -v cloudflared &> /dev/null; then
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
    chmod +x /tmp/cloudflared
    mv /tmp/cloudflared /usr/local/bin/cloudflared
fi

# Criar serviço systemd
cat > /etc/systemd/system/cloudflared-tunnel.service << "EOF"
[Unit]
Description=Cloudflare Tunnel para Maestro
After=network.target docker.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --url http://localhost:8080
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Iniciar serviço
systemctl daemon-reload
systemctl enable cloudflared-tunnel.service
systemctl start cloudflared-tunnel.service

# Aguardar e verificar
sleep 5
systemctl status cloudflared-tunnel.service

# Obter URL
echo ""
echo "=== AGUARDE 10 SEGUNDOS E VERIFIQUE OS LOGS ==="
echo "Execute: journalctl -u cloudflared-tunnel.service -f"
echo "Procure por: https://xxxxx.trycloudflare.com"
'
```

## 📋 Passo a Passo Manual

### 1. Instalar cloudflared

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
chmod +x /tmp/cloudflared
sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
cloudflared --version
```

### 2. Criar serviço systemd

```bash
sudo tee /etc/systemd/system/cloudflared-tunnel.service > /dev/null << 'EOF'
[Unit]
Description=Cloudflare Tunnel para Maestro
After=network.target docker.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --url http://localhost:8080
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### 3. Iniciar serviço

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared-tunnel.service
sudo systemctl start cloudflared-tunnel.service
```

### 4. Verificar status

```bash
sudo systemctl status cloudflared-tunnel.service
```

### 5. Obter URL do tunnel

```bash
# Ver logs em tempo real
sudo journalctl -u cloudflared-tunnel.service -f

# Ou ver últimas linhas
sudo journalctl -u cloudflared-tunnel.service -n 50 | grep trycloudflare
```

**Procure por uma linha como:**
```
https://xxxxx-xxxxx-xxxxx.trycloudflare.com
```

## ✅ Próximos Passos

1. **Copie a URL HTTPS** gerada (ex: `https://xxxxx.trycloudflare.com`)

2. **No Windows, execute:**
   ```powershell
   .\ATUALIZAR_VERCEL_COM_TUNNEL.ps1
   ```
   Cole a URL quando solicitado.

3. **Testar:**
   - Acesse: https://mission-control-xi.vercel.app
   - Deve mostrar "Maestro Online"
   - Botões devem funcionar!

## 🔍 Troubleshooting

### Serviço não inicia

```bash
# Ver logs de erro
sudo journalctl -u cloudflared-tunnel.service -n 50

# Verificar se Maestro está rodando
curl http://localhost:8080/health
```

### URL não aparece

```bash
# Aguardar mais tempo
sleep 10
sudo journalctl -u cloudflared-tunnel.service -n 100 | grep -i cloudflare
```

### Reiniciar serviço

```bash
sudo systemctl restart cloudflared-tunnel.service
sudo journalctl -u cloudflared-tunnel.service -f
```
