// ============================================
// WhatsApp Listener - Diana Corporacao Senciente
// ============================================
// Conecta ao WhatsApp, escuta mensagens, salva em log.
// Gerenciado via PM2 (auto-restart).
// ============================================

require('dotenv').config();
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    Browsers,
    downloadMediaMessage
} = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const pino = require('pino');

// Evitar crash em erros nao tratados (Baileys emite vários)
process.on('uncaughtException', (err) => {
    console.error('[WhatsApp] Uncaught:', err.message);
});
process.on('unhandledRejection', (err) => {
    console.error('[WhatsApp] Unhandled:', err?.message || err);
});

const HTTP_PORT = process.env.DIANA_WHATSAPP_PORT || 21350;
const AUTH_PATH = path.join(__dirname, 'auth_info');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'messages.jsonl');
const MEDIA_DIR = path.join(LOG_DIR, 'media');

// Garantir diretorios
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const app = express();
const waLogger = pino({ level: 'silent' });

let lastQr = null;
let isConnected = false;
let globalSock = null;

/**
 * Wrapper resiliente para saveCreds - retry em caso de file lock (Windows)
 */
function makeSafeCredsSaver(saveCreds) {
    let saving = false;
    return async () => {
        if (saving) return;
        saving = true;
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                await saveCreds();
                saving = false;
                return;
            } catch (err) {
                if (attempt < 4) {
                    await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
                } else {
                    console.error('[WhatsApp] saveCreds falhou apos 5 tentativas:', err.message);
                }
            }
        }
        saving = false;
    };
}

/**
 * Extrai texto de qualquer tipo de mensagem WhatsApp
 */
function extractText(msg) {
    const m = msg.message;
    if (!m) return '';
    return m.conversation
        || m.extendedTextMessage?.text
        || m.imageMessage?.caption
        || m.videoMessage?.caption
        || m.documentMessage?.caption
        || m.buttonsResponseMessage?.selectedDisplayText
        || m.listResponseMessage?.title
        || '';
}

/**
 * Salva mensagem no log JSONL (uma linha JSON por mensagem)
 */
function logMessage(entry) {
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(LOG_FILE, line);
}

/**
 * Mapeamento tipo de mensagem -> extensao e prefixo
 */
const MEDIA_TYPES = {
    imageMessage: { prefix: 'img', ext: '.jpg' },
    videoMessage: { prefix: 'vid', ext: '.mp4' },
    audioMessage: { prefix: 'aud', ext: '.ogg' },
    stickerMessage: { prefix: 'stk', ext: '.webp' },
    documentMessage: { prefix: 'doc', ext: null } // usa extensao original
};

/**
 * Baixa e salva midia de uma mensagem WhatsApp
 */
async function saveMedia(msg) {
    const m = msg.message;
    if (!m) return null;

    const msgType = Object.keys(m)[0];
    const mediaInfo = MEDIA_TYPES[msgType];
    if (!mediaInfo) return null;

    try {
        const buffer = await downloadMediaMessage(msg, 'buffer', {});
        const ts = Date.now();

        let ext = mediaInfo.ext;
        if (msgType === 'documentMessage' && m.documentMessage?.fileName) {
            const origExt = path.extname(m.documentMessage.fileName);
            ext = origExt || '.bin';
        }

        const filename = `${mediaInfo.prefix}_${ts}${ext}`;
        const filepath = path.join(MEDIA_DIR, filename);
        fs.writeFileSync(filepath, buffer);
        console.log(`[WhatsApp] Media salva: ${filename} (${buffer.length} bytes)`);
        return filename;
    } catch (err) {
        console.error(`[WhatsApp] Falha ao salvar media: ${err.message}`);
        return null;
    }
}

/**
 * Conecta ao WhatsApp via Baileys
 */
