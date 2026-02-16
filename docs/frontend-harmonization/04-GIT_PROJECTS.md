# 🏛️ Harmonização Frontend: GIT & PROJECTS
**Rota:** `/git-projects` | **Componente:** `src/pages/GitProjects/GitProjects.tsx`

Este documento consolida a análise técnica e funcional para a harmonização da aba **Git & Projects**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:**
O frontend tenta "adivinhar" quais tarefas pertencem a qual repositório fazendo `string.includes(repoName)`.
```typescript
// Lógica Frágil Atual
task.project.toLowerCase().includes(repoName.toLowerCase())
```

### Schema Correto (Proposto)
O Backend deve entregar a relação explicitamente.
```typescript
interface RepositoryDTO {
  id: string;
  name: string;
  url: string;
  language: string;
  ci_status: 'passing' | 'failing' | 'building' | 'unknown';
  last_commit: {
    message: string;
    author: string;
    timestamp: string;
  };
  active_tasks_ids: string[]; // Lista de IDs de tasks vinculadas
}
```
**Ação:** Atualizar o endpoint `/api/repositories` para incluir `active_tasks` ou IDs.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Gestão Visual de Repositórios
**Como** Tech Lead,
**Quero** ver o status do CI/CD dos meus repositórios principais,
**Para** saber se a build está quebrada sem abrir o GitHub.

**Critérios de Aceite:**
- [ ] Listar repositórios cadastrados.
- [ ] Exibir ícone verde/vermelho indicando status da última build.
- [ ] Exibir data do último commit.

### Story 2: Tarefas por Projeto
**Como** Desenvolvedor,
**Quero** ver quais tarefas autônomas estão rodando em cada repositório,
**Para** acompanhar o progresso dos agentes no meu código.

---

## 3. 🎨 Product Manager (Design Atômico)

### Organismos
-   **RepoList:** Lista vertical de cards de repositório.
-   **TaskSubList:** A lista aninhada de tarefas dentro de cada repo.

### Componentes para Reuso
-   `RepoCard`: Card expansível com header (Repo Info) e body (Tasks).
-   `BuildStatusBadge`: O badge "Passing/Failing".

**Instrução:**
-   Extrair o card do repositório para `src/components/organisms/RepositoryCard.tsx`.
-   Melhorar o `ProgressBar` para ter animação suave de progresso.

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Hooks:** Manter o uso de `useRepositories` e `useTasks`, mas mover a lógica de filtro (`getTasksForRepo`) para um `useMemo` ou, idealmente, para o Backend.
2.  **Performance:** A lista de repositórios pode crescer. Implementar paginação ou virtualização se houver > 20 repos.
3.  **Botões:** Os botões "SYNC NOW" e "NEW REPOSITORY" estão sem ação (`onAction={() => {}}`). Implementar modais ou navegação para essas ações.

---

## 5. 🖌️ UX Design (Refinamento)

-   **Navegação:** O Breadcrumb "DASHBOARD / GIT & PROJECTS" é estático. Torná-lo funcional ou remover se a Sidebar já cumpre esse papel.
-   **Feedback Visual:** Adicionar um indicador de "Syncing..." animado no botão "SYNC NOW" quando clicado.
-   **Empty State:** O `EmptyState` atual é bom. Garantir que o botão "Adicionar Repositório" nele funcione.
