import * as fs from 'fs';
import * as path from 'path';

export class SpotStrategyStorageService {
    private dataDir: string;

    constructor() {
        // Diretório específico para estratégias spot
        this.dataDir = path.join(process.cwd(), 'data', 'spot-strategies');
        this.ensureDataDir();
    }

    private ensureDataDir(): void {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            console.log(`📁 [SPOT STORAGE] Diretório criado: ${this.dataDir}`);
        }
    }

    async saveStrategies(strategies: any[]): Promise<void> {
        try {
            const filePath = path.join(this.dataDir, 'strategies.json');
            const data = JSON.stringify(strategies, null, 2);
            fs.writeFileSync(filePath, data, 'utf8');
            console.log(`💾 [SPOT STORAGE] ${strategies.length} estratégias spot salvas em: ${filePath}`);
        } catch (error) {
            console.error(`❌ [SPOT STORAGE] Erro ao salvar estratégias spot:`, error);
            throw error;
        }
    }

    loadStrategiesSync(): any[] | null {
        try {
            const filePath = path.join(this.dataDir, 'strategies.json');
            if (!fs.existsSync(filePath)) {
                console.log(`📝 [SPOT STORAGE] Arquivo de estratégias spot não encontrado: ${filePath}`);
                return null;
            }
            const data = fs.readFileSync(filePath, 'utf8');
            const strategies = JSON.parse(data);
            console.log(`📖 [SPOT STORAGE] ${strategies.length} estratégias spot carregadas de: ${filePath}`);
            return strategies;
        } catch (error) {
            console.error(`❌ [SPOT STORAGE] Erro ao carregar estratégias spot:`, error);
            return null;
        }
    }

    async loadStrategies(): Promise<any[] | null> {
        try {
            const filePath = path.join(this.dataDir, 'strategies.json');
            if (!fs.existsSync(filePath)) {
                console.log(`📝 [SPOT STORAGE] Arquivo de estratégias spot não encontrado: ${filePath}`);
                return null;
            }
            const data = fs.readFileSync(filePath, 'utf8');
            const strategies = JSON.parse(data);
            console.log(`📖 [SPOT STORAGE] ${strategies.length} estratégias spot carregadas de: ${filePath}`);
            return strategies;
        } catch (error) {
            console.error(`❌ [SPOT STORAGE] Erro ao carregar estratégias spot:`, error);
            return null;
        }
    }

    // Método para limpar o storage (útil para debugging)
    clearStorage(): void {
        try {
            const filePath = path.join(this.dataDir, 'strategies.json');
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ [SPOT STORAGE] Storage de estratégias spot limpo: ${filePath}`);
            }
        } catch (error) {
            console.error(`❌ [SPOT STORAGE] Erro ao limpar storage:`, error);
        }
    }

    // Método para verificar se o storage existe
    hasStorage(): boolean {
        const filePath = path.join(this.dataDir, 'strategies.json');
        return fs.existsSync(filePath);
    }

    // Método para obter informações do storage
    getStorageInfo(): { exists: boolean; path: string; size?: number } {
        const filePath = path.join(this.dataDir, 'strategies.json');
        const exists = fs.existsSync(filePath);
        let size: number | undefined;

        if (exists) {
            const stats = fs.statSync(filePath);
            size = stats.size;
        }

        return {
            exists,
            path: filePath,
            size
        };
    }
}
