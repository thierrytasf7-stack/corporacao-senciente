// Arquivo para forçar timeout correto
export const API_TIMEOUT = 30000; // 30 segundos

// Forçar timeout em todas as requisições
export const forceTimeout = () => {
    console.log('🔧 Forçando timeout de 30 segundos...');
    return API_TIMEOUT;
};

// Verificar se o timeout está correto
export const verifyTimeout = (timeout: number) => {
    if (timeout === 15000) {
        console.warn('⚠️ Timeout antigo detectado (15s), corrigindo para 30s...');
        return 30000;
    }
    return timeout;
};
