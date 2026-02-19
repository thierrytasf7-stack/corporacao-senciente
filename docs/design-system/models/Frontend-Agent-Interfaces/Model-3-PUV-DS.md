# Model-3-PUV-DS: Interface de Worker (Agent UI)

## 1. TECHNICAL SPECIFICATION (The Pipeline View)

### 1.1 Scraping Status
- **Visuals:** Linhas de log em tempo real com prefixos `[SCRAPE]`, `[ANALYSIS]`, `[PDF]`.
- **Icons:** Badge minimalista de arquivo (PDF, HTML, JSON) gerado.

### 1.2 Executive Dashboard (Mobile)
- **Layout:** Empilhamento vertical. Gauge no topo, Trinity Card no centro, Rubric Grid no rodapé.
- **Theme:** 100% Dark Mode (Carbono).

## 2. IMPLEMENTATION GUIDE (Dashboard Layout)

```html
<div class="bg-carbon min-h-screen p-6 font-body text-white">
  <section id="gauge" class="mb-10 flex justify-center">
    <!-- Componente Gauge Model-3 -->
  </section>
  <section id="trinity" class="grid grid-cols-1 gap-4 mb-10">
    <!-- Componentes Trinity Card Model-3 -->
  </section>
  <footer class="opacity-50 text-[10px] font-data text-center">
    SENTIENT EXECUTIVE ENGINE v1.0 | EXPORT: PDF_READY
  </footer>
</div>
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** O layout DEVE caber perfeitamente em um slide (16:9) e em uma tela de celular sem scroll lateral.
- **REGRA 2:** NUNCA use animações decorativas; apenas animações de telemetria funcional (Gauges e Logs).
- **REGRA 3:** O Cyber Cyan deve ser a única cor de destaque além do Heatmap de Score.

## 4. COMPLIANCE CHECKLIST
- [ ] O dashboard apresenta os botões de download (PDF/JSON) conforme o pipeline?
- [ ] O status do scraping é visível e segue o padrão de logs do Alex?

---
*PUV-DS: Efficiency is the final deliverable.*
