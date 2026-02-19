# Model-1-PES-C4: Nós de Telemetria (N2)

## 1. TECHNICAL SPECIFICATION (The Data Card)

### 1.1 Visual Stack
- **Base Layer:** `bg: var(--color-abyss)`, `opacity: 0.9`.
- **Border Layer:** `0.5px solid var(--color-blueprint)`.
- **Aura E1:** Glow externo de 10px em `rgba(74, 242, 161, 0.2)` quando ativo.

### 1.2 Geometry
- **Padding:** 16px (2x Grid Unit).
- **Header:** Glifo I3 (Símbolo Sagrado) à esquerda + ID Hexadecimal do Agente à direita (Mono).
- **Body:** Sparklines (Gráficos de Linha) em `var(--color-data)`.
- **Footer:** Confidence Score em % (JetBrains Mono).

## 2. IMPLEMENTATION GUIDE (React / Tailwind)

```jsx
const N2TelemetryNode = ({ agentId, confidence, logs }) => {
  return (
    <div className="w-64 p-4 border-[0.5px] border-blueprint bg-abyss/90 backdrop-blur-lg hover:shadow-aura-e1 transition-all duration-300">
      <header className="flex justify-between items-center mb-4">
        <MetatronCubeIcon className="w-6 h-6 text-data" />
        <span className="font-data text-xs text-blueprint uppercase">{agentId}</span>
      </header>
      <div className="h-24 mb-4">
        <Sparkline data={logs} color="var(--color-data)" />
      </div>
      <footer className="text-center">
        <p className="font-data text-lg text-data">{confidence}%</p>
        <span className="text-[8px] uppercase tracking-widest text-blueprint">Confidence Level</span>
      </footer>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use sombras pretas (Drop Shadows). O sistema usa "Aura E1" (Glow de Frequência).
- **REGRA 2:** TODO card deve ser isonômico (mesmo tamanho ou proporção áurea).
- **REGRA 3:** NUNCA oculte o ID do Agente; ele é a identidade do nó no sistema.

## 4. COMPLIANCE CHECKLIST
- [ ] O card possui aura pulsante de 0.5Hz quando em foco?
- [ ] O Sparkline utiliza a cor `--color-data`?
- [ ] O ID do agente está formatado em JetBrains Mono?

---
*Visual Arete: Data is the only truth.*
