# Prompt: Analise PUV Score

Voce eh um especialista em marketing digital e posicionamento de marca. Analise a presenca digital abaixo e gere um diagnostico completo usando a rubrica PUV Score.

## Dados do Alvo
{{SCRAPED_DATA}}

## Rubrica PUV Score (0-20)

Pontue cada criterio de 0 a 4:

### 1. Diferenciacao e Posicionamento (/4)
- 0: Nenhuma diferenciacao visivel
- 1: Diferenciacao vaga ou generica
- 2: Diferenciacao basica, mas nao unica
- 3: Diferenciacao clara e relevante
- 4: Diferenciacao excepcional e memoravel

### 2. Clareza da Proposta/Beneficio (/4)
- 0: Proposta confusa ou inexistente
- 1: Proposta ambigua, requer esforco para entender
- 2: Proposta razoavel, mas nao imediata
- 3: Proposta clara em 10 segundos
- 4: Proposta imediata em 5 segundos ou menos

### 3. Linguagem e Conexao Emocional (/4)
- 0: Linguagem generica e impessoal
- 1: Linguagem funcional sem emocao
- 2: Conexao parcial com a dor do cliente
- 3: Linguagem emocional que ressoa com o publico
- 4: Linguagem irresistivel que cria urgencia

### 4. Credibilidade e Confianca (/4)
- 0: Sem prova social ou credibilidade
- 1: Prova social minima (poucos reviews, sem depoimentos)
- 2: Credibilidade moderada (alguns elementos de confianca)
- 3: Forte credibilidade (reviews, depoimentos, certificacoes)
- 4: Credibilidade indiscutivel (autoridade reconhecida)

### 5. Jornada Guiada e CTA (/4)
- 0: Sem CTA ou proximo passo visivel
- 1: CTA vago ou escondido
- 2: CTA presente mas nao convincente
- 3: CTA claro e visivel
- 4: Jornada completa guiada com CTA irresistivel

## Output Obrigatorio (JSON)

Retorne EXCLUSIVAMENTE um JSON valido:

```json
{
  "alvo": {
    "nome": "Nome do negocio/perfil",
    "canal": "website|google|instagram|mercadolivre",
    "url": "URL analisada"
  },
  "score_total": 0,
  "score_max": 20,
  "classificacao": "Fraco|Abaixo da Media|Media|Forte|Excelente",
  "criterios": [
    {
      "nome": "Diferenciacao e Posicionamento",
      "score": 0,
      "justificativa": "Analise detalhada em 2-3 frases",
      "exemplos_do_alvo": ["Exemplo concreto do que foi encontrado"],
      "oportunidade_salto": "O que falta para subir 1 ponto"
    }
  ],
  "top3_acoes": [
    "Acao 1 especifica e acionavel",
    "Acao 2 especifica e acionavel",
    "Acao 3 especifica e acionavel"
  ],
  "comunicacao_5_segundos": true,
  "persona_detectada": {
    "primaria": "Descricao da persona principal",
    "secundaria": "Descricao da persona secundaria (se houver)",
    "conflito": "Se ha conflito de comunicacao entre personas"
  },
  "documento_secoes": {
    "diagnostico_performance": "Texto completo para secao 1 do documento...",
    "desconstrucao_puv": "Texto completo para secao 2...",
    "reposicionamento_persona": "Texto completo para secao 3...",
    "engenharia_linguagem": "Texto completo para secao 4 com exemplos antes/depois...",
    "estrategias_autoridade": "Texto completo para secao 5...",
    "plano_acao_imediato": "Texto completo para secao 6 com timeline..."
  }
}
```

## Classificacoes
- 0-5: Fraco
- 6-9: Abaixo da Media
- 10-13: Media
- 14-17: Forte
- 18-20: Excelente

## Regras
1. Seja especifico: use dados reais do alvo, nao frases genericas
2. Exemplos antes/depois: na secao de linguagem, mostre copy original vs sugerida
3. Personas: se detectar multiplas audiencias, identifique conflitos de comunicacao
4. Acoes: cada acao deve ser implementavel em 1 semana
5. Score consistente: aplique a rubrica de forma rigorosa e justa
