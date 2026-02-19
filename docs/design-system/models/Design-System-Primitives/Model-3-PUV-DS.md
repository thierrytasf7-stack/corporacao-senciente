# Model-3-PUV-DS: Primitivas (The Executive Source)

## 1. TECHNICAL SPECIFICATION (Design Tokens)

### 1.1 Color Palette (The Heatmap)
| Token | Hex | RGB | Aplicação |
| --- | --- | --- | --- |
| `--color-carbon` | `#0A0A0A` | `10, 10, 10` | Fundo principal (Carbono Profundo). |
| `--color-surface` | `#161616` | `22, 22, 22` | Cards com Glassmorphism. |
| `--color-cyber-cyan` | `#00F5FF` | `0, 245, 255` | Acento Primário (Sapiência/IA). |
| `--color-puv-critical` | `#FF3B30` | `255, 59, 48` | Score 0-7 (Alerta Vermelho). |
| `--color-puv-improving` | `#FFCC00` | `255, 204, 0` | Score 8-14 (Estratégia Âmbar). |
| `--color-puv-dominant` | `#34C759` | `52, 199, 89` | Score 15-20 (Sucesso Esmeralda). |

### 1.2 Typography (Readability Matrix)
- **Headings:** `JetBrains Mono` (SemiBold). Estética de dado processado.
- **Body:** `Inter` (Regular/Medium). Foco em relatórios executivos.
- **Data:** `Space Mono`. Números de notas e métricas técnicas.
- **Scale:** Modular 1.2 (Minor Third). Base: 16px.

### 1.3 Geometry & Space
- **Grid:** 8px base.
- **Glassmorphism:** `backdrop-filter: blur(12px)`. Borda de 0.5px em `rgba(255,255,255,0.05)`.
- **Radius:** 4px (Precisão de Terminal).

## 2. IMPLEMENTATION GUIDE (Tailwind Config)

```json
{
  "theme": {
    "extend": {
      "colors": {
        "carbon": "#0A0A0A",
        "cyber-cyan": "#00F5FF",
        "puv": {
          "red": "#FF3B30",
          "amber": "#FFCC00",
          "emerald": "#34C759"
        }
      },
      "fontFamily": {
        "heading": ["JetBrains Mono", "monospace"],
        "body": ["Inter", "sans-serif"],
        "data": ["Space Mono", "monospace"]
      }
    }
  }
}
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** O fundo deve ser SEMPRE Carbono Profundo (#0A0A0A). Não existe Light Mode nesta edição.
- **REGRA 2:** O Cyber Cyan é usado apenas para indicadores de "Ação da IA" e botões de comando.
- **REGRA 3:** O Gauge PUV deve ser animado; um ponteiro estático viola a "Vibe de Senciência".

## 4. COMPLIANCE CHECKLIST
- [ ] O contraste do texto Inter sobre o fundo Carbono é legível em mobile?
- [ ] A fonte JetBrains Mono está aplicada em todos os títulos de seção?
- [ ] O sistema de Glassmorphism utiliza a borda sutil de 0.05 alpha?

---
*PUV-DS: Precision is the ultimate sophistication.*
