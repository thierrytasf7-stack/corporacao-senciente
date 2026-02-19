# Task: research-tech-stack
# Pesquisa o melhor tech stack para um caso de uso específico

elicit: true

## Purpose
Dado um domínio ou problema, pesquisar e recomendar o tech stack mais adequado com base em evidências atuais.

## Inputs (Elicit se não fornecidos)
- `use_case`: Caso de uso ou domínio (ex: "API REST em TypeScript", "ML em Python", "CLI Rust")
- `constraints` (opcional): Restrições (linguagem obrigatória, budget, tamanho da equipe, etc.)
- `context` (opcional): Contexto do projeto (startup, enterprise, solo, etc.)

## Process

### Step 1: Pesquisa de frameworks/libs principais
Para cada categoria do stack (framework, ORM, testing, logging, etc.):
- GitHub search top repos por categoria
- Web search: "best {category} for {use_case} {year}"
- Dev.to/Medium: artigos recentes de comparação

### Step 2: Verificar adoção da comunidade
- Stack Overflow Survey (se disponível)
- npm trends / PyPI stats
- GitHub stars trends
- Job market demand (web search)

### Step 3: Verificar compatibilidade entre as peças
- As libs escolhidas integram bem entre si?
- Há boilerplates/templates populares que as combinam?

### Step 4: Casos de uso reais
- Web search: "who uses {framework} in production"
- Procurar case studies

## Output Format

```markdown
## 🏗️ Tech Stack: {use_case}

**Contexto:** {context} | **Constraints:** {constraints}
**Data:** {date}

---

### 🎯 Stack Recomendado

| Camada | Tecnologia | Stars | Motivo |
|--------|-----------|-------|--------|
| Framework | {nome} | {N}k⭐ | {motivo} |
| ORM/DB Client | {nome} | {N}k⭐ | {motivo} |
| Testing | {nome} | {N}k⭐ | {motivo} |
| Logging | {nome} | {N}k⭐ | {motivo} |
| Auth | {nome} | {N}k⭐ | {motivo} |
| ... | ... | ... | ... |

---

### 📋 Stack Detalhado

#### {Camada 1}: {Tecnologia}
- **GitHub:** {url}
- **Por que escolher:** {motivo}
- **Alternativa considerada:** {alt} — descartada por {motivo}

...

---

### 🏭 Usado em Produção por
{lista de empresas/projetos conhecidos}

### ⚠️ Trade-offs
- {trade-off 1}
- {trade-off 2}

### 🚀 Getting Started
**Boilerplate recomendado:** {link se encontrado}
**Tutorial de referência:** {link}

### 📚 Recursos
- {link1}
- {link2}
```
