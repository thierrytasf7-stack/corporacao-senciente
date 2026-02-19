/**
 * Exemplo de Execução do Backtest
 * Tennis Favorite 30-0 Comeback
 * 
 * Este script demonstra como executar o backtest com dados reais
 */

import { BacktestEngine } from './src/backtest-engine';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

const CONFIG_PATH = path.join(__dirname, 'config', 'backtest.config.yaml');
const DATA_PATH = path.join(__dirname, 'data', 'matches.json');
const OUTPUT_DIR = path.join(__dirname, 'output');

// =============================================================================
// FUNÇÃO PRINCIPAL
// =============================================================================

async function runBacktest() {
  console.log('='.repeat(60));
  console.log('🎾 BACKTEST: Tennis Favorite 30-0 Comeback');
  console.log('='.repeat(60));
  console.log('');
  
  // Verificar se arquivo de dados existe
  if (!fs.existsSync(DATA_PATH)) {
    console.error('❌ Arquivo de dados não encontrado:', DATA_PATH);
    console.error('');
    console.error('Instruções:');
    console.error('1. Crie uma pasta "data" no diretório raiz do backtest');
    console.error('2. Adicione um arquivo "matches.json" com os dados históricos');
    console.error('3. Execute o script novamente');
    console.error('');
    console.error('Formato esperado: Array de MatchData');
    console.error('Veja o exemplo em: examples/sample-matches.json');
    return;
  }
  
  try {
    // Carregar dados
    console.log('📂 Carregando dados históricos...');
    const dataContent = fs.readFileSync(DATA_PATH, 'utf-8');
    const matches = JSON.parse(dataContent);
    console.log(`✅ ${matches.length} jogos carregados`);
    console.log('');
    
    // Inicializar engine
    console.log('⚙️ Inicializando Backtest Engine...');
    const engine = new BacktestEngine(CONFIG_PATH);
    console.log('✅ Engine inicializada');
    console.log('');
    
    // Executar backtest
    console.log('🚀 Executando backtest...');
    console.log('');
    const result = await engine.run(matches);
    
    // Imprimir resumo
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 RESUMO DO BACKTEST');
    console.log('='.repeat(60));
    console.log('');
    console.log('Status:', getResultStatus(result.recommendation.status));
    console.log('Confiança:', getConfidenceLevel(result.recommendation.confidence));
    console.log('Score:', `${result.recommendation.score.toFixed(1)}/100`);
    console.log('');
    console.log('📈 Métricas Principais:');
    console.log(`  ROI: ${(result.management.roi * 100).toFixed(2)}%`);
    console.log(`  Win Rate: ${(result.management.winRate * 100).toFixed(2)}%`);
    console.log(`  Profit Factor: ${result.management.profitFactor.toFixed(2)}`);
    console.log(`  Max Drawdown: ${(result.management.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`  Sharpe Ratio: ${result.management.sharpeRatio.toFixed(2)}`);
    console.log('');
    console.log('💰 Resultados Financeiros:');
    console.log(`  Bankroll Inicial: ${result.config.management.bankroll.initial} unidades`);
    console.log(`  Bankroll Final: ${result.management.finalBankroll.toFixed(2)} unidades`);
    console.log(`  Lucro Total: ${result.management.totalProfit.toFixed(2)} unidades`);
    console.log('');
    console.log('📊 Apostas:');
    console.log(`  Total: ${result.management.placedBets}`);
    console.log(`  Vitórias: ${result.management.wins}`);
    console.log(`  Derrotas: ${result.management.losses}`);
    console.log('');
    console.log('🔬 Validação Estatística:');
    console.log(`  Significante: ${result.validation.isStatisticallySignificant ? 'Sim' : 'Não'}`);
    console.log(`  P-Value: ${result.validation.pValue.toFixed(4)}`);
    console.log(`  Z-Score: ${result.validation.zScore.toFixed(2)}`);
    console.log('');
    console.log('📝 Próximos Passos:');
    result.recommendation.nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Backtest concluído com sucesso!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📄 Arquivos gerados:');
    console.log(`  - ${path.join(OUTPUT_DIR, 'report.md')}`);
    console.log(`  - ${path.join(OUTPUT_DIR, 'results.json')}`);
    console.log(`  - ${path.join(OUTPUT_DIR, 'analysis.csv')}`);
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ ERRO DURANTE BACKTEST:');
    console.error(error instanceof Error ? error.message : error);
    console.error('');
    console.error('Verifique:');
    console.error('1. Se o arquivo de dados está no formato correto');
    console.error('2. Se a configuração YAML é válida');
    console.error('3. Se todas as dependências estão instaladas');
    console.error('');
    process.exit(1);
  }
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

function getResultStatus(status: 'APPROVED' | 'CONDITIONAL' | 'REJECTED'): string {
  const icons = {
    APPROVED: '✅ APROVADO',
    CONDITIONAL: '⚠️ CONDICIONAL',
    REJECTED: '❌ REPROVADO',
  };
  return icons[status];
}

function getConfidenceLevel(level: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  const icons = {
    HIGH: '🟢 Alta',
    MEDIUM: '🟡 Média',
    LOW: '🔴 Baixa',
  };
  return icons[level];
}

// =============================================================================
// EXECUTAR
// =============================================================================

runBacktest().catch(console.error);
