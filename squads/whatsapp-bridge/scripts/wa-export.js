#!/usr/bin/env node
/**
 * wa-export.js - Exporta conversa para pasta organizada
 *
 * Uso:
 *   node wa-export.js --number 5511999999999 --output ./exports/joao
 *   node wa-export.js --number 5511999999999 --from 2026-02-01 --to 2026-02-13 --output ./exports/joao-fev
 *   node wa-export.js --group 120363408111554407 --output ./exports/grupo-alex
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', '..', 'apps', 'backend', 'integrations', 'whatsapp', 'logs', 'messages.jsonl');
const MEDIA_DIR = path.join(__dirname, '..', '..', '..', 'apps', 'backend', 'integrations', 'whatsapp', 'logs', 'media');

function parseArgs() {
    const args = {};
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--number') args.number = argv[++i];
        else if (argv[i] === '--group') args.group = argv[++i];
        else if (argv[i] === '--from') args.from = argv[++i];
        else if (argv[i] === '--to') args.to = argv[++i];
        else if (argv[i] === '--output') args.output = argv[++i];
    }
    if (!args.output) {
        console.error('--output <pasta> obrigatorio');
        process.exit(1);
    }
    return args;
}

function readAndFilter(args) {
    const lines = fs.readFileSync(LOG_FILE, 'utf-8').split('\n').filter(l => l.trim());
    let entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

    if (args.number) {
        const num = args.number.replace(/\D/g, '');
        entries = entries.filter(e => e.from.includes(num) || (e.type === 'private' && e.from.includes(num)));
    }
    if (args.group) {
        entries = entries.filter(e => e.chat === args.group);
    }
    if (args.from) {
        const d = new Date(args.from);
        entries = entries.filter(e => new Date(e.timestamp) >= d);
    }
    if (args.to) {
        const d = new Date(args.to + 'T23:59:59');
        entries = entries.filter(e => new Date(e.timestamp) <= d);
    }

    return entries;
}

function exportConversation(entries, outputDir) {
    fs.mkdirSync(outputDir, { recursive: true });

    // 1. Salvar conversa como texto legivel
    let textExport = '';
    const mediaFiles = [];

    for (const e of entries) {
        const date = e.timestamp.replace('T', ' ').replace(/\.\d+Z/, '');
        const who = e.fromMe ? 'EU' : e.from;

        if (e.text === '[media/other]' && e.mediaFile) {
            textExport += `[${date}] ${who}: [${e.msgType}] -> ${e.mediaFile}\n`;
            mediaFiles.push(e.mediaFile);
        } else {
            textExport += `[${date}] ${who}: ${e.text}\n`;
        }
    }

    // Salvar conversa.txt
    fs.writeFileSync(path.join(outputDir, 'conversa.txt'), textExport, 'utf-8');

    // 2. Salvar JSON completo
    fs.writeFileSync(path.join(outputDir, 'conversa.json'), JSON.stringify(entries, null, 2), 'utf-8');

    // 3. Copiar midias se existirem
    if (mediaFiles.length > 0) {
        const mediaOut = path.join(outputDir, 'media');
        fs.mkdirSync(mediaOut, { recursive: true });
        let copied = 0;
        for (const mf of mediaFiles) {
            const src = path.join(MEDIA_DIR, mf);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, path.join(mediaOut, path.basename(mf)));
                copied++;
            }
        }
        console.log(`  Midias copiadas: ${copied}/${mediaFiles.length}`);
    }

    // 4. Stats
    const stats = {
        total: entries.length,
        fromMe: entries.filter(e => e.fromMe).length,
        fromOthers: entries.filter(e => !e.fromMe).length,
        media: entries.filter(e => e.text === '[media/other]').length,
        dateRange: {
            from: entries[0]?.timestamp,
            to: entries[entries.length - 1]?.timestamp
        }
    };
    fs.writeFileSync(path.join(outputDir, 'stats.json'), JSON.stringify(stats, null, 2), 'utf-8');

    console.log(`\nExportado para: ${outputDir}`);
    console.log(`  Total: ${stats.total} mensagens`);
    console.log(`  Minhas: ${stats.fromMe} | Outros: ${stats.fromOthers}`);
    console.log(`  Midia: ${stats.media}`);
    console.log(`  Periodo: ${stats.dateRange.from?.split('T')[0]} a ${stats.dateRange.to?.split('T')[0]}`);
    console.log(`  Arquivos: conversa.txt, conversa.json, stats.json`);
}

// Main
const args = parseArgs();
const entries = readAndFilter(args);

if (entries.length === 0) {
    console.log('Nenhuma mensagem encontrada com esses filtros.');
    process.exit(0);
}

exportConversation(entries, args.output);
