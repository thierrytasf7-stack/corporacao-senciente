# Model-1-PES-C4: Primitivas (The Sovereign Source)

## 1. TECHNICAL SPECIFICATION (The Spectrum)

### 1.1 Palette (Abyss System)
| Token | Hex | RGB | Uso |
| --- | --- | --- | --- |
| `--color-abyss` | `#0A192F` | `10, 25, 47` | Camada 0 (Background) |
| `--color-blueprint` | `rgba(255,255,255,0.1)` | `255, 255, 255, 0.1` | Grades e eixos estruturais. |
| `--color-high-spec` | `#FFFFFF` | `255, 255, 255` | Comandos e Títulos de Alta Prioridade. |
| `--color-data` | `#4AF2A1` | `74, 242, 161` | Logs, Fluxo de Execução e Status Positivo. |
| `--color-hazard` | `#FF6B00` | `255, 107, 0` | Alertas críticos e intervenção manual. |

### 1.2 Typography (Gamma Hybrid)
- **Primary (Interface):** `Space Grotesk` (Fallback: `Inter`). Weights: `SemiBold (600)` para Títulos, `Regular (400)` para Botões.
- **Secondary (Data):** `JetBrains Mono` (Fallback: `Fira Code`). Habilitar `font-variant-ligatures: normal`.
- **Scale:** Modular 1.618 (Golden Ratio). Base 16px.

### 1.3 Geometry & Space
- **Grid Unit:** 8px.
- **Radius:** 2px (Geometric Precision). Evite arredondamentos orgânicos.
- **Border:** 0.5px sólida (Visual Sharpness).

## 2. IMPLEMENTATION GUIDE (Tailwind / CSS)

```css
:root {
  --color-abyss: #0A192F;
  --color-blueprint: rgba(255,255,255,0.1);
  --color-high-spec: #FFFFFF;
  --color-data: #4AF2A1;
  --color-hazard: #FF6B00;
  --font-interface: 'Space Grotesk', sans-serif;
  --font-data: 'JetBrains Mono', monospace;
  --aura-e1: 0 0 10px rgba(74, 242, 161, 0.3);
}

.c4-container {
  background: var(--color-abyss);
  border: 0.5px solid var(--color-blueprint);
  backdrop-filter: blur(10px);
}
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use `border-radius` maior que 4px. O sistema é geométrico e preciso.
- **REGRA 2:** NUNCA use cores fora desta paleta. Se precisar de uma variação, use opacidade (alpha) da cor base.
- **REGRA 3:** TODO texto de log DEVE ser em minúsculo e `font-data`. TODO comando em ALL CAPS e `font-interface`.

## 4. COMPLIANCE CHECKLIST
- [ ] O fundo do site é `#0A192F`?
- [ ] As fontes carregadas são `Space Grotesk` e `JetBrains Mono`?
- [ ] Não existem valores hexadecimais espalhados no código (exceto em `:root`)?

---
*Visual Arete: Precision is the only luxury.*
