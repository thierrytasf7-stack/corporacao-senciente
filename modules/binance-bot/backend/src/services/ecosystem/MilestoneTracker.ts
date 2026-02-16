/**
 * MilestoneTracker - Track 2x/3x/5x/10x milestones at 3 levels
 * Levels: Bot (individual), Group (5 bots), Community (5 groups)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface MilestoneEvent {
    level: 'bot' | 'group' | 'community';
    entityId: string;
    milestone: number;  // 2, 3, 5, 10
    bankroll: number;
    initialBankroll: number;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface MilestoneState {
    botMilestones: Record<string, number[]>;       // botId -> achieved milestones
    groupMilestones: Record<string, number[]>;     // groupId -> achieved milestones
    communityMilestones: number[];                  // achieved milestones
    events: MilestoneEvent[];                       // full history
}

const MILESTONES = [2, 3, 5, 10];
const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const MILESTONES_FILE = path.join(DATA_DIR, 'milestones.json');

export class MilestoneTracker {
    private state: MilestoneState = {
        botMilestones: {},
        groupMilestones: {},
        communityMilestones: [],
        events: []
    };

    private onMilestoneCallbacks: ((event: MilestoneEvent) => void)[] = [];

    constructor() {
        this.load();
    }

    onMilestone(cb: (event: MilestoneEvent) => void): void {
        this.onMilestoneCallbacks.push(cb);
    }

    /**
     * Check all milestones for current state. Returns newly achieved milestones.
     */
    checkAll(community: {
        totalBankroll: number;
        initialBankroll: number;  // 2500
        groups: Array<{
            groupId: string;
            groupBankroll: number;
            initialBankroll: number;  // 500
            bots: Array<{
                botId: string;
                bankroll: number;
                initialBankroll: number;  // 100
            }>;
        }>;
    }): MilestoneEvent[] {
        const newEvents: MilestoneEvent[] = [];

        // Bot milestones
        for (const group of community.groups) {
            for (const bot of group.bots) {
                const achieved = this.state.botMilestones[bot.botId] || [];
                for (const m of MILESTONES) {
                    if (!achieved.includes(m) && bot.bankroll >= bot.initialBankroll * m) {
                        if (!this.state.botMilestones[bot.botId]) this.state.botMilestones[bot.botId] = [];
                        this.state.botMilestones[bot.botId].push(m);
                        const event: MilestoneEvent = {
                            level: 'bot', entityId: bot.botId, milestone: m,
                            bankroll: bot.bankroll, initialBankroll: bot.initialBankroll,
                            timestamp: new Date().toISOString(),
                            metadata: { groupId: group.groupId }
                        };
                        this.state.events.push(event);
                        newEvents.push(event);
                    }
                }
            }

            // Group milestones
            const gAchieved = this.state.groupMilestones[group.groupId] || [];
            for (const m of MILESTONES) {
                if (!gAchieved.includes(m) && group.groupBankroll >= group.initialBankroll * m) {
                    if (!this.state.groupMilestones[group.groupId]) this.state.groupMilestones[group.groupId] = [];
                    this.state.groupMilestones[group.groupId].push(m);
                    const event: MilestoneEvent = {
                        level: 'group', entityId: group.groupId, milestone: m,
                        bankroll: group.groupBankroll, initialBankroll: group.initialBankroll,
                        timestamp: new Date().toISOString()
                    };
                    this.state.events.push(event);
                    newEvents.push(event);
                }
            }
        }

        // Community milestones
        for (const m of MILESTONES) {
            if (!this.state.communityMilestones.includes(m) && community.totalBankroll >= community.initialBankroll * m) {
                this.state.communityMilestones.push(m);
                const event: MilestoneEvent = {
                    level: 'community', entityId: 'community', milestone: m,
                    bankroll: community.totalBankroll, initialBankroll: community.initialBankroll,
                    timestamp: new Date().toISOString()
                };
                this.state.events.push(event);
                newEvents.push(event);
            }
        }

        // Trim events to last 500
        if (this.state.events.length > 500) {
            this.state.events = this.state.events.slice(-500);
        }

        // Fire callbacks
        for (const event of newEvents) {
            for (const cb of this.onMilestoneCallbacks) {
                try { cb(event); } catch { /* swallow */ }
            }
        }

        return newEvents;
    }

    getGroupsWithMilestone(milestone: number): string[] {
        return Object.entries(this.state.groupMilestones)
            .filter(([, achieved]) => achieved.includes(milestone))
            .map(([groupId]) => groupId);
    }

    getBotMilestones(botId: string): number[] {
        return this.state.botMilestones[botId] || [];
    }

    getStatus(): MilestoneState {
        // H3 fix: deep copy to prevent external mutation
        return JSON.parse(JSON.stringify(this.state));
    }

    removeBotMilestones(botId: string): void {
        delete this.state.botMilestones[botId];
    }

    persist(): void {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(MILESTONES_FILE, JSON.stringify(this.state, null, 2));
        } catch { /* silent */ }
    }

    reset(): void {
        this.state = { botMilestones: {}, groupMilestones: {}, communityMilestones: [], events: [] };
    }

    private load(): void {
        try {
            if (fs.existsSync(MILESTONES_FILE)) {
                this.state = JSON.parse(fs.readFileSync(MILESTONES_FILE, 'utf8'));
            }
        } catch { /* start fresh */ }
    }
}
