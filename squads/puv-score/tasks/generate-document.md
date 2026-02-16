# Task: Gerar Documento PDF (6 Secoes)

## Descricao
Gera documento PDF com plano detalhado de reposicionamento comercial.

## Instrucoes
```bash
node squads/puv-score/scripts/document-gen.js --analysis analysis.json --output report.pdf
```

## Estrutura do Documento (6 Secoes)
1. **Diagnostico de Performance** - Dados quantitativos + score breakdown
2. **Desconstrucao da PUV** - Analise profunda de cada criterio
3. **Reposicionamento por Persona** - Segmentacao de audiencia
4. **Engenharia de Linguagem** - Exemplos antes/depois de copy
5. **Estrategias de Autoridade** - Prova social, credibilidade
6. **Plano de Acao Imediato** - Acoes com timeline

## Formato
- PDF A4 portrait
- Tipografia profissional
- Headers, tabelas, destaques

## Referencia
`exports/alex-semana/reenvio/media/doc_1770992119541.pdf`

## Dependencias
- Puppeteer
- Template Markdown em templates/document.md
