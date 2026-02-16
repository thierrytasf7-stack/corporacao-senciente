# Task: Scrape Website

## Descricao
Extrai dados de um website usando Playwright headless browser.

## Instrucoes
```bash
node squads/puv-score/scripts/scraper.js --canal website --link https://www.exemplo.com
```

## Dados Extraidos
- Titulo da pagina
- Meta description
- Headlines (H1, H2, H3)
- CTAs (botoes, links de acao)
- Conteudo principal (texto)
- Imagens (URLs)
- Links de navegacao
- Schema markup (se existir)

## Output
JSON em stdout ou arquivo `--output scraped.json`

## Dependencias
- Playwright instalado
