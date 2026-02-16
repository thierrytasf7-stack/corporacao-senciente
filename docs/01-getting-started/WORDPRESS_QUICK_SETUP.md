# WordPress - Setup Rápido

## 🚀 Passo a Passo Rápido

### 1. Iniciar WordPress

**Opção A - Docker (se tiver Docker instalado):**
```bash
npm run wordpress:docker:up
# ou
docker compose -f docker-compose.wordpress.yml up -d
```

**Opção B - Local (XAMPP/Local/Laragon):**
- Iniciar seu servidor local
- WordPress deve estar acessível em uma URL (ex: `http://localhost` ou `http://localhost:8080`)

### 2. Configurar WordPress (primeira vez)

1. Acessar WordPress Admin:
   - Docker: `http://localhost:8080/wp-admin`
   - Local: sua URL + `/wp-admin`

2. Se for primeira vez, configurar:
   - Idioma, título, usuário admin, senha, email

### 3. Criar Application Password

1. No WordPress Admin, ir em: **Usuários → Seu Perfil**
2. Rolar até **"Application Passwords"**
3. Criar novo password:
   - Nome: `Copywriting Agent`
   - Clicar em **"Adicionar nova senha de aplicativo"**
4. **COPIE o password gerado** (formato: `xxxx xxxx xxxx xxxx`)
   - ⚠️ **Aparece apenas uma vez!**

### 4. Atualizar env.local

**Opção A - Script Interativo:**
```bash
node scripts/configure_wordpress_env.js
```
Seguir as instruções na tela.

**Opção B - Script com Argumentos:**
```bash
node scripts/set_wordpress_env.js http://localhost:8080 admin "xxxx xxxx xxxx xxxx"
```
Substituir:
- `http://localhost:8080` pela sua URL do WordPress
- `admin` pelo seu usuário
- `"xxxx xxxx xxxx xxxx"` pelo Application Password gerado

**Opção C - Manual:**
Editar `env.local` e adicionar/atualizar:
```env
WORDPRESS_URL=http://localhost:8080
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxxxxxxxxxxxxxx
```
⚠️ Remover espaços do Application Password!

### 5. Testar

```bash
node scripts/test_copywriting_agent.js
```

---

## ✅ Checklist

- [ ] WordPress rodando
- [ ] WordPress configurado (primeira vez)
- [ ] Application Password criado
- [ ] Application Password copiado
- [ ] env.local atualizado
- [ ] Teste executado com sucesso

---

## 🐛 Problemas Comuns

### "WordPress não encontrado"
- Verificar se WordPress está rodando
- Verificar URL no navegador
- Verificar porta (8080, 80, ou outra)

### "Erro de autenticação"
- Verificar se Application Password foi criado (não é a senha normal!)
- Verificar se não tem espaços no password no env.local
- Regenerar Application Password se necessário

### "Docker não encontrado"
- Instalar Docker Desktop
- Ou usar opção Local (XAMPP/Local/Laragon)

---

## 📝 Exemplo Completo

```bash
# 1. Iniciar WordPress (Docker)
npm run wordpress:docker:up

# 2. Aguardar 30-60 segundos

# 3. Acessar http://localhost:8080/wp-admin
#    Configurar WordPress (primeira vez)
#    Criar Application Password

# 4. Atualizar env.local
node scripts/set_wordpress_env.js http://localhost:8080 admin "abcd efgh ijkl mnop"

# 5. Testar
node scripts/test_copywriting_agent.js
```






















