# 📜 Protocolo: git_regras_de_contexto_para_funcionarios

**Versão:** 1.0.0 | **Status:** Ativo | **Objetivo:** Contexto Limpo, Raciocínio Preciso.

## 🛡️ Regras de Ouro de Performance
Para garantir que o Aider seja rápido e assertivo, as seguintes regras são impostas pelo Hive Guardian:

### 1. Blindagem de Contexto (Anti-Ruído)
- **PROIBIDO:** Enviar arquivos de lock (`package-lock.json`, `yarn.lock`, `Cargo.lock`).
- **PROIBIDO:** Enviar arquivos de sessão ou dados (`auth_info`, `.sqlite`, `.log`).
- **PROIBIDO:** Enviar binários ou imagens (`.exe`, `.png`, `.jpg`).
- **REGRA:** Se o arquivo não contém lógica de programação ou configuração estrutural, ele deve ser ignorado.

### 2. Higiene de Índice (Anti-Fantasmas)
- Antes de qualquer trabalhador iniciar, o sistema DEVE rodar `git add -u`.
- Isso evita que o Aider tente mapear arquivos que já foram deletados ou movidos.

### 3. Foco Cirúrgico (Subtree First)
- Sempre que possível, o trabalhador deve focar apenas na subpasta da tarefa.
- O `.aiderignore` deve ser respeitado como a fronteira absoluta do sistema.

### 4. Versionamento Semântico
- Toda evolução deve resultar em uma atualização de versão no `component_inventory.json`.

### 5. Regra do Histórico (Cadeia de Contexto)
- **OBRIGATÓRIO:** Antes de editar qualquer componente que já tenha um histórico de evolução, o trabalhador DEVE rodar `git log -p [path]` para entender as decisões arquiteturais anteriores.
- Isso evita regressão de funcionalidades e garante que a evolução seja incremental e coerente com a "vibe" do código anterior.

---
*Assinado: @architect (Aria) - Diana Corporação Senciente*
