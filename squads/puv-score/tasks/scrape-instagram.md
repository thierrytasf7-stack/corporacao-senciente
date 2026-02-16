# Task: Scrape Instagram Profile

## Descricao
Extrai dados de um perfil Instagram usando Playwright.

## Instrucoes
```bash
node squads/puv-score/scripts/scraper.js --canal instagram --link https://www.instagram.com/perfil
```

## Dados Extraidos
- Nome de usuario
- Nome display
- Bio completa
- Link na bio
- Numero de posts
- Numero de seguidores
- Numero de seguindo
- Posts recentes (10): imagem URL, caption, likes, comments
- Hashtags mais usadas
- Highlights (nomes)
- CTA na bio

## Output
JSON padronizado

## Notas
- Instagram pode bloquear scraping agressivo
- Usar delays entre requests
- Considerar login via cookies se necessario

## Dependencias
- Playwright instalado
