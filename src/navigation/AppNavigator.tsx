import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
} from '../screens';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';

// Re-export types for convenience
export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main App Navigator
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator
        initialRouteName="Login"
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
          name="Loader"
          component={LoaderScreen}
          options={{
            title: 'Loading',
            headerShown: false,
            gestureEnabled: false,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;