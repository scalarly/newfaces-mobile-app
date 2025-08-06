import React, { forwardRef } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  ViewStyle,
  View as RNView,
} from 'react-native';
import { getTheme, spacing, borderRadius } from '../helpers/theme';

interface CustomPressableProps extends RNPressableProps {
  /** Padding variant from theme */
  padding?: keyof typeof spacing | number;
  /** Border radius variant */
  borderRadius?: keyof typeof borderRadius | number;
  /** Background color variant */
  backgroundColor?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Press feedback scale */
  scaleOnPress?: number;
  /** Press feedback opacity */
  opacityOnPress?: number;
  /** Haptic feedback type */
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection';
}

/**
 * Enhanced Pressable component with theme support and feedback options
 * 
 * @example
 * <Pressable 
 *   padding="md"
 *   borderRadius="md"
 *   backgroundColor="primary"
 *   scaleOnPress={0.95}
 *   onPress={() => console.log('Pressed')}
 * >
 *   <Text>Press me</Text>
 * </Pressable>
 */
export const Pressable = forwardRef<RNView, CustomPressableProps>(({
  padding,
  borderRadius: borderRadiusProp,
  backgroundColor,
  disabled = false,
  scaleOnPress,
  opacityOnPress = 0.7,
  hapticFeedback,
  style,
  onPress,
  children,
  ...props
}, ref) => {
  const theme = getTheme();

  const getPadding = () => {
    if (typeof padding === 'number') return padding;
    if (padding && padding in spacing) {
      return spacing[padding];
    }
    return undefined;
  };

  const getBorderRadius = () => {
    if (typeof borderRadiusProp === 'number') return borderRadiusProp;
    if (borderRadiusProp && borderRadiusProp in borderRadius) {
      return borderRadius[borderRadiusProp];
    }
    return undefined;
  };

  const getBackgroundColor = () => {
    if (!backgroundColor) return undefined;
    
    // Check if it's a theme color
    if (backgroundColor in theme.colors) {
      return theme.colors[backgroundColor as keyof typeof theme.colors];
    }
    
    return backgroundColor;
  };

  const handlePress = (event: any) => {
    if (disabled) return;

    // Add haptic feedback if requested
    if (hapticFeedback) {
      // Note: In a real app, you'd import from 'expo-haptics' or 'react-native-haptic-feedback'
      // HapticFeedback.trigger(hapticFeedback);
    }

    onPress?.(event);
  };

  const baseStyle: ViewStyle = {
    padding: getPadding(),
    borderRadius: getBorderRadius(),
    backgroundColor: getBackgroundColor() as string,
    opacity: disabled ? 0.5 : 1,
  };

  const pressableStyle = ({ pressed }: { pressed: boolean }): ViewStyle[] => {
    const pressedStyle: ViewStyle = {};
    
    if (pressed) {
      if (scaleOnPress) {
        pressedStyle.transform = [{ scale: scaleOnPress }];
      }
      if (opacityOnPress) {
        pressedStyle.opacity = opacityOnPress;
      }
    }

    return [
      baseStyle,
      pressedStyle,
      (typeof style === 'function' ? style({ pressed }) : style) as ViewStyle,
    ];
  };

  return (
    <RNPressable
      ref={ref}
      style={pressableStyle}
      onPress={handlePress}
      disabled={disabled}
      {...props}
    >
      {children}
    </RNPressable>
  );
});

Pressable.displayName = 'Pressable';