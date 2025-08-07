/**
 * LegacyButton - Button component that matches legacy app styling
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

export interface LegacyButtonProps {
  /** Button text */
  text: string;
  /** Press handler */
  onPress: () => void;
  /** Button disabled state */
  disabled?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Custom button style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Button variant */
  variant?: 'primary' | 'text';
}

export const LegacyButton: React.FC<LegacyButtonProps> = ({
  text,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button];
    
    if (variant === 'primary') {
      baseStyle.push(styles.btnPrimary);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle[] = [styles.buttonText];
    
    if (variant === 'primary') {
      baseStyle.push(styles.btnText);
    } else if (variant === 'text') {
      baseStyle.push(styles.textButtonText);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.buttonTextDisabled);
    }
    
    if (textStyle) {
      baseStyle.push(textStyle);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={getTextStyle()}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimary: {
    marginTop: 32,
    backgroundColor: '#0052CD',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: 0.03,
  },
  textButtonText: {
    color: '#0052CD',
    fontWeight: '500',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});
