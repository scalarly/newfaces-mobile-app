import React, { useState } from 'react';
import { ScrollView, View as RNView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  View, 
  Pressable, 
  Header,
} from '../components';
import { useNotifications, useNotificationDebug } from '../hooks/useNotifications';
import { NotificationType } from '../services/NotificationService';
import { colors, spacing } from '../helpers/theme';

/**
 * Notification Debug Screen
 * 
 * This screen provides tools for testing and debugging the notification system.
 * It's useful during development to verify that notifications are working correctly.
 */
const NotificationDebugScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    token, 
    isEnabled, 
    error,
    requestPermissions,
    showPermissionAlert,
    scheduleLocalNotification,
    cancelAllNotifications,
    getNotificationSettings,
  } = useNotifications();

  const {
    debugInfo,
    getDebugInfo,
    testLocalNotification,
    testScheduledNotification,
    testNotificationTypes,
  } = useNotificationDebug();

  /**
   * Test different notification types using hook
   */
  const handleTestNotificationTypes = async () => {
    setIsLoading(true);
    try {
      await testNotificationTypes();
      Alert.alert('Test Started', 'Multiple test notifications will appear over the next few seconds.');
    } catch (error) {
      Alert.alert('Test Failed', 'Failed to send test notifications.');
      console.error('❌ Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Test scheduled notification
   */
  const testScheduled = async () => {
    try {
      await testScheduledNotification(10); // 10 seconds from now
      Alert.alert('Scheduled Test', 'A notification has been scheduled for 10 seconds from now.');
    } catch (error) {
      Alert.alert('Schedule Failed', 'Failed to schedule notification.');
      console.error('❌ Schedule failed:', error);
    }
  };

  /**
   * Request permissions
   */
  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermissions();
      if (granted) {
        Alert.alert('Success', 'Notification permissions granted!');
      } else {
        Alert.alert('Permissions Required', 'Please enable notifications in your device settings.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get debug information
   */
  const handleGetDebugInfo = async () => {
    setIsLoading(true);
    try {
      await getDebugInfo();
      Alert.alert('Debug Info', 'Check the console for detailed notification information.');
    } catch (error) {
      Alert.alert('Error', 'Failed to get debug information.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancel all notifications
   */
  const handleCancelAll = async () => {
    try {
      await cancelAllNotifications();
      Alert.alert('Success', 'All notifications have been cancelled.');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel notifications.');
    }
  };

  /**
   * Get notification settings
   */
  const handleGetSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      Alert.alert('Settings', JSON.stringify(settings, null, 2));
    } catch (error) {
      Alert.alert('Error', 'Failed to get notification settings.');
    }
  };

  return (
    <View flex safeArea>
      <Header 
        title="Notification Debug" 
        canGoBack 
        noShadow 
      />
      
      <ScrollView style={styles.container}>
        {/* Status Section */}
        <View style={styles.section}>
          <Text size="large" weight="semibold" style={styles.sectionTitle}>
            📊 Notification Status
          </Text>
          
          <View style={styles.statusCard}>
            <StatusItem 
              label="Permissions Enabled" 
              value={isEnabled ? '✅ Yes' : '❌ No'} 
              status={isEnabled ? 'success' : 'error'}
            />
            <StatusItem 
              label="FCM Token" 
              value={token ? `${token.substring(0, 20)}...` : 'Not available'} 
              status={token ? 'success' : 'warning'}
            />
            {error && (
              <StatusItem 
                label="Error" 
                value={error} 
                status="error"
              />
            )}
          </View>
        </View>

        {/* Test Actions Section */}
        <View style={styles.section}>
          <Text size="large" weight="semibold" style={styles.sectionTitle}>
            🧪 Test Notifications
          </Text>
          
          <TestButton
            title="🔔 Simple Test Notification"
            onPress={testLocalNotification}
            disabled={isLoading || !isEnabled}
          />
          
          <TestButton
            title="📱 Test Multiple Notification Types"
            onPress={handleTestNotificationTypes}
            disabled={isLoading || !isEnabled}
          />
          
          <TestButton
            title="⏰ Test Scheduled Notification (10s)"
            onPress={testScheduled}
            disabled={isLoading || !isEnabled}
          />
        </View>

        {/* Management Section */}
        <View style={styles.section}>
          <Text size="large" weight="semibold" style={styles.sectionTitle}>
            ⚙️ Notification Management
          </Text>
          
          <TestButton
            title="🔓 Request Permissions"
            onPress={handleRequestPermissions}
            disabled={isLoading}
          />
          
          <TestButton
            title="⚠️ Show Permission Alert"
            onPress={showPermissionAlert}
            disabled={isLoading}
          />
          
          <TestButton
            title="🗑️ Cancel All Notifications"
            onPress={handleCancelAll}
            disabled={isLoading}
          />
          
          <TestButton
            title="⚙️ Get Notification Settings"
            onPress={handleGetSettings}
            disabled={isLoading}
          />
        </View>

        {/* Debug Section */}
        <View style={styles.section}>
          <Text size="large" weight="semibold" style={styles.sectionTitle}>
            🐛 Debug Information
          </Text>
          
          <TestButton
            title="📊 Get Debug Info"
            onPress={handleGetDebugInfo}
            disabled={isLoading}
          />
          
          {debugInfo && (
            <View style={styles.debugInfo}>
              <Text size="small" color="textSecondary">
                Last Updated: {new Date(debugInfo.timestamp).toLocaleString()}
              </Text>
              <Text size="small" style={styles.debugText}>
                {JSON.stringify(debugInfo, null, 2)}
              </Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={[styles.section, styles.instructionsSection]}>
          <Text size="large" weight="semibold" style={styles.sectionTitle}>
            📝 Instructions
          </Text>
          
          <Text size="small" color="textSecondary" style={styles.instruction}>
            1. First, ensure permissions are granted by tapping "Request Permissions"
          </Text>
          <Text size="small" color="textSecondary" style={styles.instruction}>
            2. Test local notifications with the test buttons above
          </Text>
          <Text size="small" color="textSecondary" style={styles.instruction}>
            3. For remote notifications, use the FCM token with your backend
          </Text>
          <Text size="small" color="textSecondary" style={styles.instruction}>
            4. Check console logs for detailed debugging information
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Status item component
 */
interface StatusItemProps {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error';
}

const StatusItem: React.FC<StatusItemProps> = ({ label, value, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.statusItem}>
      <Text size="small" color="textSecondary">
        {label}:
      </Text>
      <Text size="small" style={{ color: getStatusColor() }}>
        {value}
      </Text>
    </View>
  );
};

/**
 * Test button component
 */
interface TestButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const TestButton: React.FC<TestButtonProps> = ({ title, onPress, disabled }) => (
  <Pressable
    style={[styles.testButton, disabled && styles.testButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text 
      size="body" 
      weight="medium" 
      color={disabled ? "textSecondary" : "white"}
    >
      {title}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey300,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey300,
  },
  testButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: colors.grey400,
  },
  debugInfo: {
    backgroundColor: colors.grey100,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  debugText: {
    fontFamily: 'monospace',
    marginTop: spacing.sm,
  },
  instructionsSection: {
    backgroundColor: colors.grey100,
    padding: spacing.md,
    borderRadius: 8,
  },
  instruction: {
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});

export default NotificationDebugScreen;