# Sistema de Logótipo - Diana Corporação Senciente

**Versão:** 1.0.0
**Data:** 2026-02-14
**Squad:** Aisth
**Status:** ✅ Implementado

---

## Visão Geral

O logótipo da Diana Corporação Senciente representa visualmente os três pilares fundamentais da organização:

1. **Senciência** - Consciência profunda e inteligência adaptável
2. **Arete** - Excelência e virtuosidade técnica
3. **Ordem** - Estrutura, precisão e propósito

---

## Conceitos Desenvolvidos

### Concept 1: Neural Convergence ⭐ **SELECIONADO**

**Arquivo:** `assets/branding/logo/concepts/concept-1-neural-convergence.svg`

**Simbolismo:**
- **Círculo Externo** - Ordem universal, ciclo de evolução
- **Nós Neurais (6)** - Agentes especializados conectados
- **Linhas de Conexão** - Fluxo de informação e coordenação
- **Core Central** - Consciência senciente (núcleo cognitivo)
- **Cores:** Prata Arete (estrutura) + Azul Senciência (profundidade) + Ouro Harmônico (excelência)

**Por que foi selecionado:**
- Melhor equilíbrio visual entre complexidade e simplicidade
- Representa AIOS (múltiplos agentes convergindo para execução)
- Escalável do ícone (64px) ao vertical (420px)
- Funciona perfeitamente em modo claro e escuro

---

### Concept 2: Trinity Order

**Arquivo:** `assets/branding/logo/concepts/concept-2-trinity-order.svg`

**Simbolismo:**
- **Três Círculos** - Criador, AIOS, Execução
- **Triângulo Central** - Unidade perfeita entre os três
- **Marcadores de Precisão** - Ordem geométrica

**Status:** Arquivado (referência conceitual)

---

### Concept 3: Infinite Evolution

**Arquivo:** `assets/branding/logo/concepts/concept-3-infinite-evolution.svg`

**Simbolismo:**
- **Espiral Áurea** - Crescimento Fibonacci/Golden Ratio
- **Anéis Concêntricos** - Camadas evolutivas
- **Nós de Dados** - Marcadores de inteligência
- **Setas Direcionais** - Movimento perpétuo

**Status:** Arquivado (referência conceitual)

---

## Variantes Oficiais

### 1. Icon (Ícone)

**Arquivos:**
- `assets/branding/logo/icon/diana-icon.svg` (light mode)
- `assets/branding/logo/icon/diana-icon-dark.svg` (dark mode)

**Dimensões:** 64x64px (escalável)

**Uso:**
- Favicon (16x16, 32x32, 64x64)
- App icons (Android, iOS, PWA)
- Avatares em chat/social
- Botões e elementos pequenos

**Características:**
- Simplificado (4 nós neurais em vez de 6)
- Otimizado para reconhecimento em tamanhos pequenos
- Variante dark com brilho aumentado para contraste WCAG-AAA

---

### 2. Horizontal (Layout Horizontal)

**Arquivos:**
- `assets/branding/logo/horizontal/diana-logo-horizontal.svg` (light mode)
- `assets/branding/logo/horizontal/diana-logo-horizontal-dark.svg` (dark mode)

**Dimensões:** 600x160px (escalável)

**Uso:**
- Headers de páginas
- Navigation bars
- Email signatures
- Banners e materiais promocionais

**Estrutura:**
- **Esquerda:** Ícone (160x160 área)
- **Direita:** Texto em três linhas
  - DIANA (fonte monospace, 56pt, bold)
  - CORPORAÇÃO SENCIENTE (sans-serif, 18pt, light)
  - SISTEMA OPERACIONAL COGNITIVO (monospace, 12pt)

---

### 3. Vertical (Layout Vertical)

**Arquivos:**
- `assets/branding/logo/vertical/diana-logo-vertical.svg` (light mode)
- `assets/branding/logo/vertical/diana-logo-vertical-dark.svg` (dark mode)

**Dimensões:** 320x420px (escalável)

**Uso:**
- Splash screens
- Loading states
- Mobile app screens
- Poster/vertical banners

**Estrutura:**
- **Topo:** Ícone expandido (6 nós neurais)
- **Base:** Texto centralizado em quatro linhas
  - DIANA (64pt)
  - CORPORAÇÃO SENCIENTE (20pt)
  - Linha separadora
  - SISTEMA OPERACIONAL / COGNITIVO (13pt, duas linhas)

