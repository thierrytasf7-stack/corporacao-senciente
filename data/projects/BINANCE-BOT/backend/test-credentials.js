const Binance = require('node-binance-api');

async function testCredentials() {
  console.log('🧪 Testando credenciais da Binance Testnet...');
  
  const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY || '',
    APISECRET: process.env.BINANCE_SECRET_KEY || '',
    useServerTime: true,
    test: true,
    recvWindow: 60000,
    verbose: true
  });

  try {
    console.log('🔑 API Key:', process.env.BINANCE_API_KEY ? 'Configurada' : 'Não configurada');
    console.log('🔑 Secret Key:', process.env.BINANCE_SECRET_KEY ? 'Configurada' : 'Não configurada');
    
    // Testar ping
    console.log('🔗 Testando ping...');
    const ping = await binance.ping();
    console.log('✅ Ping:', ping);
    
    // Testar server time
    console.log('⏰ Testando server time...');
    const time = await binance.time();
    console.log('✅ Server time:', time);
    
    // Testar account info (requer autenticação)
    console.log('👤 Testando account info...');
    const account = await binance.account();
    console.log('✅ Account info obtida');
    console.log('💰 Balances:', account.balances.length, 'ativos');
    
    console.log('🎉 Todas as credenciais estão funcionando!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('🔍 Detalhes:', error);
    
    if (error.message.includes('API-key format invalid')) {
      console.log('💡 Solução: Gere novas credenciais em https://testnet.binance.vision/');
    }
  }
}

testCredentials();
