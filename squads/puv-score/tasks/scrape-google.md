# Task: Scrape Google Business Profile

## Descricao
Extrai dados de um perfil Google Business usando Playwright.

## Instrucoes
```bash
node squads/puv-score/scripts/scraper.js --canal google --link "https://maps.google.com/..."
```

## Dados Extraidos
- Nome do negocio
- Avaliacao media (estrelas)
- Numero de reviews
- Descricao
- Categorias
- Horarios de funcionamento
- Endereco
- Telefone
- Fotos (URLs das primeiras 10)
- Reviews recentes (top 5)

## Output
JSON padronizado

## Dependencias
- Playwright instalado
