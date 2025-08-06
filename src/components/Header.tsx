import React, { forwardRef } from 'react';
import { StyleSheet, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { View } from './Layout';
import { Text } from './Typography';
import { Pressable } from './Pressable';
import { getTheme, spacing, shadows } from '../helpers/theme';

interface HeaderProps {
  /** Header title */
  title?: string;
  /** Whether back button should be shown */
  canGoBack?: boolean;
  /** Custom back button action */
  onBackPress?: () => void;
  /** Show notification bell icon */
  showNotification?: boolean;
  /** Remove shadow */
  noShadow?: boolean;
  /** Custom right component */
  rightComponent?: React.ReactNode;
  /** Header background color */
  backgroundColor?: string;
}

/**
 * Modern header component with navigation and theming support
 * 
 * @example
 * <Header 
 *   title="Profile" 
 *   canGoBack
 *   showNotification
 * />
 * 
 * <Header 
 *   title="Settings"
 *   canGoBack
 *   onBackPress={() => customBackAction()}
 *   rightComponent={<Button>Save</Button>}
 * />
 */
export const Header = forwardRef<RNView, HeaderProps>(({
  title,
  canGoBack = false,
  onBackPress,
  showNotification = false,
  noShadow = false,
  rightComponent,
  backgroundColor,
}, ref) => {
  const navigation = useNavigation();
  const theme = getTheme();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleNotificationPress = () => {
    if ('navigate' in navigation) {
      (navigation as any).navigate('Notification');
    }
  };

  const headerStyle = [
    styles.header,
    {
      backgroundColor: backgroundColor || theme.colors.surface,
      paddingTop: insets.top,
      ...(noShadow ? {} : shadows.sm),
    },
  ];

  return (
    <View ref={ref} style={headerStyle}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {canGoBack && (
            <Pressable
              style={styles.backButton}
              onPress={handleBackPress}
              hitSlop={spacing.md}
            >
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
          )}
          {title && (
            <Text 
              size="h6" 
              weight="semibold" 
              color="primary"
              style={styles.title}
            >
              {title}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          {showNotification && (
            <Pressable
              style={styles.notificationButton}
              onPress={handleNotificationPress}
              hitSlop={spacing.md}
            >
              <Icon 
                name="bell" 
                size={20} 
                color={getTheme().colors.primary} 
                style={styles.bellIcon}
              />
            </Pressable>
          )}
          {rightComponent}
        </View>
      </View>
    </View>
  );
});

Header.displayName = 'Header';

// Standalone notification icon component
export const NotificationIcon = forwardRef<RNView, { 
  onPress?: () => void;
  size?: number;
  color?: string;
}>(({ onPress, size = 24, color = getTheme().colors.primary }, ref) => (
  <Pressable
    onPress={onPress}
    style={styles.notificationButton}
    hitSlop={spacing.md}
  >
    <View ref={ref} style={[styles.bellIconContainer, { width: size, height: size }]}>
      <Icon 
        name="bell" 
        size={size * 0.8} 
        color={color}
      />
    </View>
  </Pressable>
));

NotificationIcon.displayName = 'NotificationIcon';

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 58,
    paddingHorizontal: spacing.md,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.lg,
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0052CD',
  },
  title: {
    flex: 1,
  },
  notificationButton: {
    padding: spacing.xs,
  },
  bellIcon: {
    textAlign: 'center',
  },
  bellIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});