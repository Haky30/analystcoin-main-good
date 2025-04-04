import React, { useEffect, useState } from 'react';
import { binanceService } from '../services/binanceService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TopPerformer {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
}

interface MarketData {
  prices: number[][];
  volumes: number[][];
}

const cryptoNames: { [key: string]: string } = {
  'BTCUSDT': 'Bitcoin',
  'ETHUSDT': 'Ethereum',
  'BNBUSDT': 'Binance Coin',
  'XRPUSDT': 'Ripple',
  'ADAUSDT': 'Cardano',
  'DOGEUSDT': 'Dogecoin',
  'MATICUSDT': 'Polygon',
  'SOLUSDT': 'Solana',
  'DOTUSDT': 'Polkadot',
  'TRXUSDT': 'TRON',
  'LTCUSDT': 'Litecoin',
  'AVAXUSDT': 'Avalanche',
  'LINKUSDT': 'Chainlink',
  'ATOMUSDT': 'Cosmos',
  'UNIUSDT': 'Uniswap',
  'ETCUSDT': 'Ethereum Classic',
  'XLMUSDT': 'Stellar',
  'VETUSDT': 'VeChain',
  'ICPUSDT': 'Internet Computer',
  'FILSUSDT': 'Filecoin',
  'AAVEUSDT': 'Aave',
  'ALGOUSDT': 'Algorand',
  'AXSUSDT': 'Axie Infinity',
  'NEOUSDT': 'NEO',
  'QTUMUSDT': 'Qtum',
  'EOSUSDT': 'EOS',
  'IOTAUSDT': 'IOTA',
  'ONTUSDT': 'Ontology',
  'BCCUSDT': 'Bitcoin Cash',
  'PHAUSDT': 'PHA Network',
  'ATAUSDT': 'Automata',
  'IDEXUSDT': 'IDEX',
  'STEEMUSDT': 'Steem',
  'PONDUSDT': 'Marlin',
  'GMTUSDT': 'STEPN',
  'DEXEUSDT': 'DeXe',
  'ACAUSDT': 'Acala',
  'MDTUSDT': 'Measurable Data',
  'ZILUSDT': 'Zilliqa',
  'BATUSDT': 'Basic Attention Token',
  'ZRXUSDT': '0x Protocol',
  'SNXUSDT': 'Synthetix',
  'CRVUSDT': 'Curve DAO',
  'MKRUSDT': 'Maker',
  'COMPUSDT': 'Compound',
  'YFIUSDT': 'yearn.finance',
  'SUSHIUSDT': 'SushiSwap',
  'ENJUSDT': 'Enjin Coin',
  'MANAUSDT': 'Decentraland',
  'SANDUSDT': 'The Sandbox',
  'AUDIOUSDT': 'Audius',
  'CHZUSDT': 'Chiliz',
  'HOTUSDT': 'Holo',
  'RVNUSDT': 'Ravencoin',
  'DASHUSDT': 'Dash',
  'XMRUSDT': 'Monero',
  'KAVAUSDT': 'Kava',
  'RUNEUSDT': 'THORChain',
  'NEARUSDT': 'NEAR Protocol',
  'FTMUSDT': 'Fantom',
  'GALAUSDT': 'Gala',
  'ROSEUSDT': 'Oasis Network',
  'TUSDT': 'TrueUSD'
};

export default function Market() {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [indicators, setIndicators] = useState({
    rsi: 0,
    macd: 0,
    volume24h: 0,
    ma20: 0
  });

  const loadMarketData = async (symbol: string) => {
    try {
      setLoading(true);
      const [klineData, stats] = await Promise.all([
        binanceService.getKlines(symbol, '1d', 30),
        binanceService.get24hrStats(symbol)
      ]);

      // Mise à jour des données du graphique
      setMarketData({
        prices: klineData.map((item: any) => [item[0], parseFloat(item[4])]),
        volumes: klineData.map((item: any) => [item[0], parseFloat(item[5])])
      });

      // Calcul et mise à jour des indicateurs
      const prices = klineData.map((item: any) => parseFloat(item[4]));
      const volume = parseFloat(stats.volume);
      
      // Mise à jour des indicateurs
      setIndicators({
        rsi: calculateRSI(prices), // Vous devrez implémenter cette fonction
        macd: calculateMACD(prices), // Vous devrez implémenter cette fonction
        volume24h: volume,
        ma20: calculateMA(prices, 20) // Vous devrez implémenter cette fonction
      });

    } catch (err) {
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const priceChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedSymbol} Price Chart`,
        color: 'white'
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  const priceChartData = marketData ? {
    labels: marketData.prices.map(item => new Date(item[0]).toLocaleDateString()),
    datasets: [
      {
        label: 'Price',
        data: marketData.prices.map(item => item[1]),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  } : null;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Récupérer tous les symboles disponibles
        const allPairs = await binanceService.get24hrStats();
        const symbols = allPairs.map((pair: any) => pair.symbol)
          .filter((symbol: string) => symbol.endsWith('USDT'));
        setAvailableSymbols(symbols);
        
        // Charger les données initiales
        const data = await binanceService.get24hrStats();
        const sorted = data
          .sort((a: TopPerformer, b: TopPerformer) => 
            parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
          )
          .slice(0, 10);
        setTopPerformers(sorted);
        
        // Charger les données du graphique pour le symbole sélectionné
        await loadMarketData(selectedSymbol);
      } catch (err) {
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    const interval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Market Analysis</h1>
      
      <div className="mb-8">
        <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Price Chart</h2>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-[#212838] text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              {availableSymbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {cryptoNames[symbol] || symbol}
                </option>
              ))}
            </select>
          </div>
          {priceChartData && !loading ? (
            <Line options={priceChartOptions} data={priceChartData} />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <span className="text-gray-400">Loading chart data...</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Technical Indicators for {selectedSymbol}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#212838] p-4 rounded-lg">
              <div className="text-gray-400 text-sm">RSI (14)</div>
              <div className="text-white text-lg font-semibold">
                {indicators.rsi.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#212838] p-4 rounded-lg">
              <div className="text-gray-400 text-sm">MACD</div>
              <div className={`text-${indicators.macd >= 0 ? 'green' : 'red'}-500 text-lg font-semibold`}>
                {indicators.macd >= 0 ? '+' : ''}{indicators.macd.toFixed(4)}
              </div>
            </div>
            <div className="bg-[#212838] p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Volume 24h</div>
              <div className="text-white text-lg font-semibold">
                ${(indicators.volume24h / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="bg-[#212838] p-4 rounded-lg">
              <div className="text-gray-400 text-sm">MA (20)</div>
              <div className="text-white text-lg font-semibold">
                ${indicators.ma20.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1f2e] rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Top Performers (24h)</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading market data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#151a27]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Name</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Change 24h</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">High 24h</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Low 24h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {topPerformers.map((coin) => (
                  <tr key={coin.symbol} className="hover:bg-[#212838] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{cryptoNames[coin.symbol] || coin.symbol}</div>
                      <div className="text-sm text-gray-400">{coin.symbol}</div>
                    </td>
                    <td className={`px-6 py-4 text-right ${
                      parseFloat(coin.priceChangePercent) >= 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {parseFloat(coin.priceChangePercent).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      ${parseFloat(coin.lastPrice).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      ${parseFloat(coin.highPrice).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      ${parseFloat(coin.lowPrice).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}