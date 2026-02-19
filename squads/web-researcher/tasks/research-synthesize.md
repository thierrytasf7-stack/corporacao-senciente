# Task: research-synthesize
# Sintetiza múltiplas URLs/fontes em um relatório coeso

elicit: true

## Purpose
Dado um conjunto de URLs ou fontes, fazer fetch de cada uma e sintetizar o conteúdo em um relatório estruturado.

## Inputs (Elicit se não fornecidos)
- `sources`: Lista de URLs ou nomes de fontes a analisar
- `question` (opcional): Pergunta específica a responder com as fontes
- `format` (opcional): summary | detailed | comparison (default: summary)

## Process

### Para cada fonte:
1. WebFetch com prompt: "Extrai os pontos principais, dados relevantes e conclusões deste conteúdo em relação a: {question}"
2. Anotar: título, data, autor, credibilidade estimada, pontos chave

### Síntese:
1. Agrupar informações similares entre fontes
2. Identificar divergências
3. Formular resposta clara à question (se fornecida)

## Output Format

```markdown
## 📑 Síntese de Fontes

**Pergunta central:** {question}
**Fontes analisadas:** {N}
**Data:** {date}

---

### Fonte 1: [{titulo}]({url})
**Data:** {data} | **Autor:** {autor}
**Pontos principais:**
- {ponto 1}
- {ponto 2}

### Fonte 2: ...

---

### 🔗 Síntese Integrada

**Consenso:** {o que todas concordam}
**Divergências:** {onde diferem e por quê}

### ✅ Resposta à Pergunta
{resposta direta e fundamentada}

### 🔗 Referências
{lista formatada de todas as fontes}
```
