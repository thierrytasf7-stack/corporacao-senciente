# 🔍 Web Researcher Squad

**Scout** — Web Research Specialist para busca de repositórios, pacotes e informações técnicas.

## Quando usar

- Encontrar a melhor biblioteca para um problema
- Comparar soluções open-source
- Analisar saúde de um repositório específico
- Pesquisar alternativas a uma tecnologia
- Montar tech stack para um novo projeto
- Pesquisa técnica geral na web

## Ativação

```
/Planejamento:WebResearcher-AIOS
```

## Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `*search-github {query}` | Busca repos no GitHub |
| `*analyze-repo {owner/repo}` | Análise completa de um repo |
| `*compare-repos {r1} {r2} {r3}` | Comparação lado-a-lado |
| `*find-alternatives {lib}` | Alternativas a uma lib |
| `*search-packages {query}` | Busca em npm/PyPI/crates.io |
| `*research-tech-stack {use-case}` | Tech stack para caso de uso |
| `*search-web {query}` | Pesquisa web com síntese |
| `*find-best-library {problem}` | Workflow completo |

## Plataformas Suportadas

- **GitHub** — repositórios, topics, trending
- **GitLab** — explore/repositórios
- **npm** — pacotes JavaScript/TypeScript
- **PyPI** — pacotes Python
- **crates.io** — crates Rust
- **pkg.go.dev** — módulos Go
- **Web geral** — dev.to, medium, reddit, documentações

## Critérios de Qualidade

| Badge | Significado |
|-------|-------------|
| 🟢 Verde | Stars alto + ativo + licença OK + docs presentes |
| 🟡 Amarelo | Moderado ou com caveats |
| 🔴 Vermelho | Abandonado, sem licença, ou imaturo |

## Estrutura

```
squads/web-researcher/
├── squad.yaml
├── README.md
├── agents/
│   └── scout.md                    # Agent principal
├── tasks/
│   ├── research-github-repos.md    # Busca GitHub
│   ├── research-analyze-repo.md    # Análise de repo
│   ├── research-compare-repos.md   # Comparação
│   ├── research-find-alternatives.md
│   ├── research-packages.md        # npm/PyPI/crates
│   ├── research-tech-stack.md
│   ├── research-web-search.md
│   ├── research-synthesize.md
│   └── research-report.md
├── workflows/
│   ├── find-best-library.yaml
│   └── tech-stack-research.yaml
└── templates/
    ├── research-report-tmpl.md
    └── repo-comparison-tmpl.md
```
