# 📘 Manual de Operação e Limites: Workers Diana

Este documento registra as capacidades comprovadas e os limites operacionais dos trabalhadores nativos.

## 🤖 Agent Zero (Infraestrutura)
*   **Motor:** PowerShell 5.1+
*   **Capacidade:** Processamento de filas JSON.
*   **Limites Testados:**
    *   **Concorrência:** 5 tarefas simultâneas (Aprovado).
    *   **Tipos de Tarefa:** I/O, Git, Ping, Cálculos (Aprovado).
    *   **Sanitização:** Remove aspas e crases de comandos delegados.
*   **Uso Ideal:** Instalação de dependências, execução de testes, validação de ambiente.

## 👷 Aider (Edição de Código)
*   **Motor:** Nushell + Aider CLI
*   **Capacidade:** Edição autônoma via LLM.
*   **Limites Testados:**
    *   **Delegação:** Capaz de identificar comandos de sistema e passar para o Agent Zero (Aprovado).
    *   **Ambiente:** Auto-injeta chaves de API (Aprovado).
    *   **Estabilidade:** Requer tratamento cuidadoso de erros Nushell (Patcheado).
*   **Uso Ideal:** Refatoração, correção de bugs, criação de features.

## 🛡️ Guardian Hive (Orquestrador)
*   **Motor:** Rust (Binário Nativo)
*   **Capacidade:** Gestão de Backlog e UI TUI.
*   **Limites:**
    *   **UI:** Requer sessão de desktop para abrir janelas (Limitação do Windows).
    *   **Performance:** Ultra-rápido (<10ms por ciclo).

---
*Gerado por Quinn (@qa) após Bateria de Estresse "Gauntlet"*
