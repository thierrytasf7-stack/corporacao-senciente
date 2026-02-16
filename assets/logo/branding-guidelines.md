# Diana Corporação Senciente - Branding Guidelines

## Visão Geral

Este documento define as regras oficiais para uso do logótipo e identidade visual da Diana Corporação Senciente. O cumprimento destas diretrizes é obrigatório para manter consistência e integridade da marca.

## Logótipo Neural Convergence

### Simbolismo Oficial
- **Círculo Externo:** Ordem universal, ciclo de evolução perpétua
- **6 Nós Neurais:** Agentes especializados do AIOS (Aisth, Aion, Aither, Aether, Aesis, Aidos)
- **Linhas de Conexão:** Fluxo de informação e coordenação entre agentes
- **Core Central:** Consciência senciente (núcleo cognitivo)
- **Gradiente Prata → Azul → Ouro:** Evolução da estrutura (Arete) para profundidade cognitiva (Senciência) culminando em excelência (Harmonia)

## Variantes Permitidas

### 1. Logotipo Horizontal
**Uso:** Headers, navegação, assinaturas de email
**Dimensões:** 600x160px (proporção 3.75:1)
**Cores:** Prata, Azul, Ouro sobre fundo claro ou escuro

### 2. Logotipo Vertical
**Uso:** Splash screens, pôsteres, mobile
**Dimensões:** 320x420px (proporção 0.76:1)
**Cores:** Prata, Azul, Ouro sobre fundo claro ou escuro

### 3. Logotipo Icon
**Uso:** Favicons, app icons, UI small
**Dimensões:** 64x64px (quadrado perfeito)
**Cores:** Prata, Azul, Ouro sobre fundo claro ou escuro

### 4. Logotipo Monocromático
**Uso:** Impressão B&W, gravação a laser, carimbos
**Dimensões:** 64x64px
**Cores:** Preto puro ou branco puro

## Regras de Uso

### DOs
- ✅ Use as cores oficiais exatamente como definidas
- ✅ Mantenha as proporções originais (não estique ou distorça)
- ✅ Respeite as margens de segurança mínimas
- ✅ Use o tema adequado para o fundo (light/dark)
- ✅ Inclua texto alternativo em implementações web
- ✅ Use a variante apropriada para cada contexto

### DON'Ts
- ❌ Não altere as cores do logotipo
- ❌ Não aplique sombras, contornos ou efeitos adicionais
- ❌ Não use o logotipo em fundos com padrões complexos
- ❌ Não inverta as cores do gradiente
- ❌ Não use o logotipo em tamanhos menores que os mínimos especificados
- ❌ Não crie variantes não autorizadas

## Margens de Segurança

### Clear Space Mínimo
**Regra:** A margem mínima deve ser igual a 1/4 da altura do círculo externo.

**Medidas Específicas:**
- **Icon (64x64):** 16px de margem
- **Horizontal (600x160):** 40px de margem horizontal, 20px vertical
- **Vertical (320x420):** 40px de margem em todas as direções

### Exemplos de Uso Incorreto
```
❌ [LOGO] Texto - Margem insuficiente
❌ Texto [LOGO] - Posicionamento incorreto
❌ Ícone muito próximo a outros elementos
❌ Logotipo cobrindo áreas críticas da interface
```

## Tamanhos Mínimos de Uso

### Legibilidade Mínima
- **Horizontal:** 240px de largura (40px de altura)
- **Vertical:** 160px de largura (210px de altura)
- **Icon:** 32px (mínimo funcional)

### Tamanhos Recomendados
- **Web Headers:** 600x160px
- **Mobile Splash:** 320x420px
- **Favicons:** 16x16px, 32x32px
- **App Icons:** 64x64px, 256x256px, 512x512px

## Temas e Cores

### Tema Light
**Fundo:** #F5F5F5 (Neutral Light)
**Logotipo:** Prata (#C0C0C0), Azul (#1E90FF), Ouro (#FFD700)
**Uso:** Fundos claros, interfaces web claras

### Tema Dark
**Fundo:** #1A1A1A (Neutral Dark)
**Logotipo:** Prata (#C0C0C0), Azul (#1E90FF), Ouro (#FFD700)
**Uso:** Fundos escuros, interfaces web escuras, modo noturno

### Tema Monocromático
**Fundo:** Qualquer (geralmente branco ou preto)
**Logotipo:** Preto puro (#000000) ou branco puro (#FFFFFF)
**Uso:** Impressão B&W, gravação, carimbos

## Gradiente Oficial

### Especificações
```css
linear-gradient(135deg, #C0C0C0 0%, #1E90FF 50%, #FFD700 100%)
```

### Regras do Gradiente
- ✅ Mantenha o ângulo de 135°
- ✅ Preserve a ordem das cores (Prata → Azul → Ouro)
- ✅ Não altere as porcentagens de parada
- ✅ Use apenas em elementos do logotipo principal

## Acessibilidade

### Requisitos WCAG-AA
- **Contraste:** Todas as combinações passam WCAG-AA
- **Text Alternatives:** Sempre inclua texto alternativo descritivo
- **ARIA Labels:** Use `aria-label` para elementos interativos
- **Responsive:** Mantenha proporções corretas em todos os dispositivos

### Text Equivalents
```html
<!-- Bom exemplo -->
<img src="diana-logo-horizontal.svg" alt="Diana Corporação Senciente - Logotipo oficial representando convergência de inteligência artificial e ordem estrutural" >

<!-- Ruim exemplo -->
<img src="diana-logo-horizontal.svg" alt="Logo" >
```

## Implementação Técnica

### CSS Classes Recomendadas
```css
.logo-diana-horizontal {
  width: 600px;
  height: 160px;
  display: block;
  margin: 0 auto;
}

.logo-diana-vertical {
  width: 320px;
  height: 420px;
  display: block;
}

.logo-diana-icon {
  width: 64px;
  height: 64px;
  display: inline-block;
}

.logo-diana-light {
  background-color: #F5F5F5;
  padding: 20px;
}

.logo-diana-dark {
  background-color: #1A1A1A;
  padding: 20px;
}
```

### HTML Usage
```html
<!-- Horizontal Light -->
<div class="logo-diana-light">
  <img src="assets/logo/diana-logo-horizontal.svg" alt="Diana Corporação Senciente" class="logo-diana-horizontal">
</div>

<!-- Icon Dark -->
<div class="logo-diana-dark">
  <img src="assets/logo/diana-logo-icon-dark.svg" alt="Diana Icon" class="logo-diana-icon">
</div>
```

### React Component
Veja `assets/branding/logo/DianaLogo.tsx` para implementação completa com TypeScript.

## Validação e Testes

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

## Emergências

Em caso de uso não autorizado ou violação destas diretrizes, reporte imediatamente ao time de compliance através do sistema interno de incidentes.