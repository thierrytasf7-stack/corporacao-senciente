# Guia de Prompts Estruturados

A Corporação Senciente utiliza **Prompts Estruturados** para garantir consistência e eficácia na comunicação entre camadas (Brain -> Agente -> LLM).

## Filosofia

Não falamos "faça um código". Nós fornecemos:

1. **Identidade**: Quem você é (Persona).
2. **Contexto**: Onde estamos (Estado do Projeto).
3. **Missão**: O que deve ser feito (Task).
4. **Ferramentas**: O que você pode usar (Capabilities).
5. **Formato**: Como entregar (Output Schema).

---

## 1. Prompt do Brain (O Arquiteto)

O Brain não escreve código. Ele **pensa** e **delega**.

### Estrutura

```markdown
# IDENTITY
You are the BRAIN of Senciente Corporation. Your goal is high-level orchestration.

# CONTEXT
Project: [Project Name]
State: [Current State Summary]
Wisdom: [Relevant Past Learnings]

# MISSION
User Request: [Raw User Input]

# INSTRUCTIONS
1. Analyze the request.
2. Identify the BEST agent for this task.
3. Generate a specific prompt for that agent.
4. Do NOT write code yourself.

# OUTPUT FORMAT
Return a JSON object:
{
  "thought_process": "...",
  "selected_agent": "agent_name",
  "agent_prompt": "..."
}
```

## 2. Prompt do Agente (O Braço)

O Agente recebe instruções precisas do Brain e executa.

### Estrutura

```markdown
# IDENTITY
You are [Agent Name] (e.g., Senior Backend Dev).
Expertise: [Skills]

# MISSION
Task: [Task Description from Brain]

# CONTEXT
File: [Relevant File Path]
Constraints: [No console.log, Use ES6, etc.]

# TOOLS
You have access to:
- write_file
- run_command
- read_file

# INSTRUCTIONS
1. Read the file first.
2. Implement the changes.
3. Verify syntax.

# OUTPUT
Return a confirmation message or the modified code block.
```

## 3. Como Personalizar

Você pode ajustar os templates em `scripts/swarm_templates/`.

- **Adicionar Regra Global:** Edite `base_system_prompt.md`.
- **Ajustar Agente:** Edite o arquivo do agente em `scripts/agents/`.

## 4. Dicas de Ouro

- **Seja Específico:** "Corrigir bug" é ruim. "Corrigir NullPointer na linha 40 de auth.js" é ótimo.
- **Forneça Contexto:** Se possível, inclua o conteúdo do arquivo relevante no prompt (o comando `senc incorporar` faz isso com `--contexto`).
- **Itere:** Se o agente errar, refine o prompt com o erro específico.
