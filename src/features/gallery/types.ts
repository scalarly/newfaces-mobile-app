/**
 * Gallery feature types and interfaces
 */

export interface GalleryImage {
  id: string;
  path: string;
  url?: string;
  title: string;
  type: 'image';
  size?: number;
  mimeType?: string;
  createdAt?: string;
  isSelected?: boolean;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  images: GalleryImage[];
  downloadUrl?: string;
  createdAt?: string;
}

export interface DownloadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export interface PDFExportOptions {
  title?: string;
  selectedImages: GalleryImage[];
  fileName?: string;
  quality?: number;
  format?: 'A4' | 'Letter' | 'Custom';
  orientation?: 'portrait' | 'landscape';
}

export interface GalleryPermissions {
  storage: boolean;
  camera?: boolean;
  photoLibrary?: boolean;
}

export interface AuthenticatedImageRequest {
  uri: string;
  headers: Record<string, string>;
}

export type GalleryViewMode = 'grid' | 'list';
export type SortOrder = 'newest' | 'oldest' | 'name';
