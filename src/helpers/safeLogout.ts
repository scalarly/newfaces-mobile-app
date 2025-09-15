import { NavigationProp, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';

/**
 * Safe logout implementation following React Native 2025 best practices
 * Avoids bridge casting errors by minimizing native module interactions
 */
export const safeLogout = async (navigation: NavigationProp<RootStackParamList>) => {
  console.log('🔓 Starting safe logout (2025 best practices)...');
  
  // Step 1: Clear AsyncStorage first (most reliable)
  const tokensToRemove = ['userToken', 'leadID', 'userProfile', 'lastLogin', 'appState'];
  
  try {
    console.log('🧹 Clearing AsyncStorage tokens...');
    await AsyncStorage.multiRemove(tokensToRemove);
    console.log('✅ AsyncStorage cleared successfully');
    
    // Verify removal
    const remainingTokens = await AsyncStorage.multiGet(tokensToRemove);
    const stillPresent = remainingTokens.filter(([key, value]) => value !== null);
    
    if (stillPresent.length === 0) {
      console.log('✅ All AsyncStorage tokens verified as removed');
    } else {
      console.warn('⚠️ Some tokens still present:', stillPresent.map(([key]) => key));
    }
  } catch (error) {
    console.error('❌ AsyncStorage clearing failed:', error);
    // Don't fail logout for this
  }
  
  // Step 2: Clear SecureStorage with ultra-safe approach (avoid bridge issues)
  try {
    console.log('🔐 Attempting minimal SecureStorage cleanup...');
    
    // Use react-native-keychain directly with minimal operations
    const Keychain = require('react-native-keychain');
    
    // Try to clear tokens with minimal bridge interaction
    const secureTokens = ['userToken', 'leadID'];
    
    for (const token of secureTokens) {
      try {
        // Set a very short timeout to avoid bridge hanging
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Keychain timeout')), 1500);
        });
        
        const removePromise = new Promise<void>((resolve, reject) => {
          try {
            Keychain.resetInternetCredentials(token)
              .then(() => {
                console.log(`✅ Keychain ${token} removed`);
                resolve();
              })
              .catch((error: any) => {
                console.warn(`⚠️ Keychain ${token} removal failed:`, error);
                resolve(); // Don't reject, just continue
              });
          } catch (syncError) {
            console.warn(`⚠️ Keychain ${token} sync error:`, syncError);
            resolve(); // Don't reject, just continue
          }
        });
        
        await Promise.race([removePromise, timeoutPromise]);
      } catch (tokenError) {
        console.warn(`⚠️ Keychain ${token} operation failed:`, tokenError);
        // Continue with other tokens
      }
    }
    
    console.log('✅ Keychain cleanup completed (with possible warnings)');
  } catch (keychainError) {
    console.warn('⚠️ Keychain cleanup failed entirely, continuing logout:', keychainError);
    // Don't fail logout for this - AsyncStorage clearing is sufficient
  }
  
  // Step 3: Wait for all async operations to complete
  console.log('⏱️ Waiting for cleanup to complete...');
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Step 4: Navigate using the safest method
  console.log('🔄 Navigating to Login screen...');
  
  try {
    // Use the most compatible navigation approach
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    
    // Find the root navigator safely
    let rootNavigation = navigation;
    let depth = 0;
    
    while (rootNavigation.getParent() && depth < 10) {
      const parent = rootNavigation.getParent();
      if (parent) {
        rootNavigation = parent;
        depth++;
      } else {
        break;
      }
    }
    
    console.log(`🔍 Using navigation at depth ${depth}`);
    rootNavigation.dispatch(resetAction);
    
    console.log('✅ Navigation completed successfully');
    
  } catch (navError) {
    console.error('❌ Navigation failed:', navError);
    
    // Fallback: try simple navigation
    try {
      (navigation as any).navigate('Login');
      console.log('✅ Fallback navigation successful');
    } catch (fallbackError) {
      console.error('❌ All navigation attempts failed:', fallbackError);
      throw new Error('Unable to navigate after logout');
    }
  }
  
  console.log('🎉 Safe logout completed successfully');
};

/**
 * Create a safe logout handler
 */
export const createSafeLogoutHandler = (navigation: NavigationProp<RootStackParamList>) => {
  return async () => {
    try {
      await safeLogout(navigation);
    } catch (error) {
      console.error('❌ Safe logout handler failed:', error);
      
      // Last resort: force navigation only
      try {
        const resetAction = CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        navigation.dispatch(resetAction);
        console.log('✅ Emergency navigation completed');
      } catch (emergencyError) {
        console.error('❌ Emergency navigation failed:', emergencyError);
      }
    }
  };
};

/**
 * Minimal logout that only handles essential operations
 * Use this if all other methods fail
 */
export const minimalLogout = async (navigation: NavigationProp<RootStackParamList>) => {
  console.log('🔓 Minimal logout (emergency mode)...');
  
  try {
    // Only clear AsyncStorage
    await AsyncStorage.multiRemove(['userToken', 'leadID']);
    console.log('✅ Essential tokens cleared');
  } catch (error) {
    console.warn('⚠️ Token clearing failed:', error);
  }
  
  // Simple navigation
  try {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
    console.log('✅ Minimal logout completed');
  } catch (error) {
    console.error('❌ Minimal logout navigation failed:', error);
    throw error;
  }
};
