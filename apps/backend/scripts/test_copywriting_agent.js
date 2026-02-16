/**
 * Teste Sequencial do Copywriting Agent
 * 
 * Testa todas as tools implementadas em sequência
 */

import { executeSpecializedAgent } from './cerebro/agent_executor.js';
import { logger } from './utils/logger.js';
import { checkAvailability as checkLanguageTool } from './utils/languagetool_client.js';
import { analyzeSentiment } from './utils/huggingface_client.js';
import { checkWordPressAvailability } from './utils/wordpress_client.js';

const log = logger.child({ module: 'test_copywriting_agent' });

async function testLanguageTool() {
    console.log('\n🧪 Teste 1: LanguageTool (Grammar Checking)');
    console.log('='.repeat(60));
    
    try {
        const available = await checkLanguageTool();
        if (!available) {
            console.log('⚠️  LanguageTool API não disponível (pode ser rate limit)');
            console.log('   Isso é normal - a API pública tem limites');
        } else {
            console.log('✅ LanguageTool API disponível');
        }

        const result = await executeSpecializedAgent(
            'copywriting',
            'Verifique a gramática deste texto: "Este é um texto de exemplo com alguns erros gramaticais."'
        );
        
        console.log('\n📝 Resultado:');
        console.log(result.answer || result.response || 'Sem resposta');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

async function testHuggingFace() {
    console.log('\n🧪 Teste 2: Hugging Face (Sentiment Analysis)');
    console.log('='.repeat(60));
    
    try {
        const sentiment = await analyzeSentiment('I love this product! It is amazing and wonderful.');
        console.log('✅ Hugging Face API funcionando');
        console.log('📊 Sentimento:', sentiment.label, `(${(sentiment.score * 100).toFixed(1)}%)`);
        
        const result = await executeSpecializedAgent(
            'copywriting',
            'Analise o tom deste texto: "Nossa solução é incrível e vai transformar seu negócio!"'
        );
        
        console.log('\n📝 Resultado:');
        console.log(result.answer || result.response || 'Sem resposta');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

async function testSEOAnalysis() {
    console.log('\n🧪 Teste 3: SEO Analysis');
    console.log('='.repeat(60));
    
    try {
        const result = await executeSpecializedAgent(
            'copywriting',
            'Analise o SEO deste texto: "SaaS para empresas que querem automatizar processos e aumentar produtividade"'
        );
        
        console.log('\n📝 Resultado:');
        console.log(result.answer || result.response || 'Sem resposta');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

async function testWordPress() {
    console.log('\n🧪 Teste 4: WordPress (Content Publishing)');
    console.log('='.repeat(60));
    
    try {
        const available = await checkWordPressAvailability();
        if (!available) {
            console.log('⚠️  WordPress não disponível em ' + process.env.WORDPRESS_URL);
            console.log('   Verifique se o WordPress está rodando e a URL está correta');
            console.log('   URL configurada:', process.env.WORDPRESS_URL);
            return false;
        }
        
        console.log('✅ WordPress disponível');
        console.log('⚠️  Teste de publicação pulado (requer credenciais configuradas)');
        console.log('   Para testar publicação, configure WORDPRESS_USERNAME e WORDPRESS_APP_PASSWORD');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

async function testCampaignCreation() {
    console.log('\n🧪 Teste 5: Campaign Creation');
    console.log('='.repeat(60));
    
    try {
        const result = await executeSpecializedAgent(
            'copywriting',
            'Crie uma campanha chamada "Teste de Campanha" com uma variante de copy para teste'
        );
        
        console.log('\n📝 Resultado:');
        console.log(result.answer || result.response || 'Sem resposta');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

async function testPerformanceAnalysis() {
    console.log('\n🧪 Teste 6: Performance Analysis');
    console.log('='.repeat(60));
    
    try {
        const result = await executeSpecializedAgent(
            'copywriting',
            'Analise a performance da URL: https://example.com/test'
        );
        
        console.log('\n📝 Resultado:');
        console.log(result.answer || result.response || 'Sem resposta');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('\n🚀 Iniciando Testes Sequenciais do Copywriting Agent\n');
    console.log('='.repeat(60));
    
    const results = {
        languageTool: false,
        huggingFace: false,
        seoAnalysis: false,
        wordPress: false,
        campaignCreation: false,
        performanceAnalysis: false,
    };

    // Teste 1: LanguageTool
    results.languageTool = await testLanguageTool();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 2: Hugging Face
    results.huggingFace = await testHuggingFace();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 3: SEO Analysis
    results.seoAnalysis = await testSEOAnalysis();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 4: WordPress
    results.wordPress = await testWordPress();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 5: Campaign Creation
    results.campaignCreation = await testCampaignCreation();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 6: Performance Analysis
    results.performanceAnalysis = await testPerformanceAnalysis();

    // Resumo
    console.log('\n\n📊 Resumo dos Testes');
    console.log('='.repeat(60));
    console.log(`LanguageTool:        ${results.languageTool ? '✅' : '❌'}`);
    console.log(`Hugging Face:        ${results.huggingFace ? '✅' : '❌'}`);
    console.log(`SEO Analysis:        ${results.seoAnalysis ? '✅' : '❌'}`);
    console.log(`WordPress:           ${results.wordPress ? '✅' : '⚠️ '}`);
    console.log(`Campaign Creation:   ${results.campaignCreation ? '✅' : '❌'}`);
    console.log(`Performance Analysis: ${results.performanceAnalysis ? '✅' : '❌'}`);

    const successCount = Object.values(results).filter(r => r).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n✅ ${successCount}/${totalCount} testes passaram\n`);
}

// Executar testes
runAllTests().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});



























