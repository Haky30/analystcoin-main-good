import CryptoJS from 'crypto-js';

const ITERATIONS = 25000; // Increased from 1000 to 25000 for better security

interface EncryptedData {
  iv: string;
  apiKey: string;
  secretKey: string;
}

export function encryptApiKeys(apiKey: string, secretKey: string, salt: string): EncryptedData {
  // Generate a random IV
  const iv = CryptoJS.lib.WordArray.random(16);

  // Derive a key from the salt using PBKDF2
  const key = CryptoJS.PBKDF2(salt, CryptoJS.enc.Utf8.parse(salt), {
    keySize: 256 / 32,
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256
  });

  // Encrypt the API key
  const encryptedApiKey = CryptoJS.AES.encrypt(apiKey, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();

  // Encrypt the secret key
  const encryptedSecretKey = CryptoJS.AES.encrypt(secretKey, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();

  return {
    iv: iv.toString(),
    apiKey: encryptedApiKey,
    secretKey: encryptedSecretKey
  };
}

export function decryptApiKeys(encryptedApiKey: string, encryptedSecretKey: string, iv: string, salt: string) {
  try {
    // Parse the IV from the string
    const parsedIv = CryptoJS.enc.Hex.parse(iv);

    // Derive the key from the salt using PBKDF2
    const key = CryptoJS.PBKDF2(salt, CryptoJS.enc.Utf8.parse(salt), {
      keySize: 256 / 32,
      iterations: ITERATIONS,
      hasher: CryptoJS.algo.SHA256
    });

    // Decrypt the API key
    const decryptedApiKey = CryptoJS.AES.decrypt(encryptedApiKey, key, {
      iv: parsedIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);

    // Decrypt the secret key
    const decryptedSecretKey = CryptoJS.AES.decrypt(encryptedSecretKey, key, {
      iv: parsedIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);

    if (!decryptedApiKey || !decryptedSecretKey) {
      throw new Error('Failed to decrypt API keys');
    }

    return {
      apiKey: decryptedApiKey,
      secretKey: decryptedSecretKey
    };
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API keys');
  }
}