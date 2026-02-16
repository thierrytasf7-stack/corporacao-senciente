/**
 * CommunityEcosystem - Top-level orchestrator for 5 groups × 5 bots = 25 bots
 *
 * Hierarchy: Community ($2,500) → 5 Groups ($500 each) → 5 Bots ($100 each)
 *
 * Survival instincts:
 * - Bot: tries to survive and grow
 * - Group: replaces dead bots from best alive
 * - Inter-group: every 200 cycles, worst group loses worst bot, gains clone from best group
 * - Community: 3+ groups hitting milestone = boost mutation (positive evolutionary pressure)
 */

import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from '../BinanceApiService';
import { SignalPoolEngine } from '../SignalPoolEngine';
import { GroupArena, GroupPersonality } from './GroupArena';
import { MilestoneTracker, MilestoneEvent } from './MilestoneTracker';
import { DNAVectorMemory } from './DNAVectorMemory';
import { ClaudeOracle, OracleContext } from './ClaudeOracle';
import { EvolutionRegistry } from './EvolutionRegistry';

const CYCLE_INTERVAL_MS = 6000;
const INTER_GROUP_EVOLUTION_INTERVAL = 200;
const ORACLE_CONSULTATION_INTERVAL = 500;
const PERSIST_INTERVAL_MS = 30000;
const INITIAL_BOT_BANKROLL = 100;
const BOTS_PER_GROUP = 5;
const GROUP_IDS: GroupPersonality[] = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'OMEGA'];

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const STATE_FILE = path.join(DATA_DIR, 'community-state.json');
const HALL_OF_FAME_FILE = path.join(DATA_DIR, 'hall-of-fame.json');

export class CommunityEcosystem {
    private groups: Map<GroupPersonality, GroupArena> = new Map();
    private milestones: MilestoneTracker;
    private memory: DNAVectorMemory;
    private oracle: ClaudeOracle;
    private signalPool: SignalPoolEngine;
    private evolutionRegistry: EvolutionRegistry;

    private isRunning: boolean = false;
    private currentCycle: number = 0;
    private cycleInterval: NodeJS.Timeout | null = null;
    private persistInterval: NodeJS.Timeout | null = null;
    private cycleRunning: boolean = false; // Guard against overlapping cycles
    private startTime: string = '';
    private peakBankroll: number = 0;
    private consecutiveBankruptcies: number = 0;
    private hallOfFame: Array<{
        name: string; groupId: string; fitness: number; bankroll: number;
        generation: number; winRate: number; timestamp: string;
    }> = [];

    constructor(private binanceService: BinanceApiService) {
        this.signalPool = new SignalPoolEngine(binanceService);
        this.milestones = new MilestoneTracker();
        this.memory = new DNAVectorMemory();
        this.oracle = new ClaudeOracle();
        this.evolutionRegistry = new EvolutionRegistry();

        // Initialize 5 groups sharing the same signal pool
        for (const gId of GROUP_IDS) {
            const group = new GroupArena(gId, binanceService, this.signalPool);
            group.setDNAMemory(this.memory);
            this.groups.set(gId, group);
        }

        this.milestones.onMilestone((event) => this.onMilestoneAchieved(event));
        this.ensureDataDirs();
    }

