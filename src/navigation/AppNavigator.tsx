import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SecureStorage } from '../helpers/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import {
  LoginScreen,
  ForgotPasswordScreen,
  EmailScreen,
  SMSScreen,
  NotificationScreen,
  PaymentsScreen,
  EMIScreen,
  SwitchUserScreen,
  LoaderScreen,
  // NotificationDebugScreen, // Removed for production
} from '../screens';
// import DebugAPIScreen from '../screens/DebugAPIScreen'; // Removed for production
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';

// Re-export types for convenience
export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main App Navigator
const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Enhanced authentication check with better reliability
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Starting enhanced auth check...');
        
        let userToken: string | null = null;
        let tokenSource = 'none';
        
        // Step 1: Try SecureStorage first with timeout
        try {
          const timeoutPromise = new Promise<string | null>((_, reject) => {
            setTimeout(() => reject(new Error('SecureStorage timeout')), 3000);
          });
          
          const securePromise = SecureStorage.getItem('userToken');
          userToken = await Promise.race([securePromise, timeoutPromise]);
          
          if (userToken) {
            tokenSource = 'SecureStorage';
            console.log('✅ SecureStorage auth check successful');
          }
        } catch (secureError) {
          console.warn('⚠️ SecureStorage failed, trying AsyncStorage fallback:', secureError);
        }
        
        // Step 2: If no token from SecureStorage, try AsyncStorage
        if (!userToken) {
          try {
            userToken = await AsyncStorage.getItem('userToken');
            if (userToken) {
              tokenSource = 'AsyncStorage';
              console.log('✅ AsyncStorage fallback successful');
            }
          } catch (asyncError) {
            console.error('❌ AsyncStorage also failed:', asyncError);
          }
        }
        
        // Step 3: Validate token if found
        let isValidToken = false;
        if (userToken) {
          console.log(`🔍 Found token from ${tokenSource}, validating...`);
          
          // Basic token validation
          if (userToken.length > 10 && !userToken.includes('null') && !userToken.includes('undefined')) {
            isValidToken = true;
            console.log('✅ Token appears valid');
            
            // Optional: Verify token with backend (uncomment if needed)
            // try {
            //   const { apiService } = await import('../helpers/request');
            //   await apiService.get('me');
            //   console.log('✅ Token verified with backend');
            // } catch (verifyError) {
            //   console.warn('⚠️ Token verification failed:', verifyError);
            //   isValidToken = false;
            //   
            //   // Clear invalid token
            //   try {
            //     await SecureStorage.removeItem('userToken');
            //     await AsyncStorage.removeItem('userToken');
            //     console.log('🧹 Cleared invalid token');
            //   } catch (clearError) {
            //     console.warn('⚠️ Failed to clear invalid token:', clearError);
            //   }
            // }
          } else {
            console.warn('⚠️ Token appears invalid:', { 
              length: userToken.length, 
              preview: userToken.substring(0, 20) 
            });
          }
        }
        
        const authResult = isValidToken;
        console.log('🔍 Final auth result:', {
          hasToken: !!userToken,
          tokenSource,
          isValidToken,
          authResult
        });
        
        setIsAuthenticated(authResult);
        
        // If authenticated, sync notification token with backend
        if (authResult) {
          try {
            const { notificationService } = await import('../services/NotificationService');
            await notificationService.syncToken();
          } catch (error) {
            console.warn('⚠️ Failed to sync notification token after auth check:', error);
          }
        }
      } catch (error) {
        console.error('❌ Critical error in auth check:', error);
        // On any error, assume not authenticated and proceed
        setIsAuthenticated(false);
      } finally {
        console.log('🔍 Enhanced auth check completed, setting isLoading to false');
        setIsLoading(false);
        console.log('✅ Loading state updated, should now show main navigation');
      }
    };

    // Add absolute timeout as safety net
    const safetyTimeout = setTimeout(() => {
      console.warn('🚨 Auth check taking too long, forcing to login screen');
      setIsAuthenticated(false);
      setIsLoading(false);
    }, 8000);

    checkAuthStatus().finally(() => {
      clearTimeout(safetyTimeout);
    });
  }, []);

  // Show loader while checking authentication
  if (isLoading) {
    console.log('🔄 Rendering LoaderScreen - isLoading:', isLoading);
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <LoaderScreen />
      </>
    );
  }

  console.log('📱 Rendering main navigation - isAuthenticated:', isAuthenticated);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Main" : "Login"}
        screenOptions={{
          headerShown: false, // We'll handle headers in individual screens
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Sign In',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{
            headerShown: false,
            gestureEnabled: false, // Disable swipe back from main tabs
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            title: 'Forgot Password',
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Email"
          component={EmailScreen}
          options={{
            title: 'Email Details',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SMS"
          component={SMSScreen}
          options={{
            title: 'Messages',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            title: 'Notifications',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Payments"
          component={PaymentsScreen}
          options={{
            title: 'Payment Details',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EMI"
          component={EMIScreen}
          options={{
            title: 'EMI Details',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SwitchUser"
          component={SwitchUserScreen}
          options={{
            title: 'Switch User',
            headerShown: false,
            presentation: 'modal',
          }}
        />
        {/* Debug screens removed for production */}
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;