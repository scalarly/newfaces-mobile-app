import { useTranslation as useI18nTranslation } from 'react-i18next';
import { 
  SupportedLanguage, 
  setLanguagePreference, 
  getCurrentLanguage, 
  getSupportedLanguages,
  LANGUAGE_CONFIG,
} from '../locales/i18n';

/**
 * Extended translation hook with additional functionality
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  /**
   * Change language and persist preference
   */
  const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
    try {
      await setLanguagePreference(language);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  };

  /**
   * Get current language (reactive)
   */
  const currentLanguage = (i18n.language as SupportedLanguage) || SupportedLanguage.EN;

  /**
   * Get all supported languages with their config
   */
  const supportedLanguages = getSupportedLanguages().map((lang) => ({
    code: lang,
    ...LANGUAGE_CONFIG[lang],
  }));

  /**
   * Check if i18n is ready
   */
  const isReady = i18n.isInitialized;

  /**
   * Check if currently using RTL language
   */
  const isRTL = i18n.dir() === 'rtl';

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    supportedLanguages,
    isReady,
    isRTL,
  };
};

export default useTranslation;
