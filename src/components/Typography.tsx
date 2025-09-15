import React, { forwardRef } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { getTheme, colors, typography, fontSize, fontWeight } from '../helpers/theme';

interface CustomTextProps extends RNTextProps {
  /** Text size variant or custom number */
  size?: keyof typeof fontSize | number;
  /** Font weight variant */
  weight?: keyof typeof fontWeight;
  /** Text color variant or custom color */
  color?: keyof typeof colors | string;
  /** Text transform */
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  /** Opacity level for dimmed text */
  dimRate?: number;
  /** Semantic text variants */
  variant?: 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning';
}

/**
 * Enhanced Text component with theme support and typography system
 * 
 * @example
 * <Text size="large" weight="bold" color="primary">
 *   Hello World
 * </Text>
 * 
 * <Text variant="secondary" dimRate={0.6}>
 *   Muted text
 * </Text>
 */
export const Text = forwardRef<RNText, CustomTextProps>(({
  size = 'body',
  weight = 'regular',
  color = 'textPrimary',
  textTransform = 'none',
  dimRate,
  variant,
  style,
  children,
  ...props
}, ref) => {
  const theme = getTheme();

  const getFontSize = (): number => {
    if (typeof size === 'number') return size;
    return fontSize[size] || fontSize.body;
  };

  const getLineHeight = (): number => {
    const fontSize = getFontSize();
    return Math.ceil(fontSize * 1.4); // 1.4 line height ratio
  };

  const getFontWeight = (): string => {
    return fontWeight[weight as keyof typeof fontWeight] || fontWeight.normal;
  };

  const getTextColor = (): string => {
    if (variant) {
      switch (variant) {
        case 'primary':
          return theme.colors.primary;
        case 'secondary':
          return theme.colors.onSurfaceVariant;
        case 'accent':
          return theme.colors.secondary;
        case 'error':
          return theme.colors.error;
        case 'success':
          return theme.colors.primary; // Use primary as success
        case 'warning':
          return theme.colors.tertiary;
        default:
          return theme.colors.onSurface;
      }
    }

    // Check if color is a theme color key
    if (color in colors) {
      const themeColor = theme.colors[color as keyof typeof theme.colors];
      return typeof themeColor === 'string' ? themeColor : colors.textPrimary;
    }

    // Check if it's a custom color from our colors object
    if (color in colors) {
      return colors[color as keyof typeof colors];
    }

    // Custom color string or fallback
    return typeof color === 'string' ? color : colors.textPrimary;
  };

  const finalColor = getTextColor();
  const colorWithOpacity = dimRate ? `${finalColor}${Math.floor(dimRate * 255).toString(16).padStart(2, '0')}` : finalColor;

  const textStyle = [
    styles.baseText,
    {
      fontSize: getFontSize(),
      lineHeight: getLineHeight(),
      fontWeight: getFontWeight() as any, // Cast to satisfy React Native's fontWeight type
      color: colorWithOpacity,
      textTransform,
    },
    style,
  ];

  return (
    <RNText ref={ref} style={textStyle} {...props}>
      {children}
    </RNText>
  );
});

Text.displayName = 'Text';

// Semantic text components
export const Title = forwardRef<RNText, Omit<CustomTextProps, 'size'>>(
  (props, ref) => <Text ref={ref} size="h1" weight="bold" {...props} />
);

export const Heading = forwardRef<RNText, Omit<CustomTextProps, 'size'>>(
  (props, ref) => <Text ref={ref} size="h2" weight="semibold" {...props} />
);

export const Body = forwardRef<RNText, CustomTextProps>(
  (props, ref) => <Text ref={ref} size="body" {...props} />
);

export const Caption = forwardRef<RNText, Omit<CustomTextProps, 'size'>>(
  (props, ref) => <Text ref={ref} size="caption" variant="secondary" {...props} />
);

export const Label = forwardRef<RNText, Omit<CustomTextProps, 'size'>>(
  (props, ref) => <Text ref={ref} size="body2" weight="medium" {...props} />
);

Title.displayName = 'Title';
Heading.displayName = 'Heading';
Body.displayName = 'Body';
Caption.displayName = 'Caption';
Label.displayName = 'Label';

const styles = StyleSheet.create({
  baseText: {
    includeFontPadding: false, // Android specific
    textAlignVertical: 'center', // Android specific
  },
});