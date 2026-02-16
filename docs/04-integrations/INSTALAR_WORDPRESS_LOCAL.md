# 🚀 Instalar WordPress Localmente - Guia Rápido

## Opção 1: XAMPP (Mais Fácil - Recomendado)

### 1. Download e Instalação

1. **Baixar XAMPP:**
   - URL: https://www.apachefriends.org/download.html
   - Escolher versão para Windows
   - Baixar e instalar (deixe tudo padrão)

2. **Iniciar Serviços:**
   - Abrir **XAMPP Control Panel**
   - Clicar em **"Start"** para **Apache**
   - Clicar em **"Start"** para **MySQL**
   - Aguardar ambos ficarem verdes

3. **Instalar WordPress:**
   - Baixar WordPress: https://wordpress.org/download/
   - Extrair para: `C:\xampp\htdocs\wordpress`
   - Acessar: `http://localhost/wordpress`
   - Seguir instalação

### 2. Configurar WordPress

1. **Primeira Instalação:**
   - Idioma: Português
   - Título: Copywriting Agent
   - Usuário: `admin`
   - Senha: (escolha uma forte)
   - Email: seu email

2. **Criar Application Password:**
   - WordPress Admin → Usuários → Seu Perfil
   - Rolar até "Application Passwords"
   - Nome: `Copywriting Agent`
   - Clicar em "Adicionar nova senha de aplicativo"
   - **COPIE o password gerado**

3. **Atualizar env.local:**
   ```bash
   node scripts/update_wordpress_env.js
   ```
   - URL: `http://localhost/wordpress`
   - Usuário: `admin` (ou o que você criou)
   - Password: (cole o Application Password)

---

## Opção 2: Local by Flywheel (Mais Moderno)

### 1. Download e Instalação

1. **Baixar Local:**
   - URL: https://localwp.com/
   - Baixar e instalar

2. **Criar Site:**
   - Abrir Local
   - Clicar em "Create a new site"
   - Nome: `copywriting-agent`
   - Ambiente: Preferred
   - WordPress: versão mais recente
   - Usuário: `admin`
   - Senha: (escolha uma)

3. **Iniciar Site:**
   - Clicar em "Start" no site criado
   - URL será mostrada (ex: `http://copywriting-agent.local`)

### 2. Configurar Application Password

1. Acessar WordPress Admin
2. Usuários → Seu Perfil → Application Passwords
3. Criar: `Copywriting Agent`
4. Copiar password

### 3. Atualizar env.local

```bash
node scripts/update_wordpress_env.js
```
- URL: (a URL mostrada no Local, ex: `http://copywriting-agent.local`)
- Usuário: `admin`
- Password: (Application Password)

---

## Opção 3: Laragon (Leve e Rápido)

### 1. Download e Instalação

1. **Baixar Laragon:**
   - URL: https://laragon.org/download/
   - Baixar versão Full
   - Instalar

2. **Iniciar Laragon:**
   - Abrir Laragon
   - Clicar em "Start All"
   - Aguardar serviços iniciarem

3. **Criar Site WordPress:**
   - Menu → WordPress → Quick add
   - Nome: `copywriting-agent`
   - Aguardar instalação

### 2. Configurar

1. Acessar: `http://copywriting-agent.test`
2. Configurar WordPress
3. Criar Application Password
4. Atualizar env.local

---

## ⚡ Instalação Rápida (Recomendado: XAMPP)

```bash
# 1. Baixar XAMPP: https://www.apachefriends.org/
# 2. Instalar XAMPP
# 3. Iniciar Apache e MySQL no XAMPP Control Panel
# 4. Baixar WordPress: https://wordpress.org/download/
# 5. Extrair para C:\xampp\htdocs\wordpress
# 6. Acessar: http://localhost/wordpress
# 7. Configurar WordPress
# 8. Criar Application Password
# 9. Executar: node scripts/update_wordpress_env.js
```

---

## ✅ Após Instalar

Execute para configurar:

```bash
npm run wordpress:setup
```

Ou manualmente:

```bash
node scripts/update_wordpress_env.js
```

---

## 🐛 Problemas?

### "Conexão recusada"
- Verificar se Apache está rodando no XAMPP
- Verificar se porta 80 não está em uso
- Tentar `http://localhost:8080` se 80 estiver ocupada

### "Erro de banco de dados"
- Verificar se MySQL está rodando
- Verificar credenciais no `wp-config.php`

### "WordPress não encontrado"
- Verificar se arquivos estão em `C:\xampp\htdocs\wordpress`
- Verificar permissões da pasta

---

## 📝 Checklist

- [ ] Servidor local instalado (XAMPP/Local/Laragon)
- [ ] Apache/MySQL rodando
- [ ] WordPress instalado
- [ ] WordPress configurado (primeira vez)
- [ ] Application Password criado
- [ ] env.local atualizado
- [ ] Teste executado: `npm run test:copywriting`






















