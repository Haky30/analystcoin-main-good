import React, { useState, useEffect } from 'react';
import { Activity, Bell, Wallet } from 'lucide-react';
import { BinanceConnect } from '../components/BinanceConnect';
import { Portfolio } from '../components/Portfolio';
import { binanceService } from '../services/binanceService';
import { toast } from 'react-hot-toast';

interface Balance {
  asset: string;
  free: string;
  locked: string;
}

interface Position {
  symbol: string;
  entryPrice: string;
  markPrice: string;
  positionAmt: string;
  unrealizedProfit: string;
}

interface PriceChange {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
}

export function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [assets, setAssets] = useState<Balance[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState({ usdt: '0', btc: '0' });
  const [topPerformers, setTopPerformers] = useState<PriceChange[]>([]);

  const loadAccountData = async () => {
    setIsLoading(true);
    try {
      const [accountInfo, performers] = await Promise.all([
        binanceService.getAccountInfo(),
        binanceService.getTopPerformers()
      ]);
      
      setAssets(accountInfo.balances);
      setTotalValue({
        usdt: accountInfo.totalUSDTValue,
        btc: accountInfo.totalBTCValue
      });
      setTopPerformers(performers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBinanceConnect = async (apiKey: string, secretKey: string) => {
    setIsLoading(true);
    try {
      binanceService.setCredentials({ apiKey, secretKey });
      const isConnected = await binanceService.testConnection();
      
      if (isConnected) {
        setIsConnected(true);
        await loadAccountData();
        toast.success('Connexion à Binance réussie !');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Erreur de connexion à Binance');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les données toutes les 30 secondes
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(loadAccountData, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {!isConnected ? (
          <BinanceConnect onConnect={handleBinanceConnect} />
        ) : (
          <>
            {/* Valeur totale du portfolio */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Valeur Totale (USDT)</h2>
                <div className="text-3xl font-bold">${totalValue.usdt}</div>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Valeur Totale (BTC)</h2>
                <div className="text-3xl font-bold">₿{totalValue.btc}</div>
              </div>
            </div>

            {/* Grid principale */}
            <div className="grid md:grid-cols-3 gap-6">
              <Portfolio assets={assets} isLoading={isLoading} />
              
              {/* Top Performers */}
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Top 24h</h2>
                {topPerformers.map((coin) => (
                  <div key={coin.symbol} className="flex justify-between items-center mb-2">
                    <span>{coin.symbol.replace('USDT', '')}</span>
                    <span className={parseFloat(coin.priceChangePercent) > 0 ? 'text-green-500' : 'text-red-500'}>
                      {parseFloat(coin.priceChangePercent).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Alertes Actives */}
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Alertes Actives</h2>
                <div className="text-3xl font-bold">3</div>
                <div className="text-gray-400 text-sm">Objectifs de prix proches</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}