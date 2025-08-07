// Main helpers index file - exports all utility functions and services
// Modern TypeScript implementation replacing legacy helpers

// Core services
export { apiService as request, apiService } from './request';
export { default as SecureStorage } from './secureStorage';

// Import services for internal use
import { apiService } from './request';
import SecureStorage from './secureStorage';

// Utility modules
export * from './dateUtils';
export * from './applicationUtils';
export * from './generalUtils';
export * from './theme';

// Import default exports for convenience
import dateUtils from './dateUtils';
import applicationUtils from './applicationUtils';
import generalUtils from './generalUtils';
import themeModule from './theme';

// Re-export with named exports
export { dateUtils, applicationUtils, generalUtils };
export { themeModule as themeConfig };

// Re-export commonly used functions with legacy-compatible names
import { 
  formatDate, 
  formatDateShort, 
  formatDateLong,
  parseTimeString as getTime,
  setDateLocale,
  SupportedLocale 
} from './dateUtils';

import { 
  getFullName,
  getDisplayName,
  getUserInitials,
  getContactInfo,
  isValidEmail,
  isValidPhone 
} from './applicationUtils';

import { 
  getByPath as byString,
  isEmptyObject,
  getMap,
  getQueryString,
  toLower,
  toUpper,
  getByStartsWithKey,
  getOptions,
  getList,
  isEqual as equal,
  deepCopy as copy,
  formatString as format,
  removeEmptyKeys,
  getRandomString,
  formatNumber as numFormat,
  debounce,
  throttle
} from './generalUtils';

import { 
  legacyTheme,
  colors,
  spacing,
  typography,
  getColor,
  getSpacing 
} from './theme';

const theme = legacyTheme;

// Legacy-compatible moment replacement
const moment = dateUtils;

// Language configuration
export const lang = 'en'; // Default language
export const setLanguage = (language: 'en' | 'it') => {
  setDateLocale(language === 'it' ? SupportedLocale.IT : SupportedLocale.EN);
};

// Initialize with default language
setLanguage(lang as 'en' | 'it');

// Translation and i18n exports
export { useTranslation } from '../hooks/useTranslation';
export { 
  SupportedLanguage, 
  setLanguagePreference, 
  getCurrentLanguage, 
  getSupportedLanguages,
  LANGUAGE_CONFIG,
} from '../locales/i18n';
export { default as i18n } from '../locales/i18n';

// Legacy-compatible exports
export {
  // Date utilities (moment replacement)
  moment,
  formatDate,
  formatDateShort,
  formatDateLong,
  getTime,
  
  // Application utilities
  getFullName,
  getDisplayName,
  getUserInitials,
  getContactInfo,
  isValidEmail,
  isValidPhone,
  
  // General utilities
  byString,
  isEmptyObject,
  getMap,
  getQueryString,
  toLower,
  toUpper,
  getByStartsWithKey,
  getOptions,
  getList,
  equal,
  copy,
  format,
  removeEmptyKeys,
  getRandomString,
  numFormat,
  debounce,
  throttle,
  
  // Theme and styling
  theme,
  colors,
  spacing,
  typography,
  getColor,
  getSpacing,
};

// Storage utilities (replacing expo-secure-store and web storage)
export const storage = {
  // Secure storage (for sensitive data like tokens)
  setSecureItem: SecureStorage.setItem,
  getSecureItem: SecureStorage.getItem,
  removeSecureItem: SecureStorage.removeItem,
  clearSecure: SecureStorage.clear,
  
  // Note: For React Native, we only use secure storage
  // Web storage functions are not applicable in mobile apps
  setCookie: (key: string, value: string, _exdays: number = 7) => {
    console.warn('setCookie is not supported in React Native. Use setSecureItem instead.');
  },
  getCookie: (_key: string) => {
    console.warn('getCookie is not supported in React Native. Use getSecureItem instead.');
    return '';
  },
};

// Legacy exports for backward compatibility
export const setCookie = storage.setCookie;
export const getCookie = storage.getCookie;

// Helper functions for common operations
export const helpers = {
  // Date operations
  date: dateUtils,
  
  // User/lead operations
  user: {
    getFullName,
    getDisplayName,
    getUserInitials,
    getContactInfo,
    isValidEmail,
    isValidPhone,
  },
  
  // Data manipulation
  data: {
    byString,
    isEmptyObject,
    getMap,
    getQueryString,
    getOptions,
    getList,
    removeEmptyKeys,
    equal,
    copy,
  },
  
  // String operations
  string: {
    toLower,
    toUpper,
    format,
    getRandomString,
    debounce,
    throttle,
  },
  
  // Theme operations
  theme: {
    getColor,
    getSpacing,
    colors,
    spacing,
    typography,
  },
  
  // Storage operations
  storage,
};

// Type exports for TypeScript users
export type { 
  SupportedLocale
} from './dateUtils';

export type {
  LeadDetails
} from './applicationUtils';

export type {
  SelectOption,
  MapFunction 
} from './generalUtils';

export type {
  ApiResponse,
  ApiError,
  HttpMethod,
  RequestOptions
} from './request';

// Main default export
export default {
  // Services
  request: apiService,
  SecureStorage,
  
  // Utilities
  dateUtils,
  applicationUtils,
  generalUtils,
  themeConfig: themeModule,
  helpers,
  
  // Legacy compatibility
  moment,
  lang,
  setLanguage,
  
  // Storage
  storage,
};