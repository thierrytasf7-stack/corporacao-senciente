// Rota para colocar ordens REAIS
app.post('/api/v1/binance/order', async (req, res) => {
    try {
        const { symbol, side, type, quantity, price, timeInForce } = req.body;
        console.log('🚀 [ORDEM REAL] Colocando ordem na Binance:', { symbol, side, type, quantity, price, timeInForce });

        if (!symbol || !side || !type || !quantity) {
            return res.status(400).json({ success: false, message: 'Parâmetros obrigatórios: symbol, side, type, quantity' });
        }

        if (!binanceService) {
            return res.status(500).json({ success: false, message: 'Serviço Binance não inicializado' });
        }

        const orderData = {
            symbol,
            side: side.toUpperCase(),
            type: type.toUpperCase(),
            quantity: quantity.toString()
        };

        if (price) orderData.price = price.toString();
        if (timeInForce) orderData.timeInForce = timeInForce;

        const result = await binanceService.placeOrder(orderData);
        console.log('✅ [ORDEM SUCESSO] Ordem executada com sucesso:', result);

        res.json({
            success: true,
            message: 'Ordem executada com sucesso na Binance',
            data: result
        });

    } catch (error) {
        console.error('❌ [ORDEM ERRO] Erro ao executar ordem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao executar ordem na Binance',
            error: error?.message || 'Erro desconhecido'
        });
    }
});

