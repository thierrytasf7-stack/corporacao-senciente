# Task: research-report
# Gera relatório estruturado consolidado da pesquisa realizada

## Purpose
Consolidar resultados de múltiplas pesquisas da sessão em um único relatório estruturado, pronto para compartilhar ou usar em tomada de decisão.

## Inputs
- Contexto da sessão atual (pesquisas já realizadas)
- `title` (opcional): Título do relatório
- `output` (opcional): screen | file (default: screen)

## Process
1. Coletar todos os resultados de pesquisa da sessão
2. Organizar por tema/categoria
3. Formatar como relatório executivo
4. Se output=file, salvar em `docs/research/{date}-{title}.md`

## Output Format

```markdown
# 📊 Relatório de Pesquisa: {title}

**Data:** {date}
**Pesquisador:** Scout (web-researcher)
**Fontes consultadas:** {N total}

---

## Sumário Executivo
{3-5 frases com os principais achados e recomendação}

---

## Pesquisas Realizadas

### 1. {tema}
{resultado condensado}

### 2. {tema}
...

---

## 🎯 Recomendações Finais

| Decisão | Recomendação | Confiança |
|---------|-------------|-----------|
| {decisão 1} | {recomendação} | Alta/Média/Baixa |

---

## 📚 Todas as Fontes
{lista completa numerada}
```