    private ensureDataDirs(): void {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // ======================== LIFECYCLE ========================

    async start(): Promise<{ success: boolean; message: string }> {
        if (this.isRunning) return { success: false, message: 'Ecosystem already running' };

        // Try to resume persisted state
        const resumed = this.loadPersistedState();

        if (!resumed) {
            // Fresh start: initialize all groups
            for (const [, group] of this.groups) {
                group.initialize();
            }
        }

        this.isRunning = true;
        this.startTime = new Date().toISOString();
        this.peakBankroll = Math.max(this.peakBankroll, this.getTotalBankroll());
        this.cycleInterval = setInterval(() => this.runCycle(), CYCLE_INTERVAL_MS);
        this.persistInterval = setInterval(() => this.persistState(), PERSIST_INTERVAL_MS);

        const totalBots = GROUP_IDS.length * BOTS_PER_GROUP;
        console.log(`🌐 Community Ecosystem ${resumed ? 'RESUMED' : 'STARTED'} | ${GROUP_IDS.length} groups × ${BOTS_PER_GROUP} bots = ${totalBots} bots | $${totalBots * INITIAL_BOT_BANKROLL} total capital`);

        return {
            success: true,
            message: `Ecosystem ${resumed ? 'resumed' : 'started'} with ${totalBots} bots across ${GROUP_IDS.length} groups`
        };
    }

    stop(): { success: boolean; message: string } {
        if (!this.isRunning) return { success: false, message: 'Ecosystem not running' };

        if (this.cycleInterval) clearInterval(this.cycleInterval);
        if (this.persistInterval) clearInterval(this.persistInterval);
        this.isRunning = false;

        this.persistState();
        this.milestones.persist();
        this.memory.persist();
        this.oracle.persist();
        this.evolutionRegistry.persist();

        console.log('🛑 Community Ecosystem stopped (state persisted)');
        return { success: true, message: 'Ecosystem stopped, state persisted for resume' };
    }

    async reset(): Promise<{ success: boolean; message: string }> {
        if (this.isRunning) this.stop();

        // Clear persisted state
        try { if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE); } catch { /* ok */ }

        this.currentCycle = 0;
        this.peakBankroll = 0;
        this.consecutiveBankruptcies = 0;
        this.hallOfFame = [];
        this.milestones.reset();
        this.memory.reset();
        this.oracle.reset();
        this.evolutionRegistry.reset();

        for (const [, group] of this.groups) {
            group.initialize();
        }

        console.log('🔄 Community Ecosystem reset');
        return this.start();
    }

    // ======================== MAIN CYCLE ========================

    private async runCycle(): Promise<void> {
        // H2 fix: guard against overlapping cycles
        if (this.cycleRunning) return;
        this.cycleRunning = true;
        this.currentCycle++;

        try {
            // Step 1: Get all signals once (shared by all 25 bots)
            const allSignals = await this.signalPool.generateAllSignals();

            // Step 2: Execute cycle for each group
            for (const [, group] of this.groups) {
                await group.executeCycle(allSignals);
            }

            // Step 3: Check milestones
            const totalBankroll = this.getTotalBankroll();
            this.peakBankroll = Math.max(this.peakBankroll, totalBankroll);

            const newMilestones = this.milestones.checkAll({
                totalBankroll,
                initialBankroll: GROUP_IDS.length * BOTS_PER_GROUP * INITIAL_BOT_BANKROLL,
                groups: GROUP_IDS.map(gId => {
                    const group = this.groups.get(gId)!;
                    return {
                        groupId: gId,
                        groupBankroll: group.getGroupBankroll(),
                        initialBankroll: BOTS_PER_GROUP * INITIAL_BOT_BANKROLL,
                        bots: group.getAllBots().map(b => ({
                            botId: b.genome.id,
                            bankroll: b.bankroll,
                            initialBankroll: INITIAL_BOT_BANKROLL
                        }))
                    };
                })
            });

            if (newMilestones.length > 0) {
                for (const m of newMilestones) {
                    console.log(`🏆 MILESTONE: ${m.level} ${m.entityId} hit ${m.milestone}x ($${m.bankroll.toFixed(0)})`);
                }
            }

            // Step 4: Inter-group evolution every 200 cycles
            if (this.currentCycle % INTER_GROUP_EVOLUTION_INTERVAL === 0 && this.currentCycle > 0) {
                this.interGroupEvolution();
            }

            // Step 5: Oracle consultation every 500 cycles (C3 fix: await + catch)
            if (this.currentCycle % ORACLE_CONSULTATION_INTERVAL === 0 && this.currentCycle > 0) {
                await this.oracleConsultation().catch(err => {
                    console.error('🔮 Oracle consultation error:', err);
                });
            }

            // Step 6: Community pressure - if 3+ groups hit a milestone, boost mutation
            this.checkCommunityPressure();

            // Step 7: Record evolution snapshots every 50 cycles
            if (this.currentCycle % 50 === 0 && this.currentCycle > 0) {
                this.recordEvolutionSnapshots();
            }

        } catch (err) {
            // M4 fix: log first 5 errors always, then every 100
            if (this.currentCycle <= 5 || this.currentCycle % 100 === 0) {
                console.error(`⚠️ Ecosystem cycle ${this.currentCycle} error:`, err);
            }
        } finally {
            this.cycleRunning = false;
        }
    }

    // ======================== EVOLUTION REGISTRY ========================

