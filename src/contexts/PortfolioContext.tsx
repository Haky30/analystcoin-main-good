import React, { createContext, useContext, useState, useEffect } from 'react';
import { binanceService } from '../services/binanceService';
import { useAuth } from './AuthContext';

interface Balance {
  asset: string;
  free: string;
  locked: string;
}

interface PortfolioContextType {
  assets: Balance[];
  totalValue: {
    usdt: string;
    btc: string;
  };
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Balance[]>([]);
  const [totalValue, setTotalValue] = useState({ usdt: '0', btc: '0' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPortfolio = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const accountInfo = await binanceService.getAccountInfo();
      
      setAssets(accountInfo.balances);
      setTotalValue({
        usdt: accountInfo.totalUSDTValue || '0',
        btc: accountInfo.totalBTCValue || '0'
      });
    } catch (err) {
      setError('Failed to load portfolio data');
      console.error('Portfolio loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshPortfolio();
      const interval = setInterval(refreshPortfolio, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    assets,
    totalValue,
    loading,
    error,
    refreshPortfolio
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}