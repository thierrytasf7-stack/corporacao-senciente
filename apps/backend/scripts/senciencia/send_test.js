#!/usr/bin/env node
/**
 * Script para enviar mensagem de teste ao controller
 */
import { sendText } from './controller_server.js';

const testMessage = `prossiga eleve os 29 a 8.0 como minimo,`;

// BUG FIX: sendText é síncrono, então não precisa ser async, mas mantemos para consistência
async function test() {
    console.log('📤 Enviando mensagem de teste...');

    // sendText é síncrono, mas envolvemos em try/catch para robustez
    try {
        const result = sendText(testMessage);
        console.log('✅ Resultado:', result);

        if (result.status === 'written') {
            console.log(`✅ Arquivo escrito: ${result.file}`);
            console.log(`📝 Conteúdo: ${result.content.substring(0, 80)}...`);
            console.log('\n🎯 Próximo: Execute o AHK script para digitar automaticamente');
        } else {
            console.error('❌ Erro:', result.error);
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Erro na execução:', e.message);
        throw e;
    }
}

// BUG FIX: Usar await para garantir que a função seja aguardada antes do script terminar
(async () => {
    try {
        await test();
    } catch (e) {
        console.error('❌ Erro fatal:', e.message);
        process.exit(1);
    }
})();
