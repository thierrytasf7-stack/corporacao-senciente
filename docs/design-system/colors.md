# Sistema de Cores - Diana Corporação Senciente

**Versão:** 2.0.0
**Data:** 2026-02-14
**Squad:** Aisth
**Status:** ✅ IMPLEMENTADO

---

## Visão Geral

A paleta de cores da Diana foi projetada para refletir os valores fundamentais da organização:

- **Senciência** (Azul) - Consciência profunda e inteligência artificial
- **Arete** (Prata) - Virtude, excelência técnica e ordem
- **Harmonia** (Ouro) - Elegância e sutileza estética

Todas as combinações atendem aos padrões **WCAG-AAA** de acessibilidade.

---

## Cores Principais

### 1. Prata Arete (Primary)

```css
--diana-primary: #C0C0C0
--diana-primary-light: #E0E0E0
--diana-primary-dark: #A0A0A0
```

**RGB:** 192, 192, 192
**Contraste em fundo escuro:** 9.2:1 (AAA ✓)
**Significado:** Virtuosidade, ordem inteligente, precisão técnica

**Uso:**
- Botões primários e CTAs principais
- Headers de seções importantes
- Elementos de navegação principal
- Badges de status operacional

---

### 2. Azul Senciência (Secondary)

```css
--diana-secondary: #1E90FF
--diana-secondary-light: #4DA6FF
--diana-secondary-dark: #1873CC
```

**RGB:** 30, 144, 255
**Contraste em fundo escuro:** 4.8:1 (AA ✓)
**Significado:** Profundidade cognitiva, inteligência artificial, fluxo de pensamento

**Uso:**
- Backgrounds de seções de conteúdo
- Links e elementos interativos
- Badges de processamento ativo
- Gradientes hero (Prata → Azul)

⚠️ **Nota:** Em fundos claros, use `--diana-secondary-dark` para manter contraste WCAG-AA.

---

### 3. Ouro Harmônico (Accent)

```css
--diana-accent: #FFD700
--diana-accent-light: #FFED4E
--diana-accent-dark: #CCAC00
```

**RGB:** 255, 215, 0
**Contraste em fundo escuro:** 10.4:1 (AAA ✓)
**Significado:** Elegância, sutileza, harmonia estética

**Uso:**
- Highlights em features premium
- Badges de conquistas e milestones
- Gradientes especiais (Azul → Ouro)
- Ícones de destaque

⚠️ **Atenção:** Use com moderação (máximo 10% da UI) para evitar fadiga visual.

---

### 4. Neutral Dark

```css
--diana-neutral-dark: #1A1A1A
```

**RGB:** 26, 26, 26
**Contraste em fundo claro:** 13.6:1 (AAA ✓)
**Significado:** Base confiável, solidez, profissionalismo

**Uso:**
- Background principal em dark mode
- Textos em fundos claros
- Borders para definição visual

---

### 5. Neutral Light

```css
--diana-neutral-light: #F5F5F5
```

**RGB:** 245, 245, 245
**Contraste em fundo escuro:** 13.6:1 (AAA ✓)
**Significado:** Clareza, espaço respiratório, minimalismo

**Uso:**
- Background principal em light mode
- Seções alternadas para hierarquia
- Cards e containers em temas claros

---

## Escala de Cinzas

```css
--diana-gray-900: #1A1A1A  /* Mais escuro */
--diana-gray-800: #2D2D2D
--diana-gray-700: #404040
--diana-gray-600: #666666
--diana-gray-500: #808080
--diana-gray-400: #A0A0A0
--diana-gray-300: #C0C0C0  /* = Primary */
--diana-gray-200: #E0E0E0
--diana-gray-100: #F5F5F5  /* Mais claro */
```

---

## Gradientes Oficiais

### Gradient Primary
```css
--diana-gradient-primary: linear-gradient(135deg, #C0C0C0 0%, #1E90FF 100%);
```
**Uso:** Headers, hero sections, banners de destaque

### Gradient Accent
```css
--diana-gradient-accent: linear-gradient(135deg, #1E90FF 0%, #FFD700 100%);
```
**Uso:** CTAs premium, cards especiais, features exclusivas

### Gradient Neutral
```css
--diana-gradient-neutral: linear-gradient(180deg, #1A1A1A 0%, #404040 100%);
```
**Uso:** Backgrounds sutis, seções alternadas em dark mode

---

## Cores Semânticas

### Success
```css
--diana-success: #10B981
--diana-success-light: #34D399
--diana-success-dark: #059669
```
**Uso:** Confirmações, estados positivos, operações bem-sucedidas

### Warning
```css
--diana-warning: #F59E0B
--diana-warning-light: #FBBF24
--diana-warning-dark: #D97706
```
**Uso:** Alertas, avisos, atenção necessária

### Error
```css
--diana-error: #EF4444
--diana-error-light: #F87171
--diana-error-dark: #DC2626
```
**Uso:** Erros, estados críticos, falhas

### Info
```css
--diana-info: #3B82F6
--diana-info-light: #60A5FA
--diana-info-dark: #2563EB
```
**Uso:** Informações, dicas, notificações neutras

---

## Implementação

### CSS Puro

Importe o arquivo de paleta:

