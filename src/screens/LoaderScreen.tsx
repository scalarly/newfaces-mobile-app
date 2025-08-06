import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../helpers/theme';

/**
 * LoaderScreen - A modern loading screen with spinner animation
 * Replaces the legacy LoaderScreen.js with modern TypeScript implementation
 */

interface LoaderScreenProps {
  /** Optional message to display below the loader */
  message?: string;
  /** Custom color for the loader */
  color?: string;
  /** Size of the loader */
  size?: 'small' | 'large';
}

const LoaderScreen: React.FC<LoaderScreenProps> = ({ 
  message,
  color = colors.primary,
  size = 'large'
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          <ActivityIndicator
            size={size}
            color={color}
            animating={true}
          />
          {message && (
            <Animated.Text style={styles.message}>
              {message}
            </Animated.Text>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.onSurface,
    textAlign: 'center',
  },
});

export default LoaderScreen;