# Task: Analise PUV Score

## Descricao
Analisa dados scraped usando Claude API com rubrica PUV Score (5 criterios x 4pts = 20pts).

## Instrucoes
```bash
node squads/puv-score/scripts/analyzer.js --data scraped.json --output analysis.json
```

## Rubrica PUV Score
| Criterio | Peso |
|----------|------|
| Diferenciacao e Posicionamento | /4 |
| Clareza da Proposta/Beneficio | /4 |
| Linguagem e Conexao Emocional | /4 |
| Credibilidade e Confianca | /4 |
| Jornada Guiada e CTA | /4 |

## Output JSON
```json
{
  "score_total": 15,
  "score_max": 20,
  "classificacao": "Forte",
  "criterios": [
    {"nome": "Diferenciacao", "score": 3, "justificativa": "..."},
    ...
  ],
  "top3_acoes": ["...", "...", "..."],
  "oportunidades_salto": [...],
  "analise_persona": {...},
  "documento_secoes": {
    "diagnostico": "...",
    "desconstrucao_puv": "...",
    "reposicionamento_persona": "...",
    "engenharia_linguagem": "...",
    "estrategias_autoridade": "...",
    "plano_acao": "..."
  }
}
```

## Dependencias
- Claude API key (ANTHROPIC_API_KEY)
- Prompt template em templates/puv-prompt.md