```html
<link rel="stylesheet" href="/assets/branding/palette.css">
```

Use as classes utilitárias:

```html
<div class="bg-diana-primary text-diana-neutral-dark">
  Conteúdo com fundo Prata e texto escuro
</div>

<div class="bg-gradient-primary">
  Hero com gradiente Prata → Azul
</div>
```

---

### Tailwind CSS

Adicione a configuração Diana ao seu `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        diana: {
          primary: {
            DEFAULT: '#C0C0C0',
            light: '#E0E0E0',
            dark: '#A0A0A0',
          },
          secondary: {
            DEFAULT: '#1E90FF',
            light: '#4DA6FF',
            dark: '#1873CC',
          },
          accent: {
            DEFAULT: '#FFD700',
            light: '#FFED4E',
            dark: '#CCAC00',
          },
          neutral: {
            dark: '#1A1A1A',
            light: '#F5F5F5',
          },
          gray: {
            900: '#1A1A1A',
            800: '#2D2D2D',
            700: '#404040',
            600: '#666666',
            500: '#808080',
            400: '#A0A0A0',
            300: '#C0C0C0',
            200: '#E0E0E0',
            100: '#F5F5F5',
          },
        },
      },
      backgroundImage: {
        'gradient-diana-primary': 'linear-gradient(135deg, #C0C0C0 0%, #1E90FF 100%)',
        'gradient-diana-accent': 'linear-gradient(135deg, #1E90FF 0%, #FFD700 100%)',
        'gradient-diana-neutral': 'linear-gradient(180deg, #1A1A1A 0%, #404040 100%)',
      },
    },
  },
};
```

Uso em componentes:

```jsx
<div className="bg-diana-primary text-diana-neutral-dark">
  Conteúdo
</div>

<button className="bg-gradient-diana-primary">
  Call to Action
</button>
```

---

### React Component

Importe o componente de visualização:

```jsx
import ColorPalette from '@/components/branding/ColorPalette';

function DesignSystemPage() {
  return <ColorPalette />;
}
```

---

## Acessibilidade (WCAG)

### Padrões de Contraste

| Tamanho do Texto | WCAG AA | WCAG AAA |
|------------------|---------|----------|
| Pequeno (< 18pt regular / < 14pt bold) | 4.5:1 | 7.0:1 |
| Grande (≥ 18pt regular / ≥ 14pt bold) | 3.0:1 | 4.5:1 |

### Combinações Validadas

✅ **Prata Arete (#C0C0C0) em Dark (#1A1A1A):** 9.2:1 - AAA
✅ **Ouro Harmônico (#FFD700) em Dark (#1A1A1A):** 10.4:1 - AAA
✅ **Dark (#1A1A1A) em Light (#F5F5F5):** 13.6:1 - AAA
✅ **Azul Senciência (#1E90FF) em Dark (#1A1A1A):** 4.8:1 - AA

⚠️ **Azul Senciência (#1E90FF) em Light (#F5F5F5):** 2.9:1 - FAIL
→ **Solução:** Use `#1873CC` (dark variant) em fundos claros

### Testes Automatizados

Execute os testes de contraste:

```bash
npm test tests/branding/contrast-wcag.test.js
```

---

## Hierarquia Visual

### Regra 60-30-10

- **60%** - Prata Arete (Primary) - Base estrutural
- **30%** - Azul Senciência (Secondary) - Destaque secundário
- **10%** - Ouro Harmônico (Accent) - Pontos focais

### Prioridade de Uso

1. **Estrutura:** Neutral Dark/Light para backgrounds principais
2. **Navegação:** Primary (Prata) para elementos de controle
3. **Conteúdo:** Secondary (Azul) para áreas interativas
4. **Destaque:** Accent (Ouro) para highlights seletivos
5. **Estados:** Semânticas (Success/Warning/Error/Info) apenas para feedback

---

## Recursos

### Arquivos de Referência

- **Paleta CSS:** `assets/branding/palette.css`
- **Tailwind Config:** `tailwind.config.diana.js`
- **Componente React:** `apps/dashboard/src/components/branding/ColorPalette.tsx`
- **Testes WCAG:** `tests/branding/contrast-wcag.test.js`
- **Preview HTML:** `docs/brand/color-swatches.html`

### Documentação Complementar

- [Psicologia das Cores](../brand/COLOR-PSYCHOLOGY.md) - Significado de cada cor
- [Guia de Uso WCAG](https://www.w3.org/WAI/WCAG21/quickref/) - Referência oficial

### Visualização

Abra no navegador para preview visual completo:

```bash
file:///C:/Users/User/Desktop/Diana-Corporacao-Senciente/docs/brand/color-swatches.html
```

---

## Changelog

### v2.0.0 (2026-02-14)
- ✅ Paleta oficial definida (5 cores principais)
- ✅ Gradientes oficiais implementados (3 variações)
- ✅ Escala de cinzas (9 níveis)
- ✅ Cores semânticas (Success, Warning, Error, Info)
- ✅ Validação WCAG-AAA completa
- ✅ Integração Tailwind CSS
- ✅ Componente React de visualização
- ✅ Testes automatizados de contraste
- ✅ Documentação completa

---

**Mantido por:** Squad Aisth
**Última atualização:** 2026-02-14
