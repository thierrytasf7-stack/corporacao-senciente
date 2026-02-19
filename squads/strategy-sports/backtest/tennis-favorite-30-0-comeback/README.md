# Backtest: Tennis Favorite 30-0 Comeback

**Status:** ✅ Ready for Execution  
**Versão:** 1.0.0  
**Criado:** 2026-02-17  
**Estratégia:** `tennis-favorite-30-0-comeback`  
**Config:** `cfg-backtest-v1.0`

---

## 📋 VISÃO GERAL

Este backtest foi projetado para validar de forma **completa e funcional** a estratégia **Tennis Favorite 30-0 Comeback** para uso real em produção.

### Objetivo

Validar se a estratégia é **lucrativa e robusta** o suficiente para ser implantada com capital real.

---

## 🎯 RESUMO DA ESTRATÉGIA

| Parâmetro | Valor |
|-----------|-------|
| **Esporte** | Tênis |
| **Gatilho** | Favorito perde game por 30-0 no próprio saque |
| **Mercado** | Game Winner (Vencedor do Game) |
| **Odd Mínima** | 1.70 |
| **Odd Máxima** | 2.10 |
| **Stake** | Fixa: 1 unidade |
| **Bankroll** | 1.000 unidades |
| **Período** | 08/2025 a 02/2026 (6 meses) |
| **Torneios** | Todos (ATP, WTA, Challenger, ITF, Grand Slam) |
| **Superfícies** | Todas (Clay, Grass, Hard, Carpet) |

---

## 📁 ESTRUTURA DE ARQUIVOS

```
backtest/tennis-favorite-30-0-comeback/
├── README.md                           ← Este arquivo
├── BACKTEST_SPEC.md                    ← Especificação completa
├── config/
│   └── backtest.config.yaml            ← Configuração do backtest
├── src/
│   └── backtest-engine.ts              ← Engine de backtest
├── examples/
│   └── run-backtest.example.ts         ← Exemplo de uso
├── tests/
│   ├── backtest-engine.test.ts         ← Testes unitários
│   └── fixtures/
│       └── sample-matches.json         ← Dados de exemplo
└── output/                             ← Gerado após execução
    ├── report.md                       ← Relatório final
    ├── results.json                    ← Dados brutos
    └── analysis.csv                    ← Para Excel/planilhas
```

---

## 🚀 INSTALAÇÃO E CONFIGURAÇÃO

### Pré-requisitos

```bash
# Node.js 18+
node --version  # v18.x ou superior

# npm ou yarn
npm --version
```

### Instalar Dependências

```bash
cd squads/strategy-sports/backtest/tennis-favorite-30-0-comeback

npm install js-yaml
```

### Configurar Dados

Você precisa de uma base de dados histórica no formato:

```typescript
interface MatchData {
  matchId: string;
  date: string;                    // ISO 8601
  tournament: string;
  surface: 'Clay' | 'Grass' | 'Hard' | 'Carpet';
  player1: { name: string; ranking?: number };
  player2: { name: string; ranking?: number };
  preMatchOdds: { player1: number; player2: number };
  games: GameData[];
  status: 'completed' | 'walkover' | 'retired' | 'stopped';
}

interface GameData {
  gameId: string;
  setNumber: number;
  gameNumber: number;
  server: 'player1' | 'player2';
  points: { player1: number; player2: number };  // 0, 15, 30, 40
  winner: 'player1' | 'player2';
  liveOdds?: { player1: number; player2: number };
  interrupted: boolean;
}
```

---

## 📖 COMO EXECUTAR

### Opção 1: Script TypeScript

```typescript
import { BacktestEngine } from './src/backtest-engine';
import * as fs from 'fs';

// Carregar dados históricos
const matchesData = fs.readFileSync('./data/matches.json', 'utf-8');
const matches = JSON.parse(matchesData);

// Inicializar engine
const engine = new BacktestEngine('./config/backtest.config.yaml');

// Executar backtest
(async () => {
  const result = await engine.run(matches);
  
  console.log('Status:', result.recommendation.status);
  console.log('Score:', result.recommendation.score);
  console.log('ROI:', (result.management.roi * 100).toFixed(2) + '%');
  console.log('Win Rate:', (result.management.winRate * 100).toFixed(2) + '%');
})();
```

### Opção 2: CLI (se implementado)

```bash
# Executar backtest
npm run backtest -- --config=./config/backtest.config.yaml

# Com dados customizados
npm run backtest -- \
  --config=./config/backtest.config.yaml \
  --data=./data/matches.json \
  --output=./output
```

### Opção 3: JavaScript Puro

