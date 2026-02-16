const Binance = require('node-binance-api');

// Configuração da Binance Testnet
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY || 'your_binance_testnet_api_key_here',
  APISECRET: process.env.BINANCE_SECRET_KEY || 'your_binance_testnet_secret_key_here',
  useServerTime: true,
  test: true, // Usar Testnet
  recvWindow: 60000,
  verbose: true,
  log: (log) => console.log('Binance Log:', log)
});

async function testBinanceConnection() {
  console.log('🔗 Testando conexão com Binance Testnet...');
  console.log('📋 Configurações:');
  console.log('- API Key:', process.env.BINANCE_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
  console.log('- Secret Key:', process.env.BINANCE_SECRET_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
  console.log('- Testnet:', true);
  console.log('- API URL:', 'https://testnet.binance.vision');

  try {
    // Teste 1: Ping
    console.log('\n1️⃣ Testando ping...');
    await binance.ping();
    console.log('✅ Ping bem-sucedido');

    // Teste 2: Informações da conta
    console.log('\n2️⃣ Testando informações da conta...');
    const accountInfo = await binance.account();
    console.log('✅ Informações da conta obtidas:');
    console.log('- Pode negociar:', accountInfo.canTrade);
    console.log('- Pode sacar:', accountInfo.canWithdraw);
    console.log('- Pode depositar:', accountInfo.canDeposit);
    console.log('- Tipo de conta:', accountInfo.accountType);
    console.log('- Balances:', accountInfo.balances.length);

    // Teste 3: Preços
    console.log('\n3️⃣ Testando preços...');
    const prices = await binance.prices('BTCUSDT');
    console.log('✅ Preços obtidos:');
    console.log('- BTC/USDT:', prices.BTCUSDT);

    console.log('\n🎉 Todos os testes passaram! Conexão com Binance Testnet funcionando.');

  } catch (error) {
    console.error('\n❌ Erro na conexão com Binance Testnet:');
    console.error('- Código:', error.code);
    console.error('- Mensagem:', error.message);
    console.error('- Status:', error.status);

    if (error.code === -1022) {
      console.log('\n💡 Solução: Verifique se as credenciais da API estão corretas no arquivo .env');
    } else if (error.code === -2014) {
      console.log('\n💡 Solução: Verifique se a API Key tem as permissões necessárias');
    } else if (error.code === -1021) {
      console.log('\n💡 Solução: Verifique se o horário do sistema está sincronizado');
    }
  }
}

// Carregar variáveis de ambiente
require('dotenv').config();

testBinanceConnection();
