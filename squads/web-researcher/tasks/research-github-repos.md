# Task: research-github-repos
# Busca repositórios no GitHub com filtros avançados

elicit: true

## Purpose
Buscar repositórios GitHub relevantes para uma necessidade específica, aplicando filtros de qualidade e retornando resultados ranqueados.

## Inputs (Elicit se não fornecidos)
- `query`: O que estás buscando (ex: "websocket client", "state management react")
- `language` (opcional): Linguagem de programação (typescript, python, rust, go, etc.)
- `min_stars` (opcional, default: 100): Mínimo de stars
- `topic` (opcional): Tópico específico do GitHub
- `active_since` (opcional, default: 2024-01-01): Data mínima do último commit

## Process

### Step 1: GitHub API Search
Buscar via WebFetch na GitHub API:
```
https://api.github.com/search/repositories?q={query}+language:{lang}+stars:>{min_stars}+pushed:>{active_since}&sort=stars&order=desc&per_page=10
```

Também buscar via web search para complementar:
```
site:github.com {query} {language}
```

### Step 2: GitHub Topics (se tópico fornecido)
```
https://github.com/topics/{topic}
```

### Step 3: Para cada resultado nos top 5, coletar:
- Nome completo (owner/repo)
- Stars, forks, watchers
- Linguagem principal
- Última atualização (pushed_at)
- Licença
- Descrição
- URL do README (para verificar documentação)
- Open issues count

### Step 4: Avaliar qualidade de cada repo
Aplicar critérios:
- 🟢 Verde: stars alto + ativo + licença OK + docs presentes
- 🟡 Amarelo: moderado ou com caveats
- 🔴 Vermelho: abandonado, sem licença, ou muito novo/imaturo

### Step 5: Ranking final
Ordenar por: relevância × qualidade × atividade

## Output Format

```markdown
## 🔍 Resultados: "{query}" no GitHub

**Filtros aplicados:** language:{lang} | stars > {min_stars} | ativo desde {active_since}
**Data da pesquisa:** {date}

---

### 1. ⭐ {owner}/{repo} — {stars}★ {qualidade_badge}
**Descrição:** {description}
**Linguagem:** {lang} | **Licença:** {license}
**Última atividade:** {last_pushed} | **Forks:** {forks}
**URL:** https://github.com/{owner}/{repo}
**Avaliação:** {🟢/🟡/🔴} {motivo}

### 2. {owner}/{repo} — {stars}★
...

---

## 📊 Resumo
- **Total encontrado:** {N} repositórios
- **Top recomendado:** {owner/repo} — {motivo em 1 frase}
- **Alternativa sólida:** {owner/repo}
- **Evitar:** {owner/repo} — {motivo}

## 🔗 Links Úteis
- GitHub Topics: https://github.com/topics/{topic}
- Trending: https://github.com/trending/{language}
```
