import React, { forwardRef, useState } from 'react';
import { StyleSheet, View as RNView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { View } from './Layout';
import { Text } from './Typography';
import { Pressable } from './Pressable';
import { getTheme, spacing, shadows } from '../helpers/theme';

interface NavItem {
  icon: string; // Feather icon name
  label: string;
  route?: string;
  onPress?: () => void;
}

interface BottomNavigationProps {
  /** Custom navigation items */
  items?: NavItem[];
  /** Show logout confirmation */
  showLogout?: boolean;
  /** Logout callback */
  onLogout?: () => void;
  /** Background color */
  backgroundColor?: string;
}

const defaultNavItems: NavItem[] = [
  { icon: 'calendar', label: 'Calendar', route: 'CalendarTab' },
  { icon: 'message-circle', label: 'Messages', route: 'MessagesTab' },
  { icon: 'user', label: 'Profile', route: 'ProfileTab' },
  { icon: 'image', label: 'Gallery', route: 'GalleryTab' },
];

/**
 * Modern bottom navigation component with tab support and Feather icons
 * 
 * Features:
 * - Beautiful Feather icons from react-native-vector-icons instead of emojis
 * - Automatic active state detection based on current route
 * - Customizable colors and styling
 * - Smooth animations and hover effects
 * 
 * @example
 * <BottomNavigation 
 *   showLogout
 *   onLogout={() => signOut()}
 * />
 * 
 * <BottomNavigation 
 *   items={customNavItems}
 *   backgroundColor="primary"
 * />
 */
export const BottomNavigation = forwardRef<RNView, BottomNavigationProps>(({
  items = defaultNavItems,
  showLogout = true,
  onLogout,
  backgroundColor = '#0052CD',
}, ref) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const insets = useSafeAreaInsets();

  const handleNavPress = (item: NavItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      // Check if we can navigate directly to the tab (when already in tab navigator)
      const state = navigation.getState();
      const isInTabNavigator = state?.routes?.some(route => route.name === 'Main');
      
      if (isInTabNavigator && route.name?.endsWith('Tab')) {
        // We're already in a tab, navigate directly
        (navigation as any).navigate(item.route);
      } else {
        // We're in a stack screen (like NotificationScreen), navigate to Main first
        (navigation as any).navigate('Main', { screen: item.route });
      }
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const allItems: NavItem[] = showLogout 
    ? [...items, { icon: 'log-out', label: 'Logout', onPress: handleLogoutPress }]
    : items;

  return (
    <>
      <View 
        ref={ref} 
        style={[
          styles.bottomNavigation, 
          { 
            backgroundColor,
            paddingBottom: Math.max(insets.bottom, 10), // Use safe area or minimum 10px
            bottom: 15, // Lift navigation bar 15px from bottom edge
          }
        ]}
      >
        {allItems.map((item, index) => (
          <NavIconButton
            key={`${item.label}-${index}`}
            icon={item.icon}
            label={item.label}
            active={'route' in item && item.route ? 
              route.name === item.route // Direct tab match when in tab navigator
              : false}
            onPress={() => handleNavPress(item)}
          />
        ))}
      </View>

      {showLogoutConfirm && (
        <>
          <Pressable 
            style={styles.logoutDeciderBackdrop}
            onPress={() => setShowLogoutConfirm(false)}
          />
          <Pressable 
            style={styles.logoutDeciderBackdrop}
            onPress={() => setShowLogoutConfirm(false)}
          >
            <View style={styles.logoutConfirmationWrapper}>
              <Text style={styles.logoutConfirmationText}>
                Are you sure you want to logout?
              </Text>
              <TouchableOpacity
                onPress={handleLogoutConfirm}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutButtonText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </>
      )}
    </>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

// Individual navigation icon component
interface NavIconButtonProps {
  icon: string; // Feather icon name
  label: string;
  onPress: () => void;
  active?: boolean;
}

const NavIconButton = forwardRef<RNView, NavIconButtonProps>(({
  icon: iconName,
  label,
  onPress,
  active = false,
}, ref) => {
  return (
    <Pressable 
      style={[styles.navIcon, active && styles.navIconActive]}
      onPress={onPress}
    >
      <View style={styles.navIconContainer}>
        <Icon 
          name={iconName}
          size={20} 
          color={active ? "#FFD700" : "#ffffff"} 
        />
      </View>
      <Text style={[styles.navIconText, active && styles.navIconTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
});

NavIconButton.displayName = 'NavIconButton';

const styles = StyleSheet.create({
  bottomNavigation: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Distribute items evenly
    bottom: 0,
    minHeight: 80, // Increased from 66 to accommodate content properly
    left: 0,
    right: 0,
    paddingHorizontal: 10, // Add horizontal padding
    paddingTop: 12, // Add top padding to prevent cutting
    borderTopWidth: 1,
    borderTopColor: '#d8d8d8',
  },
  navIcon: {
    flex: 1, // Use flex instead of fixed width for better distribution
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12, // Increased vertical padding to prevent cutting
    minHeight: 60, // Ensure minimum height for touch area
  },
  navIconContainer: {
    marginBottom: 4, // Space between icon and text
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconText: {
    fontSize: 10, // Slightly larger for better readability
    fontWeight: '600', // Use numeric weight for consistency
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 12, // Better line height for icons
  },
  navIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background for active state
    borderRadius: 8,
  },
  navIconTextActive: {
    color: '#FFD700', // Golden color for active state
    fontWeight: '700', // Bolder text for active state
  },
  logoutDeciderBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#ffffffdd',
  },
  logoutConfirmationWrapper: {
    flex: 1,
    position: 'absolute',
    right: 20,
    bottom: 110, // Adjusted to account for moved navigation bar
    alignItems: 'flex-end',
  },
  logoutConfirmationText: {
    color: '#000',
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutButtonText: {
    paddingTop: 8,
    paddingBottom: 9,
    paddingLeft: 21,
    paddingRight: 21,
    borderRadius: 999,
    color: '#fff',
    backgroundColor: '#0052CD',
  },
});