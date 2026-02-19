# Task: research-analyze-repo
# Análise completa de um repositório específico

elicit: true

## Purpose
Fazer um deep-dive em um repositório específico — saúde do projeto, qualidade do código, documentação, atividade, releases, e viabilidade de adoção.

## Inputs (Elicit se não fornecidos)
- `repo`: Repositório no formato owner/repo (ex: "vercel/next.js") ou URL completa

## Process

### Step 1: Dados básicos via GitHub API
```
GET https://api.github.com/repos/{owner}/{repo}
```
Coletar: stars, forks, watchers, open_issues, language, license, created_at, pushed_at, description, homepage, topics, size.

### Step 2: Releases e versões
```
GET https://api.github.com/repos/{owner}/{repo}/releases?per_page=5
```
Verificar: frequência de releases, última versão estável, changelog presente.

### Step 3: Atividade de commits
```
GET https://api.github.com/repos/{owner}/{repo}/commits?per_page=10
```
Verificar: frequência, múltiplos contribuidores, commit messages.

### Step 4: Contributors
```
GET https://api.github.com/repos/{owner}/{repo}/contributors?per_page=10
```
Verificar: número de contribuidores ativos, bus factor.

### Step 5: README e Documentação
- WebFetch na URL do README raw
- Verificar: exemplos de uso, API docs, getting started, changelog, contributing guide

### Step 6: Issues abertas
```
GET https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=10
```
Verificar: issues sem resposta, bugs críticos abertos.

### Step 7: Dependências (se package.json ou similar presente)
```
https://raw.githubusercontent.com/{owner}/{repo}/main/package.json
```

### Step 8: Homepage/Docs
Se `homepage` presente, WebFetch para verificar qualidade da documentação externa.

## Output Format

```markdown
## 🔬 Análise: {owner}/{repo}

**URL:** https://github.com/{owner}/{repo}
**Data da análise:** {date}

---

### 📊 Métricas

| Métrica | Valor |
|---------|-------|
| ⭐ Stars | {stars} |
| 🍴 Forks | {forks} |
| 👁️ Watchers | {watchers} |
| 🐛 Issues abertas | {open_issues} |
| 📅 Criado em | {created_at} |
| 🔄 Último commit | {pushed_at} |
| 💻 Linguagem | {language} |
| 📜 Licença | {license} |
| 📦 Tamanho | {size} KB |

---

### 🏥 Saúde do Projeto

**Score geral:** {score}/10

| Critério | Status | Detalhe |
|----------|--------|---------|
| Atividade recente | ✅/⚠️/❌ | {detalhe} |
| Documentação | ✅/⚠️/❌ | {detalhe} |
| Testes | ✅/⚠️/❌ | {detalhe} |
| Releases regulares | ✅/⚠️/❌ | {detalhe} |
| Bus factor | ✅/⚠️/❌ | {N} contribuidores ativos |
| Issues respondidas | ✅/⚠️/❌ | {detalhe} |
| Licença | ✅/⚠️/❌ | {license_type} |

---

### 📦 Última Release
**Versão:** {version} — **Data:** {release_date}
**Changelog:** {tem/não tem}

### 👥 Contribuidores Top 5
1. @{contributor} — {contributions} commits
...

### 📋 Issues Críticas (abertas)
{lista ou "Nenhuma crítica identificada"}

---

### ✅ Pontos Fortes
- {ponto 1}
- {ponto 2}

### ⚠️ Riscos / Caveats
- {risco 1}
- {risco 2}

### 🎯 Veredicto
**Recomendo adotar:** Sim / Com ressalvas / Não
**Motivo:** {explicação em 2-3 frases}
```
