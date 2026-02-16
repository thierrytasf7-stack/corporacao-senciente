/**
 * Teste de Criação de Campanha Google Ads (EXEMPLO)
 * 
 * IMPORTANTE: Este script cria uma campanha de EXEMPLO em modo PAUSADO
 * A campanha NÃO será ativada automaticamente - apenas criada para validação
 */

import { config } from 'dotenv';
import fs from 'fs';
import { createCampaign, listCampaigns } from './utils/google_ads_client.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_google_ads_campaign' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

async function testCampaignCreation() {
    console.log('🧪 Teste de Criação de Campanha Google Ads (EXEMPLO)\n');
    console.log('='.repeat(80));
    console.log('⚠️  IMPORTANTE: Esta é uma campanha de EXEMPLO para validação');
    console.log('   A campanha será criada em modo PAUSADO e NÃO será ativada');
    console.log('   Você pode revisar e ativar manualmente depois se desejar\n');
    console.log('='.repeat(80));

    try {
        // 1. Validar conexão listando campanhas existentes
        console.log('\n1️⃣ Validando conexão...');
        try {
            const existingCampaigns = await listCampaigns();

            if (existingCampaigns.success) {
                console.log(`✅ Conexão validada! ${existingCampaigns.campaigns.length} campanha(s) existente(s)\n`);
            } else {
                console.log('⚠️  Não foi possível listar campanhas, mas continuando...\n');
            }
        } catch (listError) {
            console.log('⚠️  Não foi possível listar campanhas (pode ser limitação da conta de teste)');
            console.log(`   Erro: ${listError.message || 'Desconhecido'}`);
            console.log('   Continuando com criação de campanha de exemplo...\n');
        }

        // 2. Criar campanha de exemplo
        console.log('2️⃣ Criando campanha de EXEMPLO...\n');

        const exampleCampaign = {
            name: `Teste Marketing Agent - ${new Date().toISOString().split('T')[0]}`,
            objective: 'LEAD_GENERATION', // Objetivo: Geração de leads
            dailyBudget: 10.00, // R$ 10,00 por dia (exemplo)
            keywords: [
                'marketing digital',
                'publicidade online',
                'anúncios google'
            ],
            adGroupName: 'Grupo de Teste - Marketing Agent',
            adCopy: {
                headline1: 'Marketing Digital Eficiente',
                headline2: 'Aumente Suas Vendas Agora',
                headline3: 'Resultados Comprovados',
                description1: 'Descubra como aumentar suas vendas com marketing digital estratégico.',
                description2: 'Ferramentas e estratégias testadas para seu negócio crescer.',
                finalUrl: 'https://example.com/marketing-digital', // URL de exemplo
                path1: 'marketing',
                path2: 'digital'
            }
        };

        console.log('📋 Detalhes da campanha de exemplo:');
        console.log(`   Nome: ${exampleCampaign.name}`);
        console.log(`   Objetivo: ${exampleCampaign.objective}`);
        console.log(`   Orçamento diário: R$ ${exampleCampaign.dailyBudget.toFixed(2)}`);
        console.log(`   Keywords: ${exampleCampaign.keywords.join(', ')}`);
        console.log(`   URL: ${exampleCampaign.adCopy.finalUrl}\n`);

        const result = await createCampaign(exampleCampaign);

        if (result.success) {
            console.log('✅ Campanha de EXEMPLO criada com sucesso!\n');
            console.log('📊 Informações:');
            console.log(`   ID da Campanha: ${result.campaignId}`);
            console.log(`   Nome: ${result.campaignName}`);
            console.log(`   Status: ${result.status} (PAUSADA - não será ativada automaticamente)`);
            if (result.adGroupId) {
                console.log(`   ID do Grupo de Anúncios: ${result.adGroupId}`);
            }
            console.log(`\n${result.message}\n`);

            console.log('='.repeat(80));
            console.log('\n✅ Teste concluído com sucesso!\n');
            console.log('📝 Próximos passos:');
            console.log('   1. Acesse o Google Ads: https://ads.google.com');
            console.log(`   2. Revise a campanha "${result.campaignName}"`);
            console.log('   3. Se estiver tudo ok, você pode ativar manualmente');
            console.log('   4. Se não precisar, pode deletar a campanha de exemplo\n');
            console.log('='.repeat(80));

            return {
                success: true,
                campaignId: result.campaignId,
                message: 'Campanha de exemplo criada com sucesso (em modo pausado)'
            };

        } else {
            console.log('❌ Erro ao criar campanha de exemplo');
            console.log(`   ${result.message || 'Erro desconhecido'}\n`);
            return {
                success: false,
                message: result.message || 'Erro desconhecido'
            };
        }

    } catch (error) {
        log.error('Erro no teste', { error: error.message, stack: error.stack });
        console.log('\n❌ Erro durante o teste:');
        console.log(`   ${error.message}\n`);

        if (error.message.includes('Refresh Token')) {
            console.log('💡 Execute: npm run google-ads:setup\n');
        } else if (error.message.includes('Developer Token')) {
            console.log('💡 Verifique se o Developer Token está aprovado no Google Ads\n');
        } else if (error.message.includes('Customer ID')) {
            console.log('💡 Verifique o Customer ID no env.local\n');
        }

        return {
            success: false,
            message: error.message
        };
    }
}

// Executar teste
testCampaignCreation()
    .then(result => {
        if (result.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n❌ Erro fatal:', error.message);
        process.exit(1);
    });

