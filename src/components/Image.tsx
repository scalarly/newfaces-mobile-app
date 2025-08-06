import React, { forwardRef, useState } from 'react';
import {
  Image as RNImage,
  ImageProps as RNImageProps,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Text } from './Typography';
import { getTheme } from '../helpers/theme';

interface CustomImageProps extends Omit<RNImageProps, 'source'> {
  /** Image source - URI string or require() */
  src?: string;
  /** Asset from require() */
  asset?: any;
  /** Alternative source prop */
  source?: RNImageProps['source'];
  /** Show loading indicator */
  showLoading?: boolean;
  /** Placeholder content while loading */
  placeholder?: React.ReactNode;
  /** Error fallback content */
  errorFallback?: React.ReactNode;
  /** Border radius */
  borderRadius?: number;
  /** Aspect ratio (width/height) */
  aspectRatio?: number;
}

/**
 * Enhanced Image component with loading states and error handling
 * 
 * @example
 * <Image 
 *   src="https://example.com/image.jpg"
 *   showLoading
 *   borderRadius={8}
 *   aspectRatio={16/9}
 * />
 * 
 * <Image asset={require('../assets/logo.png')} />
 */
export const Image = forwardRef<RNImage, CustomImageProps>(({
  src,
  asset,
  source,
  showLoading = false,
  placeholder,
  errorFallback,
  borderRadius,
  aspectRatio,
  style,
  onLoadStart,
  onLoad,
  onError,
  ...props
}, ref) => {
  const [loading, setLoading] = useState(showLoading);
  const [error, setError] = useState(false);
  const theme = getTheme();

  // Determine the source
  const imageSource = (() => {
    if (source) return source;
    if (asset) return asset;
    if (src) return { uri: src };
    return undefined;
  })();

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoad = (event: any) => {
    setLoading(false);
    onLoad?.(event);
  };

  const handleError = (event: any) => {
    setLoading(false);
    setError(true);
    onError?.(event);
  };

  const imageStyle = [
    {
      borderRadius,
      ...(aspectRatio ? { aspectRatio } : {}),
    },
    style,
  ];

  const containerStyle = [
    imageStyle,
    styles.container,
  ];

  if (error && errorFallback) {
    return (
      <View style={containerStyle}>
        {errorFallback}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[containerStyle, styles.errorContainer]}>
        <Text size="caption" color="onSurfaceVariant">
          Failed to load image
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <RNImage
        ref={ref}
        source={imageSource}
        style={imageStyle}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {loading && (placeholder || (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ))}
    </View>
  );
});

Image.displayName = 'Image';

// Specialized image components
export const Avatar = forwardRef<RNImage, CustomImageProps & { size?: number }>((
  { size = 40, style, ...props },
  ref
) => (
  <Image
    ref={ref}
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      },
      style,
    ]}
    {...props}
  />
));

export const Icon = forwardRef<RNImage, CustomImageProps & { size?: number }>((
  { size = 24, style, ...props },
  ref
) => (
  <Image
    ref={ref}
    style={[
      {
        width: size,
        height: size,
      },
      style,
    ]}
    {...props}
  />
));

Avatar.displayName = 'Avatar';
Icon.displayName = 'Icon';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    minHeight: 100,
  },
});