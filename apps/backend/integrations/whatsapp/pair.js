// ============================================
// WhatsApp Bridge - Pairing Code ONLY
// ============================================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    console.log('🚀 Iniciando conexão para Pairing Code...');

    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const logger = pino({ level: 'info' });

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        logger,
        printQRInTerminal: false,
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const phoneNumber = process.env.WHATSAPP_PAIRING_NUMBER || '5545998211665';
        console.log(`\n⏳ Aguardando 15s para estabilizar antes de pedir o código para ${phoneNumber}...`);

        setTimeout(async () => {
            try {
                console.log('🔑 Solicitando código...');
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('\n' + '#'.repeat(50));
                console.log(`👉 SEU CÓDIGO DE PAREAMENTO: ${code}`);
                console.log('#'.repeat(50) + '\n');
            } catch (err) {
                console.error('❌ Erro no Pairing:', err.message);
                console.log('DICA: Se aparecer "Connection Closed", tente novamente em 1 minuto.');
                process.exit(1);
            }
        }, 15000);
    } else {
        console.log('✅ Já está registrado!');
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ CONECTADO!');
        }
    });
}

connectToWhatsApp();
