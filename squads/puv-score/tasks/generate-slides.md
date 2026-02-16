# Task: Gerar Slides (PDF)

## Descricao
Gera apresentacao de 10+ slides em PDF com diagnostico completo.

## Instrucoes
```bash
node squads/puv-score/scripts/slides-gen.js --analysis analysis.json --output slides.pdf
```

## Estrutura dos Slides
1. **Capa** - Nome do negocio + PUV Score + branding FNW
2. **Score Overview** - Gauge + classificacao + resumo
3. **Criterio 1** - Diferenciacao e Posicionamento (score + analise)
4. **Criterio 2** - Clareza da Proposta (score + analise)
5. **Criterio 3** - Linguagem e Conexao (score + analise)
6. **Criterio 4** - Credibilidade e Confianca (score + analise)
7. **Criterio 5** - Jornada e CTA (score + analise)
8. **Oportunidades** - "O salto de 3 para 4"
9. **Top 5 Acoes** - Acoes priorizadas
10. **Proximos Passos** - Contato + QR code

## Formato
- PDF multi-pagina (A4 landscape)
- Design profissional

## Referencia Visual
`exports/alex-semana/reenvio/media/doc_1770992121388.pdf`

## Dependencias
- Puppeteer
- Template HTML em templates/slides.html
