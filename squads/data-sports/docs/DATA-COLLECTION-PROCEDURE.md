# 📋 PROCEDIMENTO DE COLETA DE DADOS PARA TODOS ESPORTES

**Versão:** 1.0.0  
**Data:** 2026-02-17  
**Responsável:** Data-Sports Squad  
**Orquestrador:** CEO-BET

---

## 🎯 VISÃO GERAL

Este documento descreve o procedimento **PADRÃO** para coleta de dados históricos de **TODOS OS ESPORTES** suportados pela plataforma BET-SPORTS.

### Esportes Suportados

| Esporte | Scraper | Status | Dados |
|---------|---------|--------|-------|
| 🎾 **Tênis** | `tennis-scraper.py` | ✅ Pronto | Partidas, Sets, Games, Odds |
| 🏀 **Basketball (NBA)** | `nba-scraper.py` | ✅ Pronto | Jogos, Quarters, Odds |
| ⚽ **Football** | `football-scraper.py` | ⏳ Pendente | Jogos, Gols, Odds |
| 🏈 **Football Americano (NFL)** | `nfl-scraper.py` | ⏳ Pendente | Jogos, Quarters, Odds |
| 🥊 **MMA (UFC)** | `mma-scraper.py` | ⏳ Pendente | Lutas, Rounds, Odds |
| 🎮 **Esports** | `esports-scraper.py` | ⏳ Pendente | Matches, Maps, Odds |

---

## 📁 ESTRUTURA DE ARQUIVOS

```
modules/betting-platform/backend/scripts/
├── setup-tennis-db.sql              ← Schema Tênis
├── tennis-scraper.py                ← Scraper Tênis
├── nba-scraper.py                   ← Scraper NBA
├── setup-nba-db.sql                 ← Schema NBA
├── football-scraper.py              ← ⏳ Futuro
├── nfl-scraper.py                   ← ⏳ Futuro
├── mma-scraper.py                   ← ⏳ Futuro
└── esports-scraper.py               ← ⏳ Futuro
```

---

## 🔧 PRÉ-REQUISITOS

### 1. PostgreSQL Instalado

```bash
# Verificar se PostgreSQL está rodando
psql --version

# Conectar ao banco
psql -U postgres -h localhost
```

### 2. Python 3.8+

```bash
python --version  # Deve ser 3.8 ou superior
```

### 3. Variáveis de Ambiente

Editar `.env` na raiz do projeto:

```env
# APIs de Odds
THEODDS_API_KEY=sua_chaqui_aqui
API_SPORTS_KEY=sua_chave_aqui

# Pinnacle (opcional, para odds reais)
PINNACLE_USERNAME=seu_usuario
PINNACLE_PASSWORD=sua_senha

# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=betting_platform
DB_PASSWORD=sua_senha
DB_PORT=5432
```

### 4. Instalar Dependências

```bash
cd modules/betting-platform/backend/scripts

# Para Tênis
pip install requests psycopg2-binary python-dotenv

# Para NBA
pip install nba_api psycopg2-binary python-dotenv
```

---

## 🎾 PROCEDIMENTO: TÊNIS

### Passo 1: Criar Schema

```bash
cd modules/betting-platform/backend/scripts

# Conectar ao PostgreSQL
psql -U postgres -h localhost -d postgres

# Executar schema
\i setup-tennis-db.sql

# Ou via linha de comando
psql -U postgres -h localhost -d postgres -f setup-tennis-db.sql
```

### Passo 2: Executar Scraper

```bash
# Opção A: Últimos 30 dias (padrão)
python tennis-scraper.py

# Opção B: Últimos 180 dias (6 meses)
python tennis-scraper.py --days 180

# Opção C: Data específica
python tennis-scraper.py --date 2025-08-01

# Opção D: Range de datas (modificar script)
# Editar tennis-scraper.py e chamar fetch_date_range manualmente
```

### Passo 3: Buscar Odds

