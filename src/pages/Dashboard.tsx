import React from 'react';
import { Activity, Bell, Wallet } from 'lucide-react';
import { BinanceConnect } from '../components/BinanceConnect';
import { Portfolio } from '../components/Portfolio';
import { usePortfolio } from '../contexts/PortfolioContext';
import { toast } from 'react-hot-toast';

export function Dashboard() {
  const { assets, totalValue, loading, error, refreshPortfolio } = usePortfolio();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

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

        <div className="grid md:grid-cols-3 gap-6">
          <Portfolio assets={assets} isLoading={loading} />
          
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Alertes Actives</h2>
            <div className="text-3xl font-bold">3</div>
            <div className="text-gray-400 text-sm">Objectifs de prix proches</div>
          </div>
        </div>
      </div>
    </div>
  );
}