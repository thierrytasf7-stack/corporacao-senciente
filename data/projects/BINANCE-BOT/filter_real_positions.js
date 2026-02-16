const fs = require('fs');

// Ler o arquivo de posições
const positionsData = JSON.parse(fs.readFileSync('backend/data/positions.json', 'utf8'));

// Filtrar apenas posições reais (sem TEST_)
const realPositions = positionsData.positions.filter(pos =>
    !pos.id.includes('TEST_') &&
    !String(pos.orderId).includes('TEST_') &&
    pos.source === 'SYSTEM' &&
    typeof pos.orderId === 'number'
);

console.log(`Posições originais: ${positionsData.positions.length}`);
console.log(`Posições reais: ${realPositions.length}`);

// Criar novo objeto com apenas posições reais
const filteredData = {
    positions: realPositions,
    lastUpdate: new Date().toISOString(),
    version: "1.0.0"
};

// Salvar arquivo filtrado
fs.writeFileSync('backend/data/positions.json', JSON.stringify(filteredData, null, 2));

console.log('✅ Arquivo de posições filtrado com sucesso!');
console.log('📊 Apenas posições reais da Binance Testnet mantidas.');
