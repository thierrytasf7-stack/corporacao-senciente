# Task: Scrape Mercado Livre

## Descricao
Extrai dados de um anuncio no Mercado Livre usando Playwright.

## Instrucoes
```bash
node squads/puv-score/scripts/scraper.js --canal mercadolivre --link "https://produto.mercadolivre.com.br/..."
```

## Dados Extraidos
- Titulo do anuncio
- Preco
- Descricao completa
- Fotos (URLs)
- Reputacao do vendedor (nivel, %)
- Quantidade vendida
- Reviews e perguntas
- Garantia
- Frete
- Categorias

## Output
JSON padronizado

## Dependencias
- Playwright instalado
