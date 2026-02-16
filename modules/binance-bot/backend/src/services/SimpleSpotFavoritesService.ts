import * as fs from 'fs';
import * as path from 'path';

export class SimpleSpotFavoritesService {
    private favoritesFile: string;
    private favorites: Set<string> = new Set();

    constructor() {
        this.favoritesFile = path.join(process.cwd(), 'data', 'spot-favorites.json');
        this.loadFavorites();
    }

    private loadFavorites(): void {
        try {
            if (fs.existsSync(this.favoritesFile)) {
                const data = fs.readFileSync(this.favoritesFile, 'utf8');
                const favoritesArray = JSON.parse(data);
                this.favorites = new Set(favoritesArray);
                console.log(`📝 [FAVORITES] ${this.favorites.size} favoritos carregados`);
            } else {
                console.log(`📝 [FAVORITES] Nenhum favorito encontrado, iniciando vazio`);
            }
        } catch (error) {
            console.error(`❌ [FAVORITES] Erro ao carregar favoritos:`, error);
            this.favorites = new Set();
        }
    }

    private saveFavorites(): void {
        try {
            const dir = path.dirname(this.favoritesFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const favoritesArray = Array.from(this.favorites);
            fs.writeFileSync(this.favoritesFile, JSON.stringify(favoritesArray, null, 2));
            console.log(`💾 [FAVORITES] ${favoritesArray.length} favoritos salvos`);
        } catch (error) {
            console.error(`❌ [FAVORITES] Erro ao salvar favoritos:`, error);
        }
    }

    public toggleFavorite(strategyId: string): boolean {
        console.log(`🔄 [FAVORITES] Toggle favorite para: ${strategyId}`);

        if (this.favorites.has(strategyId)) {
            this.favorites.delete(strategyId);
            console.log(`❌ [FAVORITES] Removido dos favoritos: ${strategyId}`);
        } else {
            this.favorites.add(strategyId);
            console.log(`✅ [FAVORITES] Adicionado aos favoritos: ${strategyId}`);
        }

        this.saveFavorites();
        return this.favorites.has(strategyId);
    }

    public isFavorite(strategyId: string): boolean {
        return this.favorites.has(strategyId);
    }

    public getFavorites(): string[] {
        return Array.from(this.favorites);
    }

    public getFavoritesCount(): number {
        return this.favorites.size;
    }
}
