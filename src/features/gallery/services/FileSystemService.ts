/**
 * File System Service - Modern file operations using @dr.pogodin/react-native-fs
 * Replaces expo-file-system functionality
 */

import * as RNFS from '@dr.pogodin/react-native-fs';
import { Platform } from 'react-native';
import { ApiResponse } from '../../../helpers/request';

export interface DownloadFileOptions {
  url: string;
  fileName?: string;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

export interface DownloadResult {
  path: string;
  fileName: string;
  size: number;
}

export class FileSystemService {
  private static instance: FileSystemService;

  private constructor() {}

  static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  /**
   * Get the downloads directory path
   */
  getDownloadsDirectory(): string {
    if (Platform.OS === 'android') {
      return RNFS.DownloadDirectoryPath;
    }
    // iOS uses Documents directory
    return RNFS.DocumentDirectoryPath;
  }

  /**
   * Get the cache directory path
   */
  getCacheDirectory(): string {
    return RNFS.CachesDirectoryPath;
  }

  /**
   * Get the temporary directory path
   */
  getTempDirectory(): string {
    return RNFS.TemporaryDirectoryPath;
  }

  /**
   * Create a directory if it doesn't exist
   */
  async ensureDirectoryExists(path: string): Promise<void> {
    try {
      const exists = await RNFS.exists(path);
      if (!exists) {
        await RNFS.mkdir(path, { NSURLIsExcludedFromBackupKey: true });
      }
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw new Error(`Failed to create directory: ${path}`);
    }
  }

  /**
   * Download a file from a URL
   */
  async downloadFile(options: DownloadFileOptions): Promise<DownloadResult> {
    const { url, fileName, headers = {}, onProgress } = options;
    
    try {
      // Generate filename if not provided
      const finalFileName = fileName || this.generateFileName(url);
      const downloadDir = this.getDownloadsDirectory();
      
      // Ensure downloads directory exists
      await this.ensureDirectoryExists(downloadDir);
      
      const filePath = `${downloadDir}/${finalFileName}`;

      // Start download
      const downloadOptions = {
        fromUrl: url,
        toFile: filePath,
        headers,
        progress: onProgress ? (res: any) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          onProgress(progress);
        } : undefined,
      };

      const result = await RNFS.downloadFile(downloadOptions).promise;

      if (result.statusCode === 200) {
        const stats = await RNFS.stat(filePath);
        return {
          path: filePath,
          fileName: finalFileName,
          size: parseInt(stats.size.toString()),
        };
      } else {
        throw new Error(`Download failed with status: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * Download multiple files with progress tracking
   */
  async downloadMultipleFiles(
    files: DownloadFileOptions[],
    onOverallProgress?: (progress: number) => void
  ): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];
    let completedCount = 0;

    for (const fileOptions of files) {
      try {
        const result = await this.downloadFile({
          ...fileOptions,
          onProgress: (progress) => {
            // Individual file progress
            fileOptions.onProgress?.(progress);
            
            // Overall progress
            if (onOverallProgress) {
              const overallProgress = ((completedCount + progress / 100) / files.length) * 100;
              onOverallProgress(overallProgress);
            }
          },
        });
        
        results.push(result);
        completedCount++;
        
        if (onOverallProgress) {
          onOverallProgress((completedCount / files.length) * 100);
        }
      } catch (error) {
        console.error(`Failed to download file:`, error);
        // Continue with other downloads
      }
    }

    return results;
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      return await RNFS.exists(path);
    } catch {
      return false;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(path: string) {
    try {
      return await RNFS.stat(path);
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const exists = await this.fileExists(path);
      if (exists) {
        await RNFS.unlink(path);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * Read file as base64
   */
  async readFileAsBase64(path: string): Promise<string> {
    try {
      return await RNFS.readFile(path, 'base64');
    } catch (error) {
      console.error('Failed to read file as base64:', error);
      throw error;
    }
  }

  /**
   * Write file from base64
   */
  async writeFileFromBase64(path: string, base64Data: string): Promise<void> {
    try {
      await RNFS.writeFile(path, base64Data, 'base64');
    } catch (error) {
      console.error('Failed to write file from base64:', error);
      throw error;
    }
  }

  /**
   * Generate a filename from URL
   */
  private generateFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/');
      const fileName = segments[segments.length - 1];
      
      if (fileName && fileName.includes('.')) {
        return fileName;
      }
      
      // Generate filename with timestamp if no proper filename found
      const timestamp = Date.now();
      return `download_${timestamp}.jpg`;
    } catch {
      // Fallback filename
      const timestamp = Date.now();
      return `download_${timestamp}.jpg`;
    }
  }

  /**
   * Get free storage space
   */
  async getFreeSpace(): Promise<number> {
    try {
      const fsInfo = await RNFS.getFSInfo();
      return fsInfo.freeSpace;
    } catch (error) {
      console.error('Failed to get free space:', error);
      return 0;
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = this.getTempDirectory();
      const files = await RNFS.readDir(tempDir);
      
      for (const file of files) {
        try {
          await RNFS.unlink(file.path);
        } catch (error) {
          console.warn('Failed to delete temp file:', file.path, error);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }
}

export const fileSystemService = FileSystemService.getInstance();
