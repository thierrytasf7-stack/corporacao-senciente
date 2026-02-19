# Model-3-PUV-DS: Dashboards Executivos (Dashboards)

## 1. TECHNICAL SPECIFICATION (The Executive View)

### 1.1 Layout Structure
- **Focus:** Centralização total no PUV Score.
- **Glassmorphism:** Uso intensivo de camadas em `--color-surface` com blur de 12px.
- **Header:** ID da Entidade analisada em JetBrains Mono.

### 1.2 Deliverables Section
- Lista de badges para os arquivos gerados: `PDF_DIAGNOSTIC`, `HTML_VIEWER`, `RAW_JSON`.

## 2. IMPLEMENTATION GUIDE (React)

```jsx
const ExecutiveDashboard = ({ entityId, score }) => {
  return (
    <div className="p-8 bg-carbon rounded-lg shadow-2xl border border-white/10">
      <header className="mb-8 border-b border-white/5 pb-4">
        <h1 className="font-heading text-cyber-cyan text-lg uppercase tracking-tighter">
          ENTITY_ANALYSIS :: {entityId}
        </h1>
      </header>
      <div className="flex flex-wrap gap-8 justify-around">
        <PUVGauge score={score} />
        <div className="flex-1 min-w-[300px]">
          <RubricGrid />
        </div>
      </div>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use cores de fundo diferentes de Carbono (#0A0A0A).
- **REGRA 2:** O cabeçalho deve usar obrigatoriamente JetBrains Mono para passar a estética "Sentient Executive".
- **REGRA 3:** A borda de Glassmorphism (0.5px) é o único separador visual permitido entre módulos.

## 4. COMPLIANCE CHECKLIST
- [ ] O dashboard é visualmente idêntico à "Vibe Apple de Dados"?
- [ ] A hierarquia visual prioriza o Score (Gauge) sobre os dados brutos?

---
*PUV-DS: The diagnostic is the product.*