async function connect() {
    console.log('[WhatsApp] Iniciando conexao...');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
    const safeSaveCreds = makeSafeCredsSaver(saveCreds);

    const sock = makeWASocket({
        auth: state,
        logger: waLogger,
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        connectTimeoutMs: 60000
    });

    globalSock = sock;
    sock.ev.on('creds.update', safeSaveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            lastQr = qr;
            console.log(`[WhatsApp] QR disponivel em http://localhost:${HTTP_PORT}`);
        }

        if (connection === 'close') {
            isConnected = false;
            lastQr = null;
            const code = lastDisconnect?.error?.output?.statusCode;
            console.log(`[WhatsApp] Desconectado (${code})`);

            if (code === DisconnectReason.loggedOut || code === 401) {
                console.log('[WhatsApp] Sessao expirada. Limpando auth...');
                fs.rmSync(AUTH_PATH, { recursive: true, force: true });
            }

            console.log('[WhatsApp] Reconectando em 5s...');
            setTimeout(connect, 5000);
        }

        if (connection === 'open') {
            console.log('[WhatsApp] CONECTADO');
            isConnected = true;
            lastQr = null;
        }
    });

    // Listener principal - todas as mensagens
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        for (const msg of messages) {
            if (!msg.message) continue;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const text = extractText(msg);
            const isGroup = from.endsWith('@g.us');
            const msgType = Object.keys(msg.message)[0];
            const timestamp = msg.messageTimestamp
                ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
                : new Date().toISOString();

            const entry = {
                timestamp,
                from: sender.split('@')[0],
                chat: isGroup ? from.split('@')[0] : 'private',
                type: isGroup ? 'group' : 'private',
                text: text || '[media/other]',
                msgType,
                fromMe: msg.key.fromMe || false
            };

            // Baixar midia se for mensagem com arquivo
            if (MEDIA_TYPES[msgType]) {
                const mediaFile = await saveMedia(msg);
                if (mediaFile) entry.mediaFile = mediaFile;
            }

            // Log no console (compacto)
            const label = entry.fromMe ? 'EU' : entry.from;
            const chatLabel = isGroup ? ` [G:${entry.chat}]` : '';
            const mediaLabel = entry.mediaFile ? ` [${entry.mediaFile}]` : '';
            console.log(`[${entry.timestamp}] ${label}${chatLabel}: ${entry.text}${mediaLabel}`);

            // Salvar no arquivo
            logMessage(entry);

            // COMANDO /diana - Responde quando usuário digita /diana <mensagem>
            if (text && text.trim().toLowerCase().startsWith('/diana ')) {
                const userMessage = text.substring(7).trim(); // Remove "/diana "
                if (userMessage) {
                    try {
                        // Chamar analyzer.js como o PUV faz
                        const { execFile } = require('child_process');
                        const analyzerPath = path.join(__dirname, 'diana-chat-analyzer.js');

                        console.log(`[WhatsApp] Processando: ${userMessage}`);
                        console.log(`[WhatsApp] Script path: ${analyzerPath}`);

                        execFile('node', [analyzerPath, userMessage], {
                            timeout: 30000,
                            maxBuffer: 1024 * 1024 * 10, // 10MB
                            windowsHide: true,
                            cwd: path.join(__dirname, '../..')
                        }, async (error, stdout, stderr) => {
                            // Combinar stdout e stderr (analyzer envia para stderr)
                            const output = stdout || stderr;

                            if (error && !output) {
                                console.error(`[WhatsApp] Erro ao processar: ${error.message}`);
                                await sock.sendMessage(from, { text: '❌ Erro ao processar comando.' });
                                return;
                            }

                            try {
                                // Extrair JSON do output (pode ter logs antes)
                                const jsonMatch = output.match(/\{[\s\S]*\}/);
                                if (!jsonMatch) {
                                    throw new Error('JSON não encontrado na resposta');
                                }

                                const result = JSON.parse(jsonMatch[0]);
                                const reply = result.response || 'Recebi sua mensagem!';

                                // Enviar resposta de volta no WhatsApp
                                await sock.sendMessage(from, { text: `🤖 Diana:\n\n${reply}` });
                                console.log(`[WhatsApp] Diana respondeu: ${reply.substring(0, 50)}...`);
                            } catch (parseErr) {
                                console.error(`[WhatsApp] Erro ao parsear: ${parseErr.message}`);
                                await sock.sendMessage(from, { text: '❌ Erro ao processar. Tente /diana help' });
                            }
                        });
                    } catch (err) {
                        console.error('[WhatsApp] Erro ao processar comando /diana:', err.message);
                        await sock.sendMessage(from, { text: '❌ Erro ao processar comando.' });
                    }
                }
            }
        }
    });
}

