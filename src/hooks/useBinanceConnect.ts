import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { encryptApiKeys } from '../utils/crypto';
import CryptoJS from 'crypto-js';
import { toast } from 'react-hot-toast';

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

      // Generate a unique salt for the user
      const userSalt = CryptoJS.lib.WordArray.random(16).toString();

      // Encrypt API keys with the unique salt
      const encryptedData = encryptApiKeys(apiKey, secretKey, userSalt);

      // Store encrypted keys, IV, and salt in Firestore
      await setDoc(doc(db, 'users', user.uid, 'exchanges', 'binance'), {
        apiKey: encryptedData.apiKey,
        secretKey: encryptedData.secretKey,
        iv: encryptedData.iv,
        salt: userSalt,
        connected: true,
        connectedAt: new Date().toISOString()
      });

      toast.success('Successfully connected to Binance!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Binance';
      setError(errorMessage);
      toast.error(errorMessage);
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