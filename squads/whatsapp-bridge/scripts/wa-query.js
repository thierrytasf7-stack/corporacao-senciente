#!/usr/bin/env node
/**
 * wa-query.js - Busca mensagens no log do WhatsApp
 *
 * Uso:
 *   node wa-query.js --number 5511999999999
 *   node wa-query.js --number 5511999999999 --from 2026-02-01 --to 2026-02-13
 *   node wa-query.js --group 120363408111554407 --from 2026-02-10
 *   node wa-query.js --chat private --from 2026-02-13
 *   node wa-query.js --search "palavra chave"
 *   node wa-query.js --list-contacts
 *   node wa-query.js --list-groups
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', '..', 'apps', 'backend', 'integrations', 'whatsapp', 'logs', 'messages.jsonl');

function parseArgs() {
    const args = {};
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--number') args.number = argv[++i];
        else if (argv[i] === '--group') args.group = argv[++i];
        else if (argv[i] === '--chat') args.chatType = argv[++i];
        else if (argv[i] === '--from') args.from = argv[++i];
        else if (argv[i] === '--to') args.to = argv[++i];
        else if (argv[i] === '--search') args.search = argv[++i];
        else if (argv[i] === '--limit') args.limit = parseInt(argv[++i]);
        else if (argv[i] === '--list-contacts') args.listContacts = true;
        else if (argv[i] === '--list-groups') args.listGroups = true;
        else if (argv[i] === '--json') args.json = true;
        else if (argv[i] === '--media-only') args.mediaOnly = true;
    }
    return args;
}

function readLog() {
    if (!fs.existsSync(LOG_FILE)) {
        console.error('Log file not found:', LOG_FILE);
        process.exit(1);
    }
    const lines = fs.readFileSync(LOG_FILE, 'utf-8').split('\n').filter(l => l.trim());
    return lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function filterMessages(entries, args) {
    let results = entries;

    if (args.number) {
        const num = args.number.replace(/\D/g, '');
        results = results.filter(e => e.from.includes(num) || (e.chat === 'private' && e.from.includes(num)));
    }

    if (args.group) {
        results = results.filter(e => e.chat === args.group);
    }

    if (args.chatType) {
        results = results.filter(e => e.type === args.chatType);
    }

    if (args.from) {
        const fromDate = new Date(args.from);
        results = results.filter(e => new Date(e.timestamp) >= fromDate);
    }

    if (args.to) {
        const toDate = new Date(args.to + 'T23:59:59');
        results = results.filter(e => new Date(e.timestamp) <= toDate);
    }

    if (args.search) {
        const term = args.search.toLowerCase();
        results = results.filter(e => e.text && e.text.toLowerCase().includes(term));
    }

    if (args.mediaOnly) {
        results = results.filter(e => e.text === '[media/other]');
    }

    if (args.limit) {
        results = results.slice(-args.limit);
    }

    return results;
}

function listContacts(entries) {
    const contacts = {};
    for (const e of entries) {
        if (e.type === 'private' && !e.fromMe) {
            if (!contacts[e.from]) contacts[e.from] = { count: 0, last: '' };
            contacts[e.from].count++;
            contacts[e.from].last = e.timestamp;
        }
    }
    console.log(`\n--- CONTATOS (${Object.keys(contacts).length}) ---\n`);
    const sorted = Object.entries(contacts).sort((a, b) => b[1].count - a[1].count);
    for (const [num, info] of sorted) {
        console.log(`  ${num} | ${info.count} msgs | ultimo: ${info.last.split('T')[0]}`);
    }
}

function listGroups(entries) {
    const groups = {};
    for (const e of entries) {
        if (e.type === 'group') {
            if (!groups[e.chat]) groups[e.chat] = { count: 0, last: '', lastText: '' };
            groups[e.chat].count++;
            groups[e.chat].last = e.timestamp;
            if (e.text && e.text !== '[media/other]') groups[e.chat].lastText = e.text.substring(0, 50);
        }
    }
    console.log(`\n--- GRUPOS (${Object.keys(groups).length}) ---\n`);
    const sorted = Object.entries(groups).sort((a, b) => b[1].count - a[1].count);
    for (const [gid, info] of sorted) {
        console.log(`  ${gid} | ${info.count} msgs | ${info.lastText}`);
    }
}

function formatOutput(results, args) {
    if (args.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
    }

    console.log(`\n--- ${results.length} mensagens encontradas ---\n`);
    for (const e of results) {
        const date = e.timestamp.replace('T', ' ').replace(/\.\d+Z/, '');
        const who = e.fromMe ? 'EU' : e.from;
        const group = e.type === 'group' ? ` [G:${e.chat}]` : '';
        console.log(`[${date}] ${who}${group}: ${e.text}`);
    }
}

// Main
const args = parseArgs();
const entries = readLog();

if (args.listContacts) {
    listContacts(entries);
} else if (args.listGroups) {
    listGroups(entries);
} else {
    const results = filterMessages(entries, args);
    formatOutput(results, args);
}
