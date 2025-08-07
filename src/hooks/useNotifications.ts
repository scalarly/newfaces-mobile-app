import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { 
  notificationService, 
  NotificationPayload, 
  NotificationType 
} from '../services/NotificationService';

/**
 * Hook return type
 */
export interface UseNotificationsReturn {
  /** Current push token */
  token: string | null;
  /** Whether notifications are enabled */
  isEnabled: boolean;
  /** Whether the service is initializing */
  isLoading: boolean;
  /** Any initialization error */
  error: string | null;
  /** Request notification permissions */
  requestPermissions: () => Promise<boolean>;
  /** Show permission alert */
  showPermissionAlert: () => void;
  /** Display a local notification immediately */
  displayLocalNotification: (payload: NotificationPayload) => Promise<void>;
  /** Schedule a local notification */
  scheduleLocalNotification: (payload: NotificationPayload, scheduleDate?: Date) => Promise<void>;
  /** Cancel all notifications */
  cancelAllNotifications: () => Promise<void>;
  /** Check notification settings */
  getNotificationSettings: () => Promise<any>;
  /** Get current token */
  refreshToken: () => Promise<string | null>;
  /** Send test notification */
  sendTestNotification: () => Promise<void>;
}

/**
 * Hook options
 */
export interface UseNotificationsOptions {
  /** Auto-initialize on mount */
  autoInitialize?: boolean;
  /** Navigation reference for handling notification navigation */
  navigationRef?: any;
}

/**
 * React hook for managing push notifications
 * Uses react-native-push-notification without Firebase dependencies
 */
export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const { autoInitialize = true, navigationRef } = options;

  // State
  const [token, setToken] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize notification service
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔔 Initializing useNotifications hook...');

      // Set navigation reference if provided
      if (navigationRef) {
        notificationService.setNavigationRef(navigationRef);
      }

      // Get current token
      const currentToken = await notificationService.getToken();
      setToken(currentToken);

      // Check if notifications are enabled
      const enabled = await notificationService.areNotificationsEnabled();
      setIsEnabled(enabled);

      console.log('✅ useNotifications initialized', { 
        token: currentToken ? `${currentToken.substring(0, 20)}...` : null, 
        enabled 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize notifications';
      setError(errorMessage);
      console.error('❌ useNotifications initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [navigationRef]);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request permissions using the notification service
      const granted = await notificationService.requestNotificationPermissions();
      
      if (granted) {
        console.log('✅ Permissions granted, refreshing token...');
        // Try to get/refresh token after permissions are granted
        const newToken = await refreshToken();
        setToken(newToken);
      }
      
      // Update enabled state
      const enabled = await notificationService.areNotificationsEnabled();
      setIsEnabled(enabled);
      
      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      console.error('❌ Error requesting permissions:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken]);

  /**
   * Show permission alert
   */
  const showPermissionAlert = useCallback(() => {
    notificationService.showPermissionAlert();
  }, []);

  /**
   * Display a local notification immediately
   */
  const displayLocalNotification = useCallback(async (payload: NotificationPayload): Promise<void> => {
    try {
      await notificationService.displayLocalNotification(payload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to display notification';
      setError(errorMessage);
      console.error('❌ Error displaying notification:', err);
      throw err;
    }
  }, []);

  /**
   * Schedule a local notification
   */
  const scheduleLocalNotification = useCallback(async (
    payload: NotificationPayload, 
    scheduleDate?: Date
  ): Promise<void> => {
    try {
      await notificationService.scheduleLocalNotification(payload, scheduleDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule notification';
      setError(errorMessage);
      console.error('❌ Error scheduling notification:', err);
      throw err;
    }
  }, []);

  /**
   * Cancel all notifications
   */
  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await notificationService.cancelAllNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel notifications';
      setError(errorMessage);
      console.error('❌ Error cancelling notifications:', err);
      throw err;
    }
  }, []);

  /**
   * Get notification settings
   */
  const getNotificationSettings = useCallback(async (): Promise<any> => {
    try {
      return await notificationService.getNotificationSettings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get notification settings';
      setError(errorMessage);
      console.error('❌ Error getting notification settings:', err);
      return null;
    }
  }, []);

  /**
   * Refresh push token
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const newToken = await notificationService.getToken();
      setToken(newToken);
      return newToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh token';
      setError(errorMessage);
      console.error('❌ Error refreshing token:', err);
      return null;
    }
  }, []);

  /**
   * Send test notification
   */
  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      await notificationService.sendTestNotification();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      console.error('❌ Error sending test notification:', err);
      throw err;
    }
  }, []);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Refresh notification status when app becomes active
        try {
          const enabled = await notificationService.areNotificationsEnabled();
          setIsEnabled(enabled);
          
          if (enabled && !token) {
            const newToken = await notificationService.getToken();
            setToken(newToken);
          }
        } catch (err) {
          console.error('❌ Error checking notification status on app state change:', err);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [token]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  return {
    token,
    isEnabled,
    isLoading,
    error,
    requestPermissions,
    showPermissionAlert,
    displayLocalNotification,
    scheduleLocalNotification,
    cancelAllNotifications,
    getNotificationSettings,
    refreshToken,
    sendTestNotification,
  };
};

