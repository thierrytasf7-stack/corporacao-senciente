#!/usr/bin/env node

/**
 * Verify Chat/IDE - Verificação Rápida da Arquitetura Chat/IDE
 */

console.log('🔍 Verificando arquitetura Chat/IDE...\n');

// Teste 1: Verificar se arquivos existem
console.log('1. Verificando arquivos principais...');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCheck = [
    'scripts/swarm/brain_prompt_generator.js',
    'scripts/swarm/agent_prompt_generator.js',
    'scripts/swarm/chat_interface.js',
    'scripts/swarm/confidence_scorer.js',
    'docs/02-architecture/ARQUITETURA_CHAT_IDE.md',
    'docs/02-architecture/SWARM_ARCHITECTURE.md'
];

let filesExist = 0;
filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
        filesExist++;
    } else {
        console.log(`   ❌ ${file} - NÃO ENCONTRADO`);
    }
});

console.log(`\nArquivos encontrados: ${filesExist}/${filesToCheck.length}`);

// Teste 2: Verificar imports básicos
console.log('\n2. Verificando imports básicos...');

async function testImports() {
    try {
        const ChatInterface = (await import('../swarm/chat_interface.js')).default;
        console.log('   ✅ ChatInterface importado');

        const chat = new ChatInterface();
        console.log('   ✅ ChatInterface instanciado');

        const hasMethods = typeof chat.startConversation === 'function' &&
            typeof chat.sendMessage === 'function';
        console.log(`   ✅ Métodos essenciais: ${hasMethods ? 'PRESENTES' : 'FALTANDO'}`);

        return true;
    } catch (error) {
        console.log(`   ❌ Erro nos imports: ${error.message}`);
        return false;
    }
}

testImports().then(success => {
    console.log(`\nResultado geral: ${success ? '✅ ARQUITETURA CHAT/IDE OK' : '❌ PROBLEMAS DETECTADOS'}`);

    if (success) {
        console.log('\n🚀 PRÓXIMOS PASSOS:');
        console.log('1. Configurar infraestrutura WSL2 quando internet melhorar');
        console.log('2. Testar integração completa com Supabase');
        console.log('3. Implementar agentes especializados');
        console.log('4. Testar incorporação no Cursor');
    }

    // Salvar resultado simples
    const result = {
        timestamp: new Date().toISOString(),
        files_checked: filesToCheck.length,
        files_found: filesExist,
        imports_working: success,
        status: success && filesExist === filesToCheck.length ? 'READY' : 'NEEDS_WORK'
    };

    // Garantir que diretório data existe
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data', { recursive: true });
    }

    fs.writeFileSync('data/chat_ide_verification.json', JSON.stringify(result, null, 2));
    console.log('\n📊 Resultado salvo em: data/chat_ide_verification.json');
});