```bash
# Fase 2: Buscar odds para partidas sem odds
python tennis-scraper.py --odds

# Com limite (para teste)
python tennis-scraper.py --odds --limit 100
```

### Passo 4: Verificar Status

```bash
# Ver quantas partidas foram coletadas
python tennis-scraper.py --status
```

### Passo 5: Exportar Dados para Backtest

```bash
# Conectar ao banco e exportar
psql -U postgres -h localhost -d postgres

# Exportar para JSON
\copy (SELECT * FROM v_tennis_matches_complete TO 'data/tennis-matches.json' WITH FORMAT JSON);

# Ou usar script de exportação (ver abaixo)
```

---

## 🏀 PROCEDIMENTO: BASKETBALL (NBA)

### Passo 1: Criar Schema

```bash
cd modules/betting-platform/backend/scripts
psql -U postgres -h localhost -d postgres -f setup-nba-db.sql
```

### Passo 2: Executar Scraper

```bash
# Coletar todas as temporadas
python nba-scraper.py

# Coletar temporada específica
python nba-scraper.py --season 2024-25

# Coletar múltiplas temporadas (editar script)
# SEASONS = ['2022-23', '2023-24', '2024-25']
```

### Passo 3: Enriquecer com Quarters Reais

```bash
# Fase 2: Buscar Q1-Q4 reais (mais lento)
python nba-scraper.py --quarters

# Com limite (para teste)
python nba-scraper.py --quarters --limit 100
```

### Passo 4: Verificar Status

```bash
python nba-scraper.py --status
```

---

## ⚽ PROCEDIMENTO: FOOTBALL (EM IMPLEMENTAÇÃO)

### Scraper Futuro: `football-scraper.py`

**Fontes:**
- API-Football (api-football.com)
- TheOddsAPI

**Dados:**
- Partidas (liga, data, times)
- Gols (minuto, marcador)
- Escanteios
- Cartões
- Odds

**Comando (futuro):**
```bash
python football-scraper.py --days 180
python football-scraper.py --odds
python football-scraper.py --status
```

---

## 📊 EXPORTAÇÃO DE DADOS

### Script de Exportação Genérico

Criar arquivo `export-data.py`:

```python
#!/usr/bin/env python3
"""
Exporta dados do PostgreSQL para JSON (formato backtest)
"""

import psycopg2
import json

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '21057788',
    'database': 'postgres'
}

def export_tennis_matches(output_file='tennis-matches.json'):
    conn = psycopg2.connect(**DB_CONFIG)
    
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                m.match_id,
                m.match_date,
                m.tournament,
                m.surface,
                m.player1_name,
                m.player2_name,
                m.player1_rank,
                m.player2_rank,
                m.winner_name,
                m.status,
                o.player1_odd,
                o.player2_odd,
                json_agg(
                    json_build_object(
                        'set_number', s.set_number,
                        'player1_games', s.player1_games,
                        'player2_games', s.player2_games
                    )
                ) as sets,
                json_agg(
                    DISTINCT jsonb_build_object(
                        'game_id', g.id,
                        'set_number', g.set_number,
                        'game_number', g.game_number,
                        'server', g.server,
                        'player1_points', g.player1_points,
                        'player2_points', g.player2_points,
                        'winner', g.winner
                    )
                ) as games
            FROM tennis_matches m
            LEFT JOIN tennis_odds o ON m.match_id = o.match_id
            LEFT JOIN tennis_sets s ON m.match_id = s.match_id
            LEFT JOIN tennis_games g ON m.match_id = g.match_id
            WHERE m.status = 'Finished'
            GROUP BY m.match_id, o.player1_odd, o.player2_odd
            ORDER BY m.match_date DESC
        """)
        
        rows = cur.fetchall()
        
        matches = []
        for row in rows:
            match = {
                'matchId': str(row[0]),
                'date': row[1].isoformat() if row[1] else None,
                'tournament': row[2],
                'surface': row[3],
                'player1': {'name': row[4], 'ranking': row[6]},
                'player2': {'name': row[5], 'ranking': row[7]},
                'preMatchOdds': {
                    'player1': float(row[10]) if row[10] else None,
                    'player2': float(row[11]) if row[11] else None
                },
                'sets': row[12] or [],
                'games': row[13] or [],
                'status': 'completed' if row[9] == 'Finished' else row[9]
            }
            matches.append(match)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(matches, f, indent=2, ensure_ascii=False)
        
        print(f"✅ {len(matches)} partidas exportadas para {output_file}")
    
    conn.close()

if __name__ == '__main__':
    export_tennis_matches()
```

