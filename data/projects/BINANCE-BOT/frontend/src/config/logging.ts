// Configuração de logs para otimizar performance
export const LOG_CONFIG = {
    // Logs de debug (desabilitar em produção)
    DEBUG: false,

    // Logs de posições (manter apenas essenciais)
    POSITIONS: true,

    // Logs de API (reduzir frequência)
    API: false,

    // Logs de verificação Binance (manter apenas erros)
    BINANCE_VERIFICATION: false,

    // Logs de histórico (manter apenas resumos)
    HISTORY: true,

    // Logs de monitoramento (reduzir frequência)
    MONITORING: false
};

// Função helper para logs condicionais
export const logDebug = (message: string, data?: any) => {
    if (LOG_CONFIG.DEBUG) {
        console.log(message, data);
    }
};

export const logPosition = (message: string, data?: any) => {
    if (LOG_CONFIG.POSITIONS) {
        console.log(message, data);
    }
};

export const logAPI = (message: string, data?: any) => {
    if (LOG_CONFIG.API) {
        console.log(message, data);
    }
};

export const logBinance = (message: string, data?: any) => {
    if (LOG_CONFIG.BINANCE_VERIFICATION) {
        console.log(message, data);
    }
};

export const logHistory = (message: string, data?: any) => {
    if (LOG_CONFIG.HISTORY) {
        console.log(message, data);
    }
};

export const logMonitoring = (message: string, data?: any) => {
    if (LOG_CONFIG.MONITORING) {
        console.log(message, data);
    }
};
