import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import {
  ProfileScreen,
  MessagesScreen,
  CalendarScreen,
  GalleryScreen,
} from '../screens';

// Navigation types
export type TabParamList = {
  CalendarTab: undefined;
  MessagesTab: undefined;
  ProfileTab: undefined;
  GalleryTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide the default tab bar since we're using custom BottomNavigation
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#ffffff',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },

        // Add smooth animation between tabs
        animationEnabled: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'CalendarTab':
              iconName = 'calendar';
              break;
            case 'MessagesTab':
              iconName = 'message-circle';
              break;
            case 'ProfileTab':
              iconName = 'user';
              break;
            case 'GalleryTab':
              iconName = 'image';
              break;
            default:
              iconName = 'help-circle';
          }

          return (
            <Icon
              name={iconName}
              size={size || 20}
              color={color}
            />
          );
        },
      })}
      initialRouteName="ProfileTab"
    >
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarAccessibilityLabel: 'Calendar Tab',
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarAccessibilityLabel: 'Messages Tab',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'Profile Tab',
        }}
      />
      <Tab.Screen
        name="GalleryTab"
        component={GalleryScreen}
        options={{
          tabBarLabel: 'Gallery',
          tabBarAccessibilityLabel: 'Gallery Tab',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;