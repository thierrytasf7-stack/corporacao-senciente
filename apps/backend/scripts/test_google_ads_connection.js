/**
 * Script para testar conexão com Google Ads API
 */

import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    GOOGLE_ADS_CUSTOMER_ID,
    GOOGLE_ADS_DEVELOPER_TOKEN,
    GOOGLE_ADS_CLIENT_ID,
    GOOGLE_ADS_CLIENT_SECRET,
    GOOGLE_ADS_REFRESH_TOKEN,
} = process.env;

console.log('🧪 Testando Conexão Google Ads API\n');
console.log('='.repeat(80));

// Verificar variáveis
const missing = [];

if (!GOOGLE_ADS_CUSTOMER_ID) missing.push('GOOGLE_ADS_CUSTOMER_ID');
if (!GOOGLE_ADS_DEVELOPER_TOKEN) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN');
if (!GOOGLE_ADS_CLIENT_ID) missing.push('GOOGLE_ADS_CLIENT_ID');
if (!GOOGLE_ADS_CLIENT_SECRET) missing.push('GOOGLE_ADS_CLIENT_SECRET');
if (!GOOGLE_ADS_REFRESH_TOKEN) missing.push('GOOGLE_ADS_REFRESH_TOKEN');

if (missing.length > 0) {
    console.log('❌ Variáveis de ambiente faltando:\n');
    missing.forEach(v => console.log(`   - ${v}`));
    console.log('\n💡 Configure todas as variáveis no env.local antes de testar.\n');
    console.log('📖 Guia completo: docs/GUIA_CONFIGURACAO_GOOGLE_ADS_API.md\n');
    process.exit(1);
}

console.log('✅ Todas as variáveis configuradas!\n');
console.log('📋 Verificando valores:');
console.log(`   Customer ID: ${GOOGLE_ADS_CUSTOMER_ID}`);
console.log(`   Developer Token: ${GOOGLE_ADS_DEVELOPER_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   Client ID: ${GOOGLE_ADS_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   Client Secret: ${GOOGLE_ADS_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   Refresh Token: ${GOOGLE_ADS_REFRESH_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
console.log('\n⚠️  Para testar a conexão real, você precisa:');
console.log('   1. Instalar: npm install google-ads-api');
console.log('   2. Aguardar aprovação do Developer Token');
console.log('   3. Executar: node scripts/test_google_ads_real.js\n');

console.log('='.repeat(80));
console.log('\n✅ Validação de configuração concluída!\n');
console.log('📖 Consulte: docs/GUIA_CONFIGURACAO_GOOGLE_ADS_API.md\n');
























