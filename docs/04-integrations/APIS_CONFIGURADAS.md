# APIs Configuradas

**Data:** Dezembro 2025  
**Status:** ✅ Configuradas e Prontas para Uso

---

## 🔑 APIs de Busca de Conhecimento

### Serper API ✅

**Status:** Configurado  
**API Key:** `3ac63aad1bae44a89f553be1a384a00f29b59393`  
**Uso:** Busca web alternativa/fallback  
**Documentação:** https://serper.dev

**Características:**
- Busca via Google Search API
- Alta qualidade de resultados
- Rate limiting generoso
- Usado como fallback quando Tavily não está disponível

### Tavily API ✅

**Status:** Configurado  
**API Key:** `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`  
**Uso:** Busca web principal  
**Documentação:** https://tavily.com

**Características:**
- Busca otimizada para IA
- Inclui conteúdo raw
- Melhor para deep research
- API principal para conhecimento

---

## 🔄 Estratégia de Uso

O sistema usa **Tavily como principal** e **Serper como fallback**:

1. **Tentativa 1:** Tavily API
2. **Fallback:** Se Tavily falhar ou não retornar resultados suficientes, usa Serper

Isso garante máxima disponibilidade e qualidade de resultados.

---

## 📊 Onde são Usadas

- `scripts/cerebro/knowledge_fetcher.js` - Busca de conhecimento
- `scripts/cerebro/deep_research_engine.js` - Deep research
- `scripts/cerebro/competitor_analyzer.js` - Análise competitiva

---

## ⚙️ Configuração

As APIs estão configuradas em `env.local`:

```env
SERPER_API_KEY=3ac63aad1bae44a89f553be1a384a00f29b59393
TAVILY_API_KEY=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
```

---

**Última atualização:** Dezembro 2025
























