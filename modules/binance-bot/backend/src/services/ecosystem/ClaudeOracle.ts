/**
 * ClaudeOracle - Integration with Claude Code CLI for strategic decisions
 * Invokes Claude CLI headless at key moments to get AI-guided parameter adjustments.
 */

import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const ORACLE_LOG_FILE = path.join(DATA_DIR, 'oracle-log.json');
const CONSULTATION_TIMEOUT_MS = 120000; // 2 min

export interface OracleContext {
    reason: 'periodic_review' | 'milestone_achieved' | 'drawdown_emergency' | 'consecutive_bankruptcies';
    cycle: number;
    communityBankroll: number;
    communityInitial: number;
    groups: Array<{
        groupId: string;
        bankroll: number;
        aliveBots: number;
        totalBots: number;
        style: string;
        topFitness: number;
    }>;
    topDNA: Array<{
        name: string;
        fitness: number;
        bankroll: number;
        winRate: number;
        activeStrategies: number;
        leverage: number;
    }>;
    recentMilestones: string[];
    drawdownPercent: number;
    metadata?: Record<string, any>;
}

export interface OracleDecision {
    recommendation: 'ADJUST_PARAMS' | 'MIGRATE_DNA' | 'PAUSE_GROUP' | 'BOOST_MUTATION' | 'NO_ACTION';
    params: Record<string, any>;
    reasoning: string;
    confidence: number;
    timestamp: string;
}

interface OracleLogEntry {
    context: OracleContext;
    decision: OracleDecision;
    timestamp: string;
    durationMs: number;
}

export class ClaudeOracle {
    private log: OracleLogEntry[] = [];
    private enabled: boolean = true;
    private lastConsultation: number = 0;
    private minIntervalMs: number = 300000; // Min 5 min between consultations

    constructor() {
        this.loadLog();
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Consult Claude for strategic guidance
     */
    async consult(context: OracleContext): Promise<OracleDecision> {
        // Rate limit
        if (Date.now() - this.lastConsultation < this.minIntervalMs) {
            return this.noActionDecision('Rate limited - too soon since last consultation');
        }

        if (!this.enabled) {
            return this.noActionDecision('Oracle disabled');
        }

        const startTime = Date.now();
        this.lastConsultation = startTime;

        try {
            const prompt = this.buildPrompt(context);
            const result = await this.invokeClaude(prompt);
            const decision = this.parseDecision(result);

            const entry: OracleLogEntry = {
                context,
                decision,
                timestamp: new Date().toISOString(),
                durationMs: Date.now() - startTime
            };
            this.log.push(entry);
            if (this.log.length > 100) this.log = this.log.slice(-100);

            console.log(`🔮 Oracle: ${decision.recommendation} (confidence: ${decision.confidence}) - ${decision.reasoning.substring(0, 80)}`);
            return decision;
        } catch (err) {
            console.error('🔮 Oracle consultation failed:', err);
            return this.noActionDecision(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
    }

    private buildPrompt(context: OracleContext): string {
        const groupSummary = context.groups.map(g =>
            `  ${g.groupId}: $${g.bankroll.toFixed(0)} | ${g.aliveBots}/${g.totalBots} alive | style=${g.style} | topFitness=${g.topFitness.toFixed(1)}`
        ).join('\n');

        const topBots = context.topDNA.slice(0, 5).map(d =>
            `  ${d.name}: fitness=${d.fitness.toFixed(1)} bankroll=$${d.bankroll.toFixed(0)} WR=${(d.winRate * 100).toFixed(0)}% strats=${d.activeStrategies} lev=${d.leverage}x`
        ).join('\n');

        return `You are analyzing a DNA trading bot ecosystem. Respond ONLY with valid JSON.

CONTEXT:
- Reason: ${context.reason}
- Cycle: ${context.cycle}
- Community bankroll: $${context.communityBankroll.toFixed(0)} (initial: $${context.communityInitial})
- Drawdown: ${context.drawdownPercent.toFixed(1)}%
- Recent milestones: ${context.recentMilestones.join(', ') || 'none'}

GROUPS:
${groupSummary}

TOP DNA:
${topBots}

Respond with this exact JSON structure:
{
  "recommendation": "ADJUST_PARAMS" | "MIGRATE_DNA" | "BOOST_MUTATION" | "PAUSE_GROUP" | "NO_ACTION",
  "params": {},
  "reasoning": "one sentence explanation",
  "confidence": 0.0-1.0
}

Rules:
- ADJUST_PARAMS: suggest leverage/TP/SL changes for underperforming groups
- MIGRATE_DNA: suggest moving DNA between groups
- BOOST_MUTATION: increase mutation rate when stagnating
- PAUSE_GROUP: pause a group that's hemorrhaging capital
- NO_ACTION: if things are fine`;
    }

    private invokeClaude(prompt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const args = ['-p', prompt, '--output-format', 'json', '--model', 'sonnet'];

            execFile('claude', args, {
                timeout: CONSULTATION_TIMEOUT_MS,
                maxBuffer: 1024 * 1024,
                env: { ...process.env }
            }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Claude CLI error: ${error.message}`));
                    return;
                }
                resolve(stdout);
            });
        });
    }

    private parseDecision(rawOutput: string): OracleDecision {
        try {
            // Claude CLI with --output-format json wraps result
            let parsed: any;
            try {
                parsed = JSON.parse(rawOutput);
                // If it's a Claude CLI wrapper, extract the result
                if (parsed.result) {
                    parsed = typeof parsed.result === 'string' ? JSON.parse(parsed.result) : parsed.result;
                }
            } catch {
                // Try to extract JSON from text
                const jsonMatch = rawOutput.match(/\{[\s\S]*"recommendation"[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No valid JSON found in Claude response');
                }
            }

            const validRecs = ['ADJUST_PARAMS', 'MIGRATE_DNA', 'PAUSE_GROUP', 'BOOST_MUTATION', 'NO_ACTION'];
            return {
                recommendation: validRecs.includes(parsed.recommendation) ? parsed.recommendation : 'NO_ACTION',
                params: parsed.params || {},
                reasoning: String(parsed.reasoning || 'No reasoning provided').substring(0, 500),
                confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
                timestamp: new Date().toISOString()
            };
        } catch {
            return this.noActionDecision('Failed to parse Claude response');
        }
    }

    private noActionDecision(reasoning: string): OracleDecision {
        return {
            recommendation: 'NO_ACTION',
            params: {},
            reasoning,
            confidence: 0,
            timestamp: new Date().toISOString()
        };
    }

    getLog(): OracleLogEntry[] {
        return this.log;
    }

    getLastDecision(): OracleDecision | null {
        return this.log.length > 0 ? this.log[this.log.length - 1].decision : null;
    }

    persist(): void {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(ORACLE_LOG_FILE, JSON.stringify({ log: this.log }, null, 2));
        } catch { /* silent */ }
    }

    reset(): void {
        this.log = [];
        this.lastConsultation = 0;
    }

    private loadLog(): void {
        try {
            if (fs.existsSync(ORACLE_LOG_FILE)) {
                const data = JSON.parse(fs.readFileSync(ORACLE_LOG_FILE, 'utf8'));
                this.log = data.log || [];
            }
        } catch { /* start fresh */ }
    }
}
