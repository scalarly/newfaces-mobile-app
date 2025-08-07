/**
 * GalleryHeader - Enhanced gallery header with album download
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../../../components/Layout';
import { Text } from '../../../components/Typography';
import { Pressable } from '../../../components/Pressable';
import { GradientView, gradientPresets } from './GradientView';
import { colors, spacing } from '../../../helpers/theme';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from 'react-native-vector-icons/Feather';

export interface GalleryHeaderProps {
  title: string;
  subtitle?: string;
  showAlbumDownload?: boolean;
  onAlbumDownload?: () => void;
  isLoading?: boolean;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  title,
  subtitle,
  showAlbumDownload = false,
  onAlbumDownload,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <GradientView
        colors={[...gradientPresets.ocean.colors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>

        {showAlbumDownload && onAlbumDownload && (
          <Pressable
            style={styles.albumButton}
            onPress={onAlbumDownload}
            disabled={isLoading}
          >
            <Icon 
              name={isLoading ? "loader" : "download-cloud"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.albumButtonText}>
              {isLoading ? 'Downloading...' : 'Download Album'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  albumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: spacing.xs,
  },
  albumButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
