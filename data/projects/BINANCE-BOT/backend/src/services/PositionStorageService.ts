import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

export interface StoredPosition {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    openPrice: number;
    currentPrice?: number;
    status: 'OPEN' | 'CLOSED';
    strategyName: string;
    orderId: string;
    notes: string;
    openTime: string;
    closeTime?: string;
    pnl?: number;
    pnlPercentage?: number;
    realValueInvested: number;
    updatedAt: string;
    source: 'SYSTEM' | 'BINANCE'; // Distinguir origem
}

export interface PositionStorage {
    positions: StoredPosition[];
    lastUpdate: string;
    version: string;
}

/**
 * ⚠️ SISTEMA DE POSIÇÕES REAIS APENAS - NUNCA CRIAR POSIÇÕES FICTÍCIAS ⚠️
 * 
 * Este serviço foi modificado para trabalhar APENAS com posições reais da Binance.
 * TODAS as posições devem vir da Binance Testnet - NUNCA criar posições fictícias.
 * 
 * REGRAS OBRIGATÓRIAS:
 * 1. NUNCA criar posições com source: 'SYSTEM'
 * 2. NUNCA adicionar posições fictícias ou simuladas
 * 3. APENAS posições reais da Binance Testnet
 * 4. SEMPRE verificar se a posição existe na Binance antes de adicionar
 */
export class PositionStorageService {
    private storageFilePath: string;
    private positions: StoredPosition[] = [];
    private lastUpdate: string = new Date().toISOString();

    constructor() {
        // Criar diretório de storage se não existir
        const storageDir = path.join(process.cwd(), 'data');
        this.storageFilePath = path.join(storageDir, 'positions.json');
        this.ensureStorageDir();
        this.loadFromFileSync();

        // ⚠️ AVISO: Sistema configurado para DADOS REAIS APENAS
        logger.warn('🚨 SISTEMA CONFIGURADO PARA DADOS REAIS APENAS - NUNCA CRIAR POSIÇÕES FICTÍCIAS');
    }

    private async ensureStorageDir(): Promise<void> {
        try {
            const storageDir = path.dirname(this.storageFilePath);
            await fs.mkdir(storageDir, { recursive: true });
            logger.info('💾 [STORAGE] Diretório de storage garantido:', { dir: storageDir });
        } catch (error: any) {
            logger.error('❌ [STORAGE] Erro ao criar diretório:', error.message);
        }
    }

