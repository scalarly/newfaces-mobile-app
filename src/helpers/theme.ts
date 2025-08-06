import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Custom color palette
export const colors = {
  // Primary brand colors (matching legacy theme)
  primary: '#0052cd',
  primaryVariant: '#0031a3',
  
  // Secondary colors
  secondary: '#03DAC6',
  secondaryVariant: '#018786',
  
  // Surface and background colors
  surface: '#FFFFFF',
  background: '#F5F5F5',
  
  // Text colors
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onSurface: '#2C3E50',
  onBackground: '#2C3E50',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral colors
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
  
  // Text variations
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textDisabled: '#95A5A6',
  textHint: '#BDC3C7',
  
  // Legacy color (for backward compatibility)
  legacyBlue: '#0052cd',
};

// Font configuration
const fontConfig = {
  fontFamily: 'System',
};

const fonts = configureFonts({
  config: {
    ...fontConfig,
  },
});

// Light theme configuration
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryVariant,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryVariant,
    surface: colors.surface,
    surfaceVariant: colors.grey100,
    background: colors.background,
    error: colors.error,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSurface: colors.onSurface,
    onBackground: colors.onBackground,
    onError: colors.onPrimary,
    // Custom additions
    outline: colors.grey300,
    outlineVariant: colors.grey200,
  },
  fonts,
};

// Dark theme configuration
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryVariant,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryVariant,
    surface: colors.grey800,
    surfaceVariant: colors.grey700,
    background: colors.grey900,
    error: colors.error,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
    onError: colors.onPrimary,
    // Custom additions
    outline: colors.grey600,
    outlineVariant: colors.grey700,
  },
  fonts,
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius system
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

// Shadow presets
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Typography system
export const fontSize = {
  small: 12,
  caption: 12,
  body: 14,
  body2: 14,
  body1: 16,
  h6: 16,
  h5: 18,
  h4: 20,
  h3: 24,
  h2: 28,
  h1: 32,
  large: 20,
  xlarge: 24,
};

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography = {
  fontSize,
  fontWeight,
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

// Icon sizes
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

// Z-index levels
export const zIndex = {
  base: 0,
  dropdown: 1000,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
};

// Common layout dimensions
export const layout = {
  headerHeight: 56,
  tabBarHeight: 60,
  buttonHeight: 48,
  inputHeight: 56,
  listItemHeight: 72,
};

// Helper functions for theme usage
export const getTheme = (isDark: boolean = false): MD3Theme => {
  return isDark ? darkTheme : lightTheme;
};

export const getColor = (colorName: keyof typeof colors): string => {
  return colors[colorName];
};

export const getSpacing = (size: keyof typeof spacing): number => {
  return spacing[size];
};

export const getBorderRadius = (size: keyof typeof borderRadius): number => {
  return borderRadius[size];
};

export const getShadow = (size: keyof typeof shadows) => {
  return shadows[size];
};

export const getTypography = (variant: keyof typeof typography) => {
  return typography[variant];
};

export const getIconSize = (size: keyof typeof iconSizes): number => {
  return iconSizes[size];
};

// Legacy theme object for backward compatibility
export const legacyTheme = {
  color: colors.legacyBlue,
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
};

// Default export
export default {
  light: lightTheme,
  dark: darkTheme,
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  iconSizes,
  animations,
  breakpoints,
  zIndex,
  layout,
  getTheme,
  getColor,
  getSpacing,
  getBorderRadius,
  getShadow,
  getTypography,
  getIconSize,
  legacy: legacyTheme,
};