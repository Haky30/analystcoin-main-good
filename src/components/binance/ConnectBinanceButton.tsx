import React from 'react';
import { Link } from 'lucide-react';
import { Button } from '../ui/Button';
import { useBinanceConnect } from '../../hooks/useBinanceConnect';

export function ConnectBinanceButton() {
  const { connectToBinance, isConnecting, error } = useBinanceConnect();

  return (
    <div className="space-y-4">
      <Button
        onClick={connectToBinance}
        disabled={isConnecting}
        className="flex items-center gap-2"
      >
        <Link className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Binance Account'}
      </Button>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}