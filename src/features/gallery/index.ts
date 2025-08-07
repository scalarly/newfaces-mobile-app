/**
 * Gallery Feature - Enhanced gallery functionality
 * 
 * Features included:
 * - Multi-selection and batch operations
 * - PDF export from selected images
 * - File download with progress tracking
 * - Authenticated image requests with headers
 * - Modern linear gradient support
 * - Permission handling
 * - Cross-platform file system operations
 */

// Main screen
export { default as EnhancedGalleryScreen } from './screens/EnhancedGalleryScreen';

// Components
export { GalleryItem } from './components/GalleryItem';
export { GallerySelectionBar } from './components/GallerySelectionBar';
export { GalleryHeader } from './components/GalleryHeader';
export { GradientView, gradientPresets } from './components/GradientView';

// Services
export { galleryService } from './services/GalleryService';
export { fileSystemService } from './services/FileSystemService';
export { pdfService } from './services/PDFService';
export { permissionsService } from './services/PermissionsService';

// Types
export type {
  GalleryImage,
  GalleryAlbum,
  DownloadProgress,
  PDFExportOptions,
  GalleryPermissions,
  AuthenticatedImageRequest,
  GalleryViewMode,
  SortOrder,
} from './types';

// Service types
export type { 
  DownloadFileOptions, 
  DownloadResult 
} from './services/FileSystemService';

export type { 
  PDFGenerationResult 
} from './services/PDFService';

export type { 
  GalleryServiceEvents 
} from './services/GalleryService';
