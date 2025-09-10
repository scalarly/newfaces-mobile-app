/**
 * EnhancedGalleryScreen - Simplified to show only album link
 * 
 * This screen now shows only the album download link as a styled button.
 * All other gallery functionality is commented out for future use.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our enhanced components
import { View, Container } from '../../../components/Layout';
import { Text } from '../../../components/Typography';
import { Pressable } from '../../../components/Pressable';
import { Header } from '../../../components/Header';
import { BottomNavigation } from '../../../components/BottomNavigation';
import { useTranslation } from '../../../hooks/useTranslation';

// Gallery feature components - COMMENTED OUT FOR FUTURE USE
// import { GalleryItem } from '../components/GalleryItem';
// import { GallerySelectionBar } from '../components/GallerySelectionBar';
// import { GalleryHeader } from '../components/GalleryHeader';
import { GradientView } from '../components/GradientView';

// Services
import { galleryService } from '../services/GalleryService';

// Types
import { GalleryImage } from '../types';

import { colors, spacing } from '../../../helpers/theme';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

export const EnhancedGalleryScreen: React.FC = () => {
  const { t } = useTranslation();
  
  // State management - SIMPLIFIED FOR ALBUM LINK ONLY
  const [images, setImages] = useState<GalleryImage[]>([]); // Keep for future use
  const [albumLink, setAlbumLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState(false);

  // COMMENTED OUT FOR FUTURE USE - Selection and other states
  // const [refreshing, setRefreshing] = useState(false);
  // const [isSelectionMode, toggleSelectionMode] = useToggle(false);
  // const [selectedCount, setSelectedCount] = useState(0);
  // const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  // const [isDownloading, setIsDownloading] = useState(false);
  // const [isExportingPDF, setIsExportingPDF] = useState(false);
  // const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Initialize gallery service listeners - SIMPLIFIED FOR ALBUM LINK ONLY
  useEffect(() => {
    galleryService.setEventListeners({
      onDownloadComplete: (result) => {
        setIsDownloadingAlbum(false);
        
        if (result.success) {
          // No need to show success alert for opening external links
          console.log('✅ Album link opened successfully');
        } else {
          Alert.alert(
            'Error',
            result.error || 'Failed to open album link',
            [{ text: 'OK' }]
          );
        }
      },
    });

    return () => {
      galleryService.cleanup();
    };
  }, []);

  // Load gallery data - SIMPLIFIED FOR ALBUM LINK ONLY
  const loadGalleryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const galleryData = await galleryService.fetchGalleryData();
      setImages(galleryData.images); // Keep for future use
      setAlbumLink(galleryData.albumLink);
      
      console.log('📸 Gallery loaded:', {
        imageCount: galleryData.images.length,
        hasAlbumLink: !!galleryData.albumLink,
        albumLink: galleryData.albumLink ? 'Available' : 'Not available'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load gallery data';
      setError(errorMessage);
      console.error('Gallery load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  // Open album link - ONLY FUNCTIONALITY ACTIVE
  const handleOpenAlbum = useCallback(async () => {
    try {
      setIsDownloadingAlbum(true);
      await galleryService.openAlbumLink(albumLink);
    } catch (error) {
      console.error('Failed to open album:', error);
      setIsDownloadingAlbum(false);
    }
  }, [albumLink]);

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('mobile.titles.gallery')} showNotification />
        <Container style={styles.content}>
          <View style={styles.centerContainer}>
            <Icon name="loader" size={48} color={colors.primary} />
            <Text style={styles.loadingText}>{t('mobile.gallery.loadingImages')}</Text>
          </View>
        </Container>
        <BottomNavigation />
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('mobile.titles.gallery')} showNotification />
        <Container style={styles.content}>
          <View style={styles.centerContainer}>
            <Icon name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.errorTitle}>{t('mobile.gallery.albumError')}</Text>
            <Text style={styles.errorDescription}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadGalleryData}>
              <Text style={styles.retryButtonText}>{t('general.tryAgain')}</Text>
            </Pressable>
          </View>
        </Container>
        <BottomNavigation />
      </SafeAreaView>
    );
  }

  // Render main screen with album link only
  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient */}
      <GradientView
        colors={['#f8f9fa', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Header 
        title={t('mobile.titles.gallery')} 
        showNotification 
      />
      
      <Container style={styles.content}>
        <View style={styles.centerContainer}>
          {/* Gallery Icon */}
          <View style={styles.iconContainer}>
            <Icon name="image" size={64} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Photo Gallery</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {images.length > 0 
              ? `${images.length} image${images.length !== 1 ? 's' : ''} available`
              : 'Your photo collection'
            }
          </Text>

          {/* Open Album Button */}
          {albumLink ? (
            <Pressable
              style={[styles.albumButton, isDownloadingAlbum && styles.albumButtonDisabled]}
              onPress={handleOpenAlbum}
              disabled={isDownloadingAlbum}
            >
              <GradientView
                colors={isDownloadingAlbum ? ['#9CA3AF', '#6B7280'] : ['#0052CD', '#003A8C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.albumButtonGradient}
              />
              
              <View style={styles.albumButtonContent}>
                <View style={styles.albumButtonTextContainer}>
                  <Text style={styles.albumButtonTitle}>
                    {isDownloadingAlbum ? t('mobile.gallery.downloadingAlbum') : t('mobile.gallery.openAlbum')}
                  </Text>
                  <Text style={styles.albumButtonSubtitle}>
                    {t('mobile.gallery.viewInDrive')}
                  </Text>
                </View>
                
                <Icon 
                  name={isDownloadingAlbum ? "loader" : "chevron-right"} 
                  size={24} 
                  color="#FFFFFF" 
                  style={styles.albumButtonIcon}
                />
              </View>
            </Pressable>
          ) : (
            <View style={styles.noAlbumContainer}>
              <Icon name="folder-x" size={32} color={colors.grey400} />
              <Text style={styles.noAlbumText}>{t('mobile.gallery.noAlbum')}</Text>
            </View>
          )}

          {/* Info text */}
          {albumLink && (
            <Text style={styles.infoText}>
              {t('mobile.gallery.viewInDrive')}
            </Text>
          )}
        </View>
      </Container>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginBottom: 66, // Account for bottom navigation
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  // Loading and error states
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.grey600,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorDescription: {
    fontSize: 14,
    color: colors.grey600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Main content styles
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.grey900,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey600,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },

  // Album button styles
  albumButton: {
    width: width - (spacing.xl * 2),
    height: 60,
    borderRadius: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  albumButtonDisabled: {
    opacity: 0.7,
  },
  albumButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  albumButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  albumButtonTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  albumButtonSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  albumButtonIcon: {
    position: 'absolute',
    right: spacing.md,
  },

  // No album state
  noAlbumContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.grey100,
  },
  noAlbumText: {
    fontSize: 16,
    color: colors.grey500,
    marginTop: spacing.sm,
  },

  // Info text
  infoText: {
    fontSize: 14,
    color: colors.grey500,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// COMMENTED OUT FOR FUTURE USE - All the complex gallery functionality
/*
  // Multi-selection functionality
  const [isSelectionMode, toggleSelectionMode] = useToggle(false);
  const [selectedCount, setSelectedCount] = useState(0);
  
  // Download and PDF export functionality
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Full screen image view
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  // Image grid rendering
  const renderGalleryItem = useCallback(({ item, index }: { item: GalleryImage; index: number }) => {
    const isSelected = galleryService.isImageSelected(item.id);
    
    return (
      <GalleryItem
        item={item}
        isSelected={isSelected}
        isSelectionMode={isSelectionMode}
        onPress={handleImagePress}
        onLongPress={handleImageLongPress}
        itemWidth={itemWidth}
        style={{
          marginLeft: index % itemsPerRow === 0 ? 0 : itemSpacing,
        }}
      />
    );
  }, [isSelectionMode, handleImagePress, handleImageLongPress]);
  
  // Selection operations
  const handleSelectAll = useCallback(() => {
    galleryService.selectAllImages(images);
  }, [images]);

  const handleClearSelection = useCallback(() => {
    galleryService.clearSelection();
  }, []);
  
  // Download and export operations
  const handleDownloadSelected = useCallback(async () => {
    // Implementation for downloading selected images
  }, []);

  const handleExportPDF = useCallback(async () => {
    // Implementation for PDF export
  }, []);
*/

export default EnhancedGalleryScreen;