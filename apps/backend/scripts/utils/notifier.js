import notifier from 'node-notifier';

/**
 * Envia uma notificação desktop no Windows.
 * @param {string} title - Título da notificação.
 * @param {string} message - Mensagem do corpo.
 * @param {string} type - Tipo (info, warn, error, success).
 */
export function sendNotification(title, message, type = 'info') {
    const iconMap = {
        'info': 'info',
        'warn': 'warning',
        'error': 'error',
        'success': 'info' // node-notifier padrão não tem success específico no windows toast genérico
    };

    notifier.notify({
        title: `[Senciente] ${title}`,
        message: message,
        sound: type === 'error' || type === 'warn', // Som apenas para erros/avisos
        wait: false,
        appID: 'Corporação Senciente'
    });

    // Fallback log
    console.log(`🔔 NOTIFICAÇÃO: [${title}] ${message}`);
}

// Teste direto
if (import.meta.url === `file://${process.argv[1]}`) {
    sendNotification('Teste de Sistema', 'O sistema de notificações está ativo!', 'success');
}