**Uso:**
```bash
python export-data.py
```

---

## 🔄 COLETA AUTOMATIZADA (CRON)

### Script de Atualização Diária

Criar arquivo `daily-update.sh`:

```bash
#!/bin/bash
# Atualiza dados de todos os esportes diariamente

cd /path/to/Diana-Corporacao-Senciente/modules/betting-platform/backend/scripts

echo "=== Iniciando atualização diária ==="
echo "Data: $(date)"

# Tênis (último dia)
echo "Coletando Tênis..."
python tennis-scraper.py --date $(date +%Y-%m-%d)
python tennis-scraper.py --odds --limit 50

# NBA (durante temporada)
echo "Coletando NBA..."
python nba-scraper.py

# Status
echo "Status final:"
python tennis-scraper.py --status
python nba-scraper.py --status

echo "=== Atualização concluída ==="
```

### Configurar Cron (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Adicionar linha (executa todo dia às 02:00)
0 2 * * * /path/to/daily-update.sh >> /var/log/betting-update.log 2>&1
```

### Task Scheduler (Windows)

```powershell
# Criar task agendada
$action = New-ScheduledTaskAction -Execute "python" `
  -Argument "tennis-scraper.py --date $(Get-Date -Format yyyy-MM-dd)" `
  -WorkingDirectory "C:\path\to\scripts"

$trigger = New-ScheduledTaskTrigger -Daily -At 2am

Register-ScheduledTask -TaskName "Betting Data Update" `
  -Action $action -Trigger $trigger -User "System"
```

---

## 📊 VALIDAÇÃO DE DADOS

### Checklist de Validação

Antes de usar os dados para backtest, validar:

- [ ] **Partidas com status "Finished"** (excluir Live, Cancelled)
- [ ] **Dados completos** (player1, player2, winner)
- [ ] **Sets coerentes** (ex: 6-4, 7-5, não 10-0)
- [ ] **Games ponto-a-ponto** (0, 15, 30, 40)
- [ ] **Odds presentes** (player1_odd, player2_odd)
- [ ] **Sem duplicatas** (match_id único)

### Query de Validação

```sql
-- Verificar partidas com dados incompletos
SELECT 
    match_id,
    player1_name,
    player2_name,
    winner_name,
    status,
    COUNT(DISTINCT s.set_number) as sets_count,
    COUNT(DISTINCT g.id) as games_count
FROM tennis_matches m
LEFT JOIN tennis_sets s ON m.match_id = s.match_id
LEFT JOIN tennis_games g ON m.match_id = g.match_id
WHERE m.status = 'Finished'
GROUP BY m.match_id
HAVING 
    winner_name IS NULL OR
    COUNT(DISTINCT s.set_number) = 0 OR
    COUNT(DISTINCT g.id) = 0;

-- Verificar odds ausentes
SELECT COUNT(*) 
FROM tennis_matches m
LEFT JOIN tennis_odds o ON m.match_id = o.match_id
WHERE m.status = 'Finished' AND o.match_id IS NULL;
```

---

## 🎯 BACKTEST READY

### Formato Esperado para Backtest

Os dados exportados devem seguir este schema:

