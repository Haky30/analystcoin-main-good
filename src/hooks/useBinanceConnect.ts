import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { encryptApiKeys } from '../utils/crypto';

export function useBinanceConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const connectToBinance = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Open Binance connection modal
      const result = await window.open(
        'https://www.binance.com/en/my/settings/api-management',
        'Connect to Binance',
        'width=600,height=600'
      );

      if (!result) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Handle the API key input
      const apiKey = prompt('Please enter your Binance API Key:');
      const secretKey = prompt('Please enter your Binance Secret Key:');

      if (!apiKey || !secretKey) {
        throw new Error('API keys are required');
      }

      // Encrypt API keys before storing
      const encryptedKeys = encryptApiKeys(apiKey, secretKey);

      // Store encrypted keys in Firestore
      await setDoc(doc(db, 'users', user.uid, 'exchanges', 'binance'), {
        apiKey: encryptedKeys.apiKey,
        secretKey: encryptedKeys.secretKey,
        connected: true,
        connectedAt: new Date().toISOString()
      });

      // Test the connection
      await testBinanceConnection(apiKey);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Binance');
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    connectToBinance,
    isConnecting,
    error
  };
}