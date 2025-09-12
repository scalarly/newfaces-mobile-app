/**
 * Gallery Service - Main service for gallery operations
 * Coordinates file downloads, PDF generation, and multi-selection operations
 */

import { apiService } from '../../../helpers/request';
import { fileSystemService } from './FileSystemService';
import { pdfService } from './PDFService';
import { permissionsService } from './PermissionsService';
import { 
  GalleryImage, 
  GalleryAlbum, 
  DownloadProgress, 
  PDFExportOptions,
  AuthenticatedImageRequest 
} from '../types';

export interface GalleryServiceEvents {
  onDownloadProgress: (progress: DownloadProgress) => void;
  onDownloadComplete: (result: { success: boolean; filePath?: string; error?: string }) => void;
  onSelectionChange: (selectedCount: number) => void;
}

export class GalleryService {
  private static instance: GalleryService;
  private selectedImages: Set<string> = new Set();
  private eventListeners: Partial<GalleryServiceEvents> = {};

  private constructor() {}

  static getInstance(): GalleryService {
    if (!GalleryService.instance) {
      GalleryService.instance = new GalleryService();
    }
    return GalleryService.instance;
  }

  /**
   * Set event listeners
   */
  setEventListeners(listeners: Partial<GalleryServiceEvents>): void {
    this.eventListeners = { ...this.eventListeners, ...listeners };
  }

  /**
   * Fetch gallery data from API
   */
  async fetchGalleryData(): Promise<{ images: GalleryImage[]; albumLink: string | null }> {
    try {
      console.log('🔍 Fetching gallery data from API...');
      
      // Get gallery data from me/album endpoint (contains both images and album_link)
      const galleryResponse = await apiService.get('me/album');
      
      console.log('📡 Raw API response for me/album:', {
        status: galleryResponse.status,
        data: galleryResponse.data,
        dataKeys: galleryResponse.data ? Object.keys(galleryResponse.data) : 'no data',
        fullResponse: JSON.stringify(galleryResponse.data, null, 2)
      });

      // According to API docs: response structure is { status, http_status, data: { album_link, images } }
      const galleryData = galleryResponse.data.data || galleryResponse.data;
      const images = galleryData?.images || [];
      
      // Album link is directly in the gallery response data
      const albumLink = galleryData?.album_link || null;
      
      console.log('🔍 Album link extraction:', {
        foundAlbumLink: albumLink,
        albumLinkType: typeof albumLink,
        albumLinkLength: albumLink?.length,
        extractionPath: albumLink ? 'data.album_link' : 'not found'
      });

      // If images is an array directly (like legacy), process it
      let processedImages: GalleryImage[] = [];
      
      if (Array.isArray(images)) {
        processedImages = images.map((item) => ({
          id: item.id?.toString() || `img_${Math.random()}`,
          path: item.path || '',
          url: `${apiService.baseURL}/${item.path}`,
          title: item.title || `Image ${item.id}`,
          type: 'image' as const,
          size: item.size,
          mimeType: item.mime_type || 'image/jpeg',
          createdAt: item.created_at,
          isSelected: false,
        }));
      }

      console.log('📸 Final gallery data:', {
        imageCount: processedImages.length,
        hasAlbumLink: !!albumLink,
        albumLink: albumLink ? `${albumLink.substring(0, 50)}...` : null,
        sampleImage: processedImages[0] || 'no images'
      });

      return {
        images: processedImages,
        albumLink
      };
    } catch (error) {
      console.error('❌ Failed to fetch gallery data:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      throw error;
    }
  }

  /**
   * Create authenticated image request with proper headers
   */
  createAuthenticatedImageRequest(imagePath: string): AuthenticatedImageRequest {
    // Get the auth token from storage or context
    const userToken = this.getUserToken();
    
    return {
      uri: `${apiService.baseURL}/${imagePath}`,
      headers: {
        'Cookie': `session=${userToken}`,
        'Authorization': `Bearer ${userToken}`,
        'session': userToken || '',
      },
    };
  }

  /**
   * Toggle image selection
   */
  toggleImageSelection(imageId: string): void {
    if (this.selectedImages.has(imageId)) {
      this.selectedImages.delete(imageId);
    } else {
      this.selectedImages.add(imageId);
    }
    
    this.eventListeners.onSelectionChange?.(this.selectedImages.size);
  }

  /**
   * Select all images
   */
  selectAllImages(images: GalleryImage[]): void {
    images.forEach(image => this.selectedImages.add(image.id));
    this.eventListeners.onSelectionChange?.(this.selectedImages.size);
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedImages.clear();
    this.eventListeners.onSelectionChange?.(0);
  }

  /**
   * Get selected images
   */
  getSelectedImages(allImages: GalleryImage[]): GalleryImage[] {
    return allImages.filter(image => this.selectedImages.has(image.id));
  }

  /**
   * Check if image is selected
   */
  isImageSelected(imageId: string): boolean {
    return this.selectedImages.has(imageId);
  }

  /**
   * Get selection count
   */
  getSelectionCount(): number {
    return this.selectedImages.size;
  }

  /**
   * Download single image
   */
  async downloadSingleImage(
    image: GalleryImage,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Check permissions
      const hasPermissions = await permissionsService.hasRequiredPermissions();
      if (!hasPermissions) {
        const granted = await permissionsService.requestRequiredPermissions();
        if (!granted) {
          throw new Error('Storage permission is required to download files');
        }
      }

      const imageRequest = this.createAuthenticatedImageRequest(image.path);
      
      const downloadResult = await fileSystemService.downloadFile({
        url: imageRequest.uri,
        headers: imageRequest.headers,
        fileName: this.generateFileName(image),
        onProgress,
      });

      this.eventListeners.onDownloadComplete?.({
        success: true,
        filePath: downloadResult.path,
      });

      return downloadResult.path;
    } catch (error) {
      console.error('Failed to download image:', error);
      this.eventListeners.onDownloadComplete?.({
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      });
      throw error;
    }
  }

