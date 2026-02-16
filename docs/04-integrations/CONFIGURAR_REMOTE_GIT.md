# 🔧 Configurar Remote do Git

## Status Atual

O remote está configurado como:
```
https://github.com/thierrytasf7-stack/Diana-Corporacao-Senciente.git
```

**IMPORTANTE:** Este repositório precisa existir no GitHub antes de fazer push.

## Passos para Publicar

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `coorporacao-autonoma` (ou outro de sua escolha)
3. Deixe **privado** ou **público** (sua escolha)
4. **NÃO** inicialize com README, .gitignore ou license (já temos)
5. Clique em "Create repository"

### 2. Configurar Remote (se necessário)

Se o nome do repositório for diferente, atualize:

```bash
git remote remove origin
git remote add origin https://github.com/SEU_USER/SEU_REPO.git
git remote -v
```

### 3. Fazer Push

```bash
git push -u origin main
```

## Verificar Remote Atual

```bash
git remote -v
```

## Alternativas de URL

Se usar SSH (recomendado se tiver chave SSH configurada):

```bash
git remote set-url origin git@github.com:thierrytasf7/coorporacao-autonoma.git
```

---

**Nota:** Se o repositório já existe mas está retornando erro 404, verifique:
- Permissões de acesso (repo privado requer autenticação)
- Nome exato do repositório
- Usuário correto do GitHub

