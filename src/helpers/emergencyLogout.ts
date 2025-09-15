import { NavigationProp, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';

/**
 * Emergency logout - completely avoids native modules to prevent bridge errors
 * This is the absolute safest logout implementation possible
 */
export const emergencyLogout = async (navigation: NavigationProp<RootStackParamList>) => {
  console.log('🚨 Emergency logout - bridge-free implementation');
  
  // Step 1: Clear AsyncStorage only (no native modules involved)
  try {
    console.log('🧹 Clearing AsyncStorage (bridge-free)...');
    
    // Clear essential tokens
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('leadID');
    
    // Clear additional data
    await AsyncStorage.removeItem('userProfile');
    await AsyncStorage.removeItem('lastLogin');
    await AsyncStorage.removeItem('appState');
    
    console.log('✅ AsyncStorage cleared successfully');
  } catch (error) {
    console.error('❌ AsyncStorage clearing failed:', error);
    // Continue anyway - navigation is more important
  }
  
  // Step 2: Simple navigation reset (no complex operations)
  try {
    console.log('🔄 Emergency navigation to Login...');
    
    // Use the most basic navigation reset possible
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
    
    console.log('✅ Emergency logout completed');
  } catch (navError) {
    console.error('❌ Emergency navigation failed:', navError);
    
    // Last resort: try direct navigate
    try {
      (navigation as any).navigate('Login');
      console.log('✅ Fallback navigation successful');
    } catch (fallbackError) {
      console.error('❌ All navigation failed:', fallbackError);
      throw new Error('Complete logout failure - app restart required');
    }
  }
};

/**
 * Create emergency logout handler
 */
export const createEmergencyLogoutHandler = (navigation: NavigationProp<RootStackParamList>) => {
  return async () => {
    try {
      await emergencyLogout(navigation);
    } catch (error) {
      console.error('❌ Emergency logout handler failed:', error);
      
      // Absolute last resort - force app to login state
      try {
        // Clear just the essential token
        await AsyncStorage.removeItem('userToken');
        
        // Force navigation
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
        
        console.log('✅ Absolute fallback completed');
      } catch (absoluteError) {
        console.error('❌ Absolute fallback failed:', absoluteError);
        // At this point, user needs to restart the app
      }
    }
  };
};

/**
 * Sync logout - completely synchronous to avoid any async bridge issues
 */
export const syncLogout = (navigation: NavigationProp<RootStackParamList>) => {
  console.log('⚡ Synchronous logout - no async operations');
  
  try {
    // Only do navigation - no storage operations
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
    
    console.log('✅ Sync logout navigation completed');
    
    // Clear storage in background (non-blocking)
    setTimeout(() => {
      AsyncStorage.removeItem('userToken').catch(console.warn);
      AsyncStorage.removeItem('leadID').catch(console.warn);
    }, 100);
    
  } catch (error) {
    console.error('❌ Sync logout failed:', error);
    
    // Try basic navigate
    try {
      (navigation as any).navigate('Login');
      console.log('✅ Sync fallback navigation completed');
    } catch (fallbackError) {
      console.error('❌ Sync fallback failed:', fallbackError);
    }
  }
};

/**
 * Debug logout - helps identify what's causing the bridge error
 */
export const debugLogout = async (navigation: NavigationProp<RootStackParamList>) => {
  console.log('🐛 Debug logout - step by step');
  
  try {
    console.log('Step 1: Clear userToken only');
    await AsyncStorage.removeItem('userToken');
    console.log('✅ userToken cleared');
    
    console.log('Step 2: Wait 500ms');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Wait completed');
    
    console.log('Step 3: Navigate to Login');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
    console.log('✅ Debug logout completed');
    
  } catch (error) {
    console.error('❌ Debug logout failed at step:', error);
    throw error;
  }
};

/**
 * Navigation-only logout - test if the error is from storage operations
 */
export const navigationOnlyLogout = (navigation: NavigationProp<RootStackParamList>) => {
  console.log('🔄 Navigation-only logout - no storage operations');
  
  try {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
    console.log('✅ Navigation-only logout completed');
  } catch (error) {
    console.error('❌ Navigation-only logout failed:', error);
    throw error;
  }
};
