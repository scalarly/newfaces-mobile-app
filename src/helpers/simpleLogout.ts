import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { performLogout } from './authUtils';

/**
 * Simple logout function - now uses the robust logout implementation
 * This is kept for backwards compatibility
 */
export const simpleLogout = async (navigation: NavigationProp<RootStackParamList>) => {
  console.log('🔓 Simple logout (using robust implementation)...');
  return performLogout(navigation);
};

/**
 * Create a simple logout handler - now uses robust logout
 */
export const createSimpleLogoutHandler = (navigation: NavigationProp<RootStackParamList>) => {
  return async () => {
    try {
      await performLogout(navigation);
    } catch (error) {
      console.error('❌ Logout handler failed:', error);
    }
  };
};
