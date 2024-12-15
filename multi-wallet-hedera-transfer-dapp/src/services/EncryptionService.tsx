import CryptoJS from 'crypto-js';


export class EncryptionService {
  private readonly encryptionKey: string;

  constructor() {
    const envKey = process.env.REACT_APP_ENCRYPTION;
    if (!envKey) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }
    this.encryptionKey = envKey;
  }

  encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey);
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

// Create a singleton instance
export const encryptionService = new EncryptionService();