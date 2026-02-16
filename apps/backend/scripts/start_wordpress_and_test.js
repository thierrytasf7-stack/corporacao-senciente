/**
 * Inicia WordPress Server e testa
 */

import { config } from 'dotenv';
import fs from 'fs';
import { checkWordPressAvailability, publishToWordPress } from './utils/wordpress_client.js';
import { startWordPressServer } from './wordpress_server.js';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

async function main() {
    console.log('🚀 Iniciando WordPress Server...\n');

    // Iniciar servidor
    const server = await startWordPressServer();

    // Aguardar servidor iniciar
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n🧪 Testando servidor...\n');
    console.log('='.repeat(60));

    // Verificar disponibilidade
    const isAvailable = await checkWordPressAvailability();

    if (!isAvailable) {
        console.log('❌ Servidor não está respondendo');
        server.close();
        process.exit(1);
    }

    console.log('✅ Servidor está respondendo\n');

    // Testar publicação
    try {
        const testPost = {
            title: 'Teste Copywriting Agent - ' + new Date().toLocaleString('pt-BR'),
            content: `
                <h2>Post de Teste</h2>
                <p>Este é um post de teste criado pelo Copywriting Agent.</p>
                <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
                <p>✅ Servidor WordPress Node.js funcionando perfeitamente!</p>
            `,
            status: 'publish',
        };

        const result = await publishToWordPress(testPost);

        console.log('✅ Post publicado com sucesso!');
        console.log(`   ID: ${result.id}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Título: ${result.title}`);
        console.log(`   Status: ${result.status}\n`);

    } catch (error) {
        console.log('❌ Erro ao publicar:');
        console.log(`   ${error.message}\n`);
        server.close();
        process.exit(1);
    }

    console.log('='.repeat(60));
    console.log('\n✅ WordPress Server está funcionando!\n');
    console.log('🌐 Acesse: http://localhost:8080\n');
    console.log('⚠️  Pressione Ctrl+C para parar\n');

    // Manter servidor rodando
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Parando servidor...\n');
        server.close(() => {
            console.log('✅ Servidor parado\n');
            process.exit(0);
        });
    });
}

main().catch(error => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
});



























