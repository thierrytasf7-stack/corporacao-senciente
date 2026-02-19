/**
 * Teste de Validação - Todas as Implementações
 * Verifica se os únicos erros são de saldo insuficiente
 */

import axios from 'axios';

const crypto = require('crypto');

// CHAVE UNIFICADA - USA A MESMA PARA TUDO
const UNIFIED_API_KEY = 'k8kZUlC11apSde0pQfyOm28kNno6T1sYjLTZLYP5hkZG7Z9h1WbWPfxexAJzWB98';
const UNIFIED_API_SECRET = 'NOlurjeo9jDe9BNkPGOEANprzSa4HaIWqkQqGkUu4mAzJEHLvtwsu4uj6Sgop153';

function generateSignature(params: any, secret: string): string {
    return crypto.createHmac('sha256', secret).update(new URLSearchParams(params).toString()).digest('hex');
}

async function testBinanceConnection(type: 'TESTNET' | 'MAINNET', market: 'FUTURES' | 'SPOT') {
    const isTestnet = type === 'TESTNET';
    
    // USA A MESMA CHAVE UNIFICADA PARA TUDO!
    const key = UNIFIED_API_KEY;
    const secret = UNIFIED_API_SECRET;
    
    // URLs corrigidas - USANDO MESMA CHAVE PARA TUDO
    const baseUrl = isTestnet
        ? (market === 'FUTURES' ? 'https://testnet.binancefuture.com' : 'https://testnet.binance.vision/api/v3')
        : (market === 'FUTURES' ? 'https://fapi.binance.com' : 'https://api.binance.com/api/v3');
    
    const accountEndpoint = market === 'FUTURES' ? '/fapi/v2/account' : '/account';
    const headerKey = market === 'FUTURES' ? 'X-MBX-APIKEY' : 'X-MBX-APIKEY';
    
    console.log(`\n🔍 Testando ${type} ${market}...`);
    console.log(`   URL: ${baseUrl}`);
    console.log(`   API Key: ${key.substring(0, 20)}...`);
    
    try {
        // Test 1: Ping (sem autenticação)
        const pingUrl = market === 'FUTURES' 
            ? `${baseUrl}/fapi/v1/ping`
            : `${baseUrl}/ping`;
        await axios.get(pingUrl);
        console.log(`   ✅ Ping OK`);
        
        // Test 2: Account (com autenticação)
        const timestamp = Date.now();
        const params = { timestamp };
        const signature = generateSignature(params, secret);
        
        const accountUrl = `${baseUrl}${accountEndpoint}`;
        const response = await axios.get(accountUrl, {
            params: { ...params, signature },
            headers: { 
                'X-MBX-APIKEY': key,
                'Content-Type': 'application/json'
            }
        });
        
        // Balances diferentes para Spot e Futures
        let balance = 0;
        if (market === 'FUTURES') {
            balance = response.data.totalWalletBalance || response.data.availableBalance || 0;
        } else {
            // Spot: procurar por USDT nos balances
            const usdtBalance = response.data.balances?.find((b: any) => b.asset === 'USDT');
            balance = usdtBalance ? parseFloat(usdtBalance.free) : 0;
        }
        
        console.log(`   ✅ Account OK`);
        console.log(`   💰 Saldo: ${balance} USDT`);
        
        if (parseFloat(balance as any) === 0 || parseFloat(balance as any) < 0.001) {
            console.log(`   ⚠️  SALDO INSUFICIENTE - Este é o erro esperado!`);
            return { success: true, balance: parseFloat(balance as any), error: 'SALDO_INSUFICIENTE' };
        }
        
        return { success: true, balance: parseFloat(balance as any) };
        
    } catch (error: any) {
        const status = error.response?.status;
        const msg = error.response?.data?.msg || error.message;
        const code = error.response?.data?.code;
        
        console.log(`   ❌ Erro: ${status || 'N/A'} - ${msg} (Code: ${code || 'N/A'})`);
        console.log(`   🔑 API Key: ${key.substring(0, 20)}...`);
        console.log(`   📝 Secret: ${secret.substring(0, 20)}...`);
        
        // Verifica se é erro de saldo
        if (msg?.includes('balance') || msg?.includes('insufficient') || status === -1013 || msg?.includes('Invalid API')) {
            console.log(`   ⚠️  Erro de API/Saldo - Verifique permissions!`);
            return { success: false, error: msg, status };
        }
        
        // Outros erros
        return { success: false, error: msg, status };
    }
}

