import { NavigationProp, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureStorage from './secureStorage';
import { RootStackParamList } from '../navigation/types';

/**
 * Robust logout utility function
 * Ensures complete token cleanup before navigation
 */
export const performLogout = async (navigation: NavigationProp<RootStackParamList>) => {
  console.log('🔓 Starting robust logout process...');
  
  const tokensToRemove = ['userToken', 'leadID'];
  const clearResults = {
    secureStorage: { success: 0, failed: 0 },
    asyncStorage: { success: 0, failed: 0 }
  };
  
  // Step 1: Clear all tokens from SecureStorage with verification
  console.log('🧹 Clearing SecureStorage tokens...');
  for (const tokenKey of tokensToRemove) {
    try {
      const removalSuccess = await SecureStorage.removeItem(tokenKey);
      
      if (removalSuccess) {
        console.log(`✅ SecureStorage ${tokenKey} cleared and verified`);
        clearResults.secureStorage.success++;
      } else {
        console.warn(`⚠️ SecureStorage ${tokenKey} removal failed or still exists`);
        clearResults.secureStorage.failed++;
        
        // Try alternative clearing method
        try {
          await SecureStorage.clear();
          console.log(`🔄 Attempted full SecureStorage clear for ${tokenKey}`);
          
          // Check if it's cleared now
          const recheckToken = await SecureStorage.getItem(tokenKey);
          if (recheckToken === null) {
            console.log(`✅ Full clear succeeded for ${tokenKey}`);
            clearResults.secureStorage.success++;
            clearResults.secureStorage.failed--;
          }
        } catch (clearError) {
          console.error(`❌ Full SecureStorage clear failed for ${tokenKey}:`, clearError);
        }
      }
    } catch (error) {
      console.error(`❌ SecureStorage ${tokenKey} removal failed:`, error);
      clearResults.secureStorage.failed++;
    }
  }
  
  // Step 2: Clear all tokens from AsyncStorage with verification
  console.log('🧹 Clearing AsyncStorage tokens...');
  for (const tokenKey of tokensToRemove) {
    try {
      await AsyncStorage.removeItem(tokenKey);
      
      // Verify token was actually removed
      const verifyToken = await AsyncStorage.getItem(tokenKey);
      if (verifyToken === null) {
        console.log(`✅ AsyncStorage ${tokenKey} cleared and verified`);
        clearResults.asyncStorage.success++;
      } else {
        console.warn(`⚠️ AsyncStorage ${tokenKey} still exists after removal attempt`);
        clearResults.asyncStorage.failed++;
        
        // Force remove with multiRemove
        try {
          await AsyncStorage.multiRemove([tokenKey]);
          console.log(`🔄 Attempted multiRemove for ${tokenKey}`);
        } catch (multiError) {
          console.error(`❌ AsyncStorage multiRemove failed for ${tokenKey}:`, multiError);
        }
      }
    } catch (error) {
      console.error(`❌ AsyncStorage ${tokenKey} removal failed:`, error);
      clearResults.asyncStorage.failed++;
    }
  }
  
  // Step 3: Log cleanup summary
  console.log('📊 Token cleanup summary:', {
    secureStorage: clearResults.secureStorage,
    asyncStorage: clearResults.asyncStorage,
    totalSuccess: clearResults.secureStorage.success + clearResults.asyncStorage.success,
    totalFailed: clearResults.secureStorage.failed + clearResults.asyncStorage.failed
  });
  
  // Step 4: Additional cleanup - clear any cached user data
  try {
    // Clear any other user-related data
    await AsyncStorage.multiRemove(['userProfile', 'lastLogin', 'appState']);
    console.log('✅ Additional user data cleared');
  } catch (error) {
    console.warn('⚠️ Additional cleanup failed:', error);
  }
  
  // Step 5: Wait a moment to ensure all async operations complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Step 6: Navigate to Login screen
  console.log('🔍 Navigating to Login screen...');
  
  const resetAction = CommonActions.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
  
  // Try multiple navigation approaches
  let navigationSuccess = false;
  
  // Approach 1: Direct dispatch
  try {
    navigation.dispatch(resetAction);
    navigationSuccess = true;
    console.log('✅ Direct navigation to Login completed');
  } catch (error) {
    console.warn('⚠️ Direct dispatch failed:', error);
  }
  
  // Approach 2: Root navigator dispatch
  if (!navigationSuccess) {
    try {
      let rootNavigation = navigation;
      let attempts = 0;
      
      while (rootNavigation.getParent() && attempts < 5) {
        const parent = rootNavigation.getParent();
        if (parent) {
          rootNavigation = parent;
          attempts++;
        } else {
          break;
        }
      }
      
      rootNavigation.dispatch(resetAction);
      navigationSuccess = true;
      console.log('✅ Root navigation to Login completed');
    } catch (error) {
      console.warn('⚠️ Root navigation failed:', error);
    }
  }
  
  // Approach 3: Simple navigate as last resort
  if (!navigationSuccess) {
    try {
      (navigation as any).navigate('Login');
      navigationSuccess = true;
      console.log('✅ Fallback navigation to Login completed');
    } catch (error) {
      console.error('❌ All navigation approaches failed:', error);
    }
  }
  
  if (!navigationSuccess) {
    console.error('❌ CRITICAL: Unable to navigate to Login screen after logout');
    throw new Error('Navigation to Login screen failed after logout');
  }
  
  console.log('🎉 Robust logout completed successfully');
};

/**
 * Create a logout handler for a given navigation instance
 */
export const createLogoutHandler = (navigation: NavigationProp<RootStackParamList>) => {
  return async () => {
    try {
      console.log('🔍 createLogoutHandler: Starting logout handler...');
      await performLogout(navigation);
      console.log('✅ createLogoutHandler: Logout handler completed successfully');
    } catch (error) {
      console.error('❌ Logout handler failed:', error);
      // Don't rethrow - we want to prevent crashes
    }
  };
};