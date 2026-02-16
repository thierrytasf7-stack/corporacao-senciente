const axios = require('axios');
const crypto = require('crypto');

async function testDirectAPI() {
    try {
        console.log('🔍 TESTANDO API DIRETA DA BINANCE TESTNET...');

        const apiKey = 'fNvgZQzCexYFQfGALy03zGXzsDQ3lEoDYLgtRDwdml1HGdmmH51uLKWfAzV4RGyF';
        const secretKey = '80nEJoimIghboxbDbPFuIWHPh5rRaGETWsi7ugYtnPHPa4puFgWG7CP2RSvynFsO';
        const baseUrl = 'https://testnet.binance.vision';

        // Testar endpoint de tempo
        console.log('🕐 Testando endpoint de tempo...');
        const timeResponse = await axios.get(`${baseUrl}/api/v3/time`);
        const serverTime = timeResponse.data.serverTime;
        console.log('✅ Tempo do servidor:', new Date(serverTime));
        console.log('📊 Server time:', serverTime);
        console.log('📊 Local time:', Date.now());
        console.log('📊 Diferença:', serverTime - Date.now(), 'ms');

        // Testar endpoint de informações da conta
        console.log('\n🔗 Testando endpoint de informações da conta...');
        const timestamp = serverTime; // Usar tempo do servidor
        const queryString = `timestamp=${timestamp}`;
        const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');

        console.log('📝 Parâmetros:', {
            timestamp,
            queryString,
            signature: signature.substring(0, 20) + '...'
        });

        const accountResponse = await axios.get(`${baseUrl}/api/v3/account`, {
            params: {
                timestamp,
                signature
            },
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        });

        console.log('✅ Conta acessada com sucesso!');
        console.log('📊 Account Type:', accountResponse.data.accountType);
        console.log('💰 Balances:', accountResponse.data.balances.filter(b => parseFloat(b.free) > 0).length, 'ativos com saldo');

        // Mostrar saldos principais
        const mainBalances = accountResponse.data.balances.filter(b =>
            ['USDT', 'BTC', 'ETH', 'BNB'].includes(b.asset) &&
            (parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        );

        console.log('\n💰 Saldos principais:');
        mainBalances.forEach(balance => {
            const total = parseFloat(balance.free) + parseFloat(balance.locked);
            console.log(`  ${balance.asset}: ${balance.free} (livre) + ${balance.locked} (bloqueado) = ${total.toFixed(8)}`);
        });

    } catch (error) {
        console.error('❌ ERRO:', {
            message: error.message,
            status: error.response?.status,
            code: error.response?.data?.code,
            msg: error.response?.data?.msg
        });
    }
}

testDirectAPI();
