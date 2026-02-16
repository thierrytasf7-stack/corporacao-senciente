import BinanceRealService from './services/BinanceRealService';

console.log('Testando BinanceRealService...');

const binanceService = new BinanceRealService();
console.log('Status da conexão:', binanceService.isConnectedToBinance());

console.log('BinanceRealService criado com sucesso!');