    private recordEvolutionSnapshots(): void {
        const seedNames = [
            'strategyParams', 'marketRegime', 'temporal', 'correlation',
            'sentiment', 'riskAdapt', 'metaEvolution', 'patterns', 'symbolSelection'
        ];

        for (const [gId, group] of this.groups) {
            const seeds = group.getSeedsStatus();
            for (const seedName of seedNames) {
                const seed = seeds[seedName];
                if (seed) {
                    this.evolutionRegistry.record(`${gId}:${seedName}`, {
                        cycle: this.currentCycle,
                        generation: seed.generation,
                        fitness: seed.fitness,
                        bestGenomeHash: `${gId}-${seedName}-gen${seed.generation}`,
                        metadata: { groupId: gId }
                    });
                }
            }
        }
    }

    // ======================== INTER-GROUP EVOLUTION ========================

    private interGroupEvolution(): void {
        // Rank groups by bankroll
        const groupRanking = GROUP_IDS.map(gId => ({
            groupId: gId,
            group: this.groups.get(gId)!,
            bankroll: this.groups.get(gId)!.getGroupBankroll(),
            fitness: this.groups.get(gId)!.getGroupFitness()
        })).sort((a, b) => a.fitness - b.fitness);

        const worstGroup = groupRanking[0];
        const bestGroup = groupRanking[groupRanking.length - 1];

        if (worstGroup.groupId === bestGroup.groupId) return;

        // Worst group loses its worst bot
        const removedBot = worstGroup.group.removeWorstBot();

        // Best group donates a mutated clone of its best
        const bestGenome = bestGroup.group.getBestGenome();
        if (bestGenome) {
            const clone = JSON.parse(JSON.stringify(bestGenome));
            clone.id = `eco-migrant-${Date.now()}`;
            clone.name = `Migrant-${this.currentCycle}`;

            // Apply light mutation for genetic diversity (prevents exact clones dominating)
            for (let i = 0; i < 30; i++) {
                if (Math.random() < 0.1) clone.strategyMask[i] = !clone.strategyMask[i];
                if (Math.random() < 0.1) clone.strategyWeights[i] = Math.max(0.1, Math.min(2.0, clone.strategyWeights[i] + (Math.random() - 0.5) * 0.3));
            }
            if (Math.random() < 0.2) clone.risk.leverage = Math.max(5, Math.min(75, clone.risk.leverage + Math.round((Math.random() - 0.5) * 10)));
            if (Math.random() < 0.2) clone.consensus.minAgreeingSignals = Math.max(2, Math.min(15, clone.consensus.minAgreeingSignals + Math.round((Math.random() - 0.5) * 2)));
            if (Math.random() < 0.2) clone.risk.atrMultiplierTP = Math.max(1.0, Math.min(5.0, clone.risk.atrMultiplierTP + (Math.random() - 0.5) * 0.5));
            if (Math.random() < 0.2) clone.risk.atrMultiplierSL = Math.max(0.5, Math.min(3.0, clone.risk.atrMultiplierSL + (Math.random() - 0.5) * 0.3));

            // Ensure min active strategies
            const activeCount = clone.strategyMask.filter((m: boolean) => m).length;
            if (activeCount < 3) {
                for (let i = 0; i < 30 && clone.strategyMask.filter((m: boolean) => m).length < 3; i++) {
                    if (!clone.strategyMask[i]) clone.strategyMask[i] = true;
                }
            }

            worstGroup.group.addBot(clone);

            // Cross-pollinate seeds: best group's seed genomes influence worst group's evolution
            const donorSeeds = bestGroup.group.exportSeedGenomes();
            worstGroup.group.crossPollinateSeeds(donorSeeds);

            console.log(`🔄 MIGRATION Cycle ${this.currentCycle}: ${bestGroup.groupId}→${worstGroup.groupId} | Bot DNA + 8 seed genomes cross-pollinated`);
        }
    }

    // ======================== COMMUNITY PRESSURE ========================

    private checkCommunityPressure(): void {
        const milestoneStatus = this.milestones.getStatus();

        // Count groups with any milestone achieved
        const groupsWithMilestone = GROUP_IDS.filter(gId => {
            const achieved = milestoneStatus.groupMilestones[gId];
            return achieved && achieved.length > 0;
        });

        // Positive pressure: if 3+ groups hit milestones, boost mutation for accelerated evolution
        if (groupsWithMilestone.length >= 3) {
            for (const [, group] of this.groups) {
                group.metaEvolutionDNA.boostMutationRates(1.1); // +10% across all
            }
        }

        // Auto-restore paused groups after recovery (bankroll back above 90% of initial)
        for (const gId of GROUP_IDS) {
            const group = this.groups.get(gId)!;
            if (group.getPauseMultiplier() < 1.0) {
                const bankroll = group.getGroupBankroll();
                const initial = BOTS_PER_GROUP * INITIAL_BOT_BANKROLL;
                if (bankroll >= initial * 0.9) {
                    group.setPauseMultiplier(1.0);
                    console.log(`🔄 Group ${gId} pause lifted - bankroll recovered to ${bankroll.toFixed(2)}`);
                }
            }
        }
    }

