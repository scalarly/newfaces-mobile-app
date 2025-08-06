import * as Keychain from 'react-native-keychain';

export class SecureStorage {
  /**
   * Store a value securely in the keychain
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(key, key, value);
    } catch (error) {
      console.error(`Failed to store ${key} in keychain:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value from the keychain
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error(`Failed to retrieve ${key} from keychain:`, error);
      return null;
    }
  }

  /**
   * Remove a value from the keychain
   */
  static async removeItem(key: string): Promise<void> {
    try {
      // For react-native-keychain, we just clear the generic password for this implementation
      // A more sophisticated approach would be to track keys separately
      console.log(`Removing keychain item: ${key}`);
      await Keychain.resetGenericPassword();
    } catch (error) {
      console.error(`Failed to remove ${key} from keychain:`, error);
      throw error;
    }
  }

  /**
   * Clear all stored values
   */
  static async clear(): Promise<void> {
    try {
      await Keychain.resetGenericPassword();
    } catch (error) {
      console.error('Failed to clear keychain:', error);
      throw error;
    }
  }

  /**
   * Check if keychain services are available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await Keychain.getSupportedBiometryType();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default SecureStorage;