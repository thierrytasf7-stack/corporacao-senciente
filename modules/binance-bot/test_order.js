const crypto = require('crypto');
const axios = require('axios');

const apiKey = process.env.BINANCE_API_KEY;
const secretKey = process.env.BINANCE_SECRET_KEY;

async function testOrder() {
    try {
        const timestamp = Date.now() - 10400;
        const params = {
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'MARKET',
            quantity: '0.0001',
            timestamp
        };

        const queryString = Object.keys(params)
            .sort()
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        const signature = crypto.createHmac('sha256', secretKey)
            .update(queryString)
            .digest('hex');

        const url = `https://testnet.binance.vision/api/v3/order?${queryString}&signature=${signature}`;

        console.log('🔑 Testando ordem real...');
        console.log('Query:', queryString);
        console.log('Signature:', signature);
        console.log('URL:', url);

        const response = await axios.post(url, {}, {
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        });

        console.log('✅ ORDEM EXECUTADA!');
        console.log('Order ID:', response.data.orderId);
        console.log('Status:', response.data.status);
        console.log('Response:', response.data);

    } catch (error) {
        console.log('❌ ERRO NA ORDEM!');
        console.log('Erro:', error.response?.data || error.message);
    }
}

testOrder();
