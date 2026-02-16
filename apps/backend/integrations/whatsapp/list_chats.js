// Script de teste para listar chats disponíveis
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');

const logger = pino({ level: 'silent' });
const authPath = path.join(__dirname, 'auth_info');

async function listChats() {
    const { state } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
        auth: state,
        logger,
        printQRInTerminal: false
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;

        if (connection === 'open') {
            console.log('✅ Conectado! Listando chats...\n');

            try {
                // Pegar todos os chats
                const chats = await sock.groupFetchAllParticipating();
                console.log('📱 Grupos encontrados:');
                Object.values(chats).forEach(chat => {
                    console.log(`  - ${chat.subject} (${chat.id})`);
                });

                console.log('\n📞 Para enviar mensagem, use o JID do chat.');
                console.log('Exemplo: await sock.sendMessage("CHAT_ID", { text: "Olá!" })');

            } catch (err) {
                console.error('Erro:', err.message);
            }

            process.exit(0);
        }
    });
}

listChats().catch(console.error);
