import React, { useEffect, useRef } from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './navigation/AppNavigator';
import { notificationService } from './services/NotificationService';
import { useNotifications } from './hooks/useNotifications';
import messaging from '@react-native-firebase/messaging';

// Initialize i18n
import './locales/i18n';

// Suppress Firebase deprecation warnings during transition period
// TODO: Remove this once React Native Firebase fully implements modular API
(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

// Register background message handler at the top level
// This must be done outside of any component or class
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📱 Received background message:', remoteMessage);
  // Background messages are automatically displayed by the system
  // We can perform data processing here if needed
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Custom theme configuration
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0052CD',
    secondary: '#3498db',
    surface: '#ffffff',
    background: '#f5f5f5',
  },
};

/**
 * Notification-aware app wrapper component
 */
const AppWithNotifications: React.FC = () => {
  const navigationRef = useRef<any>(null);

  // Initialize notifications with navigation reference
  const { token, isEnabled, isLoading, error } = useNotifications({
    autoInitialize: true,
    navigationRef,
  });

  useEffect(() => {
    // Set navigation reference for notification service
    if (navigationRef.current) {
      notificationService.setNavigationRef(navigationRef);
    }
  }, []);

  // Log notification status for debugging
  useEffect(() => {
    if (!isLoading) {
      console.log('🔔 Notification Status:', {
        token: token ? `${token.substring(0, 20)}...` : null,
        isEnabled,
        error,
      });
    }
  }, [token, isEnabled, isLoading, error]);

  // Add debug logging for App component
  console.log('🚀 AppWithNotifications rendering - isLoading:', isLoading);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
};

/**
 * Main App Component
 * 
 * This is the root component that sets up:
 * - React Native Paper theme provider
 * - Safe area provider for proper spacing
 * - React Query client for API state management
 * - Push notification service
 * - Navigation container
 */
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppWithNotifications />
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;