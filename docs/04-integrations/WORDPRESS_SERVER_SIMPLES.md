# 🚀 WordPress Server Simples (Node.js)

## 📋 Visão Geral

Servidor WordPress **100% Node.js** que implementa WordPress REST API básico para publicação de conteúdo.

### ✅ Vantagens

- **Não precisa PHP/MySQL** - funciona apenas com Node.js
- **Instalação zero** - não precisa instalar XAMPP/Local/Laragon
- **Leve e rápido** - ideal para desenvolvimento e testes
- **Compatível** - implementa endpoints WordPress REST API essenciais

## 🚀 Início Rápido

### Opção 1: Setup Automático (Recomendado)

```bash
npm run wordpress:server:setup
```

Este comando:
1. Coleta credenciais (usuário e senha)
2. Atualiza `env.local` automaticamente
3. Inicia o servidor
4. Abre no navegador

### Opção 2: Iniciar Manualmente

```bash
npm run wordpress:server
```

Depois configure `env.local`:
```env
WORDPRESS_URL=http://localhost:8080
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=sua_senha_aqui
```

### Opção 3: Via .bat (Windows)

```bash
npm run wordpress:start
```

Ou execute diretamente:
```bash
scripts\start_wordpress_server.bat
```

## 📝 Endpoints Disponíveis

### GET `/wp-json/wp/v2/posts`
Lista todos os posts

### POST `/wp-json/wp/v2/posts`
Cria um novo post

**Headers:**
```
Authorization: Basic base64(username:password)
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Título do Post",
  "content": "Conteúdo do post em HTML",
  "status": "draft" | "publish"
}
```

**Resposta:**
```json
{
  "id": 1,
  "title": { "rendered": "Título do Post" },
  "content": { "rendered": "Conteúdo do post" },
  "status": "draft",
  "link": "http://localhost:8080/post/1",
  "date": "2025-01-XX..."
}
```

## 🔧 Configuração

### Porta

Por padrão, o servidor roda na porta **8080**.

Para usar outra porta:
```bash
WORDPRESS_PORT=8081 npm run wordpress:server
```

### Armazenamento

Os posts são salvos em:
```
wordpress_posts/posts.json
```

## 🧪 Testar Integração

Após iniciar o servidor, teste com o Copywriting Agent:

```bash
npm run test:copywriting
```

## 📊 Interface Web

Acesse `http://localhost:8080` para ver:
- Lista de posts publicados
- Visualização individual de posts
- Link para API REST

## 🔐 Autenticação

O servidor usa **Basic Authentication**:
- Usuário: `WORDPRESS_USERNAME` do `env.local`
- Senha: `WORDPRESS_APP_PASSWORD` do `env.local`

## ⚠️ Limitações

Este servidor é **simples** e focado em **desenvolvimento/testes**:

- ✅ Publicação de posts
- ✅ Listagem de posts
- ✅ Visualização web
- ❌ Não tem plugins WordPress
- ❌ Não tem temas WordPress
- ❌ Não tem MySQL/banco de dados completo
- ❌ Não tem admin panel completo

Para produção, use WordPress real ou WordPress.com.

## 🆚 Comparação

| Recurso | WordPress Real | Este Servidor |
|---------|---------------|---------------|
| PHP/MySQL | ✅ Necessário | ❌ Não precisa |
| Instalação | Complexa | Zero |
| REST API | ✅ Completa | ✅ Básica |
| Admin Panel | ✅ Completo | ❌ Não tem |
| Plugins | ✅ Milhares | ❌ Não tem |
| Uso | Produção | Dev/Testes |

## 🐛 Troubleshooting

### Porta já em uso

```bash
WORDPRESS_PORT=8081 npm run wordpress:server
```

### Erro de autenticação

Verifique `env.local`:
```env
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=sua_senha
```

### Servidor não inicia

Verifique se Node.js está instalado:
```bash
node --version
```

## 📚 Próximos Passos

1. ✅ Iniciar servidor: `npm run wordpress:server:setup`
2. ✅ Testar publicação: `npm run test:copywriting`
3. ✅ Integrar com Copywriting Agent

---

**Criado para:** Copywriting Agent - Corporação Autônoma






