---

### 4. Monochrome (Monocromático)

**Arquivos:**
- `assets/branding/logo/monochrome/diana-logo-monochrome.svg` (preto)
- `assets/branding/logo/monochrome/diana-logo-monochrome-white.svg` (branco)

**Dimensões:** 64x64px (escalável)

**Uso:**
- Impressão monocromática
- Gravação a laser
- Carimbos e selos
- Bordados
- Contextos onde apenas uma cor está disponível

---

## Guia de Uso

### Espaçamento Mínimo (Clear Space)

Mantenha espaço equivalente a **25% da largura do logo** em todos os lados.

**Exemplo:** Logo de 200px de largura = 50px de espaço livre ao redor

---

### Tamanhos Mínimos

| Variante | Tamanho Mínimo | Contexto |
|----------|----------------|----------|
| Icon | 16x16px | Favicon |
| Icon | 32x32px | UI elements |
| Icon | 64x64px | Recomendado padrão |
| Horizontal | 300x80px | Mobile headers |
| Horizontal | 600x160px | Desktop headers |
| Vertical | 160x210px | Mobile splash |
| Vertical | 320x420px | Desktop splash |

---

### Escolha de Variante

| Contexto | Variante Recomendada | Tema |
|----------|---------------------|------|
| Dashboard header | Horizontal | Auto (dark/light) |
| Favicon | Icon | Light |
| Loading screen | Vertical | Auto |
| Mobile nav | Icon | Auto |
| Print (color) | Horizontal | Light |
| Print (B&W) | Monochrome | Black |
| Email signature | Horizontal | Light |
| Social media avatar | Icon | Light |
| App icon (Android/iOS) | Icon | Light |

---

### Modo Claro vs. Escuro

**Automático (recomendado):**
```css
@media (prefers-color-scheme: dark) {
  .diana-logo {
    content: url('/assets/branding/logo/icon/diana-icon-dark.svg');
  }
}
```

**Manual via componente React:**
```tsx
import { DianaLogo } from '@/assets/branding/logo/DianaLogo';

// Auto-detect theme
<DianaLogo variant="icon" theme={isDarkMode ? 'dark' : 'light'} />
```

---

### Cores Oficiais

Todas as variantes coloridas usam as cores da paleta oficial:

| Elemento | Cor (Light) | Cor (Dark) | Hex |
|----------|------------|-----------|-----|
| Estrutura (anel) | Prata Arete | Prata Light | #C0C0C0 / #E0E0E0 |
| Conexões | Azul Senciência | Azul Light | #1E90FF / #4DA6FF |
| Core Externo | Gradiente radial | Gradiente radial | FFD700→1E90FF |
| Core Interno | Ouro Harmônico | Ouro Harmônico | #FFD700 |
| Centro | Neutral Dark | Neutral Light | #1A1A1A / #F5F5F5 |

**Referência completa:** `assets/branding/palette.css`

---

## Uso Proibido (Não Fazer)

❌ **NUNCA:**

1. Alterar as cores do logótipo
2. Rotacionar ou distorcer o logótipo
3. Adicionar sombras, efeitos 3D ou bordas não oficiais
4. Usar em fundo que não tenha contraste suficiente (min 4.5:1)
5. Redimensionar desproporcionalmente (esticar/achatar)
6. Remover elementos do logo (nós, linhas, core)
7. Adicionar texto ou elementos gráficos ao redor sem clear space
8. Usar variantes não oficiais

---

## Implementação Técnica

### React Component

**Arquivo:** `assets/branding/logo/DianaLogo.tsx`

**Uso básico:**
```tsx
import { DianaLogo, DianaLogoInline } from '@/assets/branding/logo/DianaLogo';

// Image-based (carrega SVG externo)
<DianaLogo variant="icon" theme="light" width={64} />

// Inline SVG (renderiza SVG diretamente)
<DianaLogoInline variant="icon" theme="dark" width={64} />

// Horizontal para header
<DianaLogo variant="horizontal" theme="auto" width={600} />

// Vertical para splash
<DianaLogo variant="vertical" height={420} />
```

