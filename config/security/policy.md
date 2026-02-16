# Política de Segurança Cibernética

**Squad:** Kratos
**Nível:** Básico (Genesis)

## 1. Controle de Acesso
- O acesso administrativo é restrito ao Criador e ao Kernel.
- Chaves de API nunca devem ser commitadas no repositório (uso estrito de `.env`).

## 2. Segredos (Vault)
- Senhas e tokens devem ser armazenados em variáveis de ambiente ou cofres criptografados.

## 3. Firewall Cognitivo
- O sistema deve rejeitar prompts que violem o Manifesto Ético.
- Inputs externos devem ser sanitizados antes do processamento.

## 4. Auditoria
- Todas as ações críticas (deploy, delete, shutdown) devem ser logadas em `data/logs/security.log`.