// --- Web server minimo (so para QR na primeira conexao) ---

app.get('/', async (req, res) => {
    if (isConnected) {
        return res.send('<div style="font-family:sans-serif;text-align:center;margin-top:100px"><h1 style="color:#25D366">Conectado</h1><p>WhatsApp listener ativo.</p></div>');
    }
    if (!lastQr) {
        return res.send('<div style="font-family:sans-serif;text-align:center;margin-top:100px"><h1>Aguardando QR...</h1><script>setTimeout(()=>location.reload(),3000)</script></div>');
    }
    try {
        const img = await qrcode.toDataURL(lastQr);
        res.send(`<div style="font-family:sans-serif;text-align:center;margin-top:50px"><h1 style="color:#25D366">Escaneie o QR</h1><img src="${img}" style="width:350px"><p>WhatsApp > Aparelhos Conectados > Conectar</p><script>setTimeout(()=>location.reload(),15000)</script></div>`);
    } catch {
        res.send('Erro ao gerar QR.');
    }
});

app.get('/health', (req, res) => {
    res.json({ connected: isConnected, uptime: process.uptime() });
});

// API para enviar mensagens (usado pelos sentinelas)
app.use(express.json());
app.post('/api/send', async (req, res) => {
    const { chat, message } = req.body;
    if (!isConnected || !globalSock) {
        return res.status(503).json({ ok: false, error: 'not connected' });
    }
    if (!chat || !message) {
        return res.status(400).json({ ok: false, error: 'chat and message required' });
    }
    try {
        const jid = chat.includes('@') ? chat : `${chat}@g.us`;
        await globalSock.sendMessage(jid, { text: message });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// API para enviar imagens (usado pelo worker PUV - scorecard JPG)
app.post('/api/send-image', async (req, res) => {
    const { chat, filePath, caption } = req.body;
    if (!isConnected || !globalSock) {
        return res.status(503).json({ ok: false, error: 'not connected' });
    }
    if (!chat || !filePath) {
        return res.status(400).json({ ok: false, error: 'chat and filePath required' });
    }
    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ ok: false, error: `file not found: ${filePath}` });
        }
        const jid = chat.includes('@') ? chat : `${chat}@g.us`;
        const buffer = fs.readFileSync(filePath);
        await globalSock.sendMessage(jid, {
            image: buffer,
            caption: caption || ''
        });
        console.log(`[WhatsApp] Imagem enviada: ${path.basename(filePath)} (${buffer.length} bytes)`);
        res.json({ ok: true, size: buffer.length });
    } catch (e) {
        console.error(`[WhatsApp] Erro ao enviar imagem: ${e.message}`);
        res.status(500).json({ ok: false, error: e.message });
    }
});

// API para enviar documentos/PDFs (usado pelo worker PUV)
app.post('/api/send-document', async (req, res) => {
    const { chat, filePath, fileName, mimetype, caption } = req.body;
    if (!isConnected || !globalSock) {
        return res.status(503).json({ ok: false, error: 'not connected' });
    }
    if (!chat || !filePath) {
        return res.status(400).json({ ok: false, error: 'chat and filePath required' });
    }
    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ ok: false, error: `file not found: ${filePath}` });
        }
        const jid = chat.includes('@') ? chat : `${chat}@g.us`;
        const buffer = fs.readFileSync(filePath);
        const name = fileName || path.basename(filePath);
        await globalSock.sendMessage(jid, {
            document: buffer,
            fileName: name,
            mimetype: mimetype || 'application/pdf',
            caption: caption || ''
        });
        console.log(`[WhatsApp] Documento enviado: ${name} (${buffer.length} bytes)`);
        res.json({ ok: true, fileName: name, size: buffer.length });
    } catch (e) {
        console.error(`[WhatsApp] Erro ao enviar documento: ${e.message}`);
        res.status(500).json({ ok: false, error: e.message });
    }
});

app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`[WhatsApp] Server: http://localhost:${HTTP_PORT}`);
    connect();
});