  /**
   * Download multiple selected images
   */
  async downloadSelectedImages(
    images: GalleryImage[],
    onOverallProgress?: (progress: number) => void
  ): Promise<string[]> {
    try {
      // Check permissions
      const hasPermissions = await permissionsService.hasRequiredPermissions();
      if (!hasPermissions) {
        const granted = await permissionsService.requestRequiredPermissions();
        if (!granted) {
          throw new Error('Storage permission is required to download files');
        }
      }

      const selectedImages = this.getSelectedImages(images);
      if (selectedImages.length === 0) {
        throw new Error('No images selected for download');
      }

      // Prepare download options for each image
      const downloadOptions = selectedImages.map(image => {
        const imageRequest = this.createAuthenticatedImageRequest(image.path);
        return {
          url: imageRequest.uri,
          headers: imageRequest.headers,
          fileName: this.generateFileName(image),
        };
      });

      // Start downloads
      const results = await fileSystemService.downloadMultipleFiles(
        downloadOptions,
        onOverallProgress
      );

      const filePaths = results.map(result => result.path);
      
      this.eventListeners.onDownloadComplete?.({
        success: true,
        filePath: `${results.length} files downloaded`,
      });

      return filePaths;
    } catch (error) {
      console.error('Failed to download selected images:', error);
      this.eventListeners.onDownloadComplete?.({
        success: false,
        error: error instanceof Error ? error.message : 'Bulk download failed',
      });
      throw error;
    }
  }

