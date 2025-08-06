import React, { forwardRef } from 'react';
import { StyleSheet, View as RNView } from 'react-native';
import { View } from './Layout';
import { Text } from './Typography';
import { getTheme } from '../helpers/theme';

interface AlertLabelProps {
  /** Alert message text */
  text: string;
  /** Alert type */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Custom success state (legacy support) */
  success?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
}

/**
 * Alert label component for displaying status messages
 * 
 * @example
 * <AlertLabel text="Success message" type="success" />
 * <AlertLabel text="Error occurred" type="error" />
 * <AlertLabel text="Custom message" backgroundColor="#ff6b6b" />
 */
export const AlertLabel = forwardRef<RNView, AlertLabelProps>(({
  text,
  type = 'info',
  success,
  backgroundColor: customBackgroundColor,
  textColor = '#ffffff',
}, ref) => {
  const theme = getTheme();

  const getBackgroundColor = (): string => {
    if (customBackgroundColor) return customBackgroundColor;
    
    // Legacy support
    if (success !== undefined) {
      return success ? '#13d879' : '#ff1d00';
    }

    // Modern type-based colors
    switch (type) {
      case 'success':
        return '#13d879';
      case 'error':
        return '#ff1d00';
      case 'warning':
        return '#ff9500';
      case 'info':
      default:
        return theme.colors.primary;
    }
  };

  const alertStyle = [
    styles.container,
    {
      backgroundColor: getBackgroundColor(),
    },
  ];

  return (
    <View ref={ref} style={alertStyle}>
      <Text style={[styles.text, { color: textColor }]}>
        {text}
      </Text>
    </View>
  );
});

AlertLabel.displayName = 'AlertLabel';

const styles = StyleSheet.create({
  container: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});