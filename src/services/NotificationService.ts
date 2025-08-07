// No longer using react-native-push-notification to avoid Firebase dependencies
import notifee, { 
  AndroidImportance, 
  AndroidStyle, 
  AndroidColor, 
  AndroidCategory,
  EventType,
  Event as NotifeeEvent,
  Notification,
  AndroidChannel,
  AuthorizationStatus,
  TriggerType,
  TimestampTrigger
} from '@notifee/react-native';
import { Platform, Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../helpers/request';

/**
 * Notification configuration and types
 */
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: NotificationType;
  priority?: 'default' | 'high' | 'max';
  sound?: string;
  imageUrl?: string;
  bigText?: string;
  actions?: NotificationAction[];
}

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  EMAIL = 'EMAIL',
  APPOINTMENT = 'APPOINTMENT',
  PAYMENT = 'PAYMENT',
  GENERAL = 'GENERAL',
}

export enum NotificationChannelId {
  DEFAULT = 'default',
  MESSAGES = 'messages',
  EMAILS = 'emails',
  APPOINTMENTS = 'appointments',
  PAYMENTS = 'payments',
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
}

/**
 * Modern push notification service for React Native
 * Uses react-native-push-notification and Notifee without Firebase
 */
export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private isInitialized = false;
  private navigationRef: any = null;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Set navigation reference for handling notification navigation
   */
  setNavigationRef(navigationRef: any): void {
    this.navigationRef = navigationRef;
  }

  /**
   * Initialize the notification service
   */
  private async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log('🔔 Initializing NotificationService...');

      // Request notification permissions
      await this.requestPermissions();

      // Create notification channels (Android)
      await this.createNotificationChannels();

          // Configure local notifications only (no push notifications)
    await this.configureLocalNotifications();

      // Set up notification interaction handlers
      this.setupNotificationInteractionHandlers();

      // Handle app state changes
      this.setupAppStateHandlers();

      this.isInitialized = true;
      console.log('✅ NotificationService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize NotificationService:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      // Request permissions using Notifee
      const settings = await notifee.requestPermission();
      console.log('🔐 Notification permission settings:', settings);
      
      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        console.log('✅ Notification permissions granted');
        return true;
      } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        console.log('❌ Notification permissions denied');
        return false;
      } else {
        console.log('⚠️ Notification permissions not determined');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Create notification channels for Android
   */
  private async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      const channels: AndroidChannel[] = [
        {
          id: NotificationChannelId.DEFAULT,
          name: 'Default Notifications',
          importance: AndroidImportance.HIGH,
          description: 'General notifications',
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
        },
        {
          id: NotificationChannelId.MESSAGES,
          name: 'Messages',
          importance: AndroidImportance.HIGH,
          description: 'SMS and WhatsApp messages',
          sound: 'message_sound',
          vibration: true,
          vibrationPattern: [200, 300, 200, 300],
        },
        {
          id: NotificationChannelId.EMAILS,
          name: 'Emails',
          importance: AndroidImportance.DEFAULT,
          description: 'Email notifications',
          sound: 'email_sound',
          vibration: true,
          vibrationPattern: [500, 300],
        },
        {
          id: NotificationChannelId.APPOINTMENTS,
          name: 'Appointments',
          importance: AndroidImportance.HIGH,
          description: 'Calendar and appointment reminders',
          sound: 'appointment_sound',
          vibration: true,
          vibrationPattern: [100, 200, 100, 200, 100, 200],
        },
        {
          id: NotificationChannelId.PAYMENTS,
          name: 'Payments',
          importance: AndroidImportance.HIGH,
          description: 'Payment and billing notifications',
          sound: 'payment_sound',
          vibration: true,
          vibrationPattern: [400, 600],
        },
      ];

      for (const channel of channels) {
        await notifee.createChannel(channel);
      }

      console.log('✅ Notification channels created successfully');
    } catch (error) {
      console.error('❌ Error creating notification channels:', error);
    }
  }

  /**
   * Configure push notifications
   */
  private async configureLocalNotifications(): Promise<void> {
    try {
      // Generate a local identifier for this device
      await this.generateLocalToken();
      
      console.log('✅ Local notification system configured');
    } catch (error) {
      console.error('❌ Error configuring local notifications:', error);
    }
  }

  /**
   * Generate a local token for development/testing purposes
   */
  private async generateLocalToken(): Promise<void> {
    try {
      // Generate a UUID-based token for local testing
      const localToken = `local_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔧 Generated local token for testing:', localToken);
      
      this.pushToken = localToken;
      await this.storePushToken(localToken);
      await this.syncTokenWithBackend(localToken);
    } catch (error) {
      console.error('❌ Error generating local token:', error);
    }
  }

  /**
   * Store push token locally
   */
  private async storePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('pushToken', token);
      console.log('✅ Push token stored locally');
    } catch (error) {
      console.error('❌ Error storing push token:', error);
    }
  }

  /**
   * Sync push token with backend server (matches legacy expo_token field)
   */
  private async syncTokenWithBackend(token: string): Promise<void> {
    try {
      // Get user data from 'me' endpoint (exactly like legacy)
      const userResponse = await apiService.get('me');
      
      if (!userResponse?.data?.data?.id) {
        console.log('⚠️ No user data found, skipping token sync');
        return;
      }

      const userId = userResponse.data.data.id;
      
      // Check if token already exists (like legacy)
      if (userResponse.data.data.expo_token === token) {
        console.log('✅ Push token already up to date');
        return;
      }

      // Use the exact same API structure as legacy app
      const requestData = {
        data: {
          expo_token: token  // Keep the same field name as legacy for backend compatibility
        }
      };

      const response = await apiService.patch(`users/${userId}`, requestData);

      if (response.status === 200) {
        console.log('✅ Push token synced with backend (expo_token field)');
      }
    } catch (error) {
      console.error('❌ Error syncing push token with backend:', error);
    }
  }

  /**
   * Handle received notifications
   */
  private handleNotificationReceived(notification: any): void {
    // If app is in foreground, display notification manually
    if (notification.foreground) {
      this.displayLocalNotification({
        title: notification.title || 'New Notification',
        body: notification.message || notification.body || '',
        data: notification.data,
        type: notification.data?.type as NotificationType,
      });
    }
  }

  /**
   * Handle notification actions/taps
   */
  private handleNotificationAction(notification: any): void {
    const notificationType = notification.data?.type as NotificationType;
    
    // Navigate based on notification type (matches legacy behavior)
    this.navigateBasedOnType(notificationType, notification.data);
  }

  /**
   * Set up notification interaction handlers
   */
  private setupNotificationInteractionHandlers(): void {
    // Handle notification events (tap, action buttons, etc.)
    notifee.onForegroundEvent(async ({ type, detail }: NotifeeEvent) => {
      await this.handleNotifeeEvent(type, detail);
    });

    notifee.onBackgroundEvent(async ({ type, detail }: NotifeeEvent) => {
      await this.handleNotifeeEvent(type, detail);
    });
  }

  /**
   * Set up app state change handlers
   */
  private setupAppStateHandlers(): void {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Clear notification badges when app becomes active
        this.clearNotificationBadges();
      }
    });
  }

  /**
   * Handle Notifee events
   */
  private async handleNotifeeEvent(type: EventType, detail: any): Promise<void> {
    try {
      switch (type) {
        case EventType.DISMISSED:
          console.log('🔕 Notification dismissed:', detail.notification?.id);
          break;
        
        case EventType.PRESS:
          console.log('👆 Notification pressed:', detail.notification?.data);
          if (detail.notification?.data) {
            const notificationType = detail.notification.data.type as NotificationType;
            await this.navigateBasedOnType(notificationType, detail.notification.data);
          }
          break;
        
        case EventType.ACTION_PRESS:
          console.log('🎯 Action button pressed:', detail.pressAction?.id);
          await this.handleActionPress(detail.pressAction?.id, detail.notification?.data);
          break;
        
        default:
          console.log('🔔 Unhandled notification event:', type);
      }
    } catch (error) {
      console.error('❌ Error handling Notifee event:', error);
    }
  }

  /**
   * Navigate based on notification type (matches legacy behavior)
   */
  private async navigateBasedOnType(type: NotificationType, data: any): Promise<void> {
    if (!this.navigationRef?.current) {
      console.log('⚠️ Navigation ref not available');
      return;
    }

    try {
      switch (type) {
        case NotificationType.EMAIL:
        case NotificationType.MESSAGE:
          this.navigationRef.current.navigate('Messages');
          break;
        
        case NotificationType.APPOINTMENT:
          this.navigationRef.current.navigate('Calendar');
          break;
        
        case NotificationType.PAYMENT:
          if (data?.paymentId) {
            this.navigationRef.current.navigate('Payments', { id: data.paymentId });
          }
          break;
        
        default:
          this.navigationRef.current.navigate('Notification');
          break;
      }
    } catch (error) {
      console.error('❌ Error navigating:', error);
    }
  }

  /**
   * Handle action button press
   */
  private async handleActionPress(actionId: string, data: any): Promise<void> {
    try {
      switch (actionId) {
        case 'reply':
          console.log('📝 Quick reply action');
          break;
        
        case 'view':
          console.log('👀 View action');
          await this.navigateBasedOnType(data?.type, data);
          break;
        
        case 'dismiss':
          console.log('🔕 Dismiss action');
          break;
        
        default:
          console.log('🎯 Unknown action:', actionId);
      }
    } catch (error) {
      console.error('❌ Error handling action press:', error);
    }
  }

  /**
   * Get channel ID for notification type
   */
  private getChannelIdForType(type?: NotificationType): string {
    switch (type) {
      case NotificationType.MESSAGE:
        return NotificationChannelId.MESSAGES;
      case NotificationType.EMAIL:
        return NotificationChannelId.EMAILS;
      case NotificationType.APPOINTMENT:
        return NotificationChannelId.APPOINTMENTS;
      case NotificationType.PAYMENT:
        return NotificationChannelId.PAYMENTS;
      default:
        return NotificationChannelId.DEFAULT;
    }
  }

  /**
   * Clear notification badges
   */
  private async clearNotificationBadges(): Promise<void> {
    try {
      await notifee.setBadgeCount(0);
      console.log('✅ Notification badges cleared');
    } catch (error) {
      console.error('❌ Error clearing notification badges:', error);
    }
  }

  /**
   * Public methods
   */

  /**
   * Get current push token
   */
  async getToken(): Promise<string | null> {
    if (!this.pushToken) {
      try {
        this.pushToken = await AsyncStorage.getItem('pushToken');
      } catch (error) {
        console.error('❌ Error getting push token:', error);
        return null;
      }
    }
    return this.pushToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Check notification settings using Notifee
        const settings = await notifee.getNotificationSettings();
        console.log('🔍 Android notification settings:', settings);
        return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
      } else {
        // For iOS, check using Notifee as well
        const settings = await notifee.getNotificationSettings();
        return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
      }
    } catch (error) {
      console.error('❌ Error checking notification permissions:', error);
      // Fallback: check if token exists
      const token = await this.getToken();
      return token !== null;
    }
  }

  /**
   * Request notification permissions publicly
   */
  async requestNotificationPermissions(): Promise<boolean> {
    return await this.requestPermissions();
  }

  /**
   * Show settings alert for enabling notifications
   */
  showPermissionAlert(): void {
    Alert.alert(
      'Enable Notifications',
      'To receive important updates and notifications, please enable notifications in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => notifee.openNotificationSettings() },
      ]
    );
  }

  /**
   * Display a local notification using Notifee
   */
  async displayLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      const channelId = this.getChannelIdForType(payload.type);
      
      // Convert data to strings (Notifee requirement)
      const stringifiedData: Record<string, string> = {};
      if (payload.data) {
        Object.entries(payload.data).forEach(([key, value]) => {
          stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
        });
      }
      
      // Prepare Android config
      const androidConfig: any = {
        channelId,
        sound: payload.sound || 'default',
        vibrationPattern: [300, 500],
        actions: payload.actions?.map(action => ({
          title: action.title,
          pressAction: {
            id: action.id,
          },
        })) || [],
      };

      // Only add largeIcon if we have a valid URL
      if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
        androidConfig.largeIcon = payload.imageUrl;
      }

      // Only add style if we have bigText
      if (payload.bigText) {
        androidConfig.style = {
          type: AndroidStyle.BIGTEXT,
          text: payload.bigText,
        };
      }

      // Prepare iOS config
      const iosConfig: any = {
        sound: payload.sound || 'default',
      };

      // Only add attachments if we have a valid URL
      if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
        iosConfig.attachments = [{ url: payload.imageUrl }];
      }

      // Use Notifee to display the notification
      await notifee.displayNotification({
        title: payload.title,
        body: payload.body,
        data: stringifiedData,
        android: androidConfig,
        ios: iosConfig,
      });
      console.log('✅ Local notification displayed');
    } catch (error) {
      console.error('❌ Error displaying local notification:', error);
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(payload: NotificationPayload, scheduleDate?: Date): Promise<void> {
    try {
      const channelId = this.getChannelIdForType(payload.type);
      
      if (scheduleDate) {
        // Convert data to strings (Notifee requirement)
        const stringifiedData: Record<string, string> = {};
        if (payload.data) {
          Object.entries(payload.data).forEach(([key, value]) => {
            stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
          });
        }
        
        // Prepare Android config for scheduled notification
        const androidConfig: any = {
          channelId,
          sound: payload.sound || 'default',
          vibrationPattern: [300, 500],
        };

        // Only add largeIcon if we have a valid URL
        if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
          androidConfig.largeIcon = payload.imageUrl;
        }

        // Only add style if we have bigText
        if (payload.bigText) {
          androidConfig.style = {
            type: AndroidStyle.BIGTEXT,
            text: payload.bigText,
          };
        }

        // Prepare iOS config for scheduled notification
        const iosConfig: any = {
          sound: payload.sound || 'default',
        };

        // Only add attachments if we have a valid URL
        if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
          iosConfig.attachments = [{ url: payload.imageUrl }];
        }

        // Schedule notification for later using Notifee
        await notifee.createTriggerNotification(
          {
            title: payload.title,
            body: payload.body,
            data: stringifiedData,
            android: androidConfig,
            ios: iosConfig,
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: scheduleDate.getTime(),
          } as TimestampTrigger
        );
        console.log('✅ Local notification scheduled for:', scheduleDate);
      } else {
        // Display immediately
        await this.displayLocalNotification(payload);
      }
    } catch (error) {
      console.error('❌ Error scheduling local notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('✅ All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling notifications:', error);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<any> {
    try {
      const notifeeSettings = await notifee.getNotificationSettings();
      const enabled = await this.areNotificationsEnabled();
      const token = await this.getToken();
      
      return {
        notifee: notifeeSettings,
        enabled,
        token,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error getting notification settings:', error);
      return null;
    }
  }

  /**
   * Send a test local notification (for development)
   */
  async sendTestNotification(): Promise<void> {
    await this.displayLocalNotification({
      title: '🧪 Test Notification',
      body: 'This is a test notification from the React Native notification service.',
      type: NotificationType.GENERAL,
      data: {
        test: 'true',
        timestamp: Date.now().toString(),
        source: 'debug'
      },
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();