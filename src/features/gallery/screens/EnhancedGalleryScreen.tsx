/**
 * EnhancedGalleryScreen - Modern gallery with all requested features
 * - Multi-selection and batch operations
 * - PDF export functionality
 * - File download with progress tracking
 * - Authenticated image requests
 * - Linear gradient support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, Dimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our enhanced components
import { View, Container } from '../../../components/Layout';
import { Text } from '../../../components/Typography';
import { Image } from '../../../components/Image';
import { Pressable } from '../../../components/Pressable';
import { Header } from '../../../components/Header';
import { BottomNavigation } from '../../../components/BottomNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useToggle } from '../../../hooks/useToggle';

// Gallery feature components
import { GalleryItem } from '../components/GalleryItem';
import { GallerySelectionBar } from '../components/GallerySelectionBar';
import { GalleryHeader } from '../components/GalleryHeader';
import { GradientView, gradientPresets } from '../components/GradientView';

// Services
import { galleryService } from '../services/GalleryService';
import { permissionsService } from '../services/PermissionsService';

// Types
import { GalleryImage, DownloadProgress } from '../types';

import { colors, spacing } from '../../../helpers/theme';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');
const itemSpacing = spacing.md;
const itemsPerRow = 2;
const itemWidth = (width - itemSpacing * 3) / itemsPerRow;

export const EnhancedGalleryScreen: React.FC = () => {
  const { t } = useTranslation();
  
  // State management
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Selection state
  const [isSelectionMode, toggleSelectionMode] = useToggle(false);
  const [selectedCount, setSelectedCount] = useState(0);
  
  // Operation states
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState(false);

  // Selected image for full screen view
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Initialize gallery service listeners
  useEffect(() => {
    galleryService.setEventListeners({
      onDownloadProgress: (progress) => {
        setDownloadProgress(progress);
      },
      onDownloadComplete: (result) => {
        setIsDownloading(false);
        setIsExportingPDF(false);
        setIsDownloadingAlbum(false);
        setDownloadProgress(null);
        
        if (result.success) {
          Alert.alert(
            'Success',
            `File saved successfully${result.filePath ? `\nLocation: ${result.filePath}` : ''}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Error',
            result.error || 'Operation failed',
            [{ text: 'OK' }]
          );
        }
      },
      onSelectionChange: (count) => {
        setSelectedCount(count);
        if (count === 0 && isSelectionMode) {
          toggleSelectionMode();
        }
      },
    });

    return () => {
      galleryService.cleanup();
    };
  }, [isSelectionMode, toggleSelectionMode]);

  // Load gallery data
  const loadGalleryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const galleryData = await galleryService.fetchGalleryData();
      setImages(galleryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load gallery';
      setError(errorMessage);
      console.error('Gallery load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh gallery data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGalleryData();
    setRefreshing(false);
  }, [loadGalleryData]);

  // Load data on mount
  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  // Handle image press
  const handleImagePress = useCallback((image: GalleryImage) => {
    if (isSelectionMode) {
      galleryService.toggleImageSelection(image.id);
    } else {
      setSelectedImage(image);
    }
  }, [isSelectionMode]);

  // Handle image long press (start selection mode)
  const handleImageLongPress = useCallback((image: GalleryImage) => {
    if (!isSelectionMode) {
      toggleSelectionMode();
      galleryService.toggleImageSelection(image.id);
    }
  }, [isSelectionMode, toggleSelectionMode]);

  // Selection operations
  const handleSelectAll = useCallback(() => {
    galleryService.selectAllImages(images);
  }, [images]);

  const handleClearSelection = useCallback(() => {
    galleryService.clearSelection();
  }, []);

  const isAllSelected = selectedCount === images.length && images.length > 0;

  // Download operations
  const handleDownloadSelected = useCallback(async () => {
    try {
      setIsDownloading(true);
      
      const hasPermissions = await permissionsService.hasRequiredPermissions();
      if (!hasPermissions) {
        const granted = await permissionsService.showPermissionRationale();
        if (!granted) {
          setIsDownloading(false);
          return;
        }
      }

      await galleryService.downloadSelectedImages(images, (progress) => {
        // Overall progress is handled by the service event listener
      });
      
      // Clear selection after successful download
      galleryService.clearSelection();
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [images]);

  // PDF export
  const handleExportPDF = useCallback(async () => {
    try {
      setIsExportingPDF(true);
      
      const hasPermissions = await permissionsService.hasRequiredPermissions();
      if (!hasPermissions) {
        const granted = await permissionsService.showPermissionRationale();
        if (!granted) {
          setIsExportingPDF(false);
          return;
        }
      }

      await galleryService.exportSelectedImagesToPDF(images, {
        title: 'Gallery Export',
        orientation: 'portrait',
        format: 'A4',
      });
      
      // Clear selection after successful export
      galleryService.clearSelection();
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  }, [images]);

  // Album download
  const handleAlbumDownload = useCallback(async () => {
    try {
      setIsDownloadingAlbum(true);
      
      const hasPermissions = await permissionsService.hasRequiredPermissions();
      if (!hasPermissions) {
        const granted = await permissionsService.showPermissionRationale();
        if (!granted) {
          setIsDownloadingAlbum(false);
          return;
        }
      }

      await galleryService.downloadAlbum();
    } catch (error) {
      console.error('Album download failed:', error);
    }
  }, []);

  // Render gallery item
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

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
              <Icon name="image" size={64} color={colors.grey400} />
        <Text style={styles.emptyTitle}>No Images Found</Text>
        <Text style={styles.emptyDescription}>
          Your gallery is empty. Images will appear here once they're uploaded.
        </Text>
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('mobile.titles.gallery')} showNotification />
        <Container style={styles.content}>
          <View style={styles.loadingContainer}>
            <Icon name="loader" size={48} color={colors.primary} />
            <Text style={styles.loadingText}>Loading gallery...</Text>
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
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.errorTitle}>Failed to Load Gallery</Text>
            <Text style={styles.errorDescription}>Note: Feature is under development</Text>
            <Pressable style={styles.retryButton} onPress={loadGalleryData}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </Container>
        <BottomNavigation />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient */}
      <GradientView
        colors={['#f8f9fa', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Header 
        title={isSelectionMode ? `${selectedCount} Selected` : t('mobile.titles.gallery')} 
        showNotification={!isSelectionMode}
        canGoBack={isSelectionMode}
        onBackPress={isSelectionMode ? handleClearSelection : undefined}
      />
      
      <Container style={styles.content}>
        {/* Gallery header with album download */}
        <GalleryHeader
          title="Photo Gallery"
          subtitle={`${images.length} image${images.length !== 1 ? 's' : ''}`}
          showAlbumDownload={!isSelectionMode && images.length > 0}
          onAlbumDownload={handleAlbumDownload}
          isLoading={isDownloadingAlbum}
        />

        {/* Gallery grid */}
        <FlatList
          data={images}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id}
          numColumns={itemsPerRow}
          columnWrapperStyle={itemsPerRow > 1 ? styles.row : undefined}
          contentContainerStyle={[
            styles.flatListContent,
            images.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={renderEmptyState}
        />

        {/* Progress overlay */}
        {downloadProgress && (
          <View style={styles.progressOverlay}>
            <GradientView
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
              style={styles.progressBackground}
            />
            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>
                {downloadProgress.status === 'downloading' ? 'Downloading...' : 'Processing...'}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${downloadProgress.progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(downloadProgress.progress)}%
              </Text>
            </View>
          </View>
        )}
      </Container>

      {/* Selection bar */}
      {isSelectionMode && (
        <GallerySelectionBar
          selectedCount={selectedCount}
          totalCount={images.length}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onDownloadSelected={handleDownloadSelected}
          onExportPDF={handleExportPDF}
          isLoading={isDownloading || isExportingPDF}
        />
      )}

      {/* Full screen image viewer */}
      {selectedImage && (
        <Pressable 
          style={styles.fullScreenOverlay}
          onPress={() => setSelectedImage(null)}
        >
          <GradientView
            colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)']}
            style={StyleSheet.absoluteFillObject}
          />
          <Image
            src={selectedImage.url || selectedImage.path}
            style={styles.fullScreenImage}
            showLoading
          />
        </Pressable>
      )}

      {/* Bottom Navigation */}
      {!isSelectionMode && <BottomNavigation />}
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
  flatListContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.grey600,
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.grey700,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.grey500,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Progress overlay
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  progressBar: {
    width: 160,
    height: 4,
    backgroundColor: colors.grey200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    marginTop: spacing.sm,
    color: colors.grey600,
  },
  
  // Full screen image
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullScreenImage: {
    width: width - 40,
    height: (width - 40) * 0.75,
    maxHeight: '80%',
    borderRadius: 8,
  },
});

export default EnhancedGalleryScreen;
