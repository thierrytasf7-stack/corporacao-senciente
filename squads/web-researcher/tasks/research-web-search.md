# Task: research-web-search
# Pesquisa web geral com síntese de múltiplas fontes

elicit: true

## Purpose
Pesquisa web abrangente sobre um tópico técnico, sintetizando múltiplas fontes em um relatório coerente.

## Inputs (Elicit se não fornecidos)
- `query`: Tópico ou pergunta a pesquisar
- `depth`: quick (top 3 fontes) | standard (top 5) | deep (top 10, default: standard)
- `focus` (opcional): docs | community | news | benchmarks | tutorials

## Process

### Step 1: Web Search
WebSearch com query fornecida + variações:
- Query original
- Query + "2025 OR 2026" (para conteúdo recente)
- Query + "tutorial" (se focus=tutorials)
- Query + "benchmark" (se focus=benchmarks)

### Step 2: Fetch e análise das fontes top
Para cada URL relevante nos resultados:
- WebFetch com prompt de extração do conteúdo relevante
- Anotar: fonte, data, principais insights

### Step 3: Cross-reference
- Identificar pontos em comum entre fontes
- Identificar contradições e explicar
- Identificar consenso da comunidade

### Step 4: Síntese
Produzir resumo coeso com os principais achados.

## Output Format

```markdown
## 🌐 Pesquisa: "{query}"

**Profundidade:** {depth} | **Fontes analisadas:** {N}
**Data:** {date}

---

### 📋 Principais Achados

1. **{insight 1}**
   - Fonte: [{titulo}]({url}) — {data}
   - Detalhe: {explicação}

2. **{insight 2}**
   ...

---

### 🔑 Pontos de Consenso
- {ponto que múltiplas fontes concordam}

### ⚖️ Pontos Controversos
- {ponto X}: Alguns defendem {A}, outros {B} porque {motivo}

### 📚 Fontes Utilizadas
1. [{titulo}]({url}) — {data publicação} — {credibilidade: alta/média}
2. ...

---

### 💡 Conclusão
{síntese em 2-4 frases com a informação mais importante}
```
