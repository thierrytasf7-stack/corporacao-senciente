import React from 'react';
import { BinanceMarketsPanel } from './BinanceMarketsPanel';

/**
 * MarketsPanel - Painel principal de mercados
 * 
 * Agora utiliza dados REAIS da Binance Testnet em vez de dados fictícios.
 * Permite visualizar todos os mercados disponíveis, organizá-los por categoria
 * e marcar favoritos para análise rotativa.
 */
const MarketsPanel: React.FC = () => {
  return (
    <div className="p-6">
      {/* Painel de mercados reais da Binance Testnet */}
      <BinanceMarketsPanel />
    </div>
  );
};

export default MarketsPanel;