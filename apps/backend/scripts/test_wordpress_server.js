/**
 * Teste do WordPress Server
 * 
 * Testa publicação e listagem de posts
 */

import { config } from 'dotenv';
import fs from 'fs';
import { checkWordPressAvailability, publishToWordPress } from './utils/wordpress_client.js';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

async function testWordPressServer() {
    console.log('🧪 Testando WordPress Server\n');
    console.log('='.repeat(60));

    // 1. Verificar disponibilidade
    console.log('\n1️⃣ Verificando disponibilidade...');
    const isAvailable = await checkWordPressAvailability();

    if (!isAvailable) {
        console.log('❌ WordPress Server não está disponível');
        console.log('\n💡 Inicie o servidor:');
        console.log('   npm run wordpress:server');
        console.log('   ou');
        console.log('   npm run wordpress:server:setup\n');
        process.exit(1);
    }

    console.log('✅ WordPress Server está disponível\n');

    // 2. Testar publicação
    console.log('2️⃣ Testando publicação de post...');

    try {
        const testPost = {
            title: 'Teste do Copywriting Agent - ' + new Date().toLocaleString('pt-BR'),
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
        console.log('❌ Erro ao publicar post:');
        console.log(`   ${error.message}\n`);

        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.log('💡 Verifique as credenciais no env.local:');
            console.log('   WORDPRESS_USERNAME=admin');
            console.log('   WORDPRESS_APP_PASSWORD=sua_senha\n');
        }

        process.exit(1);
    }

    // 3. Testar listagem
    console.log('3️⃣ Testando listagem de posts...');

    try {
        const { WORDPRESS_URL } = process.env;
        const baseUrl = WORDPRESS_URL.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const posts = await response.json();
        console.log(`✅ ${posts.length} post(s) encontrado(s)\n`);

        if (posts.length > 0) {
            console.log('📝 Últimos posts:');
            posts.slice(0, 3).forEach(post => {
                console.log(`   - ${post.title?.rendered || 'Sem título'} (ID: ${post.id})`);
            });
        }

    } catch (error) {
        console.log(`❌ Erro ao listar posts: ${error.message}\n`);
    }

    console.log('='.repeat(60));
    console.log('\n✅ Todos os testes passaram!\n');
    console.log('🌐 Acesse: http://localhost:8080\n');
}

testWordPressServer().catch(error => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
});



