    // ======================== ORACLE ========================

    private async oracleConsultation(): Promise<void> {
        const totalBankroll = this.getTotalBankroll();
        const communityInitial = GROUP_IDS.length * BOTS_PER_GROUP * INITIAL_BOT_BANKROLL;
        const drawdownPercent = this.peakBankroll > 0
            ? ((this.peakBankroll - totalBankroll) / this.peakBankroll) * 100 : 0;

        let reason: OracleContext['reason'] = 'periodic_review';
        if (drawdownPercent > 50) reason = 'drawdown_emergency';
        if (this.consecutiveBankruptcies >= 3) reason = 'consecutive_bankruptcies';

        const recentMilestoneEvents = this.milestones.getStatus().events.slice(-5);

        const context: OracleContext = {
            reason,
            cycle: this.currentCycle,
            communityBankroll: totalBankroll,
            communityInitial,
            groups: GROUP_IDS.map(gId => {
                const group = this.groups.get(gId)!;
                const status = group.getStatus();
                return {
                    groupId: gId,
                    bankroll: status.bankroll,
                    aliveBots: status.aliveBots,
                    totalBots: status.totalBots,
                    style: status.style,
                    topFitness: Math.max(...status.bots.map(b => b.fitness), 0)
                };
            }),
            topDNA: this.getTopDNA(),
            recentMilestones: recentMilestoneEvents.map(m => `${m.level}:${m.entityId}:${m.milestone}x`),
            drawdownPercent
        };

        const decision = await this.oracle.consult(context);

        // Apply oracle recommendations
        if (decision.confidence > 0.5 && decision.recommendation !== 'NO_ACTION') {
            this.applyOracleDecision(decision);
        }
    }

    private applyOracleDecision(decision: any): void {
        console.log(`🔮 Oracle decision: ${decision.recommendation} (conf: ${decision.confidence}) - ${decision.reasoning}`);

        switch (decision.recommendation) {
            case 'BOOST_MUTATION': {
                for (const [, group] of this.groups) {
                    group.metaEvolutionDNA.boostMutationRates(1.3);
                }
                console.log('🔮 Applied: Mutation rates + amplitude boosted +30% across all groups');
                break;
            }
            case 'MIGRATE_DNA': {
                this.interGroupEvolution();
                console.log('🔮 Applied: Extra inter-group migration triggered');
                break;
            }
            case 'PAUSE_GROUP': {
                const worstGroup = GROUP_IDS.map(gId => ({
                    gId, bankroll: this.groups.get(gId)!.getGroupBankroll()
                })).sort((a, b) => a.bankroll - b.bankroll)[0];
                const group = this.groups.get(worstGroup.gId as any)!;
                group.setPauseMultiplier(0.3); // Reduce to 30% activity for worst group
                // Auto-restore after 100 cycles via community pressure check
                console.log(`🔮 Applied: Group ${worstGroup.gId} paused to 30% activity (threshold raised)`);
                break;
            }
            case 'ADJUST_PARAMS': {
                if (decision.params) {
                    const p = decision.params;
                    if (p.evolutionInterval) {
                        // Adjust evolution pace for all groups
                        for (const [, group] of this.groups) {
                            group.metaEvolutionDNA.boostMutationRates(p.mutationBoost || 1.0);
                        }
                    }
                    console.log('🔮 Applied: Custom params:', JSON.stringify(p));
                }
                break;
            }
        }
    }

    private onMilestoneAchieved(event: MilestoneEvent): void {
        // Update hall of fame for bot milestones
        if (event.level === 'bot' && event.milestone >= 5) {
            this.hallOfFame.push({
                name: event.entityId,
                groupId: event.metadata?.groupId || 'unknown',
                fitness: 0,
                bankroll: event.bankroll,
                generation: 0,
                winRate: 0,
                timestamp: event.timestamp
            });
            if (this.hallOfFame.length > 50) {
                this.hallOfFame = this.hallOfFame.slice(-50);
            }
        }

        // Trigger oracle for group milestones
        if (event.level === 'group') {
            // Will be consulted in the next scheduled oracle cycle
        }
    }

