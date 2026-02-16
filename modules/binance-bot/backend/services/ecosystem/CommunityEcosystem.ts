// Add to existing imports
import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from '../BinanceApiService';
import { SignalPoolEngine } from '../SignalPoolEngine';
import { GroupArena, GroupPersonality } from './GroupArena';
import { MilestoneTracker, MilestoneEvent } from './MilestoneTracker';
import { DNAVectorMemory } from './DNAVectorMemory';
import { ClaudeOracle, OracleContext } from './ClaudeOracle';
import { EvolutionRegistry } from './EvolutionRegistry';

// Add to existing constants
const CYCLE_INTERVAL_MS = 6000;
const INTER_GROUP_EVOLUTION_INTERVAL = 200;
const ORACLE_CONSULTATION_INTERVAL = 500;
const PERSIST_INTERVAL_MS = 30000;
const INITIAL_BOT_BANKROLL = 100;
const BOTS_PER_GROUP = 5;
const GROUP_IDS: GroupPersonality[] = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'OMEGA'];

// Add to existing properties
private evolutionRegistry: EvolutionRegistry;

// Add to constructor after existing initializations
this.evolutionRegistry = new EvolutionRegistry();

// Add to existing methods
/**
 * Get EvolutionRegistry instance
 */
getEvolutionRegistry(): EvolutionRegistry {
    return this.evolutionRegistry;
}

// ... rest of existing code ...