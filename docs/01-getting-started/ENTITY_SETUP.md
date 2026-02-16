# Agente Entidade/Autoridade – Guia de Entrevista

## Objetivo
Tratar a empresa como entidade real, garantindo cadastros, autoridades e segredos para operar MVPs.

## Perguntas-chave
1) Organização Git (GitHub/GitLab): existe? owners? SSO?  
2) Cloud (AWS/GCP/Azure) e billing: conta ativa? quem é billing admin?  
3) DNS/domínios: lista de domínios, acesso ao registrador?  
4) Deploy/edge: Vercel/Netlify/Cloudflare? credenciais e times?  
5) Segredos: cofre (Vault/1Password/SM)? política de rotação?  
6) Identidades: Okta/Entra/Google Workspace? grupos para acesso?  
7) Observabilidade/logs: onde fica? quem tem acesso admin?  
8) Compliance/segurança: requisitos (SOC2/GDPR), dados sensíveis envolvidos?  
9) Suporte/incident: canal e responsáveis?  
10) Planos de pagamento/limites: cartões, budgets, alerts?

## Saídas esperadas
- Mapa de contas e autoridades (who is owner/admin/billing).
- Lista de credenciais/segredos a provisionar (não armazenar no repo).
- Tarefas/PRDs em `task_context` para cada lacuna (ex.: “criar org GitHub”, “configurar Vercel team”).
- Notas em corporate_memory (categoria value/history) sobre decisões de autoridade.

## Ação do agente
- Conduzir a entrevista, consolidar gaps, gerar checklist e tasks.
- Referenciar políticas RLS e cofre de segredos; evitar expor chaves no repo.































