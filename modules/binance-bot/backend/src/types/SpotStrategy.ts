export interface SpotStrategy {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    isFavorite: boolean;
    type: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    tradingType: 'SPOT';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    updatedAt: string;
}

// Exportação para forçar compilação
export const SPOT_STRATEGY_TYPES = {
    CONSERVATIVE: 'CONSERVATIVE' as const,
    MODERATE: 'MODERATE' as const,
    AGGRESSIVE: 'AGGRESSIVE' as const
};
