/**
 * Teste de Validação - TODAS AS CHAVES
 * Verifica quais chaves funcionam em cada ambiente
 */

import axios from 'axios';

const crypto = require('crypto');

// TODAS AS CHAVES ENCONTRADAS NOS ARQUIVOS .ENV
const CHAVES = {
    'MAINNET (k8kZUlC...)': {
        key: 'k8kZUlC11apSde0pQfyOm28kNno6T1sYjLTZLYP5hkZG7Z9h1WbWPfxexAJzWB98',
        secret: 'NOlurjeo9jDe9BNkPGOEANprzSa4HaIWqkQqGkUu4mAzJEHLvtwsu4uj6Sgop153'
    },
    'TESTNET (fNvgZQz...)': {
        key: 'fNvgZQzCexYFQfGALy03zGXzsDQ3lEoDYLgtRDwdml1HGdmmH51uLKWfAzV4RGyF',
        secret: '80nEJoimIghboxbDbPFuIWHPh5rRaGETWsi7ugYtnPHPa4puFgWG7CP2RSvynFsO'
    }
};

function generateSignature(params: any, secret: string): string {
    return crypto.createHmac('sha256', secret).update(new URLSearchParams(params).toString()).digest('hex');
}

async function testarChave(nomeChave: string, key: string, secret: string, url: string, nome: string) {
    try {
        const timestamp = Date.now();
        const params = { timestamp };
        const signature = generateSignature(params, secret);
        
        const response = await axios.get(url, {
            params: { ...params, signature },
            headers: { 'X-MBX-APIKEY': key },
            timeout: 5000
        });
        
        const balance = response.data.totalWalletBalance || response.data.availableBalance || 
                       response.data.balances?.find((b: any) => b.asset === 'USDT')?.free || 0;
        
        console.log(`   ✅ ${nomeChave} -> ${nome}: SALDO ${balance} USDT`);
        return { success: true, balance, chave: nomeChave };
    } catch (error: any) {
        const msg = error.response?.data?.msg || error.message;
        const code = error.response?.data?.code || error.code;
        console.log(`   ❌ ${nomeChave} -> ${nome}: ${msg} (${code})`);
        return { success: false, error: msg, chave: nomeChave };
    }
}

async function testarTodasChaves() {
    console.log('='.repeat(70));
    console.log('🧪 TESTE DE TODAS AS CHAVES BINANCE');
    console.log('='.repeat(70));
    
    const ambientes = [
        { nome: 'Testnet Futures', url: 'https://testnet.binancefuture.com/fapi/v2/account', type: 'testnet' },
        { nome: 'Testnet Spot', url: 'https://testnet.binance.vision/api/v3/account', type: 'testnet' },
        { nome: 'Mainnet Futures', url: 'https://fapi.binance.com/fapi/v2/account', type: 'mainnet' },
        { nome: 'Mainnet Spot', url: 'https://api.binance.com/api/v3/account', type: 'mainnet' }
    ];
    
    const resultados = {
        'MAINNET (k8kZUlC...)': { testnet: 0, mainnet: 0, total: 0 },
        'TESTNET (fNvgZQz...)': { testnet: 0, mainnet: 0, total: 0 }
    };
    
    for (const amb of ambientes) {
        console.log(`\n📍 ${amb.nome}:`);
        
        for (const [nomeChave, creds] of Object.entries(CHAVES)) {
            const resultado = await testarChave(nomeChave, creds.key, creds.secret, amb.url, amb.nome);
            
            if (resultado.success) {
                if (amb.type === 'testnet') {
                    resultados[nomeChave as keyof typeof resultados].testnet++;
                } else {
                    resultados[nomeChave as keyof typeof resultados].mainnet++;
                }
                resultados[nomeChave as keyof typeof resultados].total++;
            }
        }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO:');
    console.log('='.repeat(70));
    
    for (const [chave, stats] of Object.entries(resultados)) {
        console.log(`\n${chave}:`);
        console.log(`   Testnet: ${stats.testnet}/2 ambientes`);
        console.log(`   Mainnet: ${stats.mainnet}/2 ambientes`);
        console.log(`   Total: ${stats.total}/4 ambientes`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ RECOMENDAÇÃO DE USO:');
    console.log('='.repeat(70));
    
    if (resultados['MAINNET (k8kZUlC...)'].mainnet > 0) {
        console.log('\n🔹 MAINNET (k8kZUlC...): Usar em Mainnet Futures e Mainnet Spot');
    }
    if (resultados['TESTNET (fNvgZQz...)'].testnet > 0) {
        console.log('🔹 TESTNET (fNvgZQz...): Usar em Testnet Futures e Testnet Spot');
    }
    
    console.log('\n' + '='.repeat(70));
}

testarTodasChaves();
