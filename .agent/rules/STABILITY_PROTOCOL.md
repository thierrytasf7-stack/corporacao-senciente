# 🛡️ Protocolo: estabilidade_e_blindagem_de_contexto

**Versão:** 1.0.0 | **Status:** Ativo | **Mandato:** Erro Zero de I/O.

## 📋 Diretrizes de Segurança de Execução

### 1. Regra da Subárvore (Subtree-Only)
- **Obrigatório:** O Aider JAMAIS deve ser iniciado na raiz do projeto para tarefas de componentes específicos sem a flag `--subtree-only`.
- **Racional:** Evita que o Python tente abrir 8.000 arquivos simultaneamente, o que estoura o limite de handles do Windows e causa `Permission denied`.

### 2. Blindagem de Permissões (Pre-Flight)
- Antes de iniciar um processo de IA, o sistema DEVE garantir acesso total (Full Control) ao diretório alvo.
- O grupo `Todos` (ou `Everyone`) deve ter permissão `F` recursiva na pasta do componente.

### 3. Gerenciamento de Travas (Lock Handling)
- Se um componente falhar com `Permission denied`, o trabalhador deve:
    1. Identificar se há um servidor (Vite, Next, Docker) rodando na pasta.
    2. Notificar o Guardião para tentar um `taskkill` do processo bloqueador.

### 4. Limpeza de Índice Git
- `git add -u` é obrigatório antes de qualquer execução paralela para manter a "Verdade Absoluta" do sistema.

---
*Assinado: @architect (Aria) - Diana Corporação Senciente*
