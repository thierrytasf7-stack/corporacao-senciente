const crypto = require('crypto');
const axios = require('axios');

async function testSignature() {
    try {
        console.log('🔍 TESTANDO GERAÇÃO DE ASSINATURA...');

        // Configuração
        const apiKey = 'fNvgZQzCexYFQfGALy03zGXzsDQ3lEoDYLgtRDwdml1HGdmmH51uLKWfAzV4RGyF';
        const secretKey = '80nEJoimIghboxbDbPFuIWHPh5rRaGETWsi7ugYtnPHPa4puFgWG7CP2RSvynFsO';
        const baseUrl = 'https://testnet.binance.vision';

        console.log('📋 Configuração:', {
            apiKey: apiKey ? '✅ Configurada' : '❌ Não configurada',
            secretKey: secretKey ? '✅ Configurada' : '❌ Não configurada',
            baseUrl
        });

        if (secretKey === 'your_binance_testnet_secret_key_here') {
            console.log('❌ PROBLEMA: Secret Key ainda é placeholder!');
            console.log('💡 Você precisa configurar a chave secreta real no arquivo development.yml');
            return;
        }

        // Testar endpoint simples primeiro
        console.log('\n🔗 Testando endpoint de tempo do servidor...');
        try {
            const timeResponse = await axios.get(`${baseUrl}/api/v3/time`);
            console.log('✅ Tempo do servidor:', new Date(timeResponse.data.serverTime));
        } catch (error) {
            console.log('❌ Erro ao obter tempo do servidor:', error.message);
        }

        // Testar endpoint de informações da conta
        console.log('\n🔗 Testando endpoint de informações da conta...');

        // Obter tempo do servidor primeiro
        let serverTime;
        try {
            const timeResponse = await axios.get(`${baseUrl}/api/v3/time`);
            serverTime = timeResponse.data.serverTime;
            console.log('🕐 Usando tempo do servidor:', new Date(serverTime));
        } catch (error) {
            console.log('❌ Erro ao obter tempo do servidor, usando timestamp local');
            serverTime = Date.now();
        }

        const timestamp = serverTime;
        const queryString = `timestamp=${timestamp}`;
        const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');

        console.log('📝 Parâmetros:', {
            timestamp,
            queryString,
            signature: signature.substring(0, 20) + '...'
        });

        try {
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

        } catch (error) {
            console.log('❌ Erro ao acessar conta:', {
                status: error.response?.status,
                message: error.response?.data?.msg || error.message,
                code: error.response?.data?.code
            });
        }

    } catch (error) {
        console.error('❌ ERRO geral:', error.message);
    }
}

testSignature();