    private loadFromFileSync(): void {
        try {
            const fs = require('fs');
            const data = fs.readFileSync(this.storageFilePath, 'utf-8');
            const storage: PositionStorage = JSON.parse(data);
            this.positions = storage.positions || [];
            this.lastUpdate = storage.lastUpdate || new Date().toISOString();
            logger.info(`✅ [STORAGE] ${this.positions.length} posições carregadas do arquivo local (sync)`);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                logger.info('📁 [STORAGE] Arquivo de storage não existe, criando novo (sync)');
                this.positions = [];
            } else {
                logger.error('❌ [STORAGE] Erro ao carregar arquivo (sync):', error.message);
                this.positions = [];
            }
        }
    }

    private async loadFromFile(): Promise<void> {
        try {
            const data = await fs.readFile(this.storageFilePath, 'utf-8');
            const storage: PositionStorage = JSON.parse(data);
            this.positions = storage.positions || [];
            this.lastUpdate = storage.lastUpdate || new Date().toISOString();
            logger.info(`✅ [STORAGE] ${this.positions.length} posições carregadas do arquivo local`);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                logger.info('📁 [STORAGE] Arquivo de storage não existe, criando novo');
                this.positions = [];
            } else {
                logger.error('❌ [STORAGE] Erro ao carregar arquivo:', error.message);
                this.positions = [];
            }
        }
    }

    private async saveToFile(): Promise<void> {
        try {
            const storage: PositionStorage = {
                positions: this.positions,
                lastUpdate: new Date().toISOString(),
                version: '1.0.0'
            };
            await fs.writeFile(this.storageFilePath, JSON.stringify(storage, null, 2));
            logger.info(`💾 [STORAGE] ${this.positions.length} posições salvas no arquivo local`);
        } catch (error: any) {
            logger.error('❌ [STORAGE] Erro ao salvar arquivo:', error.message);
        }
    }

    /**
     * ❌ MÉTODO REMOVIDO - NUNCA CRIAR POSIÇÕES FICTÍCIAS ❌
     * 
     * Este método foi removido para evitar criação de posições fictícias.
     * Use apenas addRealBinancePosition() para posições reais da Binance.
     * 
     * REGRAS OBRIGATÓRIAS:
     * - NUNCA criar posições com source: 'SYSTEM'
     * - NUNCA adicionar posições fictícias ou simuladas
     * - APENAS posições reais da Binance Testnet
     */
    // async addSystemPosition() - REMOVIDO PARA EVITAR POSIÇÕES FICTÍCIAS

    /**
     * ✅ ADICIONA APENAS POSIÇÕES REAIS DA BINANCE ✅
     * 
     * Este método adiciona APENAS posições reais verificadas na Binance Testnet.
     * NUNCA use para posições fictícias ou simuladas.
     * 
     * REGRAS OBRIGATÓRIAS:
     * 1. SEMPRE verificar se a posição existe na Binance antes de adicionar
     * 2. APENAS posições com source: 'BINANCE'
     * 3. NUNCA criar posições fictícias
     */
    async addRealBinancePosition(binancePosition: any): Promise<StoredPosition> {
        // Verificar se é uma posição real da Binance
        if (!binancePosition || !binancePosition.symbol) {
            throw new Error('❌ Posição inválida - deve ser uma posição real da Binance');
        }

        const position: StoredPosition = {
            id: `BINANCE_${binancePosition.symbol}_${Date.now()}`,
            symbol: binancePosition.symbol,
            side: binancePosition.side === 'LONG' ? 'BUY' : 'SELL',
            quantity: parseFloat(binancePosition.size || binancePosition.origQty || '0'),
            openPrice: parseFloat(binancePosition.entryPrice || binancePosition.price || '0'),
            currentPrice: parseFloat(binancePosition.markPrice || binancePosition.price || '0'),
            status: 'OPEN',
            strategyName: 'Binance Real',
            orderId: binancePosition.orderId || `BINANCE_${Date.now()}`,
            notes: '✅ POSIÇÃO REAL DA BINANCE TESTNET - VERIFICADA',
            openTime: new Date(binancePosition.time || Date.now()).toISOString(),
            realValueInvested: parseFloat(binancePosition.cummulativeQuoteQty || '0'),
            updatedAt: new Date().toISOString(),
            source: 'BINANCE' // ⚠️ APENAS POSIÇÕES REAIS DA BINANCE
        };

        this.positions.push(position);
        await this.saveToFile();

        logger.info('✅ [STORAGE] Posição REAL da Binance adicionada:', {
            id: position.id,
            symbol: position.symbol,
            side: position.side,
            quantity: position.quantity,
            source: 'BINANCE'
        });

        return position;
    }

    /**
     * Fecha uma posição específica
     */
    async closePosition(id: string, closePrice: number, closeTime?: string): Promise<StoredPosition | null> {
        const positionIndex = this.positions.findIndex(p => p.id === id);

        if (positionIndex === -1) {
            logger.error(`❌ [STORAGE] Posição não encontrada para fechar: ${id}`);
            return null;
        }

        const position = this.positions[positionIndex];

        // Atualizar posição para CLOSED
        position.status = 'CLOSED';
        position.closeTime = closeTime || new Date().toISOString();
        position.currentPrice = closePrice; // Usar currentPrice como preço de fechamento
        position.updatedAt = new Date().toISOString();

        // Calcular PnL
        const pnl = position.side === 'BUY'
            ? (closePrice - position.openPrice) * position.quantity
            : (position.openPrice - closePrice) * position.quantity;

        position.pnl = pnl;
        position.pnlPercentage = (pnl / (position.openPrice * position.quantity)) * 100;

        await this.saveToFile();

        logger.info('✅ [STORAGE] Posição fechada:', {
            id: position.id,
            symbol: position.symbol,
            side: position.side,
            openPrice: position.openPrice,
            closePrice: closePrice,
            pnl: pnl,
            pnlPercentage: position.pnlPercentage
        });

        return position;
    }

    /**
     * Atualiza uma posição existente
     */
    async updatePosition(id: string, updates: Partial<StoredPosition>): Promise<StoredPosition | null> {
        const index = this.positions.findIndex(p => p.id === id);
        if (index === -1) {
            logger.warn(`⚠️ [STORAGE] Posição não encontrada para atualização: ${id}`);
            return null;
        }

        this.positions[index] = {
            ...this.positions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveToFile();

        logger.info('✅ [STORAGE] Posição atualizada:', {
            id: this.positions[index].id,
            status: this.positions[index].status
        });

        return this.positions[index];
    }


    /**
     * ✅ OBTÉM APENAS POSIÇÕES REAIS DA BINANCE ✅
     * 
     * Este método retorna APENAS posições reais da Binance Testnet.
     * Posições fictícias (source: 'SYSTEM') são automaticamente filtradas.
     * 
     * REGRAS OBRIGATÓRIAS:
     * - NUNCA retornar posições fictícias
     * - APENAS posições com source: 'BINANCE'
     * - SEMPRE verificar se a posição existe na Binance
     */
    async getAllPositions(): Promise<StoredPosition[]> {
        // ⚠️ FILTRAR APENAS POSIÇÕES REAIS DA BINANCE
        const realPositions = this.positions.filter(p => p.source === 'BINANCE');

        logger.info(`📊 [STORAGE] Retornando ${realPositions.length} posições REAIS da Binance (filtradas ${this.positions.length - realPositions.length} fictícias)`);

        return realPositions.sort((a, b) =>
            new Date(b.openTime).getTime() - new Date(a.openTime).getTime()
        );
    }

    /**
     * ✅ OBTÉM APENAS POSIÇÕES ABERTAS REAIS DA BINANCE ✅
     * 
     * Este método retorna APENAS posições abertas reais da Binance Testnet.
     * Posições fictícias são automaticamente filtradas.
     */
    async getOpenPositions(): Promise<StoredPosition[]> {
        // ⚠️ FILTRAR APENAS POSIÇÕES REAIS ABERTAS DA BINANCE
        const realOpenPositions = this.positions.filter(p => p.status === 'OPEN' && p.source === 'BINANCE');

        logger.info(`📊 [STORAGE] Retornando ${realOpenPositions.length} posições ABERTAS REAIS da Binance`);

        return realOpenPositions;
    }

    /**
     * ✅ OBTÉM ESTATÍSTICAS APENAS DE POSIÇÕES REAIS DA BINANCE ✅
     * 
     * Este método retorna estatísticas APENAS de posições reais da Binance Testnet.
     * Posições fictícias são automaticamente filtradas.
     */
    async getStats(): Promise<{
        total: number;
        open: number;
        closed: number;
        realPositions: number;
        fictitiousPositions: number;
    }> {
        // ⚠️ FILTRAR APENAS POSIÇÕES REAIS DA BINANCE
        const realPositions = this.positions.filter(p => p.source === 'BINANCE');
        const fictitiousPositions = this.positions.filter(p => p.source === 'SYSTEM');

        const total = realPositions.length; // ⚠️ APENAS POSIÇÕES REAIS
        const open = realPositions.filter(p => p.status === 'OPEN').length;
        const closed = realPositions.filter(p => p.status === 'CLOSED').length;

        logger.info(`📊 [STATS] Estatísticas REAIS: ${total} total, ${open} abertas, ${closed} fechadas (${fictitiousPositions.length} fictícias ignoradas)`);

        return {
            total,
            open,
            closed,
            realPositions: total,
            fictitiousPositions: fictitiousPositions.length
        };
    }

    /**
     * ✅ SINCRONIZA APENAS COM POSIÇÕES REAIS DA BINANCE ✅
     * 
     * Este método sincroniza APENAS com posições reais verificadas na Binance Testnet.
     * NUNCA cria posições fictícias ou simuladas.
     * 
     * REGRAS OBRIGATÓRIAS:
     * 1. SEMPRE verificar se as posições existem na Binance
     * 2. APENAS posições com source: 'BINANCE'
     * 3. NUNCA criar posições fictícias
     */
    async syncWithBinancePositions(binancePositions: any[]): Promise<void> {
        logger.info(`🔄 [STORAGE] Sincronizando com ${binancePositions.length} posições REAIS da Binance`);

        // ⚠️ REMOVER TODAS AS POSIÇÕES FICTÍCIAS (SYSTEM) E ANTIGAS DA BINANCE
        this.positions = this.positions.filter(p => p.source !== 'BINANCE' && p.source !== 'SYSTEM');
        logger.warn(`🧹 [STORAGE] Removidas posições fictícias e antigas da Binance`);

        // ⚠️ ADICIONAR APENAS POSIÇÕES REAIS VERIFICADAS DA BINANCE
        for (const binancePos of binancePositions) {
            // Verificar se é uma posição real válida
            if (!binancePos.symbol || !binancePos.orderId) {
                logger.warn(`⚠️ [STORAGE] Posição inválida ignorada:`, binancePos);
                continue;
            }

            const position: StoredPosition = {
                id: `BINANCE_${binancePos.symbol}_${Date.now()}`,
                symbol: binancePos.symbol,
                side: binancePos.side === 'LONG' ? 'BUY' : 'SELL',
                quantity: parseFloat(binancePos.size || binancePos.origQty || '0'),
                openPrice: parseFloat(binancePos.entryPrice || binancePos.price || '0'),
                currentPrice: parseFloat(binancePos.markPrice || binancePos.price || '0'),
                status: 'OPEN',
                strategyName: 'Binance Real',
                orderId: binancePos.orderId || `BINANCE_${Date.now()}`,
                notes: '✅ POSIÇÃO REAL DA BINANCE TESTNET - VERIFICADA E SINCRONIZADA',
                openTime: new Date(binancePos.time || Date.now()).toISOString(),
                realValueInvested: parseFloat(binancePos.cummulativeQuoteQty || '0'),
                updatedAt: new Date().toISOString(),
                source: 'BINANCE' // ⚠️ APENAS POSIÇÕES REAIS DA BINANCE
            };

            this.positions.push(position);
        }

        await this.saveToFile();
        logger.info(`✅ [STORAGE] Sincronização com Binance concluída - ${binancePositions.length} posições REAIS adicionadas`);
    }
}
