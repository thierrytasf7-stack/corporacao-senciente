import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import BinanceApiService, {
  BinanceAccountInfo,
  BinanceBalance,
  BinancePosition,
  BinanceTrade,
  PortfolioData
} from '../../services/api/binanceApi';

// Estado inicial
interface BinanceState {
  // Dados da conta
  accountInfo: BinanceAccountInfo | null;

  // Portfolio
  portfolioData: PortfolioData | null;

  // Posições ativas
  activePositions: BinancePosition[];

  // Histórico de trades
  tradeHistory: BinanceTrade[];

  // Saldos
  balances: BinanceBalance[];

  // Estados de loading
  isLoading: {
    accountInfo: boolean;
    portfolio: boolean;
    positions: boolean;
    trades: boolean;
    balances: boolean;
  };

  // Estados de erro
  errors: {
    accountInfo: string | null;
    portfolio: string | null;
    positions: string | null;
    trades: string | null;
    balances: string | null;
  };

  // Status de conexão
  connectionStatus: {
    isConnected: boolean;
    lastTest: string | null; // ISO string instead of Date object
    error: string | null;
  };

  // Credenciais
  credentials: {
    isValid: boolean;
    error: string | null;
  };
}

const initialState: BinanceState = {
  accountInfo: null,
  portfolioData: null,
  activePositions: [],
  tradeHistory: [],
  balances: [],
  isLoading: {
    accountInfo: false,
    portfolio: false,
    positions: false,
    trades: false,
    balances: false,
  },
  errors: {
    accountInfo: null,
    portfolio: null,
    positions: null,
    trades: null,
    balances: null,
  },
  connectionStatus: {
    isConnected: false,
    lastTest: null,
    error: null,
  },
  credentials: {
    isValid: false,
    error: null,
  },
};

// Async thunks
export const testBinanceConnection = createAsyncThunk(
  'binance/testConnection',
  async () => {
    const result = await BinanceApiService.testConnection();
    return result;
  }
);

export const validateBinanceCredentials = createAsyncThunk(
  'binance/validateCredentials',
  async () => {
    const result = await BinanceApiService.validateCredentials();
    return result;
  }
);

export const fetchAccountInfo = createAsyncThunk(
  'binance/fetchAccountInfo',
  async () => {
    const data = await BinanceApiService.getAccountInfo();
    return data;
  }
);

export const fetchPortfolioData = createAsyncThunk(
  'binance/fetchPortfolioData',
  async () => {
    const data = await BinanceApiService.getPortfolioData();
    return data;
  }
);

export const fetchActivePositions = createAsyncThunk(
  'binance/fetchActivePositions',
  async () => {
    const data = await BinanceApiService.getActivePositions();
    return data;
  }
);

export const fetchTradeHistory = createAsyncThunk(
  'binance/fetchTradeHistory',
  async ({ symbol, limit }: { symbol?: string; limit?: number }) => {
    const data = await BinanceApiService.getTradeHistory(symbol, limit);
    return data;
  }
);

export const fetchBalances = createAsyncThunk(
  'binance/fetchBalances',
  async () => {
    const data = await BinanceApiService.getBalances();
    return data;
  }
);

