---
task: Scrape Markets Data
tipo: "data-scraper"
responsavel: "@data-scraper"
atomic_layer: task
Entrada: |
  - sports: Esportes para raspagem de mercados
  - bookmakers: Casas de apostas alvo
  - market_types: Tipos de mercados desejados
  - event_filters: Filtros para eventos específicos
  - depth: Profundidade de mercados (principal vs. alternativos)
Saida: |
  - scraped_markets: Mercados de apostas raspados
  - market_metadata: Metadados dos mercados
  - availability_info: Informações de disponibilidade
  - market_stats: Estatísticas dos mercados
  - scraping_log: Log da raspagem
---

# scrape-markets

Coleta informações sobre mercados de apostas disponíveis, incluindo tipos, seleções e condições.

## Processo de Scraping

1. **Identificação de Eventos:** Encontrar eventos esportivos disponíveis
2. **Listagem de Mercados:** Coletar todos os mercados oferecidos por evento
3. **Extração de Detalhes:** Obter informações sobre cada mercado (seleções, odds, limites)
4. **Parsing de Estrutura:** Organizar dados em estrutura padronizada
5. **Validação:** Verificar consistência e completude
6. **Armazenamento:** Salvar com timestamps e metadados
7. **Monitoramento:** Registrar disponibilidade e mudanças

## Tipos de Mercados Coletados

- **Mercados Principais:** 1X2, Over/Under, Asian Handicap, BTTS
- **Mercados de Handicaps:** Vantagens numéricas para equilibrar odds
- **Mercados de Placar:** Resultado exato, primeiro/último gol
- **Mercados de Jogador:** Artilheiro, cartões, escanteios
- **Mercados Ao Vivo:** Atualizados durante o evento
- **Mercados Especiais:** Política, entretenimento, eventos especiais

## Fontes de Mercados

- **Bookmakers:** Bet365, Betfair, Pinnacle, 1xBet
- **Tipos de Eventos:** Partidas, competições, torneios
- **Cobertura:** Eventos principais vs. mercados alternativos
- **Profundidade:** Mercados principais vs. mercados especializados

## Informações Coletadas

- **Disponibilidade:** Quais mercados estão abertos para apostas
- **Seleções:** Opções disponíveis em cada mercado
- **Odds:** Cotações atuais para cada seleção
- **Limites:** Valores mínimos e máximos de aposta
- **Status:** Se o mercado está ativo, suspenso ou fechado
- **Atualizações:** Mudanças em tempo real durante eventos ao vivo