  /**
   * Export selected images as PDF
   */
  async exportSelectedImagesToPDF(
    images: GalleryImage[],
    options?: Partial<PDFExportOptions>
  ): Promise<string> {
    try {
      // Check permissions
      const hasPermissions = await permissionsService.hasRequiredPermissions();
      if (!hasPermissions) {
        const granted = await permissionsService.requestRequiredPermissions();
        if (!granted) {
          throw new Error('Storage permission is required to create PDF files');
        }
      }

      const selectedImages = this.getSelectedImages(images);
      if (selectedImages.length === 0) {
        throw new Error('No images selected for PDF export');
      }

      // Add authenticated URLs to images for PDF generation
      const imagesWithAuth = selectedImages.map(image => {
        const authRequest = this.createAuthenticatedImageRequest(image.path);
        return {
          ...image,
          path: authRequest.uri, // Use authenticated URL
        };
      });

      const pdfOptions: PDFExportOptions = {
        selectedImages: imagesWithAuth,
        title: options?.title || 'Gallery Export',
        fileName: options?.fileName || `gallery_export_${Date.now()}`,
        quality: options?.quality || 0.8,
        format: options?.format || 'A4',
        orientation: options?.orientation || 'portrait',
      };

      const result = await pdfService.generatePDFFromImages(pdfOptions);
      
      this.eventListeners.onDownloadComplete?.({
        success: true,
        filePath: result.filePath,
      });

      return result.filePath;
    } catch (error) {
      console.error('Failed to export PDF:', error);
      this.eventListeners.onDownloadComplete?.({
        success: false,
        error: error instanceof Error ? error.message : 'PDF export failed',
      });
      throw error;
    }
  }

  /**
   * Open album link (Google Drive) in external app/browser
   */
  async openAlbumLink(albumLink?: string | null): Promise<string> {
    try {
      let finalAlbumLink = albumLink;

      // If no album link provided, fetch from API
      if (!finalAlbumLink) {
        console.log('🔗 No album link provided, fetching from API...');
        const galleryData = await this.fetchGalleryData();
        finalAlbumLink = galleryData.albumLink;
      }
      
      if (!finalAlbumLink) {
        throw new Error('No album link available');
      }

      console.log('🔗 Opening Google Drive album:', finalAlbumLink);

      // Open Google Drive link in external app/browser
      const { Linking } = require('react-native');
      
      try {
        // Try to open the URL directly - Linking.canOpenURL can be unreliable for some URLs
        await Linking.openURL(finalAlbumLink);
        
        this.eventListeners.onDownloadComplete?.({
          success: true,
          filePath: finalAlbumLink,
        });
      } catch (linkingError) {
        console.log('⚠️ Direct linking failed, trying canOpenURL check:', linkingError);
        
        // Fallback: check if URL can be opened
        const canOpen = await Linking.canOpenURL(finalAlbumLink);
        
        if (canOpen) {
          await Linking.openURL(finalAlbumLink);
          
          this.eventListeners.onDownloadComplete?.({
            success: true,
            filePath: finalAlbumLink,
          });
        } else {
          throw new Error('Cannot open the album link. Please try opening it manually in your browser.');
        }
      }

      return finalAlbumLink;
    } catch (error) {
      console.error('❌ Failed to open album link:', error);
      this.eventListeners.onDownloadComplete?.({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open album link',
      });
      throw error;
    }
  }

  /**
   * @deprecated Use openAlbumLink instead
   * Legacy method for backward compatibility
   */
  async downloadAlbum(albumLink?: string | null): Promise<string> {
    return this.openAlbumLink(albumLink);
  }

  /**
   * Generate filename for an image
   */
  private generateFileName(image: GalleryImage): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(image.mimeType || 'image/jpeg');
    const safeName = image.title.replace(/[^a-zA-Z0-9]/g, '_');
    return `${safeName}_${timestamp}.${extension}`;
  }

  /**
   * Get file extension from mime type
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
    };
    
    return mimeToExt[mimeType.toLowerCase()] || 'jpg';
  }

  /**
   * Get user token (implement based on your auth system)
   */
  private getUserToken(): string | null {
    // This should integrate with your auth context/storage
    // For now, returning null - implement based on your auth system
    try {
      // Example: return SecureStore.getItem('userToken') or similar
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check storage space before operations
   */
  async checkStorageSpace(): Promise<{ available: number; required: number }> {
    const freeSpace = await fileSystemService.getFreeSpace();
    const selectedCount = this.selectedImages.size;
    
    // Estimate 2MB per image (conservative estimate)
    const estimatedSpace = selectedCount * 2 * 1024 * 1024;
    
    return {
      available: freeSpace,
      required: estimatedSpace,
    };
  }

  /**
   * Cleanup temporary files
   */
  async cleanup(): Promise<void> {
    try {
      await fileSystemService.cleanupTempFiles();
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }
}

export const galleryService = GalleryService.getInstance();
