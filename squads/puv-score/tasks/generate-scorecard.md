# Task: Gerar Scorecard (Imagem)

## Descricao
Gera imagem JPG com infografico do PUV Score usando HTML template + Puppeteer screenshot.

## Instrucoes
```bash
node squads/puv-score/scripts/scorecard-gen.js --analysis analysis.json --output scorecard.jpg
```

## Componentes Visuais
1. **Gauge** - Ponteiro tipo velocimetro apontando para o score
2. **Score** - Numero grande (ex: 15/20) + classificacao
3. **Criterios** - 5 barras horizontais com score individual
4. **Top 3** - Acoes recomendadas em destaque
5. **QR Code** - "DESBLOQUEAR RELATORIO COMPLETO"
6. **Branding** - Logo FNW + cores da marca

## Formato
- Resolucao: 1080x1920 (vertical/stories)
- Formato: JPG ou PNG

## Referencia Visual
`exports/alex-semana/reenvio/media/doc_1770992119264.jpg`

## Dependencias
- Puppeteer
- Template HTML em templates/scorecard.html
- Pacote qrcode (npm)