```javascript
const { BacktestEngine } = require('./src/backtest-engine');
const fs = require('fs');

const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf-8'));
const engine = new BacktestEngine('./config/backtest.config.yaml');

engine.run(matches).then(result => {
  console.log('Backtest concluído!');
  console.log('Status:', result.recommendation.status);
});
```

---

## 📊 CRITÉRIOS DE APROVAÇÃO

A estratégia será considerada **APROVADA** se atender:

| Métrica | Target | Peso |
|---------|--------|------|
| **ROI** | > 5% | 30% |
| **Win Rate** | > 48% | 25% |
| **Profit Factor** | > 1.10 | 20% |
| **Max Drawdown** | < 25% | 15% |
| **Sharpe Ratio** | > 0.5 | 10% |
| **Total Bets** | ≥ 50 | Alto |

### Status de Aprovação

- ✅ **APPROVED:** Score ≥ 80 E ROI > 5% E Win Rate > 48%
- ⚠️ **CONDITIONAL:** Score ≥ 60 E 2+ critérios principais
- ❌ **REJECTED:** Score < 60 OU critérios críticos não atendidos

---

## 📈 MÉTRICAS REPORTADAS

### Estratégia (Lógica Pura)

| Métrica | Descrição |
|---------|-----------|
| Total Matches | Jogos no período |
| Total Games | Games no período |
| Trigger Count | Ocorrências de 30-0 |
| Entry Count | Entradas válidas (odds 1.7-2.1) |
| Placed Bets | Apostas executadas |

### Gestão (Performance)

| Métrica | Descrição | Cálculo |
|---------|-----------|---------|
| Wins | Apostas vencidas | Count |
| Losses | Apostas perdidas | Count |
| Win Rate | % de vitórias | Wins / (Wins + Losses) |
| Total Profit | Lucro total | Σ(profit per bet) |
| ROI | Retorno | Profit / Total Staked |
| Profit Factor | Fator de lucro | Gross Profit / Gross Loss |
| Max Drawdown | Maior queda | Max peak-to-trough |
| Sharpe Ratio | Retorno/risco | (ROI - RF) / StdDev |

### Análise Detalhada

- **Por Mês:** Performance mensal
- **Por Superfície:** Clay, Grass, Hard, Carpet
- **Por Faixa de Odds:** 1.70-1.80, 1.80-1.90, etc.
- **Sequências:** Maior win/loss streak

---

## 🔬 VALIDAÇÃO ESTATÍSTICA

O backtest inclui validação estatística completa:

### Teste de Significância

- **Teste:** One-sample t-test
- **Hipótese Nula:** ROI = 0 (estratégia não gera valor)
- **Nível de Confiança:** 95%
- **P-Value:** < 0.05 para significância

### Comparação com Baseline

- **Baseline:** Apostar sempre no favorito para vencer game
- **Alpha:** ROI da estratégia - ROI baseline
- **Outperformance:** Quanto a estratégia supera a baseline

### Testes de Robustez

- **Sensibilidade de Parâmetros:** Variar odds, stake
- **Out-of-Sample:** Dados não usados em otimização
- **Monte Carlo:** Simulação de cenários (opcional)

---

## 📄 SAÍDA (OUTPUT)

### Arquivos Gerados

| Arquivo | Formato | Conteúdo |
|---------|---------|----------|
| `report.md` | Markdown | Relatório completo e legível |
| `results.json` | JSON | Dados brutos do backtest |
| `analysis.csv` | CSV | Dados para Excel/planilhas |
| `backtest.log` | Log | Logs de execução |

### Estrutura do Relatório (Markdown)

