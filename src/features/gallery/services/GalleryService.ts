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
  async fetchGalleryData(): Promise<GalleryImage[]> {
    try {
      const response = await apiService.get<{ items: any[] }>('me/album');
      
      return response.data.items.map((item: any) => ({
        id: item.id.toString(),
        path: item.path,
        url: `${apiService.baseURL}/${item.path}`,
        title: item.title || `Image ${item.id}`,
        type: 'image' as const,
        size: item.size,
        mimeType: item.mime_type || 'image/jpeg',
        createdAt: item.created_at,
        isSelected: false,
      }));
    } catch (error) {
      console.error('Failed to fetch gallery data:', error);
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
   * Download album (via API endpoint)
   */
  async downloadAlbum(): Promise<string> {
    try {
      // Check permissions
      const hasPermissions = await permissionsService.hasRequiredPermissions();
      if (!hasPermissions) {
        const granted = await permissionsService.requestRequiredPermissions();
        if (!granted) {
          throw new Error('Storage permission is required to download album');
        }
      }

      // Fetch user data to get album link
      const userResponse = await apiService.get<{ lead_details: { album_link?: string } }>('me');
      const albumLink = userResponse.data.lead_details?.album_link;
      
      if (!albumLink) {
        throw new Error('No album download link available');
      }

      // Download the album file
      const result = await fileSystemService.downloadFile({
        url: albumLink,
        fileName: `album_${Date.now()}.zip`,
      });

      this.eventListeners.onDownloadComplete?.({
        success: true,
        filePath: result.path,
      });

      return result.path;
    } catch (error) {
      console.error('Failed to download album:', error);
      this.eventListeners.onDownloadComplete?.({
        success: false,
        error: error instanceof Error ? error.message : 'Album download failed',
      });
      throw error;
    }
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