```typescript
interface MatchData {
  matchId: string;
  date: string;                    // ISO 8601
  tournament: string;
  surface: 'Clay' | 'Grass' | 'Hard' | 'Carpet';
  player1: { name: string; ranking?: number };
  player2: { name: string; ranking?: number };
  preMatchOdds: { player1: number; player2: number };
  sets: Array<{ setNumber: number; player1Games: number; player2Games: number }>;
  games: Array<{
    gameId: string;
    setNumber: number;
    gameNumber: number;
    server: 'player1' | 'player2';
    points: { player1: number; player2: number };  // 0, 15, 30, 40
    winner: 'player1' | 'player2';
    liveOdds?: { player1: number; player2: number };
    interrupted: boolean;
  }>;
  status: 'completed' | 'walkover' | 'retired' | 'stopped';
}
```

### Script de Conversão

Se necessário converter do formato do banco para o formato de backtest:

```bash
# Ver módulo de exportação
python export-data.py

# Dados serão salvos em: data/tennis-matches.json
```

---

## 📞 SUPORTE

### Problemas Comuns

| Erro | Solução |
|------|---------|
| `psycopg2.OperationalError: connection refused` | Verificar se PostgreSQL está rodando |
| `ModuleNotFoundError: No module named 'requests'` | `pip install requests` |
| `API key inválida` | Verificar `.env` e chave da API |
| `Timeout error` | Aumentar timeout no script ou verificar conexão |
| `Duplicate key` | Dados já coletados, usar `--status` para verificar |

### Logs

Os scrapers geram logs no console. Para salvar em arquivo:

```bash
python tennis-scraper.py --days 180 > tennis-scraper.log 2>&1
```

---

## 📈 MONITORAMENTO

### Dashboard de Coleta (SQL)

```sql
-- Resumo geral
SELECT 
    'Tênis' as esporte,
    COUNT(*) as total_partidas,
    COUNT(DISTINCT tournament) as torneios,
    COUNT(DISTINCT surface) as superficies,
    AVG(player1_rank + player2_rank) as avg_ranking
FROM tennis_matches;

-- Evolução diária
SELECT 
    DATE(match_date) as data,
    COUNT(*) as partidas
FROM tennis_matches
GROUP BY DATE(match_date)
ORDER BY data DESC
LIMIT 30;

-- Qualidade dos dados
SELECT 
    status,
    COUNT(*) as total,
    COUNT(CASE WHEN odds_fetched THEN 1 END) as com_odds,
    COUNT(CASE WHEN winner_name IS NOT NULL THEN 1 END) as com_vencedor
FROM tennis_matches
GROUP BY status;
```

---

## 🚀 PRÓXIMOS PASSOS

### Imediato (Tênis)

1. [ ] Atualizar `.env` com chaves de API
2. [ ] Instalar dependências
3. [ ] Criar schema `setup-tennis-db.sql`
4. [ ] Executar `tennis-scraper.py --days 180`
5. [ ] Executar `tennis-scraper.py --odds`
6. [ ] Exportar dados: `python export-data.py`
7. [ ] Validar dados
8. [ ] Rodar backtest

### Curto Prazo (1 semana)

1. [ ] Implementar `football-scraper.py`
2. [ ] Implementar `nfl-scraper.py`
3. [ ] Implementar `mma-scraper.py`
4. [ ] Implementar `esports-scraper.py`

### Médio Prazo (1 mês)

1. [ ] Configurar coleta automática diária (cron)
2. [ ] Criar dashboard de monitoramento
3. [ ] Integrar com Pinnacle para odds reais
4. [ ] Enriquecer dados históricos

---

## 🔗 LINKS ÚTEIS

| Recurso | URL |
|---------|-----|
| API-Sports (Tênis) | https://api-sports.io/documentation/tennis/v1 |
| TheOddsAPI | https://theoddsapi.com/ |
| Pinnacle API | https://www.pinnacle.com/en/api |
| ATP Tour | https://www.atptour.com/en/scores/archive |
| WTA Tour | https://www.wtatennis.com/scores |

---

**Procedimento completo para coleta de dados de todos os esportes.** 🎯

**Versão:** 1.0.0 | **Data:** 2026-02-17 | **Strategy-Sports Squad**
