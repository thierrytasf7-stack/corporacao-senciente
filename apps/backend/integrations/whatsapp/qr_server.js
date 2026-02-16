const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.DIANA_WHATSAPP_PORT || 21350;

let lastQr = null;
let isConnected = false;
let connectionError = null;

const logger = pino({ level: 'info' });

async function startWA() {
    console.log('🔄 Baileys: Iniciando tentativa...');

    // Caminho absoluto para evitar problemas de diretório
    const authPath = path.join(__dirname, 'auth_info');

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
        auth: state,
        logger,
        browser: ["Diana Maestro", "Chrome", "10.0"], // Browser customizado
        printQRInTerminal: false,
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('✨ [WhatsApp] QR CODE GERADO!');
            lastQr = qr;
            connectionError = null;
        }

        if (connection === 'close') {
            isConnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ [WhatsApp] Erro de Conexão: ${statusCode}`);

            connectionError = `Falha na conexão (${statusCode}). Re-tentando...`;

            // Se for logout, limpamos a pasta (opcional)
            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(startWA, 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ [WhatsApp] CONECTADO!');
            isConnected = true;
            lastQr = null;
        }
    });
}

app.get('/', async (req, res) => {
    if (isConnected) {
        return res.send('<div style="background:#d4edda; color:#155724; padding:20px; text-align:center; border-radius:10px; font-family:sans-serif; margin:50px auto; max-width:600px;"><h1>✅ WhatsApp Conectado!</h1><p>O Maestro está pronto para receber comandos.</p></div>');
    }

    if (!lastQr) {
        return res.send(`
            <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
                <h1>⏳ Inicializando WhatsApp...</h1>
                <p>O sistema está gerando o QR Code. Isso pode levar alguns segundos.</p>
                ${connectionError ? `<p style="color:red; font-weight:bold;">${connectionError}</p>` : ''}
                <hr style="max-width:300px; border:0; border-top:1px solid #ccc;">
                <p>Status: Aguardando Servidor WhatsApp</p>
                <script>setTimeout(() => location.reload(), 4000)</script>
            </div>
        `);
    }

    try {
        const qrImage = await qrcode.toDataURL(lastQr);
        res.send(`
            <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
                <h1 style="color:#25D366;">📱 Conectar ao Portal Maestria</h1>
                <p>Escaneie o QR Code abaixo com seu WhatsApp:</p>
                <div style="background:white; padding:20px; display:inline-block; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border:1px solid #ddd;">
                    <img src="${qrImage}" style="width:320px; height:320px;">
                </div>
                <p style="margin-top:20px; color:#555;"><i>Dica: A página atualiza sozinha. Se o código expirar, ele será renovado.</i></p>
                <script>setTimeout(() => location.reload(), 20000)</script>
            </div>
        `);
    } catch (e) {
        res.send('<h1>Erro ao processar QR Code</h1>');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`\n============================================`);
    console.log(`🚀 SERVIDOR QR ATIVO: http://localhost:${port} (QR Legacy)`);
    console.log(`============================================\n`);
    startWA().catch(e => console.error('Erro Fatal no WA:', e));
});
