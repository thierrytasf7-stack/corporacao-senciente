import { PinnacleAPIClient, PinnacleError } from './client';
import { Odds, Fixture } from './models';
import { EventEmitter } from 'events';

// Configuração segura para evitar banimento (Fair Use Policy)
const CONFIG = {
  SNAPSHOT_REFRESH_INTERVAL: 60 * 60 * 1000, // 1 hora (reset total)
  DELTA_POLLING_INTERVAL: 5 * 1000,          // 5 segundos (updates rápidos)
  MAX_FAILURES_BEFORE_RESET: 3,
  SPORT_ID: '29', // Futebol (Exemplo)
};

export class PinnacleFeedService extends EventEmitter {
  private client: PinnacleAPIClient;
  private lastFixtureSince: number = 0;
  private lastOddsSince: number = 0;
  private lastSnapshotTime: number = 0;
  private failureCount: number = 0;
  private pollingTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  // Cache em Memória (O Estado do Mercado)
  private fixturesCache: Map<string, Fixture> = new Map();
  private oddsCache: Map<string, Odds> = new Map();

  constructor(client: PinnacleAPIClient) {
    super();
    this.client = client;
  }

  /**
   * Inicia o ciclo de vida do Feed.
   * Inteligente: Decide se precisa de Snapshot ou apenas Delta.
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('📡 PinnacleFeedService: Iniciando conexão com Market Data...');

    // Primeira execução imediata
    await this.syncLoop();

    // Loop perpétuo
    this.pollingTimer = setInterval(() => this.syncLoop(), CONFIG.DELTA_POLLING_INTERVAL);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    console.log('🛑 PinnacleFeedService: Serviço parado.');
  }

  /**
   * O Coração do Sistema: Snapshot vs Delta
   */
  private async syncLoop(): Promise<void> {
    try {
      const now = Date.now();
      const needsSnapshot = (now - this.lastSnapshotTime) > CONFIG.SNAPSHOT_REFRESH_INTERVAL;

      if (needsSnapshot || this.lastFixtureSince === 0) {
        await this.performSnapshot();
      } else {
        await this.performDelta();
      }

      this.failureCount = 0; // Reset failures on success
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Traz TUDO. Pesado, mas necessário periodicamente para garantir consistência.
   */
  private async performSnapshot(): Promise<void> {
    console.log('📸 PinnacleFeedService: Executando SNAPSHOT completo...');
    
    // Resetar cursores
    this.lastFixtureSince = 0;
    this.lastOddsSince = 0;
    
    // Buscar dados base (sem parâmetro 'since')
    const fixtures = await this.client.getFixtures(CONFIG.SPORT_ID);
    const odds = await this.client.getOdds(CONFIG.SPORT_ID);

    // Atualizar Cache (Substituição Total ou Merge Inteligente)
    this.updateCache(fixtures, odds, true);
    
    this.lastSnapshotTime = Date.now();
    
    // Atualizar cursores para o próximo delta (usar timestamp do servidor seria ideal, aqui usamos local aproximado)
    // Na API real da Pinnacle, o 'since' é retornado no response.
    const now = Date.now();
    this.lastFixtureSince = now; 
    this.lastOddsSince = now;
  }

  /**
   * Traz apenas o que MUDOU. Leve e rápido.
   */
  private async performDelta(): Promise<void> {
    // console.log(`⚡ PinnacleFeedService: Buscando DELTA (Since: ${this.lastOddsSince})...`);

    const fixtures = await this.client.getFixtures(CONFIG.SPORT_ID, undefined, this.lastFixtureSince);
    const odds = await this.client.getOdds(CONFIG.SPORT_ID, undefined, 'DECIMAL', this.lastOddsSince);

    if (fixtures.length > 0 || odds.length > 0) {
      console.log(`⚡ Update: ${fixtures.length} fixtures mudaram, ${odds.length} odds mudaram.`);
      this.updateCache(fixtures, odds, false);
    }

    // Atualizar cursores
    const now = Date.now();
    this.lastFixtureSince = now;
    this.lastOddsSince = now;
  }

  /**
   * Atualiza a "Verdade" do Mercado e notifica a Arena
   */
  private updateCache(fixtures: Fixture[], odds: Odds[], isSnapshot: boolean): void {
    if (isSnapshot) {
      this.fixturesCache.clear();
      this.oddsCache.clear();
    }

    // Merge Fixtures
    fixtures.forEach(f => this.fixturesCache.set(f.id, f));
    
    // Merge Odds
    odds.forEach(o => this.oddsCache.set(o.fixtureId, o));

    // Emitir evento para os Bots (Arena)
    // Enviamos apenas o que mudou para economizar processamento nos bots
    if (fixtures.length > 0 || odds.length > 0) {
      this.emit('market_update', {
        type: isSnapshot ? 'SNAPSHOT' : 'DELTA',
        fixtures,
        odds,
        timestamp: Date.now()
      });
    }
  }

  private handleError(error: any): void {
    this.failureCount++;
    console.error(`⚠️ PinnacleFeedService Erro (Tentativa ${this.failureCount}):`, error.message);

    // Circuit Breaker / Reset
    if (this.failureCount >= CONFIG.MAX_FAILURES_BEFORE_RESET) {
      console.warn('🚨 Muitos erros consecutivos. Forçando novo SNAPSHOT na próxima execução.');
      this.lastFixtureSince = 0; // Força snapshot
      this.failureCount = 0;
    }
  }

  // Getters para a Arena consultar estado atual se precisar
  public getMarketState() {
    return {
      fixturesCount: this.fixturesCache.size,
      oddsCount: this.oddsCache.size,
      lastUpdate: this.lastOddsSince
    };
  }
}
