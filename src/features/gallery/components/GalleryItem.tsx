/**
 * GalleryItem - Enhanced gallery item component with multi-selection
 */

import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { View } from '../../../components/Layout';
import { Text } from '../../../components/Typography';
import { Image } from '../../../components/Image';
import { GradientView, gradientPresets } from './GradientView';
import { colors, spacing } from '../../../helpers/theme';
import { GalleryImage } from '../types';
import Icon from 'react-native-vector-icons/Feather';

export interface GalleryItemProps {
  item: GalleryImage;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: (item: GalleryImage) => void;
  onLongPress: (item: GalleryImage) => void;
  itemWidth: number;
  showTitle?: boolean;
  borderRadius?: number;
  style?: ViewStyle;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({
  item,
  isSelected,
  isSelectionMode,
  onPress,
  onLongPress,
  itemWidth,
  showTitle = true,
  borderRadius = 8,
  style,
}) => {
  const itemHeight = itemWidth * 0.75; // 4:3 aspect ratio

  const handlePress = () => {
    onPress(item);
  };

  const handleLongPress = () => {
    onLongPress(item);
  };

  return (
    <Pressable
      style={[
        styles.container,
        { width: itemWidth },
        isSelected && styles.selectedContainer,
        style,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      android_ripple={{ color: colors.primary + '20' }}
    >
      <View style={styles.imageContainer}>
        <Image
          src={item.url || item.path}
          style={[
            styles.image,
            { 
              width: itemWidth, 
              height: itemHeight,
              borderRadius,
            }
          ]}
          showLoading
          borderRadius={borderRadius}
        />
        
        {/* Selection overlay */}
        {isSelectionMode && (
          <View style={styles.overlay}>
            <GradientView
              colors={isSelected ? [...gradientPresets.selection.colors] : ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']}
              style={StyleSheet.flatten([styles.overlayGradient, { borderRadius }])}
            />
            
            {/* Selection indicator */}
            <View style={styles.selectionIndicator}>
              {isSelected ? (
                <View style={styles.selectedIcon}>
                  <Icon name="check" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.unselectedIcon} />
              )}
            </View>
          </View>
        )}
        
        {/* Title overlay */}
        {showTitle && (
          <View style={[styles.titleContainer, { borderRadius }]}>
            <GradientView
              colors={[...gradientPresets.dark.colors]}
              style={styles.titleGradient}
            />
            <Text 
              size="caption" 
              color="white" 
              style={styles.title}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  selectedContainer: {
    transform: [{ scale: 0.95 }],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.grey200,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unselectedIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 32,
  },
  titleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  title: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
