import React, { forwardRef } from 'react';
import { View as RNView, ViewProps as RNViewProps } from 'react-native';
import { getTheme, spacing, borderRadius } from '../helpers/theme';

interface CustomViewProps extends RNViewProps {
  /** Padding variant from theme */
  padding?: keyof typeof spacing | number;
  /** Margin variant from theme */
  margin?: keyof typeof spacing | number;
  /** Background color variant */
  backgroundColor?: string;
  /** Border radius variant */
  borderRadius?: keyof typeof borderRadius | number;
  /** Whether to use safe area padding */
  safeArea?: boolean;
  /** Common layout patterns */
  flex?: boolean | number;
  /** Center content */
  center?: boolean;
  /** Row layout */
  row?: boolean;
}

/**
 * Enhanced View component with theme support and common layout patterns
 * 
 * @example
 * <View padding="md" backgroundColor="surface" borderRadius="md">
 *   <Text>Content</Text>
 * </View>
 * 
 * <View row center padding="lg">
 *   <Text>Centered row content</Text>
 * </View>
 */
export const View = forwardRef<RNView, CustomViewProps>(({
  padding,
  margin,
  backgroundColor,
  borderRadius: borderRadiusProp,
  safeArea,
  flex,
  center,
  row,
  style,
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

  const getMargin = () => {
    if (typeof margin === 'number') return margin;
    if (margin && margin in spacing) {
      return spacing[margin];
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

  const getBorderRadius = () => {
    if (typeof borderRadiusProp === 'number') return borderRadiusProp;
    if (borderRadiusProp && borderRadiusProp in borderRadius) {
      return borderRadius[borderRadiusProp];
    }
    return undefined;
  };

  const viewStyle = [
    {
      padding: getPadding(),
      margin: getMargin(),
      backgroundColor: getBackgroundColor() as string,
      borderRadius: getBorderRadius(),
      ...(typeof flex === 'number' ? { flex } : flex ? { flex: 1 } : {}),
      ...(center ? { justifyContent: 'center' as const, alignItems: 'center' as const } : {}),
      ...(row ? { flexDirection: 'row' as const } : {}),
      ...(safeArea ? { paddingTop: 20 } : {}), // Fixed safe area padding
    },
    style,
  ];

  return (
    <RNView ref={ref} style={viewStyle} {...props}>
      {children}
    </RNView>
  );
});

View.displayName = 'View';

// Common layout components
export const Container = forwardRef<RNView, Omit<CustomViewProps, 'padding'>>(
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      flex
      padding="md"
      backgroundColor="background"
      style={style}
      {...props}
    />
  )
);

export const Card = forwardRef<RNView, CustomViewProps>(
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      backgroundColor="surface"
      borderRadius="md"
      padding="md"
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
      {...props}
    />
  )
);

export const Row = forwardRef<RNView, CustomViewProps>(
  (props, ref) => <View ref={ref} row {...props} />
);

export const Column = forwardRef<RNView, CustomViewProps>(
  (props, ref) => <View ref={ref} {...props} />
);

export const Spacer = forwardRef<RNView, { size?: keyof typeof spacing | number }>((
  { size = 'md', ...props },
  ref
) => {
  const spacerSize = typeof size === 'number' ? size : spacing[size];
  return <View ref={ref} style={{ width: spacerSize, height: spacerSize }} {...props} />;
});

Container.displayName = 'Container';
Card.displayName = 'Card';
Row.displayName = 'Row';
Column.displayName = 'Column';
Spacer.displayName = 'Spacer';