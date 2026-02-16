---
task: Process Markets Data
tipo: "data-processor"
responsavel: "@data-processor"
atomic_layer: task
Entrada: |
  - raw_markets: Mercados brutos coletados
  - event_info: Informações sobre eventos
  - bookmaker_data: Dados dos bookmakers
  - processing_rules: Regras de processamento
  - normalization_params: Parâmetros de normalização
Saida: |
  - processed_markets: Mercados processados
  - market_structure: Estrutura organizada dos mercados
  - availability_info: Informações de disponibilidade
  - market_stats: Estatísticas dos mercados
  - processing_log: Log do processamento
---

# process-markets

Transforma informações brutas sobre mercados de apostas em dados estruturados e organizados.

## Processo de Processamento

1. **Validação de Estrutura:** Verificar integridade da estrutura dos mercados
2. **Normalização de Nomenclatura:** Padronizar nomes e tipos de mercados
3. **Organização Hierárquica:** Estruturar mercados em categorias e subcategorias
4. **Mapeamento de Seleções:** Organizar opções disponíveis em cada mercado
5. **Análise de Disponibilidade:** Determinar status e condições de cada mercado
6. **Agregação de Metadados:** Adicionar informações contextuais relevantes
7. **Geração de Saída:** Produzir dados processados em formato consumível

## Etapas de Processamento

- **Normalização de Nomes:** Converter nomes de mercados para padrão consistente
- **Classificação Hierárquica:** Organizar mercados em categorias principais e secundárias
- **Mapeamento de Seleções:** Estruturar opções disponíveis em cada mercado
- **Análise de Status:** Determinar se mercado está ativo, suspenso ou fechado
- **Detecção de Limites:** Identificar restrições de aposta e condições especiais
- **Agregação de Metadados:** Adicionar informações sobre esporte, competição, etc.

## Estrutura Organizacional

- **Categorias Principais:** Resultado, Handicaps, Totais, Especiais
- **Subcategorias:** 1X2, Asian Handicap, Over/Under, Marcador, Cartões
- **Mercados Específicos:** Resultado exato, primeiro gol, número de escanteios
- **Mercados Ao Vivo:** Atualizados durante o evento esportivo
- **Mercados Especiais:** Eventos não esportivos, política, entretenimento

## Informações Processadas

- **Estrutura Hierárquica:** Organização clara dos mercados
- **Disponibilidade:** Status atual de cada mercado
- **Condições:** Regras e restrições específicas
- **Metadados:** Informações contextuais sobre cada mercado
- **Relacionamentos:** Conexões entre mercados relacionados