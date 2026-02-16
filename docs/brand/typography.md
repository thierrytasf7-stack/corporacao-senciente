# Tipografia Oficial Diana Corporação Senciente

## Introdução

A tipografia é um elemento fundamental da identidade visual da Diana Corporação Senciente. Este documento define as diretrizes tipográficas para todos os materiais corporativos, garantindo consistência e profissionalismo.

## Fontes Oficiais

### Web Fonts

#### Principal
- **Fonte:** Inter
- **Peso:** 400 (Regular), 500 (Medium), 600 (SemiBold)
- **Tamanho:** 16px para corpo, 20px para títulos
- **Line Height:** 1.5 para corpo, 1.2 para títulos

#### Código
- **Fonte:** SF Mono
- **Peso:** 400 (Regular)
- **Tamanho:** 14px para código, 12px para comentários
- **Line Height:** 1.4

### Fontes Alternativas

#### Para Sistemas Sem Inter
- **Google Fonts:** Roboto, Open Sans
- **System Fonts:** -apple-system, BlinkMacSystemFont, Segoe UI

#### Para Sistemas Sem SF Mono
- **Monospace:** Fira Code, JetBrains Mono, Consolas

## Hierarquia Tipográfica

### Títulos

#### H1 - Título Principal
```markdown
# Diana Corporação Senciente
```
- **Fonte:** Inter SemiBold
- **Tamanho:** 32px
- **Cor:** #1a1a1a
- **Espaçamento:** 48px após

#### H2 - Seções Principais
```markdown
## Relatório Anual 2026
```
- **Fonte:** Inter SemiBold
- **Tamanho:** 24px
- **Cor:** #1a1a1a
- **Espaçamento:** 32px após

#### H3 - Subseções
```markdown
### Metodologia
```
- **Fonte:** Inter Medium
- **Tamanho:** 20px
- **Cor:** #333333
- **Espaçamento:** 24px após

#### H4 - Tópicos Específicos
```markdown
#### Coleta de Dados
```
- **Fonte:** Inter Regular
- **Tamanho:** 16px
- **Cor:** #333333
- **Espaçamento:** 20px após

### Corpo de Texto

#### Parágrafos
```markdown
Este é um parágrafo de exemplo. O texto deve ser legível e bem espaçado.
```
- **Fonte:** Inter Regular
- **Tamanho:** 16px
- **Cor:** #333333
- **Line Height:** 1.5
- **Espaçamento:** 24px entre parágrafos

#### Citações
```markdown
> Esta é uma citação importante.
```
- **Fonte:** Inter Italic
- **Tamanho:** 16px
- **Cor:** #666666
- **Line Height:** 1.6
- **Margem:** 20px esquerda

## Elementos Especiais

### Códigos e Comandos

#### Inline
```markdown
Use o comando `git clone` para clonar repositórios.
```
- **Fonte:** SF Mono Regular
- **Tamanho:** 14px
- **Cor:** #d73a49
- **Background:** #f8f8f8
- **Padding:** 2px 4px

#### Blocos de Código
```python
def exemplo():
    """Função de exemplo."""
    return "Olá, Diana!"
```
- **Fonte:** SF Mono Regular
- **Tamanho:** 14px
- **Cor:** #d4d4d4 (background), #f8f8f8 (foreground)
- **Line Height:** 1.4
- **Padding:** 16px
- **Border:** 1px solid #e0e0e0

### Tabelas

#### Cabeçalhos
```markdown
| Título | Descrição |
|---------|-----------|
```
- **Fonte:** Inter SemiBold
- **Tamanho:** 14px
- **Cor:** #1a1a1a
- **Background:** #f5f5f5
- **Padding:** 8px 12px

#### Conteúdo
```markdown
| Dado 1 | Dado 2 |
|--------|--------|
```
- **Fonte:** Inter Regular
- **Tamanho:** 14px
- **Cor:** #333333
- **Background:** #ffffff
- **Padding:** 8px 12px

## Cores Tipográficas

### Cores Primárias

#### Texto Principal
- **Cor:** #333333
- **Uso:** Corpo de texto, parágrafos

#### Títulos
- **Cor:** #1a1a1a
- **Uso:** H1, H2, H3

#### Links
- **Cor:** #0066cc
- **Uso:** Hiperlinks, referências

### Cores Secundárias

#### Destaques
- **Cor:** #ff6b35
- **Uso:** Palavras-chave, ênfase

#### Citações
- **Cor:** #666666
- **Uso:** Blocos de citação

#### Código
- **Cor:** #d73a49
- **Uso:** Trechos de código inline

## Espaçamento e Alinhamento

### Espaçamento Vertical

#### Entre Elementos
- **Títulos para conteúdo:** 24px
- **Parágrafos:** 16px
- **Listas:** 12px
- **Tabelas:** 20px
- **Código:** 24px

#### Dentro de Elementos
- **Parágrafos:** 0 (sem indentação)
- **Listas:** 4px entre itens
- **Tabelas:** 8px padding
- **Código:** 16px padding

### Alinhamento

#### Texto Principal
- **Alinhamento:** Justificado
- **Hifenização:** Automática

#### Títulos
- **Alinhamento:** Esquerda
- **Capitalização:** Sentence case

#### Tabelas
- **Alinhamento:** Esquerda (padrão)
- **Números:** Direita
- **Datas:** Centro

## Responsividade

### Mobile

#### Tamanhos de Fonte
- **Corpo:** 14px
- **Títulos:** Reduzir proporcionalmente
- **Código:** 12px

#### Espaçamento
- **Entre elementos:** Reduzir 25%
- **Padding:** Reduzir 20%

### Impressão

#### Otimizações
- **Fontes:** Substituir por fonts de sistema
- **Cores:** Converter para tons de cinza
- **Espaçamento:** Ajustar para impressão

## Acessibilidade

### Contraste

#### Requisitos Mínimos
- **Texto normal:** 4.5:1
- **Texto grande:** 3:1
- **Interface:** 3:1

#### Validação
- **Ferramentas:** WebAIM Contrast Checker
- **Padrões:** WCAG 2.1 AA

### Legibilidade

#### Fatores
- **Tamanho mínimo:** 16px para corpo
- **Line height:** 1.5 mínimo
- **Largura de linha:** 45-75 caracteres

## Implementação

### CSS Customizado

#### Classes Recomendadas
```css
.diana-body {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #333333;
}

.diana-title {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: #1a1a1a;
}

.diana-code {
    font-family: 'SF Mono', monospace;
    font-size: 14px;
    color: #d73a49;
}
```

### Markdown Customizado

#### Extensões Recomendadas
- **Code Highlighting:** Prism.js
- **Mermaid:** mermaid.js
- **Math:** KaTeX

## Validação

### Checklist de Tipografia
- [ ] Fontes corretas aplicadas
- [ ] Hierarquia mantida
- [ ] Cores consistentes
- [ ] Espaçamento adequado
- [ ] Acessibilidade validada

### Ferramentas de Validação
- **Contraste:** WebAIM Contrast Checker
- **Fontes:** Google Fonts Validator
- **Acessibilidade:** axe DevTools

---

*Este documento foi gerado automaticamente pelo sistema Diana Corporação Senciente*