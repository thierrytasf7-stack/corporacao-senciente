# Task: research-packages
# Busca pacotes em múltiplos registries (npm, PyPI, crates.io, pkg.go.dev)

elicit: true

## Purpose
Buscar pacotes em registries específicos para uma necessidade técnica, verificando downloads, versão, manutenção e compatibilidade.

## Inputs (Elicit se não fornecidos)
- `query`: O que estás buscando
- `platform`: npm | pypi | crates | go | all (default: all)
- `language` (opcional): Linguagem alvo

## Process por plataforma

### npm
```
WebFetch: https://registry.npmjs.org/-/v1/search?text={query}&size=10&quality=0.8&popularity=0.8
```
Para cada resultado: nome, versão, descrição, downloads semanais, TypeScript support, última atualização

### PyPI
```
WebSearch: site:pypi.org {query}
WebFetch: https://pypi.org/search/?q={query}&o=-zscore
```
Para resultado específico: `https://pypi.org/pypi/{package}/json`

### crates.io (Rust)
```
WebFetch: https://crates.io/api/v1/crates?q={query}&sort=downloads&per_page=10
```

### pkg.go.dev
```
WebSearch: site:pkg.go.dev {query}
```

## Output Format

```markdown
## 📦 Pacotes: "{query}"

**Plataformas buscadas:** {plataformas}
**Data:** {date}

---

### npm

| Pacote | Versão | Downloads/sem | TypeScript | Última atualiz. |
|--------|--------|--------------|-----------|----------------|
| {nome} | {v} | {N}M | ✅/❌ | {data} |

**Destaque:** `{pacote}` — {motivo}

---

### PyPI

| Pacote | Versão | Última atualiz. | Status |
|--------|--------|----------------|--------|
| {nome} | {v} | {data} | {ativo/abandonado} |

---

### crates.io (Rust)

| Crate | Versão | Downloads totais | Última atualiz. |
|-------|--------|-----------------|----------------|
| {nome} | {v} | {N} | {data} |

---

### 🎯 Recomendação por Plataforma
- **npm:** `{pacote}` — {motivo}
- **Python:** `{pacote}` — {motivo}
- **Rust:** `{crate}` — {motivo}
```
