// Simple encryption/decryption utilities for API keys
// Note: In production, use a more secure encryption method

export function encryptApiKeys(apiKey: string, secretKey: string) {
  return {
    apiKey: btoa(apiKey),
    secretKey: btoa(secretKey)
  };
}

export function decryptApiKeys(encryptedApiKey: string, encryptedSecretKey: string) {
  return {
    apiKey: atob(encryptedApiKey),
    secretKey: atob(encryptedSecretKey)
  };
}