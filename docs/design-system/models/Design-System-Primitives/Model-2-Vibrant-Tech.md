# Model-2-Vibrant-Tech: Primitivas (The Vibrant Source)

## 1. TECHNICAL SPECIFICATION (Design Tokens)

### 1.1 Color Palette (Eutaxia Green)
| Token | Hex | RGB | Aplicação |
| --- | --- | --- | --- |
| `--color-primary` | `#00E676` | `0, 230, 118` | Ações principais, Progresso e Flow. |
| `--color-bg-dark` | `#121212` | `18, 18, 18` | Fundo principal (Dark Mode). |
| `--color-bg-light` | `#F5F5F5` | `245, 245, 245` | Fundo principal (Light Mode). |
| `--color-surface` | `#1E1E1E` | `30, 30, 30` | Cards e superfícies elevadas. |
| `--color-text-main` | `#FFFFFF` | `255, 255, 255` | Texto primário em Dark Mode. |

### 1.2 Typography (Futuristic Sans)
- **Headers:** `Montserrat` (Angular/Autoridade).
- **Body:** `Raleway` (Moderno/Acessível).
- **Scale:** Modular 1.25 (Major Third). Base: 16px.
- **Weights:** Bold (700) para Títulos, Light (300) para corpo denso.

### 1.3 Geometry & Space
- **Grid Unit:** 8pt base.
- **Radius:** Variable `8px` (Buttons) to `16px` (Cards).
- **Shadow:** Elevation System (Soft shadows em cinzas frios).

## 2. IMPLEMENTATION GUIDE (Tailwind Config JSON)

```json
{
  "theme": {
    "extend": {
      "colors": {
        "vibrant": "#00E676",
        "neutral": {
          "900": "#121212",
          "800": "#1E1E1E",
          "100": "#F5F5F5"
        }
      },
      "fontFamily": {
        "header": ["Montserrat", "sans-serif"],
        "body": ["Raleway", "sans-serif"]
      },
      "borderRadius": {
        "vibrant": "12px"
      }
    }
  }
}
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** O verde vibrante deve ser usado com parcimônia (Luz que guia). O cinza neutro é a pedra fundamental.
- **REGRA 2:** NUNCA use `border-radius` menor que 8px. O sistema deve parecer "acolhedor e moderno".
- **REGRA 3:** Contraste mínimo de 7:1 para conformidade WCAG AAA em textos de interface.

## 4. COMPLIANCE CHECKLIST
- [ ] O arquivo `tailwind.config.js` reflete os tokens JSON acima?
- [ ] As fontes Montserrat e Raleway estão sendo carregadas via @font-face?
- [ ] O sistema de grid segue a base de 8pt?

---
*Eutaxia: Good order is the foundation of all things.*
