# 🖥️ Monitor Tools - Acesso Remoto

Servidor de acesso remoto que permite controlar seu PC através de uma interface web. A página web exibe a tela do computador em tempo real e permite interação completa com mouse e teclado.

## ✨ Funcionalidades

- 📺 **Streaming de Tela em Tempo Real**: Visualize sua tela remotamente com baixa latência
- 🖱️ **Controle de Mouse**: Clique, arraste e role normalmente
- ⌨️ **Controle de Teclado**: Digite e use todas as teclas do teclado
- 📊 **Monitoramento**: Veja FPS, latência e resolução em tempo real
- 🎨 **Interface Moderna**: Interface limpa e responsiva
- 🔒 **Múltiplos Clientes**: Suporta múltiplas conexões simultâneas

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Windows (para robotjs funcionar corretamente)

### Passos

1. **Clone ou baixe o projeto**

2. **Instale as dependências:**
```bash
npm install
```

**Nota Importante**: A biblioteca `robotjs` pode precisar de compilação nativa. Se encontrar erros:

- No Windows, você pode precisar do Visual Studio Build Tools
- Alternativamente, use: `npm install --global windows-build-tools`

3. **Inicie o servidor:**
```bash
npm start
```

4. **Acesse no navegador:**
```
http://localhost:3000
```

## 📖 Como Usar

1. **Inicie o servidor** no computador que deseja controlar
2. **Abra o navegador** e acesse `http://localhost:3000`
3. **Aguarde a conexão** - você verá a tela do computador aparecer
4. **Interaja normalmente**:
   - Clique e arraste com o mouse
   - Digite no teclado
   - Use o scroll do mouse
   - Clique com botão direito

## 🌐 Deploy na Vercel

**⚠️ IMPORTANTE**: A Vercel é uma plataforma serverless que não mantém processos rodando continuamente. Para um servidor de acesso remoto funcionar, você precisa de um servidor sempre ativo.

### Opções para Deploy:

#### Opção 1: Servidor Dedicado (Recomendado)
- Use um VPS (DigitalOcean, AWS EC2, Linode, etc.)
- Ou um servidor sempre ativo (Heroku, Railway, Render)

#### Opção 2: Vercel Serverless Functions (Limitado)
A Vercel pode hospedar o frontend, mas o backend precisa estar em outro lugar.

1. **Configure o frontend para Vercel:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

2. **Deploy do frontend:**
```bash
npm install -g vercel
vercel
```

3. **Configure o servidor Node.js** para rodar em um VPS ou serviço sempre ativo

#### Opção 3: Usar Túnel (ngrok, Cloudflare Tunnel)
Mantenha o servidor local rodando e use um túnel para expor:

```bash
# Com ngrok
ngrok http 3000

# Ou com Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000
```

## 🔧 Configuração

### Porta do Servidor
Altere a porta editando a variável `PORT` em `server.js` ou use:
```bash
PORT=8080 npm start
```

### Taxa de Captura (FPS)
Ajuste o intervalo de captura em `server.js`:
```javascript
const SCREEN_CAPTURE_INTERVAL = 100; // 100ms = 10 FPS
// Reduza para mais FPS (ex: 50ms = 20 FPS)
```

## 🛡️ Segurança

⚠️ **ATENÇÃO**: Este servidor não possui autenticação por padrão. Para uso em produção:

1. **Adicione autenticação** (JWT, senha, etc.)
2. **Use HTTPS** (certificado SSL)
3. **Configure firewall** para limitar acesso
4. **Use VPN** ou túnel seguro
5. **Implemente rate limiting**

## 📝 Estrutura do Projeto

```
monitor-tools/
├── server.js          # Servidor Node.js principal
├── package.json       # Dependências do projeto
├── public/
│   └── index.html     # Interface web cliente
├── README.md          # Este arquivo
└── vercel.json        # Configuração Vercel (opcional)
```

## 🐛 Solução de Problemas

### Erro ao instalar robotjs
```bash
npm install --global windows-build-tools
npm rebuild robotjs
```

### Tela não aparece
- Verifique se o servidor está rodando
- Confira o console do navegador para erros
- Certifique-se de que a porta não está bloqueada pelo firewall

### Mouse/Teclado não funcionam
- Verifique se o servidor tem permissões de administrador (pode ser necessário)
- Confira se não há outros programas bloqueando o controle

## 📄 Licença

MIT

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues e pull requests!

---

**Desenvolvido com ❤️ para acesso remoto**