// Slice
const binanceSlice = createSlice({
  name: 'binance',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {
        accountInfo: null,
        portfolio: null,
        positions: null,
        trades: null,
        balances: null,
      };
    },
    clearConnectionError: (state) => {
      state.connectionStatus.error = null;
    },
    clearCredentialsError: (state) => {
      state.credentials.error = null;
    },
  },
  extraReducers: (builder) => {
    // Test Connection
    builder
      .addCase(testBinanceConnection.pending, (state) => {
        state.connectionStatus.isConnected = false;
        state.connectionStatus.error = null;
      })
      .addCase(testBinanceConnection.fulfilled, (state, action) => {
        state.connectionStatus.isConnected = action.payload.success;
        state.connectionStatus.lastTest = new Date().toISOString(); // Já está correto como string ISO
        if (!action.payload.success) {
          state.connectionStatus.error = action.payload.error || 'Falha na conexão';
        }
      })
      .addCase(testBinanceConnection.rejected, (state, action) => {
        state.connectionStatus.isConnected = false;
        state.connectionStatus.error = action.error.message || 'Erro crítico na conexão';
      });

    // Validate Credentials
    builder
      .addCase(validateBinanceCredentials.pending, (state) => {
        state.credentials.error = null;
      })
      .addCase(validateBinanceCredentials.fulfilled, (state, action) => {
        state.credentials.isValid = action.payload.valid;
        if (!action.payload.valid) {
          state.credentials.error = action.payload.error || 'Credenciais inválidas';
        }
      })
      .addCase(validateBinanceCredentials.rejected, (state, action) => {
        state.credentials.isValid = false;
        state.credentials.error = action.error.message || 'Erro crítico na validação';
      });

    // Fetch Account Info
    builder
      .addCase(fetchAccountInfo.pending, (state) => {
        state.isLoading.accountInfo = true;
        state.errors.accountInfo = null;
      })
      .addCase(fetchAccountInfo.fulfilled, (state, action) => {
        state.isLoading.accountInfo = false;
        state.accountInfo = action.payload;
      })
      .addCase(fetchAccountInfo.rejected, (state, action) => {
        state.isLoading.accountInfo = false;
        state.errors.accountInfo = action.error.message || 'Erro crítico ao carregar dados da conta';
      });

    // Fetch Portfolio Data
    builder
      .addCase(fetchPortfolioData.pending, (state) => {
        state.isLoading.portfolio = true;
        state.errors.portfolio = null;
      })
      .addCase(fetchPortfolioData.fulfilled, (state, action) => {
        state.isLoading.portfolio = false;
        state.portfolioData = action.payload;
      })
      .addCase(fetchPortfolioData.rejected, (state, action) => {
        state.isLoading.portfolio = false;
        state.errors.portfolio = action.error.message || 'Erro crítico ao carregar portfolio';
      });

    // Fetch Active Positions
    builder
      .addCase(fetchActivePositions.pending, (state) => {
        state.isLoading.positions = true;
        state.errors.positions = null;
      })
      .addCase(fetchActivePositions.fulfilled, (state, action) => {
        state.isLoading.positions = false;

        // Garantir que sempre armazenamos um array
        if (Array.isArray(action.payload)) {
          state.activePositions = action.payload;
        } else if (action.payload && typeof action.payload === 'object' && action.payload.data && Array.isArray(action.payload.data)) {
          // Se for um objeto com propriedade data, extrair o array
          state.activePositions = action.payload.data;
        } else {
          // Fallback para array vazio
          state.activePositions = [];
        }
      })
      .addCase(fetchActivePositions.rejected, (state, action) => {
        state.isLoading.positions = false;
        state.errors.positions = action.error.message || 'Erro crítico ao carregar posições';
      });

    // Fetch Trade History
    builder
      .addCase(fetchTradeHistory.pending, (state) => {
        state.isLoading.trades = true;
        state.errors.trades = null;
      })
      .addCase(fetchTradeHistory.fulfilled, (state, action) => {
        state.isLoading.trades = false;
        state.tradeHistory = action.payload;
      })
      .addCase(fetchTradeHistory.rejected, (state, action) => {
        state.isLoading.trades = false;
        state.errors.trades = action.error.message || 'Erro crítico ao carregar histórico';
      });

    // Fetch Balances
    builder
      .addCase(fetchBalances.pending, (state) => {
        state.isLoading.balances = true;
        state.errors.balances = null;
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.isLoading.balances = false;

        // Garantir que sempre armazenamos um array
        if (Array.isArray(action.payload)) {
          state.balances = action.payload;
        } else if (action.payload && typeof action.payload === 'object' && action.payload.data && Array.isArray(action.payload.data)) {
          // Se for um objeto com propriedade data, extrair o array
          state.balances = action.payload.data;
        } else {
          // Fallback para array vazio
          state.balances = [];
        }
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.isLoading.balances = false;
        state.errors.balances = action.error.message || 'Erro crítico ao carregar saldos';
      });
  },
});

export const { clearErrors, clearConnectionError, clearCredentialsError } = binanceSlice.actions;
export default binanceSlice.reducer;
