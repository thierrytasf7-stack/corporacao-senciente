// ============================================
// WhatsApp Bridge - Versão Ultra Estável
// ============================================

require('dotenv').config();
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState
} = require('@whiskeysockets/baileys');
const pino = require('pino');

async function start() {
    console.log('⚡ Iniciando WhatsApp Bridge (Pairing Mode)...');

    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: true // Por segurança
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Desconectado. Reconectando em 5s...');
            setTimeout(start, 5000);
        } else if (connection === 'open') {
            console.log('✅ CONECTADO AO WHATSAPP!');
        }
    });

    // Solicitar código só se não estiver registrado
    if (!sock.authState.creds.registered) {
        const phone = process.env.WHATSAPP_PAIRING_NUMBER || '5545998211665';
        console.log(`🔑 Aguardando para gerar código para ${phone}...`);
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phone);
                console.log('\n' + '='.repeat(30));
                console.log(`CÓDIGO: ${code}`);
                console.log('='.repeat(30) + '\n');
            } catch (err) {
                console.log('❌ Erro ao pedir código:', err.message);
            }
        }, 10000);
    }
}

start();
