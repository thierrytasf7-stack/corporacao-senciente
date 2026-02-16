import * as fs from 'fs';
import * as path from 'path';

export interface TriggerConfig {
    executionId: string;
    symbol: string;
    quantity: number;
    buyPrice: number;
    profitTrigger?: number;
    lossTrigger?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

class TriggerStorage {
    private triggersFile: string;
    private triggers: Map<string, TriggerConfig> = new Map();

    constructor() {
        this.triggersFile = path.join(__dirname, '../data/triggers.json');
        this.loadTriggers();
    }

    private loadTriggers(): void {
        try {
            if (fs.existsSync(this.triggersFile)) {
                const data = fs.readFileSync(this.triggersFile, 'utf8');
                const triggersArray = JSON.parse(data);
                this.triggers = new Map(triggersArray.map((t: TriggerConfig) => [t.executionId, t]));
                console.log(`📊 [TRIGGERS] Carregados ${this.triggers.size} triggers do arquivo`);
            } else {
                // Criar diretório se não existir
                const dir = path.dirname(this.triggersFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                this.saveTriggers();
                console.log('📊 [TRIGGERS] Arquivo de triggers criado');
            }
        } catch (error) {
            console.error('❌ [TRIGGERS] Erro ao carregar triggers:', error);
        }
    }

    private saveTriggers(): void {
        try {
            const triggersArray = Array.from(this.triggers.values());
            fs.writeFileSync(this.triggersFile, JSON.stringify(triggersArray, null, 2));
        } catch (error) {
            console.error('❌ [TRIGGERS] Erro ao salvar triggers:', error);
        }
    }

    public saveTrigger(trigger: Omit<TriggerConfig, 'createdAt' | 'updatedAt'>): void {
        const now = new Date().toISOString();
        const fullTrigger: TriggerConfig = {
            ...trigger,
            createdAt: now,
            updatedAt: now
        };

        this.triggers.set(trigger.executionId, fullTrigger);
        this.saveTriggers();

        console.log(`💾 [TRIGGERS] Trigger salvo para execução ${trigger.executionId}:`, {
            symbol: trigger.symbol,
            profitTrigger: trigger.profitTrigger,
            lossTrigger: trigger.lossTrigger,
            isActive: trigger.isActive
        });
    }

    public getTrigger(executionId: string): TriggerConfig | undefined {
        return this.triggers.get(executionId);
    }

    public getAllTriggers(): TriggerConfig[] {
        return Array.from(this.triggers.values());
    }

    public getActiveTriggers(): TriggerConfig[] {
        return Array.from(this.triggers.values()).filter(t => t.isActive);
    }

    public deactivateTrigger(executionId: string): void {
        const trigger = this.triggers.get(executionId);
        if (trigger) {
            trigger.isActive = false;
            trigger.updatedAt = new Date().toISOString();
            this.triggers.set(executionId, trigger);
            this.saveTriggers();

            console.log(`🔴 [TRIGGERS] Trigger desativado para execução ${executionId} (compra vendida)`);
        }
    }

    public updateTrigger(executionId: string, updates: Partial<Pick<TriggerConfig, 'profitTrigger' | 'lossTrigger'>>): void {
        const trigger = this.triggers.get(executionId);
        if (trigger) {
            Object.assign(trigger, updates);
            trigger.updatedAt = new Date().toISOString();
            this.triggers.set(executionId, trigger);
            this.saveTriggers();

            console.log(`🔄 [TRIGGERS] Trigger atualizado para execução ${executionId}:`, updates);
        }
    }

    public deleteTrigger(executionId: string): void {
        if (this.triggers.delete(executionId)) {
            this.saveTriggers();
            console.log(`🗑️ [TRIGGERS] Trigger removido para execução ${executionId}`);
        }
    }
}

export const triggerStorage = new TriggerStorage();
