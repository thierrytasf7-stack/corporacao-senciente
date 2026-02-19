# Task: research-compare-repos
# Comparação lado-a-lado de múltiplos repositórios/bibliotecas

elicit: true

## Purpose
Comparar 2-5 soluções lado-a-lado com critérios objetivos, gerando uma tabela comparativa e recomendação clara.

## Inputs (Elicit se não fornecidos)
- `repos`: Lista de repos/libs para comparar (owner/repo ou nome de pacote)
- `use_case` (opcional): Para qual caso de uso está comparando (ex: "HTTP client para TypeScript")
- `criteria` (opcional): Critérios específicos de comparação além dos padrão

## Process

### Para cada repo na lista:
1. Coletar dados básicos via GitHub API (stars, forks, last commit, license, issues)
2. Verificar npm/PyPI se for pacote (downloads semanais, versão)
3. Checar documentação (existe? exemplos presentes?)
4. Verificar tamanho do bundle (se frontend)
5. Verificar TypeScript support (se relevante)
6. Verificar frequência de releases

### Critérios de comparação padrão:
- Popularidade (stars, downloads)
- Atividade (último commit, frequência releases)
- Maturidade (versão, anos no mercado)
- Documentação (qualidade, exemplos)
- Ecossistema (plugins, integrações)
- Performance (benchmarks públicos se disponíveis)
- Tamanho (bundle size, dependências)
- TypeScript (suporte nativo vs @types)
- Licença
- Bus factor

## Output Format

```markdown
## ⚖️ Comparação: {use_case}

**Libs comparadas:** {lista}
**Data:** {date}

---

### 📊 Tabela Comparativa

| Critério | {lib1} | {lib2} | {lib3} |
|----------|--------|--------|--------|
| ⭐ Stars | {N}k | {N}k | {N}k |
| 📥 Downloads/semana | {N} | {N} | {N} |
| 📅 Último commit | {data} | {data} | {data} |
| 🔖 Versão estável | {v} | {v} | {v} |
| 📜 Licença | {lic} | {lic} | {lic} |
| 📝 TypeScript | ✅/⚠️/❌ | ... | ... |
| 📚 Documentação | ✅/⚠️/❌ | ... | ... |
| 📦 Bundle size | {kb} | {kb} | {kb} |
| 🧪 Testes | ✅/⚠️/❌ | ... | ... |
| 👥 Bus factor | {N} | {N} | {N} |
| 🔄 Release freq. | {freq} | {freq} | {freq} |

---

### 🔍 Análise Individual

#### {lib1}
**Destaques:** {pontos fortes}
**Limitações:** {pontos fracos}
**Melhor para:** {caso de uso}

#### {lib2}
...

---

### 🏆 Recomendação Final

**Para {use_case}:**
| Cenário | Recomendação | Motivo |
|---------|-------------|--------|
| Produção (estabilidade) | {lib} | {motivo} |
| Performance máxima | {lib} | {motivo} |
| Projeto novo/greenfield | {lib} | {motivo} |
| Projeto pequeno/simples | {lib} | {motivo} |

**Conclusão:** {lib_vencedora} é a escolha recomendada para a maioria dos casos porque {motivo}.
```
