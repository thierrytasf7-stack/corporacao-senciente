# Benchmark Analysis Checklist

## Pre-Analysis
- [ ] Target identificado (agente, workflow, ou squad)
- [ ] Modelo de referência definido (default: Opus)
- [ ] Caso de uso claro

## Cost Analysis
- [ ] Token count estimado (input + output)
- [ ] Custo fixo calculado (system prompt)
- [ ] Custo variável estimado (per-execution)
- [ ] Cache savings calculado
- [ ] Projeção mensal feita

## Waste Detection
- [ ] Instruções redundantes identificadas
- [ ] Contexto não utilizado mapeado
- [ ] Over-engineering detectado
- [ ] Exemplos excessivos contados

## Quality Analysis
- [ ] Accuracy avaliada
- [ ] Instruction following verificado
- [ ] Completeness checada
- [ ] Consistency estimada

## Optimization
- [ ] Recomendações ranqueadas por impacto (Pareto)
- [ ] Economia estimada em tokens e USD
- [ ] Custo-benefício de cada recomendação calculado