/**
 * Hook for notification testing and debugging
 */
export const useNotificationDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const getDebugInfo = useCallback(async () => {
    try {
      const token = await notificationService.getToken();
      const isEnabled = await notificationService.areNotificationsEnabled();
      const settings = await notificationService.getNotificationSettings();

      const info = {
        token,
        isEnabled,
        settings: {
          notifee: settings,
          // Firebase-free notification system
          pushService: 'notifee (local notifications only)',
          description: 'Local notifications with Notifee - no remote push notifications'
        },
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
        tokenType: token ? (token.startsWith('local_') ? 'Local Test Token' : 'Push Token') : 'No Token',
      };

      setDebugInfo(info);
      console.log('🐛 Notification Debug Info:', info);
      return info;
    } catch (error) {
      console.error('❌ Error getting debug info:', error);
      return null;
    }
  }, []);

  const testLocalNotification = useCallback(async () => {
    try {
      await notificationService.sendTestNotification();
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  }, []);

  const testScheduledNotification = useCallback(async (delaySeconds: number = 5) => {
    try {
      const scheduleDate = new Date();
      scheduleDate.setSeconds(scheduleDate.getSeconds() + delaySeconds);

      const payload: NotificationPayload = {
        title: '⏰ Scheduled Test',
        body: `This notification was scheduled ${delaySeconds} seconds ago.`,
        type: NotificationType.GENERAL,
        data: {
          test: true,
          scheduled: true,
          timestamp: Date.now(),
        },
      };

      await notificationService.scheduleLocalNotification(payload, scheduleDate);
      console.log(`✅ Scheduled test notification for ${delaySeconds} seconds from now`);
    } catch (error) {
      console.error('❌ Error scheduling test notification:', error);
    }
  }, []);

  const testNotificationTypes = useCallback(async () => {
    try {
      // Test different notification types with delays
      const notifications = [
        {
          title: '📱 New Message',
          body: 'You have received a new WhatsApp message from John Doe.',
          type: NotificationType.MESSAGE,
          data: { userId: '123', messageId: '456' },
          delay: 0,
        },
        {
          title: '📧 New Email',
          body: 'Important update from your course instructor.',
          type: NotificationType.EMAIL,
          data: { emailId: '789' },
          delay: 2000,
        },
        {
          title: '📅 Upcoming Appointment',
          body: 'Your session with Dr. Smith starts in 30 minutes.',
          type: NotificationType.APPOINTMENT,
          data: { appointmentId: '101112' },
          delay: 4000,
        },
        {
          title: '💳 Payment Reminder',
          body: 'Your monthly payment is due tomorrow.',
          type: NotificationType.PAYMENT,
          data: { paymentId: '131415' },
          delay: 6000,
        },
      ];

      for (const notification of notifications) {
        setTimeout(async () => {
          await notificationService.displayLocalNotification(notification);
        }, notification.delay);
      }

      console.log('✅ Multiple test notifications scheduled');
    } catch (error) {
      console.error('❌ Error sending test notifications:', error);
    }
  }, []);

  return {
    debugInfo,
    getDebugInfo,
    testLocalNotification,
    testScheduledNotification,
    testNotificationTypes,
  };
};

// Export for backward compatibility
export default useNotifications;