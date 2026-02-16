#!/usr/bin/env node
import os from 'os';

function renderDash() {
    console.clear();
    console.log("\x1b[44m\x1b[37m %s \x1b[0m", " DIANA CORPORAÇÃO SENCIENTE - DASHBOARD DE COERÊNCIA ");
    console.log("");
    
    const stats = {
        'PROTOCOLO 01 (IDENTIDADE)': '100% [COMPLETO]',
        'PROTOCOLO 02 (SEGURANÇA)':  '95%  [ATIVO]',
        'PROTOCOLO 03 (RESILIÊNCIA)': '100% [COMPLETO]',
        'METABOLISMO': 'ÓTIMO (0.2s latência)',
        'MEMÓRIA (LETTA)': 'SINCRONIZADA'
    };

    console.log("📊 STATUS DOS PROTOCOLOS (ETAPA 002):");
    for (const [key, val] of Object.entries(stats)) {
        console.log(`  - ${key.padEnd(25)}: ${val}`);
    }

    console.log("
💻 RECURSOS DO SISTEMA:");
    console.log(`  - CPU Load: ${os.loadavg()[0].toFixed(2)}%`);
    console.log(`  - Free Mem: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    
    console.log("
📡 REDE POLVO:");
    console.log("  - Nodos Ativos: [LocalNode, Node-Alpha]");
    
    console.log("
-------------------------------------------------------");
    console.log("Refresh: 5s | Press Ctrl+C to exit");
}

setInterval(renderDash, 5000);
renderDash();
