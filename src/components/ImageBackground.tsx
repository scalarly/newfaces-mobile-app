import React, { forwardRef } from 'react';
import {
  ImageBackground as RNImageBackground,
  ImageBackgroundProps as RNImageBackgroundProps,
} from 'react-native';

interface CustomImageBackgroundProps extends Omit<RNImageBackgroundProps, 'source'> {
  /** Image source - URI string or require() */
  src?: string;
  /** Asset from require() */
  asset?: any;
  /** Alternative source prop */
  source?: RNImageBackgroundProps['source'];
}

/**
 * Enhanced ImageBackground component with flexible source options
 * 
 * @example
 * <ImageBackground src="https://example.com/bg.jpg">
 *   <Text>Content over background</Text>
 * </ImageBackground>
 * 
 * <ImageBackground asset={require('../assets/background.png')}>
 *   <View>Overlay content</View>
 * </ImageBackground>
 */
export const ImageBackground = forwardRef<RNImageBackground, CustomImageBackgroundProps>(({
  src,
  asset,
  source,
  children,
  ...props
}, ref) => {
  // Determine the source
  const imageSource = (() => {
    if (source) return source;
    if (asset) return asset;
    if (src) return { uri: src };
    return undefined;
  })();

  return (
    <RNImageBackground
      ref={ref}
      source={imageSource}
      {...props}
    >
      {children}
    </RNImageBackground>
  );
});

ImageBackground.displayName = 'ImageBackground';