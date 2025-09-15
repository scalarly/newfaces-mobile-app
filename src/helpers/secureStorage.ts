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
   * Remove a value from the keychain with verification
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      console.log(`🔍 Removing keychain item: ${key}`);
      
      // Use resetInternetCredentials to match the setInternetCredentials/getInternetCredentials pattern
      const result = await Keychain.resetInternetCredentials(key);
      console.log(`✅ Keychain reset result for ${key}:`, result);
      
      // Verify the item was actually removed
      try {
        const verifyResult = await Keychain.getInternetCredentials(key);
        if (verifyResult && verifyResult.password) {
          console.warn(`⚠️ ${key} still exists after removal attempt`);
          return false;
        } else {
          console.log(`✅ Verified ${key} was successfully removed`);
          return true;
        }
      } catch (verifyError) {
        // If getInternetCredentials throws an error, it likely means the item doesn't exist
        console.log(`✅ ${key} removal verified (not found in keychain)`);
        return true;
      }
    } catch (error) {
      console.error(`❌ Failed to remove ${key} from keychain:`, error);
      return false;
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