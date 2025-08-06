import React, { forwardRef } from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps as RNRefreshControlProps } from 'react-native';
import { useRefresh } from '../hooks/useRefresh';
import { getTheme } from '../helpers/theme';

interface CustomRefreshControlProps extends Omit<RNRefreshControlProps, 'refreshing' | 'onRefresh'> {
  /** Custom refresh function */
  onRefresh?: () => Promise<void>;
  /** Custom refresh duration */
  duration?: number;
  /** Custom colors */
  colors?: string[];
  /** Tint color for iOS */
  tintColor?: string;
}

/**
 * Enhanced RefreshControl component with theme support
 * 
 * @example
 * <ScrollView
 *   refreshControl={
 *     <RefreshControl onRefresh={async () => await fetchData()} />
 *   }
 * >
 *   <Text>Pull to refresh</Text>
 * </ScrollView>
 */
export const RefreshControl = forwardRef<RNRefreshControl, CustomRefreshControlProps>(({
  onRefresh,
  duration = 2000,
  colors,
  tintColor,
  ...props
}, ref) => {
  const theme = getTheme();
  const [refreshing, handleRefresh] = useRefresh({
    duration,
    onRefresh,
  });

  const refreshColors = colors || [theme.colors.primary];
  const refreshTintColor = tintColor || theme.colors.primary;

  return (
    <RNRefreshControl
      ref={ref}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={refreshColors}
      tintColor={refreshTintColor}
      {...props}
    />
  );
});

RefreshControl.displayName = 'RefreshControl';