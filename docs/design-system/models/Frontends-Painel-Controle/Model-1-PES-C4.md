# Model-1-PES-C4: Portal de Comando (P2)

## 1. TECHNICAL SPECIFICATION (The Radial Mandala)

### 1.1 Radial Mapping (The 8 Axes)
| Axis | Direction | Category | Content |
| --- | --- | --- | --- |
| **0°** | North | Intention | New Task / Agent |
| **45°** | North-East | Strategy | Market Monitoring |
| **90°** | East | Reality | Real-time Telemetry |
| **135°** | South-East | Growth | Evolution Metrics |
| **180°** | South | Structure | System Settings |
| **225°** | South-West | Security | Auth & Access |
| **270°** | West | History | Execution Logs |
| **315°** | North-West | Research | Knowledge Base |

### 1.2 Dynamics
- **Trigger:** Long Click (500ms) ou Shortcut (CMD/Ctrl + K).
- **Origin:** O centro do menu nasce exatamente nas coordenadas (X, Y) do cursor.
- **Visuals:** `backdrop-filter: blur(10px)` expandido por toda a tela de fundo.

## 2. IMPLEMENTATION GUIDE (CSS / React)

```css
.radial-portal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 20%, var(--color-abyss) 100%);
  animation: expandFractal 0.3s ease-out;
}

.axis-item {
  position: absolute;
  transform-origin: center;
  transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use botões quadrados dentro do Menu Radial. Tudo é circular ou vetorial (Glifos I3).
- **REGRA 2:** O menu DEVE ser transparente o suficiente para não perder o contexto visual do background.
- **REGRA 3:** O feedback sonoro de 432Hz (Chime) é OBRIGATÓRIO ao selecionar um eixo.

## 4. COMPLIANCE CHECKLIST
- [ ] O menu nasce no ponto de clique do mouse?
- [ ] Os 8 eixos estão mapeados corretamente de acordo com o protocolo?
- [ ] O efeito `backdrop-blur` de 10px é aplicado ao fundo ao abrir?

---
*Visual Arete: The center of the system is the Will.*
