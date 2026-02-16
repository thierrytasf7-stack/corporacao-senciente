# Guia de Contribuição - Diana Corporação Senciente

Bem-vindo ao repositório da Diana Corporação Senciente. Este documento define as diretrizes e convenções para contribuir com o desenvolvimento da "Jornada Senciente" e do framework AIOS.

## 🤝 Princípios Gerais

1.  **AIOS First:** O desenvolvimento é orquestrado pelo framework AIOS. Respeite a autoridade dos agentes (@mordomo, @po, @architect).
2.  **Aider First:** Utilize agentes Aider (@aider-dev) para implementação sempre que possível ($0 cost).
3.  **Qualidade:** Todo código deve passar por linting, type-checking e testes antes do merge.
4.  **Stories:** Nenhuma linha de código é escrita sem uma Story associada e critérios de aceitação claros.

## 🛠️ Convenções de Código

### TypeScript / JavaScript
*   **Estilo:** Utilizamos Prettier e ESLint. Execute `npm run format` e `npm run lint` antes de commitar.
*   **Nomenclatura:**
    *   Variáveis/Funções: `camelCase`
    *   Classes/Componentes: `PascalCase`
    *   Constantes: `UPPER_SNAKE_CASE`
*   **Tipagem:** TypeScript estrito (`strict: true`). Evite `any` sempre que possível.

### Python
*   **Estilo:** PEP 8.
*   **Ferramentas:** Utilize `black` para formatação e `ruff` ou `pylint` para linting.

### Commits
Seguimos o padrão **Conventional Commits**:
*   `feat: nova funcionalidade`
*   `fix: correção de bug`
*   `docs: documentação`
*   `style: formatação, ponto e vírgula faltando, etc.`
*   `refactor: refatoração de código`
*   `test: adição ou correção de testes`
*   `chore: tarefas de build, configurações, etc.`

Exemplo: `feat(auth): implementar login com 2FA`

## 🚀 Workflow de Desenvolvimento

1.  **Criar Story:** Solicite ao @mordomo ou @po-aider a criação de uma story.
2.  **Decomposição:** O @sm-aider decomporá a story em tasks.
3.  **Implementação:** O @mordomo orquestrará a implementação via @aider-dev.
4.  **Validação:** O @qa-aider executará testes e verificações.
5.  **Pull Request:** O @deploy-aider (ou você) criará um PR para review.

## 📂 Estrutura de Diretórios
Consulte `docs/estrutura-diretorios.md` para detalhes sobre a organização do projeto.

---
**Dúvidas?** Consulte o @mordomo ou a documentação em `docs/`.
