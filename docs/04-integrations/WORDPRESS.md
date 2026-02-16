# 🚀 WordPress - Configuração Rápida

## Passo a Passo Simplificado

### 1️⃣ Iniciar WordPress

**Se tiver Docker:**
```bash
npm run wordpress:docker:up
```

**Se usar servidor local (XAMPP/Local/Laragon):**
- Iniciar seu servidor normalmente
- WordPress deve estar acessível (ex: `http://localhost`)

### 2️⃣ Criar Application Password

1. Acessar WordPress Admin (ex: `http://localhost:8080/wp-admin`)
2. Ir em: **Usuários → Seu Perfil → Application Passwords**
3. Criar novo password:
   - Nome: `Copywriting Agent`
   - Clicar em "Adicionar nova senha de aplicativo"
4. **COPIE o password** (formato: `xxxx xxxx xxxx xxxx`)

### 3️⃣ Atualizar env.local

**Método Rápido (recomendado):**
```bash
node scripts/set_wordpress_env.js http://localhost:8080 admin "xxxx xxxx xxxx xxxx"
```

Substituir:
- `http://localhost:8080` pela URL do seu WordPress
- `admin` pelo seu usuário
- `"xxxx xxxx xxxx xxxx"` pelo Application Password copiado

**Método Interativo:**
```bash
npm run wordpress:config
```

**Método Manual:**
Editar `env.local`:
```env
WORDPRESS_URL=http://localhost:8080
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxxxxxxxxxxxxxx
```
⚠️ Remover espaços do Application Password!

### 4️⃣ Testar

```bash
npm run test:copywriting
```

---

## ✅ Pronto!

Agora o Copywriting Agent pode publicar conteúdo no WordPress automaticamente!

Para mais detalhes, veja: `docs/WORDPRESS_SETUP.md`






