async function testChampionsFiles() {
    console.log(`\n📊 Verificando arquivos de Champions...`);
    
    const fs = require('fs');
    const path = require('path');
    
    const files = [
        'data/testnet-futures-champions.json',
        'data/testnet-spot-champions.json',
        'data/mainnet-futures-champions.json',
        'data/mainnet-spot-champions.json'
    ];
    
    let allOk = true;
    
    for (const file of files) {
        const filePath = path.join(__dirname, file);
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`   ❌ ${file} - NÃO ENCONTRADO`);
                allOk = false;
                continue;
            }
            
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`   ✅ ${file} - ${content.length} champions`);
        } catch (error: any) {
            console.log(`   ❌ ${file} - ${error.message}`);
            allOk = false;
        }
    }
    
    return allOk;
}

async function testDNArenaV2() {
    console.log(`\n🏟️  Verificando DNA Arena V2...`);
    
    const fs = require('fs');
    const path = require('path');
    
    const stateFile = path.join(__dirname, 'data/DNA-ARENA-V2/arena-state.json');
    
    try {
        if (!fs.existsSync(stateFile)) {
            console.log(`   ❌ arena-state.json - NÃO ENCONTRADO`);
            return false;
        }
        
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        console.log(`   ✅ Arena V2 Ativa`);
        console.log(`   📊 Geração: ${state.generation}`);
        console.log(`   🔄 Ciclos: ${state.currentCycle}`);
        console.log(`   🤖 Bots: ${state.bots?.length || 0}`);
        
        return true;
    } catch (error: any) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('🧪 DIANA CORP - Teste de Validação Completo');
    console.log('='.repeat(60));
    
    // Test 1: DNA Arena V2
    const arenaOk = await testDNArenaV2();
    
    // Test 2: Champions Files
    const championsOk = await testChampionsFiles();
    
    // Test 3: Binance Connections
    const testnetFutures = await testBinanceConnection('TESTNET', 'FUTURES');
    const testnetSpot = await testBinanceConnection('TESTNET', 'SPOT');
    const mainnetFutures = await testBinanceConnection('MAINNET', 'FUTURES');
    const mainnetSpot = await testBinanceConnection('MAINNET', 'SPOT');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(60));
    
    console.log(`\n🏟️  DNA Arena V2: ${arenaOk ? '✅ OK' : '❌ ERRO'}`);
    console.log(`📁 Champions Files: ${championsOk ? '✅ OK' : '❌ ERRO'}`);
    
    console.log(`\n🔗 Conexões Binance:`);
    console.log(`   Testnet Futures: ${testnetFutures.success ? '✅ OK' : '❌ ERRO'} ${testnetFutures.error === 'SALDO_INSUFICIENTE' ? '(Sem saldo)' : ''}`);
    console.log(`   Testnet Spot: ${testnetSpot.success ? '✅ OK' : '❌ ERRO'} ${testnetSpot.error === 'SALDO_INSUFICIENTE' ? '(Sem saldo)' : ''}`);
    console.log(`   Mainnet Futures: ${mainnetFutures.success ? '✅ OK' : '❌ ERRO'} ${mainnetFutures.error === 'SALDO_INSUFICIENTE' ? '(Sem saldo)' : ''}`);
    console.log(`   Mainnet Spot: ${mainnetSpot.success ? '✅ OK' : '❌ ERRO'} ${mainnetSpot.error === 'SALDO_INSUFICIENTE' ? '(Sem saldo)' : ''}`);
    
    // Final verdict
    const allSuccess = arenaOk && championsOk && 
                       testnetFutures.success && testnetSpot.success && 
                       mainnetFutures.success && mainnetSpot.success;
    
    console.log('\n' + '='.repeat(60));
    if (allSuccess) {
        console.log('✅ TODOS OS TESTES PASSARAM!');
        console.log('   (Erros de saldo são esperados - só configurar depósito)');
    } else {
        console.log('❌ ALGUNS TESTES FALHARAM - Verifique os erros acima');
    }
    console.log('='.repeat(60));
    
    process.exit(allSuccess ? 0 : 1);
}

runAllTests();
