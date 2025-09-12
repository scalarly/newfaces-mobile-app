import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

import { Header, BottomNavigation, Pressable, RefreshControl } from '../components';
import { useCollection } from '../hooks/useCollection';
import { useRefresh } from '../hooks/useRefresh';
import { useTranslation } from '../hooks/useTranslation';
import { useUserToken, useUserId } from '../hooks/useAsyncStorage';
import { colors, spacing } from '../helpers/theme';
import { formatDate } from '../helpers/dateUtils';
import { RootStackParamList } from '../navigation/types';

/**
 * NotificationScreen - Modern notifications screen with auto-refresh
 * Replaces the legacy NotificationScreen.js with modern TypeScript implementation
 */

// Type definitions for different notification sources
interface NotificationUser {
  first_name: string;
  last_name?: string;
  email?: string;
}

interface NotificationTemplate {
  subject?: string;
  text?: string;
  name?: string;
}

// Legacy format (from /notifications with user_details and template_details)
interface LegacyNotificationData {
  id: number;
  user_details: NotificationUser;
  template_details: NotificationTemplate;
  created_at: string;
  unread_count?: number;
}

// New API format (from /notifications endpoint - updated format)
interface ApiNotificationData {
  id: number;
  title: string;
  body: string;
  type: 'EMAIL' | 'MESSAGE' | 'GENERAL' | string;
  extra?: {
    title?: string;
    ph_no?: string;
    type?: string;
  };
  read: boolean;
  created_at: string;
}

// Unified notification type
type NotificationData = LegacyNotificationData | ApiNotificationData;

type NotificationType = 'email' | 'sms';

type Props = NativeStackScreenProps<RootStackParamList, 'Notification'>;

const NotificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { token: userToken } = useUserToken();
  const { userId } = useUserId();
  const [refreshing, onRefresh] = useRefresh();

  // Fetch notifications from the new API endpoint
  const { collection, updateCollection } = useCollection<NotificationData>(
    'notifications',
    {
      autoFetch: true, // No need for user ID, API handles authentication via JWT
    }
  );

  // Auto-refresh notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateCollection({ reload: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [updateCollection]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Helper functions to handle both notification formats
  const isLegacyNotification = (item: NotificationData): item is LegacyNotificationData => {
    return 'user_details' in item && 'template_details' in item;
  };

  const isApiNotification = (item: NotificationData): item is ApiNotificationData => {
    return 'title' in item && 'body' in item && 'type' in item;
  };

  const handleNotificationPress = (item: NotificationData) => {
    if (isLegacyNotification(item)) {
      // Handle legacy format
      const userName = item.user_details.first_name || 'Unknown User';
      const isEmail = !!item.template_details.subject;
      
      if (isEmail) {
        navigation.navigate('Email', {
          data: {
            ...item,
            template_details: {
              subject: item.template_details.subject || '',
              body: item.template_details.text || '',
            },
          },
          title: userName,
        });
      } else {
        navigation.navigate('SMS', {
          data: {
            ...item,
            text: item.template_details.text || '',
            unread_count: item.unread_count || 0,
          },
          title: userName,
        });
      }
    } else if (isApiNotification(item)) {
      // Handle new API format
      const notificationTitle = item.title || 'Notification';
      
      if (item.type === 'EMAIL') {
        navigation.navigate('Email', {
          data: {
            id: item.id,
            user_details: { first_name: notificationTitle },
            template_details: {
              subject: item.title,
              body: item.body,
            },
            created_at: item.created_at,
          },
          title: notificationTitle,
        });
      } else if (item.type === 'MESSAGE') {
        // Handle MESSAGE type (SMS/WhatsApp)
        navigation.navigate('SMS', {
          data: {
            id: item.id,
            moderator_details: { first_name: notificationTitle },
            text: item.body,
            contact: item.extra?.ph_no,
            created_at: item.created_at,
            unread_count: item.read ? 0 : 1,
          },
          title: notificationTitle,
        });
      } else {
        // Handle GENERAL or other types - default to showing message details
        console.log('General notification tapped:', item);
        navigation.navigate('SMS', {
          data: {
            id: item.id,
            moderator_details: { first_name: notificationTitle },
            text: item.body,
            created_at: item.created_at,
            unread_count: item.read ? 0 : 1,
          },
          title: notificationTitle,
        });
      }
    }
  };

  const getNotificationContent = (item: NotificationData): string => {
    if (isLegacyNotification(item)) {
      return item.template_details.subject || 
             item.template_details.text || 
             'No content available';
    } else if (isApiNotification(item)) {
      return item.body || item.title || 'No content available';
    }
    return 'No content available';
  };

  const getNotificationIcon = (item: NotificationData): string => {
    if (isLegacyNotification(item)) {
      return item.template_details.subject ? 'mail' : 'message-circle';
    } else if (isApiNotification(item)) {
      switch (item.type) {
        case 'EMAIL':
          return 'mail';
        case 'MESSAGE':
          return 'message-circle';
        case 'GENERAL':
        default:
          return 'bell';
      }
    }
    return 'bell';
  };

  const getNotificationTitle = (item: NotificationData): string => {
    if (isLegacyNotification(item)) {
      return item.user_details.first_name || 'Unknown User';
    } else if (isApiNotification(item)) {
      return item.title || 'Notification';
    }
    return 'Notification';
  };

  const getNotificationType = (item: NotificationData): NotificationType => {
    if (isLegacyNotification(item)) {
      return item.template_details.subject ? 'email' : 'sms';
    } else if (isApiNotification(item)) {
      return item.type === 'EMAIL' ? 'email' : 'sms';
    }
    return 'sms';
  };

  const renderNotificationItem: ListRenderItem<NotificationData> = ({ item }) => {
    const notificationTitle = getNotificationTitle(item);
    const notificationContent = getNotificationContent(item);
    const notificationIcon = getNotificationIcon(item);
    const formattedDate = formatDate(item.created_at, 'dd MMM');

    // Handle unread indicator for both formats
    const hasUnreadCount = isLegacyNotification(item) 
      ? (item.unread_count && item.unread_count > 0)
      : (isApiNotification(item) && !item.read);

    const unreadCount = isLegacyNotification(item) 
      ? item.unread_count 
      : (isApiNotification(item) && !item.read ? 1 : 0);

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={styles.notificationPressable}
      >
        <Card style={styles.notificationCard}>
          <Card.Content style={styles.notificationContent}>
            {/* Notification Header */}
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {notificationTitle}
              </Text>
              <Text style={styles.notificationDate}>
                {formattedDate}
              </Text>
            </View>

            {/* Notification Body */}
            <View style={styles.notificationBody}>
              <Text 
                style={styles.notificationText} 
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {notificationContent}
              </Text>
              
              <View style={styles.notificationIcon}>
                <Icon
                  name={notificationIcon}
                  size={16}
                  color={colors.primary}
                />
              </View>
            </View>

            {/* Unread indicator */}
            {hasUnreadCount && (
              <View style={styles.unreadIndicator}>
                <Text style={styles.unreadText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name="bell"
        size={48}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyStateText}>
        No notifications yet
      </Text>
      <Text style={styles.emptyStateSubtext}>
        You'll see notifications here when they arrive
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <Header
        title={t('mobile.titles.notification')}
        canGoBack
        onBackPress={handleBackPress}
        noShadow
      />

      {/* Notifications List */}
      <FlatList
        data={collection.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotificationItem}
        style={styles.notificationsList}
        contentContainerStyle={[
          styles.notificationsContent,
          collection.items.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  notificationsList: {
    flex: 1,
    marginBottom: 66, // Space for bottom navigation
  },
  notificationsContent: {
    padding: spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  notificationPressable: {
    marginBottom: spacing.sm,
  },
  notificationCard: {
    elevation: 2,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  notificationContent: {
    padding: spacing.md,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.onSurface,
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  notificationBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginRight: spacing.sm,
  },
  notificationIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.onPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default NotificationScreen;