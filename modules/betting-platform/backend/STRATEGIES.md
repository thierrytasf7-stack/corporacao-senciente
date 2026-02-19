# Estratégias de Apostas - Documentação Técnica

Este documento detalha as estratégias implementadas no **Testnet Bet Ecosystem**, baseadas em análise de mercado e gestão matemática de banca.

## 1. Arquitetura de Estratégias

O sistema divide a decisão de aposta em duas camadas independentes e ortogonais:

### Camada 1: Bet Strategy (O "Olheiro")
**Responsabilidade:** Analisar o mercado e decidir **SE** uma aposta deve ser feita.
**Inputs:** Odds, Tempo, Placar, Probabilidade Real.
**Output:** Booleano (Sim/Não).
**Restrição:** Proibido acessar dados da banca (Saldo, Stake).

**Implementações:**
*   **OddsRange:** Aposta se a odd estiver dentro de um intervalo (ex: 1.50 - 2.00). Útil para filtrar favoritos ou zebras.
*   **DroppingOdds:** Monitora o histórico de odds de um evento. Aposta se a odd cair X% em Y segundos (sinal de "Smart Money" entrando).
*   **ValueBet:** Aposta se houver valor matemático (`Probabilidade Real > 1/Odd + Edge`). Requer um modelo externo de probabilidade.

### Camada 2: Math Strategy (O "Gestor")
**Responsabilidade:** Analisar a banca e decidir **QUANTO** apostar.
**Inputs:** Saldo Atual, Histórico de Apostas, Odd Atual.
**Output:** Valor monetário (Stake).
**Restrição:** Proibido decidir qual time apostar.

**Implementações:**
*   **FlatStake:** Aposta sempre o mesmo valor fixo (ex: R$ 10). Ótimo para testes estatísticos puros.
*   **KellyCriterion:** Calcula o stake ideal baseado na vantagem (Edge) e probabilidade de vitória. Maximiza o crescimento geométrico da banca a longo prazo.
*   **Martingale:** Dobra a aposta após uma derrota. Alto risco, recuperação rápida de perdas.

## 2. Configuração de DNA (Exemplos)

### Bot "Trend Follower"
Este bot segue o dinheiro (Dropping Odds) e usa gestão conservadora.
```json
{
  "name": "Trend Follower V1",
  "genes": {
    "bet": {
      "type": "BET",
      "name": "DroppingOdds",
      "dropThreshold": 0.10, // 10% de queda
      "timeWindowSeconds": 300 // em 5 minutos
    },
    "math": {
      "type": "MATH",
      "name": "FlatStake",
      "baseStake": 20
    }
  }
}
```

### Bot "Value Hunter"
Este bot busca erro de precificação da casa e usa Kelly para maximizar lucro.
```json
{
  "name": "Value Hunter Kelly",
  "genes": {
    "bet": {
      "type": "BET",
      "name": "ValueBet",
      "minEdge": 0.05 // 5% de vantagem mínima
    },
    "math": {
      "type": "MATH",
      "name": "Kelly",
      "bankrollPercent": 0.25 // Quarter Kelly (Conservador)
    }
  }
}
```

## 3. Próximos Passos
- Implementar "External Probability Provider" para alimentar a estratégia ValueBet.
- Criar interface no Frontend para configurar o DNA visualmente.