    // ======================== STATUS & QUERIES ========================

    getTotalBankroll(): number {
        let total = 0;
        for (const [, group] of this.groups) total += group.getGroupBankroll();
        return total;
    }

    private getTopDNA(): OracleContext['topDNA'] {
        const allBots: Array<{ name: string; fitness: number; bankroll: number; winRate: number; activeStrategies: number; leverage: number }> = [];

        for (const [, group] of this.groups) {
            for (const bot of group.getAllBots()) {
                allBots.push({
                    name: bot.genome.name,
                    fitness: group.calculateFitness(bot),
                    bankroll: bot.bankroll,
                    winRate: bot.totalTrades > 0 ? bot.wins / bot.totalTrades : 0,
                    activeStrategies: bot.genome.strategyMask.filter(m => m).length,
                    leverage: bot.genome.risk.leverage
                });
            }
        }

        return allBots.sort((a, b) => b.fitness - a.fitness).slice(0, 10);
    }

    getStatus(): any {
        const totalBankroll = this.getTotalBankroll();
        const communityInitial = GROUP_IDS.length * BOTS_PER_GROUP * INITIAL_BOT_BANKROLL;
        const totalAliveBots = GROUP_IDS.reduce((sum, gId) => sum + this.groups.get(gId)!.getAliveBots().length, 0);

        return {
            isRunning: this.isRunning,
            cycle: this.currentCycle,
            startTime: this.startTime,
            communityBankroll: Math.round(totalBankroll * 100) / 100,
            communityInitial,
            communityMultiplier: Math.round((totalBankroll / communityInitial) * 100) / 100,
            peakBankroll: Math.round(this.peakBankroll * 100) / 100,
            drawdownPercent: this.peakBankroll > 0 ? Math.round(((this.peakBankroll - totalBankroll) / this.peakBankroll) * 10000) / 100 : 0,
            totalBots: GROUP_IDS.length * BOTS_PER_GROUP,
            aliveBots: totalAliveBots,
            groups: GROUP_IDS.map(gId => this.groups.get(gId)!.getStatus()),
            milestones: this.milestones.getStatus(),
            lastOracleDecision: this.oracle.getLastDecision(),
            dnaMemoryStats: this.memory.getStats(),
            evolutionDimensions: this.evolutionRegistry.getAllDimensions().length,
            myceliumSeeds: GROUP_IDS.map(gId => ({
                groupId: gId,
                seeds: this.groups.get(gId)!.getSeedsStatus()
            }))
        };
    }

    getLeaderboard(): any {
        const allBots: Array<any> = [];

        for (const [gId, group] of this.groups) {
            for (const bot of group.getAllBots()) {
                allBots.push({
                    groupId: gId,
                    name: bot.genome.name,
                    bankroll: Math.round(bot.bankroll * 100) / 100,
                    fitness: Math.round(group.calculateFitness(bot) * 100) / 100,
                    trades: bot.totalTrades,
                    winRate: bot.totalTrades > 0 ? Math.round((bot.wins / bot.totalTrades) * 1000) / 10 : 0,
                    generation: bot.genome.generation,
                    isAlive: bot.isAlive && bot.bankroll > 0,
                    openPositions: bot.openPositions.size,
                    maxDrawdown: Math.round(bot.maxDrawdown * 100) / 100
                });
            }
        }

        return {
            cycle: this.currentCycle,
            bots: allBots.sort((a, b) => b.bankroll - a.bankroll),
            groups: GROUP_IDS.map(gId => ({
                groupId: gId,
                style: this.groups.get(gId)!.getStatus().style,
                bankroll: Math.round(this.groups.get(gId)!.getGroupBankroll() * 100) / 100,
                fitness: Math.round(this.groups.get(gId)!.getGroupFitness() * 100) / 100,
                aliveBots: this.groups.get(gId)!.getAliveBots().length
            })).sort((a, b) => b.bankroll - a.bankroll)
        };
    }

    getMilestones(): any {
        return this.milestones.getStatus();
    }

    getGroupStatus(groupId: string): any {
        const group = this.groups.get(groupId.toUpperCase() as GroupPersonality);
        if (!group) return null;
        return group.getStatus();
    }

