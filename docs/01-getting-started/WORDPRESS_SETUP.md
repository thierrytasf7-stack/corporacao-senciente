# Setup WordPress para Copywriting Agent

## 🎯 Objetivo

Configurar WordPress local para o Copywriting Agent publicar conteúdo automaticamente.

## 🐳 Opção 1: Docker (Recomendado)

### Pré-requisitos
- Docker Desktop instalado
- Docker Compose disponível

### Passo a Passo

1. **Iniciar WordPress:**
   ```bash
   npm run wordpress:docker:up
   # ou
   docker-compose -f docker-compose.wordpress.yml up -d
   ```

2. **Aguardar inicialização (30-60 segundos)**

3. **Acessar WordPress:**
   - URL: http://localhost:8080
   - Na primeira vez, configurar WordPress:
     - Idioma: Português (ou preferido)
     - Título do site: Copywriting Agent
     - Usuário admin: `admin`
     - Senha: escolher uma senha forte
     - Email: seu email

4. **Configurar Application Password:**
   - Acessar: WordPress Admin → Usuários → Seu Perfil
   - Rolar até "Application Passwords"
   - Nome: `Copywriting Agent`
   - Clicar em "Adicionar nova senha de aplicativo"
   - **Copiar o password gerado** (só aparece uma vez!)

5. **Atualizar env.local:**
   ```env
   WORDPRESS_URL=http://localhost:8080
   WORDPRESS_USERNAME=admin
   WORDPRESS_APP_PASSWORD=senha_gerada_aqui
   ```

6. **Testar:**
   ```bash
   npm run test:copywriting
   ```

### Comandos Úteis

```bash
# Ver logs
npm run wordpress:docker:logs

# Parar WordPress
npm run wordpress:docker:down

# Reiniciar
npm run wordpress:docker:down
npm run wordpress:docker:up
```

### phpMyAdmin

- URL: http://localhost:8081
- Usuário: `wordpress`
- Senha: `wordpress_password`

---

## 💻 Opção 2: Local (Sem Docker)

### Opção A: XAMPP

1. **Instalar XAMPP:**
   - Download: https://www.apachefriends.org/
   - Instalar normalmente

2. **Iniciar serviços:**
   - Abrir XAMPP Control Panel
   - Iniciar Apache e MySQL

3. **Instalar WordPress:**
   - Baixar: https://wordpress.org/download/
   - Extrair para `C:\xampp\htdocs\wordpress`
   - Acessar: http://localhost/wordpress
   - Seguir instalação

4. **Configurar Application Password:**
   - WordPress Admin → Usuários → Seu Perfil
   - Application Passwords → Criar: "Copywriting Agent"
   - Copiar password

5. **Atualizar env.local:**
   ```env
   WORDPRESS_URL=http://localhost/wordpress
   WORDPRESS_USERNAME=admin
   WORDPRESS_APP_PASSWORD=senha_gerada
   ```

### Opção B: Local by Flywheel

1. **Instalar Local:**
   - Download: https://localwp.com/
   - Instalar normalmente

2. **Criar site:**
   - Abrir Local
   - "Create a new site"
   - Nome: `copywriting-agent`
   - Ambiente: Preferred
   - WordPress: versão mais recente
   - Usuário: `admin`
   - Senha: escolher

3. **Configurar Application Password:**
   - WordPress Admin → Usuários → Seu Perfil
   - Application Passwords → Criar: "Copywriting Agent"
   - Copiar password

4. **Atualizar env.local:**
   ```env
   WORDPRESS_URL=http://copywriting-agent.local
   WORDPRESS_USERNAME=admin
   WORDPRESS_APP_PASSWORD=senha_gerada
   ```

### Opção C: Laragon

1. **Instalar Laragon:**
   - Download: https://laragon.org/
   - Instalar normalmente

2. **Criar site WordPress:**
   - Abrir Laragon
   - Menu → WordPress → Quick add
   - Nome: `copywriting-agent`
   - Aguardar instalação

3. **Configurar Application Password:**
   - WordPress Admin → Usuários → Seu Perfil
   - Application Passwords → Criar: "Copywriting Agent"
   - Copiar password

4. **Atualizar env.local:**
   ```env
   WORDPRESS_URL=http://copywriting-agent.test
   WORDPRESS_USERNAME=admin
   WORDPRESS_APP_PASSWORD=senha_gerada
   ```

---

## 🔍 Verificar WordPress

Execute o script de verificação:

```bash
npm run wordpress:setup
```

Ou manualmente:

```bash
node scripts/setup_wordpress_local.js
```

O script verifica se WordPress está rodando e mostra instruções.

---

## ✅ Testar Integração

Após configurar, teste a integração:

```bash
node scripts/test_copywriting_agent.js
```

Ou use o agente diretamente:

```javascript
import { executeSpecializedAgent } from './scripts/cerebro/agent_executor.js';

const result = await executeSpecializedAgent(
    'copywriting',
    'Publique este conteúdo no WordPress: título "Teste", conteúdo "Este é um teste de publicação automática."'
);

console.log(result);
```

---

## 🐛 Troubleshooting

### WordPress não encontrado

1. Verificar se está rodando:
   - Docker: `docker ps` (deve mostrar `copywriting-wordpress`)
   - XAMPP: Verificar Apache no XAMPP Control Panel
   - Local: Verificar se o site está "Running" no Local

2. Verificar porta:
   - Docker: `http://localhost:8080`
   - XAMPP: `http://localhost/wordpress` ou `http://localhost:80/wordpress`
   - Local: URL mostrada no Local (geralmente `.local`)

3. Verificar firewall:
   - Windows pode bloquear conexões locais
   - Desabilitar temporariamente para testar

### Erro de autenticação

1. Verificar Application Password:
   - Deve ser gerado em: Usuários → Seu Perfil → Application Passwords
   - **Não é a senha normal do WordPress!**

2. Verificar formato:
   - Application Password tem formato: `xxxx xxxx xxxx xxxx`
   - Usar **sem espaços** no env.local

3. Regenerar se necessário:
   - Deletar o Application Password antigo
   - Criar um novo

### Erro de conexão

1. Verificar URL:
   - Deve ser acessível no navegador
   - Testar: `http://localhost:8080/wp-json/wp/v2`

2. Verificar CORS (se aplicável):
   - WordPress local geralmente não tem problemas de CORS
   - Se usar domínio customizado, pode precisar configurar

---

## 📝 Notas

- **Application Password** é diferente da senha normal do WordPress
- Application Password só aparece **uma vez** quando criado
- Se perder, precisa criar um novo
- Application Password funciona apenas com WordPress 5.6+
- Para produção, usar HTTPS e credenciais seguras

---

## 🚀 Próximos Passos

Após configurar WordPress:

1. ✅ Testar publicação de conteúdo
2. ✅ Configurar categorias e tags
3. ✅ Configurar featured images (opcional)
4. ✅ Integrar com outros agentes (Marketing, Sales)






