```markdown
# Relatório de Backtest: Tennis Favorite 30-0 Comeback

## Resumo Executivo
- Status: APROVADO / CONDICIONAL / REPROVADO
- Período: 08/2025 - 02/2026
- Total Apostas: XXX
- ROI: X.XX%
- Win Rate: XX.XX%
- Lucro: XXX unidades

## Métricas Principais
[Tabela com targets e status]

## Análise Detalhada
### Por Mês
[Tabela mensal]

### Por Superfície
[Tabela por superfície]

### Por Faixa de Odds
[Tabela por odds]

## Validação Estatística
- Significância: XX%
- P-Value: 0.XXXX
- Baseline Comparison: +X.XX%

## Recomendação
[Texto e próximos passos]
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Pré-Backtest

- [ ] Dados históricos carregados (6 meses)
- [ ] Campos obrigatórios preenchidos
- [ ] Filtros aplicados (excluídos interrompidos)
- [ ] Configuração validada (schema YAML)
- [ ] Dependências instaladas

### Durante Backtest

- [ ] Triggers detectados corretamente
- [ ] Odds validadas (1.70 - 2.10)
- [ ] Apostas executadas (simulado)
- [ ] Resultados calculados
- [ ] Logs gerados sem erros

### Pós-Backtest

- [ ] Métricas calculadas
- [ ] Validação estatística executada
- [ ] Relatório gerado (report.md)
- [ ] Dados brutos exportados (JSON, CSV)
- [ ] Recomendação emitida
- [ ] Resultados revisados

---

## 🧪 EXEMPLO DE DADOS

### Sample Match (JSON)

```json
{
  "matchId": "atp-2025-australian-open-djokovic-sinner",
  "date": "2025-09-15T14:00:00Z",
  "tournament": "ATP Australian Open",
  "surface": "Hard",
  "player1": {
    "name": "Novak Djokovic",
    "ranking": 1
  },
  "player2": {
    "name": "Jannik Sinner",
    "ranking": 4
  },
  "preMatchOdds": {
    "player1": 1.65,
    "player2": 2.25
  },
  "games": [
    {
      "gameId": "g-1-1",
      "setNumber": 1,
      "gameNumber": 1,
      "server": "player1",
      "points": {
        "player1": 0,
        "player2": 30
      },
      "winner": "player1",
      "liveOdds": {
        "player1": 1.85,
        "player2": 1.95
      },
      "interrupted": false
    }
  ],
  "status": "completed"
}
```

Neste exemplo:
- **Favorito:** player1 (odd 1.65 < 2.25)
- **Server:** player1 (favorito sacando)
- **Placar:** 0-30 (30-0 contra favorito) ✅ TRIGGER
- **Odd Live:** 1.85 (dentro do range 1.70-2.10) ✅ VÁLIDO
- **Resultado:** player1 venceu o game ✅ WIN

---

## 🔧 PERSONALIZAÇÃO

### Alterar Período

Edite `config/backtest.config.yaml`:

```yaml
period:
  start: "2025-01-01T00:00:00Z"
  end: "2026-12-31T23:59:59Z"
```

### Alterar Parâmetros de Odds

```yaml
strategy:
  oddsValidation:
    min: 1.65    # Mudar de 1.70
    max: 2.20    # Mudar de 2.10
```

### Alterar Stake

```yaml
management:
  staking:
    method: "fixed"
    value: 2.0   # Mudar de 1 para 2 unidades
```

### Alterar Targets

```yaml
validation:
  targets:
    roi: 0.08        # 8% em vez de 5%
    winRate: 0.50    # 50% em vez de 48%
```

---

## ⚠️ LIMITAÇÕES E AVISOS

### Limitações Conhecidas

1. **Dados Históricos:** Qualidade depende da precisão dos dados
2. **Odds Live:** Podem não refletir liquidez real do mercado
3. **Delay de Execução:** Janela de 10s pode não ser executável sempre
4. **Viés de Sobrevivência:** Jogos interrompidos são excluídos

### Avisos Importantes

- **Backtest ≠ Performance Futura:** Resultados passados não garantem futuros
- **Overfitting:** Cuidado ao otimizar parâmetros em excesso
- **Condições de Mercado:** Liquidez e spreads podem variar
- **Paper Trading:** Sempre teste em papel antes de capital real

---

## 📞 SUPORTE

### Documentação Relacionada

- [Especificação Completa](./BACKTEST_SPEC.md)
- [Configuração](./config/backtest.config.yaml)
- [Estratégia Pura](../../strategy/tennis-favorite-30-0-comeback.md)
- [Protocolos](../../PROTOCOLS.md)

### Contato

- **Squad:** Strategy-Sports
- **CEO-BET:** Orquestrador
- **Status:** Ready for Execution

---

## 🎯 PRÓXIMOS PASSOS

1. **Preparar Dados**
   - [ ] Coletar dados históricos (6 meses)
   - [ ] Validar formato dos dados
   - [ ] Aplicar filtros necessários

2. **Executar Backtest**
   - [ ] Rodar engine
   - [ ] Verificar logs
   - [ ] Validar resultados

3. **Analisar Resultados**
   - [ ] Revisar métricas
   - [ ] Verificar validação estatística
   - [ ] Ler relatório completo

4. **Tomar Decisão**
   - [ ] Aprovar para produção
   - [ ] Solicitar otimizações
   - [ ] Reprovar e revisar

---

**Backtest pronto para execução.** 🚀

**Versão:** 1.0.0 | **Atualizado:** 2026-02-17
