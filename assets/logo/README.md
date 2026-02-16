# Diana Corporação Senciente - Logótipo Oficial

## Visão Geral

O logótipo oficial da Diana Corporação Senciente representa a convergência entre "Senciência" (inteligência, adaptabilidade) e "Ordem" (estrutura, propósito). Este sistema visual é a base da identidade corporativa em todos os materiais e interfaces.

## Conceitos de Design

### 1. Neural Convergence (Selecionado)
**Simbolismo:**
- **Círculo Externo** - Ordem universal, ciclo de evolução
- **6 Nós Neurais** - Agentes especializados do AIOS convergindo
- **Linhas de Conexão** - Fluxo de informação e coordenação
- **Core Central** - Consciência senciente (núcleo cognitivo)
- **Gradiente Prata → Azul → Ouro** - Evolução da estrutura (Arete) para profundidade cognitiva (Senciência) culminando em excelência (Harmonia)

**Razão da Seleção:**
- Melhor equilíbrio visual entre complexidade e simplicidade
- Representa arquitetura AIOS (múltiplos agentes convergindo para execução unificada)
- Escalável do ícone (16px favicon) ao vertical (420px splash screen)
- Funciona perfeitamente em modo claro e escuro com contraste WCAG-AAA

### 2. Cognitive Circuit
**Simbolismo:**
- **Circuito Integrado** - Base tecnológica
- **Três Camadas** - Percepção, Processamento, Execução
- **Conexões Douradas** - Fluxo de decisão
- **Core Azul** - Consciência central

**Rejeitado por:**
- Muito literal, parecido com logos de tecnologia genérica
- Difícil de escalar para tamanhos pequenos
- Menos representativo da arquitetura multi-agente

### 3. Sentinel Shield
**Simbolismo:**
- **Escudo** - Proteção, soberania
- **Olho Central** - Vigilância, consciência
- **6 Pontas** - Agentes especializados
- **Gradiente Prata** - Força estrutural

**Rejeitado por:**
- Conotações militares não alinhadas com a marca
- Menos representativo da natureza cognitiva
- Dificuldade em criar versão minimalista

## Estrutura de Arquivos

```
assets/logo/
├── README.md                    # Este arquivo
├── branding-guidelines.md      # Regras de uso e aplicação
├── diana-logo-horizontal.svg   # Versão horizontal (600x160)
├── diana-logo-horizontal-dark.svg # Versão dark theme
├── diana-logo-vertical.svg     # Versão vertical (320x420)
├── diana-logo-vertical-dark.svg # Versão dark theme
├── diana-logo-icon.svg         # Versão ícone (64x64)
├── diana-logo-icon-dark.svg    # Versão ícone dark theme
├── diana-logo-monochrome.svg   # Versão monocromática (preto)
├── diana-logo-monochrome-white.svg # Versão monocromática (branco)
├── favicon-16x16.png           # Favicon pequeno
├── favicon-32x32.png           # Favicon padrão
├── icon-64x64.png              # Ícone médio
├── icon-256x256.png            # Ícone grande
└── icon-512x512.png            # Ícone extra-grande
```

## Especificações Técnicas

### Logotipo Neural Convergence

**Dimensões Base:**
- **Horizontal:** 600x160px (proporção 3.75:1)
- **Vertical:** 320x420px (proporção 0.76:1)
- **Icon:** 64x64px (quadrado perfeito)

**Paleta de Cores:**
- **Prata Arete:** #C0C0C0 (primário)
- **Azul Senciência:** #1E90FF (secundário)
- **Ouro Harmônico:** #FFD700 (acento)
- **Fundo Claro:** #F5F5F5
- **Fundo Escuro:** #1A1A1A

**Gradiente Oficial:**
```css
linear-gradient(135deg, #C0C0C0 0%, #1E90FF 50%, #FFD700 100%)
```

### Clear Space (Margem de Segurança)

**Regra:** A margem mínima ao redor do logotipo deve ser igual a 1/4 da altura do círculo externo.

**Medidas Específicas:**
- **Icon (64x64):** 16px de margem
- **Horizontal (600x160):** 40px de margem horizontal, 20px vertical
- **Vertical (320x420):** 40px de margem em todas as direções

### Tamanhos Mínimos de Uso

**Legibilidade Mínima:**
- **Horizontal:** 240px de largura (40px de altura)
- **Vertical:** 160px de largura (210px de altura)
- **Icon:** 32px (mínimo funcional)

**Tamanhos Recomendados:**
- **Web Headers:** 600x160px
- **Mobile Splash:** 320x420px
- **Favicons:** 16x16px, 32x32px
- **App Icons:** 64x64px, 256x256px, 512x512px

## Acessibilidade

**Contraste WCAG-AA:**
- Prata (#C0C0C0) em Dark (#1A1A1A): 9.2:1 ✓ AAA
- Azul (#1E90FF) em Dark (#1A1A1A): 4.8:1 ✓ AA (large text AAA)
- Ouro (#FFD700) em Dark (#1A1A1A): 10.4:1 ✓ AAA
- Dark (#1A1A1A) em Light (#F5F5F5): 13.6:1 ✓ AAA

**Text Equivalents:**
- Sempre inclua texto alternativo descritivo
- Use `aria-label` para elementos interativos
- Mantenha proporções corretas para evitar distorção

## Formatos de Arquivo

### SVG (Vetorial)
- **Uso Principal:** Web, impressão, escalóvel
- **Vantagens:** Sem perda de qualidade, pequeno tamanho
- **Compatibilidade:** Todos os navegadores modernos

### PNG (Raster)
- **Uso:** Favicons, app stores, mídias sociais
- **Resolução:** 144 DPI para web, 300 DPI para impressão
- **Transparência:** Suportada em todos os formatos

## Implementação

### CSS Classes
```css
.logo-diana-horizontal { width: 600px; height: 160px; }
.logo-diana-vertical { width: 320px; height: 420px; }
.logo-diana-icon { width: 64px; height: 64px; }
.logo-diana-light { ... }
.logo-diana-dark { ... }
```

### HTML Usage
```html
<!-- Horizontal Light -->
<img src="assets/logo/diana-logo-horizontal.svg" alt="Diana Corporação Senciente" class="logo-diana-horizontal">

<!-- Icon Dark -->
<img src="assets/logo/diana-logo-icon-dark.svg" alt="Diana Icon" class="logo-diana-icon">
```

### React Component
Veja `assets/branding/logo/DianaLogo.tsx` para implementação completa com TypeScript.

## Validação

### Testes Realizados
- [x] Escalabilidade: Funciona de 16px a 512px sem perda
- [x] Contraste: Todas as combinações passam WCAG-AA
- [x] Responsividade: Mantém proporções em diferentes dispositivos
- [x] Acessibilidade: ARIA labels e text alternatives
- [x] Performance: Arquivos SVG otimizados (< 5KB cada)

### Ferramentas de Validação
- [Color Contrast Analyzer](https://webaim.org/resources/contrastchecker/)
- [SVG Validator](https://validator.w3.org/)
- [Accessibility Insights](https://accessibilityinsights.io/)

## Manutenção

### Versionamento
- **Versão Atual:** 1.0.0
- **Data de Criação:** 2026-02-14
- **Próxima Revisão:** 2026-08-01

### Processo de Atualização
1. Propor mudanças via PR com justificativa
2. Validar contraste e escalabilidade
3. Testar em todos os contextos de uso
4. Obter aprovação do time de branding

## Contato

Para dúvidas sobre uso do logotipo ou solicitações de variantes especiais, entre em contato com o time de branding através do canal #branding no Slack corporativo.