    getBotStatus(groupId: string, botId: string): any {
        const group = this.groups.get(groupId.toUpperCase() as GroupPersonality);
        if (!group) return null;
        const bot = group.getAllBots().find(b => b.genome.id === botId);
        if (!bot) return null;
        return {
            ...bot,
            openPositions: Array.from(bot.openPositions.entries()).map(([sym, pos]) => ({ symbol: sym, ...pos })),
            fitness: group.calculateFitness(bot)
        };
    }

    getDNAMemory(): any {
        return {
            stats: this.memory.getStats(),
            topPatterns: this.memory.getTopPatterns(),
            recentExperiences: this.memory.getExperiences().slice(-20)
        };
    }

    getOracleLog(): any {
        return this.oracle.getLog();
    }

    getEvolutionStatus(): any {
        return {
            dimensions: this.evolutionRegistry.getAllDimensions().length,
            registry: this.evolutionRegistry.getFullStatus()
        };
    }

    getEvolutionDimension(dimension: string): any {
        return {
            summary: this.evolutionRegistry.getDimensionSummary(dimension),
            history: this.evolutionRegistry.getDimensionHistory(dimension, 50)
        };
    }

    getSeedsStatus(): any {
        return GROUP_IDS.map(gId => ({
            groupId: gId,
            style: this.groups.get(gId)!.config.style,
            seeds: this.groups.get(gId)!.getSeedsStatus(),
            currentRegime: this.groups.get(gId)!.regimeDNA.getCurrentRegime(),
            currentSentiment: this.groups.get(gId)!.sentimentDNA.getCurrentSentiment()
        }));
    }

    async consultOracle(): Promise<any> {
        const totalBankroll = this.getTotalBankroll();
        const communityInitial = GROUP_IDS.length * BOTS_PER_GROUP * INITIAL_BOT_BANKROLL;

        const context: OracleContext = {
            reason: 'periodic_review',
            cycle: this.currentCycle,
            communityBankroll: totalBankroll,
            communityInitial,
            groups: GROUP_IDS.map(gId => {
                const status = this.groups.get(gId)!.getStatus();
                return {
                    groupId: gId, bankroll: status.bankroll,
                    aliveBots: status.aliveBots, totalBots: status.totalBots,
                    style: status.style, topFitness: Math.max(...status.bots.map(b => b.fitness), 0)
                };
            }),
            topDNA: this.getTopDNA(),
            recentMilestones: this.milestones.getStatus().events.slice(-5).map(m => `${m.level}:${m.entityId}:${m.milestone}x`),
            drawdownPercent: this.peakBankroll > 0 ? ((this.peakBankroll - totalBankroll) / this.peakBankroll) * 100 : 0
        };

        return this.oracle.consult(context);
    }

    // ======================== PERSISTENCE ========================

    private persistState(): void {
        try {
            const state = {
                currentCycle: this.currentCycle,
                startTime: this.startTime,
                peakBankroll: this.peakBankroll,
                consecutiveBankruptcies: this.consecutiveBankruptcies,
                savedAt: new Date().toISOString(),
                groups: GROUP_IDS.map(gId => this.groups.get(gId)!.serialize()),
                hallOfFame: this.hallOfFame
            };
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            this.milestones.persist();
            this.memory.persist();
            this.oracle.persist();
            this.evolutionRegistry.persist();

            // Hall of fame separate file
            fs.writeFileSync(HALL_OF_FAME_FILE, JSON.stringify(this.hallOfFame, null, 2));
        } catch (err) {
            // H5 fix: log persist failures instead of swallowing
            console.error('⚠️ Ecosystem persist failed:', err instanceof Error ? err.message : err);
        }
    }

    private loadPersistedState(): boolean {
        try {
            if (!fs.existsSync(STATE_FILE)) return false;
            const raw = fs.readFileSync(STATE_FILE, 'utf8');
            const state = JSON.parse(raw);

            this.currentCycle = state.currentCycle || 0;
            this.startTime = state.startTime || new Date().toISOString();
            this.peakBankroll = state.peakBankroll || 0;
            this.consecutiveBankruptcies = state.consecutiveBankruptcies || 0;
            this.hallOfFame = state.hallOfFame || [];

            for (const groupData of state.groups || []) {
                const group = this.groups.get(groupData.groupId as GroupPersonality);
                if (group) group.restore(groupData);
            }

            console.log(`🌐 Ecosystem state restored: cycle ${this.currentCycle}`);
            return true;
        } catch {
            return false;
        }
    }
}
