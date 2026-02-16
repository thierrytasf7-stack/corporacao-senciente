# 🔐 Solução: Autenticação Git para Push

## Problema

O repositório existe no GitHub, mas o Git retorna "Repository not found" ao tentar fazer push/pull.

**Causa:** Problema de autenticação. O repositório é privado ou requer credenciais.

## Soluções

### Opção 1: Usar Token de Acesso Pessoal (Recomendado)

1. **Criar Token no GitHub:**
   - Acesse: https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Dê um nome: "Diana-Corporacao-Senciente"
   - Selecione escopo: `repo` (acesso completo)
   - Clique em "Generate token"
   - **COPIE O TOKEN** (só aparece uma vez!)

2. **Configurar Git para usar token:**
   ```bash
   git remote set-url origin https://SEU_TOKEN@github.com/thierrytasf7-stack/Diana-Corporacao-Senciente.git
   ```

   Ou usar prompt de autenticação:
   ```bash
   git push -u origin main
   # Quando pedir usuário: thierrytasf7-stack
   # Quando pedir senha: COLE_O_TOKEN_AQUI
   ```

### Opção 2: Usar SSH (Mais Seguro)

1. **Verificar se tem chave SSH:**
   ```bash
   ls ~/.ssh/id_*.pub
   ```

2. **Se não tiver, criar:**
   ```bash
   ssh-keygen -t ed25519 -C "seu-email@example.com"
   ```

3. **Adicionar chave ao GitHub:**
   - Copiar conteúdo de `~/.ssh/id_ed25519.pub`
   - Acessar: https://github.com/settings/keys
   - Adicionar nova chave SSH

4. **Mudar remote para SSH:**
   ```bash
   git remote set-url origin git@github.com:thierrytasf7-stack/Diana-Corporacao-Senciente.git
   git push -u origin main
   ```

### Opção 3: GitHub CLI

1. **Instalar GitHub CLI:**
   - Windows: `winget install GitHub.cli`
   - Ou baixar: https://cli.github.com/

2. **Autenticar:**
   ```bash
   gh auth login
   ```

3. **Fazer push:**
   ```bash
   git push -u origin main
   ```

## Verificar Remote Atual

```bash
git remote -v
```

## Testar Conexão

```bash
git ls-remote origin
```

Se retornar branches, a autenticação está funcionando!

---

**Nota:** O link do commit prova que o repositório existe:
https://github.com/thierrytasf7-stack/Diana-Corporacao-Senciente/commit/af0bd25e92a8d0ffe6fcac84eda6eadf69a4df9f

O problema é apenas de autenticação.

