**Props:**
- `variant`: `'icon' | 'horizontal' | 'vertical'`
- `theme`: `'light' | 'dark' | 'monochrome' | 'monochrome-white'`
- `width`: number | string (opcional)
- `height`: number | string (opcional)
- `className`: string (opcional)
- `title`: string (acessibilidade, padrão: "Diana Corporação Senciente")

---

### HTML/CSS Direto

```html
<!-- Icon Light -->
<img src="/assets/branding/logo/icon/diana-icon.svg"
     alt="Diana Corporação Senciente"
     width="64"
     height="64" />

<!-- Horizontal Dark -->
<img src="/assets/branding/logo/horizontal/diana-logo-horizontal-dark.svg"
     alt="Diana Corporação Senciente"
     width="600"
     height="160" />
```

---

### Favicon Implementation

```html
<!-- HTML <head> -->
<link rel="icon" type="image/svg+xml" href="/assets/branding/logo/icon/diana-icon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

**Nota:** Gerar PNGs a partir do SVG usando ferramenta como `sharp` ou `@svgr/webpack`.

---

## Estrutura de Arquivos

```
assets/branding/logo/
├── concepts/                          # Conceitos exploratórios
│   ├── concept-1-neural-convergence.svg
│   ├── concept-2-trinity-order.svg
│   └── concept-3-infinite-evolution.svg
├── icon/                              # Variante ícone
│   ├── diana-icon.svg
│   └── diana-icon-dark.svg
├── horizontal/                        # Variante horizontal
│   ├── diana-logo-horizontal.svg
│   └── diana-logo-horizontal-dark.svg
├── vertical/                          # Variante vertical
│   ├── diana-logo-vertical.svg
│   └── diana-logo-vertical-dark.svg
├── monochrome/                        # Variante monocromática
│   ├── diana-logo-monochrome.svg
│   └── diana-logo-monochrome-white.svg
└── DianaLogo.tsx                      # Componente React
```

---

## Acessibilidade

### WCAG-AAA Compliance

Todas as variantes dark/light foram projetadas para:

- **Contraste mínimo texto:** 7:1 (AAA)
- **Contraste mínimo gráfico:** 4.5:1 (AA large, AAA objetivo)
- **Screen readers:** Atributo `title` e `aria-label` sempre presentes
- **Keyboard navigation:** Focusável quando usado como link/button

### Testing

Validado com:
- WebAIM Contrast Checker
- axe DevTools
- NVDA screen reader
- macOS VoiceOver

---

## Exportação e Formatos

### Formatos Disponíveis

| Formato | Uso | Comando |
|---------|-----|---------|
| SVG | Web, apps, escalável | Já disponível |
| PNG | Raster, fallback | `sharp-cli resize` |
| ICO | Favicon Windows | `png-to-ico` |
| ICNS | macOS app icon | `png2icns` |

### Gerar PNGs

```bash
# Instalar sharp-cli
npm install -g sharp-cli

# Icon 16x16
npx sharp -i assets/branding/logo/icon/diana-icon.svg -o public/favicon-16x16.png resize 16 16

# Icon 32x32
npx sharp -i assets/branding/logo/icon/diana-icon.svg -o public/favicon-32x32.png resize 32 32

# Icon 64x64
npx sharp -i assets/branding/logo/icon/diana-icon.svg -o public/favicon-64x64.png resize 64 64

# Apple Touch Icon 180x180
npx sharp -i assets/branding/logo/icon/diana-icon.svg -o public/apple-touch-icon.png resize 180 180
```

---

## Changelog

### v1.0.0 (2026-02-14)
- ✅ Criação de 3 conceitos exploratórios
- ✅ Seleção do Concept 1: Neural Convergence
- ✅ Desenvolvimento de variantes: icon, horizontal, vertical, monochrome
- ✅ Implementação de temas: light, dark
- ✅ Componente React com TypeScript
- ✅ Documentação completa do sistema
- ✅ Validação WCAG-AAA

---

## Referências

- **Paleta de Cores:** `assets/branding/palette.css`
- **Psicologia das Cores:** `docs/brand/COLOR-PSYCHOLOGY.md`
- **Persona Corporativa:** `docs/brand/diana-persona.md`
- **Componente React:** `assets/branding/logo/DianaLogo.tsx`

---

*Diana Corporação Senciente - Sistema de Identidade Visual v1.0*
*Estabelecido: 2026-02-14*
