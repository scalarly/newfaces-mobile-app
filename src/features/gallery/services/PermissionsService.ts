/**
 * Permissions Service - Handle file system and media permissions
 * Uses react-native-permissions for modern permission handling
 */

import { Platform, Alert, Linking } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
  Permission,
} from 'react-native-permissions';
import { GalleryPermissions } from '../types';

export class PermissionsService {
  private static instance: PermissionsService;

  private constructor() {}

  static getInstance(): PermissionsService {
    if (!PermissionsService.instance) {
      PermissionsService.instance = new PermissionsService();
    }
    return PermissionsService.instance;
  }

  /**
   * Check all gallery-related permissions
   */
  async checkGalleryPermissions(): Promise<GalleryPermissions> {
    const storagePermission = await this.checkStoragePermission();
    const cameraPermission = await this.checkCameraPermission();
    const photoLibraryPermission = await this.checkPhotoLibraryPermission();

    return {
      storage: storagePermission,
      camera: cameraPermission,
      photoLibrary: photoLibraryPermission,
    };
  }

  /**
   * Request all necessary permissions for gallery functionality
   */
  async requestGalleryPermissions(): Promise<GalleryPermissions> {
    const storagePermission = await this.requestStoragePermission();
    const cameraPermission = await this.requestCameraPermission();
    const photoLibraryPermission = await this.requestPhotoLibraryPermission();

    return {
      storage: storagePermission,
      camera: cameraPermission,
      photoLibrary: photoLibraryPermission,
    };
  }

  /**
   * Check storage/file system permission
   */
  async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS doesn't require explicit storage permission for app documents
      return true;
    }

    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      }) as Permission;

      if (!permission) return true;

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.warn('Failed to check storage permission:', error);
      return false;
    }
  }

  /**
   * Request storage/file system permission
   */
  async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      }) as Permission;

      if (!permission) return true;

      const result = await request(permission);
      
      if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
        this.showPermissionAlert('Storage', 'download and save files');
        return false;
      }

      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Failed to request storage permission:', error);
      return false;
    }
  }

  /**
   * Check camera permission
   */
  async checkCameraPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      }) as Permission;

      if (!permission) return false;

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.warn('Failed to check camera permission:', error);
      return false;
    }
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      }) as Permission;

      if (!permission) return false;

      const result = await request(permission);
      
      if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
        this.showPermissionAlert('Camera', 'take photos');
        return false;
      }

      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  }

  /**
   * Check photo library permission
   */
  async checkPhotoLibraryPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      }) as Permission;

      if (!permission) return false;

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.warn('Failed to check photo library permission:', error);
      return false;
    }
  }

  /**
   * Request photo library permission
   */
  async requestPhotoLibraryPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      }) as Permission;

      if (!permission) return false;

      const result = await request(permission);
      
      if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
        this.showPermissionAlert('Photo Library', 'access your photos');
        return false;
      }

      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Failed to request photo library permission:', error);
      return false;
    }
  }

  /**
   * Show permission rationale alert
   */
  private showPermissionAlert(permissionName: string, purpose: string): void {
    Alert.alert(
      `${permissionName} Permission Required`,
      `This app needs ${permissionName.toLowerCase()} permission to ${purpose}. Please enable it in Settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              openSettings();
            }
          },
        },
      ]
    );
  }

  /**
   * Check if all required permissions are granted
   */
  async hasRequiredPermissions(): Promise<boolean> {
    const permissions = await this.checkGalleryPermissions();
    return permissions.storage; // Storage is the minimum required
  }

  /**
   * Request all required permissions with user-friendly flow
   */
  async requestRequiredPermissions(): Promise<boolean> {
    try {
      // First, explain what we need
      return new Promise((resolve) => {
        Alert.alert(
          'Permissions Required',
          'To download files and create PDFs, this app needs access to your device storage.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Continue',
              onPress: async () => {
                const permissions = await this.requestGalleryPermissions();
                resolve(permissions.storage);
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Show rationale for why permissions are needed
   */
  showPermissionRationale(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Gallery Features',
        'To use gallery features like downloading images and creating PDFs, we need access to your device storage. This allows us to:\n\n• Save downloaded images\n• Create and save PDF files\n• Access your photo library',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Grant Access',
            onPress: async () => {
              const hasPermissions = await this.requestRequiredPermissions();
              resolve(hasPermissions);
            },
          },
        ]
      );
    });
  }
}

export const permissionsService = PermissionsService.getInstance();
