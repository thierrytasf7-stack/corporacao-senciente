# Arquitetura do Swarm Simbiótico (Chat/IDE)

A arquitetura da Senciência evoluiu de um enxame autômato puro para um **Sistema Híbrido Simbiótico**, onde a Inteligência Artificial vive dentro do ambiente de desenvolvimento (IDE) e colabora em tempo real com o humano.

## Diagrama de Fluxo

```mermaid
graph TD
    User[Usuário] -->|Comando CLI| Brain[Brain Orchestrator]
    Brain -->|Analisa Contexto| Memory[Memory System (L.L.B.)]
    Brain -->|Seleciona Agente| Prompt[Prompt Generator]
    Prompt -->|Gera Prompt Estruturado| Chat[Chat Interface / IDE]
    Chat -->|Injeta Prompt| Cursor[Cursor AI / Copilot]
    Cursor -->|Gera Código/Ação| FileSystem[Sistema de Arquivos]
    FileSystem -->|Feedback| Daemon[Daemon Monitor]
    Daemon -->|Atualiza Estado| Memory
```

## Componentes Principais

### 1. Brain Orchestrator

O cérebro central. Não executa tarefas manuais. Sua única função é **pensar** e **delegar**. Ele decide *quem* deve fazer *o que*.

### 2. Protocolo L.L.B. (Memory)

A espinha dorsal da persistência.

- **LangMem**: Memória de Longo Prazo (Wisdom). "Como resolvemos isso antes?"
- **Letta**: Memória de Curto Prazo (State). "O que estamos fazendo agora?"
- **ByteRover**: Memória de Código (Action). "Onde está esse arquivo?"

### 3. Prompt Generator

Transforma intenções abstratas em instruções precisas para LLMs. Utiliza templates otimizados para cada persona de agente.

### 4. Chat Interface

A ponte entre o sistema operacional e o modelo de IA do IDE. Simula (ou integra via API) a entrada de prompts no chat do editor, permitindo que o "Agente" assuma o controle do cursor.

### 5. Daemon (Modo Autônomo)

Um processo Node.js persistente que mantém o ciclo de vida da corporação mesmo sem interação humana direta. Ele monitora a fila de tarefas e executa ciclos de Brain/Arms periodicamente.

## Decisões de Design

### Por que "Prompt Injection"?

Em vez de construir nosso próprio editor de código (complexo e propenso a erros), parasitamos (simbioticamente) editors poderosos existentes (VS Code/Cursor). Nós injetamos a "alma" (o prompt e contexto) e deixamos o modelo do editor (Grok/Claude/GPT-4) fazer o trabalho pesado de codificação.

### Por que Node.js?

Ecossistema rico, I/O não bloqueante perfeito para orquestração, e fácil integração com ferramentas de web development.
