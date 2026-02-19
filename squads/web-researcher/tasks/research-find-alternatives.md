# Task: research-find-alternatives
# Encontra alternativas a uma biblioteca/ferramenta existente

elicit: true

## Purpose
Dado que o usuário usa ou conhece uma biblioteca específica, encontrar alternativas viáveis com análise comparativa.

## Inputs (Elicit se não fornecidos)
- `library`: Biblioteca/ferramenta atual (ex: "axios", "express", "moment.js")
- `reason` (opcional): Por que quer alternativas (performance, licença, abandono, tamanho, etc.)
- `language` (opcional): Linguagem alvo

## Process

### Step 1: Entender a biblioteca original
- WebFetch no GitHub/npm da lib original
- Identificar: categoria, casos de uso, pontos fracos

### Step 2: Buscar alternativas
Estratégias de busca:
1. GitHub search: `{category} {language} alternative to {library}`
2. Web search: `"alternative to {library}" OR "{library} alternatives {year}"`
3. npm search: alternativas por categoria
4. Site:dev.to OR site:medium.com: artigos de comparação recentes
5. Reddit: `reddit.com/r/programming OR r/webdev "{library} alternative"`
6. awesome-* lists: `awesome-{language} {category}`

### Step 3: Filtrar por qualidade
Aplicar critérios padrão de qualidade (stars, atividade, licença)

### Step 4: Comparar com original
Tabela comparativa lib original vs top 3 alternativas

## Output Format

```markdown
## 🔄 Alternativas para: {library}

**Motivo da busca:** {reason}
**Data:** {date}

---

### 📌 Sobre {library} (original)
- **Stars:** {N} | **Status:** {ativo/abandonado}
- **Problema/Limitação:** {identificado}

---

### 🥇 Top Alternativas

#### 1. {alternative1} — ⭐{stars}
**Por que é melhor que {library}:** {motivo}
**Trade-off:** {desvantagem}
**GitHub:** {url}

#### 2. {alternative2}
...

#### 3. {alternative3}
...

---

### ⚖️ Comparação Rápida

| Aspecto | {library} | {alt1} | {alt2} | {alt3} |
|---------|-----------|--------|--------|--------|
| Stars | {N} | {N} | {N} | {N} |
| Atividade | {status} | ... | ... | ... |
| Bundle size | {kb} | ... | ... | ... |
| API compatível | — | ✅/❌ | ✅/❌ | ✅/❌ |
| Migração fácil | — | ✅/❌ | ✅/❌ | ✅/❌ |

---

### 🎯 Recomendação
**Migrar para:** {recomendação}
**Drop-in replacement:** {sim/não — {lib}}
**Esforço de migração:** {baixo/médio/alto}
**Motivo:** {explicação}

### 📚 Guias de Migração
- {link1 se encontrado}
```
