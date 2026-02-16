# Guia Completo de Agentes

A Corporação é composta por departamentos especializados. Aqui estão os principais agentes.

## 1. Departamento Técnico (Technical)

Focados em código, arquitetura e qualidade.

### `architect` (Chief Architect)

- **Foco:** Estrutura de pastas, padrões de projeto, escolha de stack.
- **Uso:** "Como devemos estruturar o projeto Next.js?"

### `dev_backend` (Backend Developer)

- **Foco:** APIs, Banco de Dados, Lógica de Servidor (Node/Python).
- **Uso:** "Crie uma rota de login com JWT."

### `dev_frontend` (Frontend Developer)

- **Foco:** React, CSS, Componentes Visuais.
- **Uso:** "Centralize a div e adicione animação de fade-in."

### `qa_tester` (Quality Assurance)

- **Foco:** Testes Unitários, E2E, Bugs.
- **Uso:** "Escreva testes para a função de cálculo de frete."

### `security` (Security Engineer)

- **Foco:** Vulnerabilidades, RLS, Auth.
- **Uso:** "Audite este código em busca de SQL Injection."

---

## 2. Departamento de Negócios (Business)

Focados em produto, vendas e crescimento.

### `product_owner` (Product Manager)

- **Foco:** Requisitos, User Stories, Priorização.
- **Uso:** "Transforme essa ideia vaga em requisitos técnicos."

### `marketing` (Marketing Specialist)

- **Foco:** Copywriting, SEO, Campanhas.
- **Uso:** "Escreva um post para LinkedIn anunciando a feature."

### `sales` (Sales Representative)

- **Foco:** Pitch de vendas, CRM.
- **Uso:** "Crie um script de cold call para este produto."

---

## 3. Departamento de Operações (Operations)

Focados em manter a luz acesa.

### `devops` (DevOps Engineer)

- **Foco:** CI/CD, Docker, Deploy.
- **Uso:** "Crie um Dockerfile otimizado para produção."

### `db_admin` (Database Administrator)

- **Foco:** SQL, Migrations, Performance.
- **Uso:** "Otimize esta query que está lenta."

---

## Como Chamar um Agente

**Via CLI:**

```bash
senc incorporar agente dev_frontend "Tarefa..."
```

**Via Brain:**
O Brain seleciona automaticamente o melhor agente para sua tarefa se você usar `senc incorporar brain`.
