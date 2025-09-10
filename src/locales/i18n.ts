import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { SecureStorage } from '../helpers/secureStorage';

// Import translation files
import en from './en/translation.json';
import it from './it/translation.json';

/**
 * Storage key for user's language preference
 */
const LANGUAGE_STORAGE_KEY = 'userLanguage';

/**
 * Supported languages
 */
export enum SupportedLanguage {
  EN = 'en',
  IT = 'it',
}

/**
 * Language configuration for display purposes
 */
export const LANGUAGE_CONFIG = {
  [SupportedLanguage.EN]: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  [SupportedLanguage.IT]: {
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
} as const;

/**
 * Translation resources
 */
const resources = {
  [SupportedLanguage.EN]: {
    translation: en,
  },
  [SupportedLanguage.IT]: {
    translation: it,
  },
} as const;

/**
 * Get the device's preferred language
 */
const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = getLocales();
    const deviceLanguage = locales[0]?.languageCode.toLowerCase();
    
    // Check if device language is supported
    if (Object.values(SupportedLanguage).includes(deviceLanguage as SupportedLanguage)) {
      return deviceLanguage as SupportedLanguage;
    }
  } catch (error) {
    console.warn('Error detecting device language:', error);
  }
  
  return SupportedLanguage.EN; // Default fallback
};

/**
 * Get the user's stored language preference or device language
 */
const getInitialLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const storedLanguage = await SecureStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (storedLanguage && Object.values(SupportedLanguage).includes(storedLanguage as SupportedLanguage)) {
      return storedLanguage as SupportedLanguage;
    }
  } catch (error) {
    console.warn('Error retrieving stored language:', error);
  }
  
  return getDeviceLanguage();
};

/**
 * Store the user's language preference
 */
export const setLanguagePreference = async (language: SupportedLanguage): Promise<void> => {
  try {
    await SecureStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error storing language preference:', error);
    throw error;
  }
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || SupportedLanguage.EN;
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = (): SupportedLanguage[] => {
  return Object.values(SupportedLanguage);
};

/**
 * Check if a language is supported
 */
export const isLanguageSupported = (language: string): language is SupportedLanguage => {
  return Object.values(SupportedLanguage).includes(language as SupportedLanguage);
};

/**
 * Initialize i18next
 */
const initializeI18n = async (): Promise<void> => {
  // Check if i18n is already initialized to prevent multiple initializations
  if (i18n.isInitialized) {
    console.log('ℹ️ i18n is already initialized, skipping initialization');
    return;
  }
  
  const initialLanguage = await getInitialLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      lng: initialLanguage,
      fallbackLng: SupportedLanguage.EN,
      debug: __DEV__,
      resources,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Disable suspense to avoid issues with React Navigation
      },
      compatibilityJSON: 'v4', // Use v4 format for latest compatibility
    });
};

// Initialize i18n only if not already initialized
initializeI18n().catch((error) => {
  console.error('Failed to initialize i18n:', error);
});

export default i18n;
