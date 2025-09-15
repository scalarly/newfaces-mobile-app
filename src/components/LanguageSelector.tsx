import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Pressable } from './Pressable';
import { Text } from './Typography';
import { View as Layout } from './Layout';
import { colors, spacing, borderRadius } from '../helpers/theme';
import { useTranslation } from '../hooks/useTranslation';
import { SupportedLanguage } from '../locales/i18n';

/**
 * Props for LanguageSelector component
 */
interface LanguageSelectorProps {
  /** Whether to show as a button or dropdown */
  variant?: 'button' | 'dropdown';
  /** Custom button text override */
  buttonText?: string;
  /** Show language name along with flag */
  showLanguageName?: boolean;
  /** Custom styling */
  style?: any;
  /** Callback when language changes */
  onLanguageChange?: (language: SupportedLanguage) => void;
}

/**
 * Language option interface
 */
interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * Language Selector Component
 * Allows users to select their preferred language
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  buttonText,
  showLanguageName = true,
  style,
  onLanguageChange,
}) => {
  const { t, currentLanguage, supportedLanguages, changeLanguage } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  /**
   * Handle language selection
   */
  const handleLanguageSelect = async (language: SupportedLanguage) => {
    if (language === currentLanguage) {
      setIsModalVisible(false);
      return;
    }

    setIsChanging(true);
    try {
      await changeLanguage(language);
      onLanguageChange?.(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
      setIsModalVisible(false);
    }
  };

  /**
   * Get current language info
   */
  const currentLanguageInfo = supportedLanguages.find(
    (lang) => lang.code === currentLanguage
  );

  /**
   * Render language item in modal
   */
  const renderLanguageItem: ListRenderItem<LanguageOption> = ({ item }) => {
    const isSelected = item.code === currentLanguage;

    return (
      <Pressable
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem,
        ]}
        onPress={() => handleLanguageSelect(item.code)}
        disabled={isChanging}
      >
        <Text size="large" style={styles.languageFlag}>
          {item.flag}
        </Text>
        <Layout flex={1} style={styles.languageTextContainer}>
          <Text
            size="body1"
            weight="medium"
            color={isSelected ? 'primary' : 'text'}
          >
            {item.nativeName}
          </Text>
          <Text
            size="small"
            color={isSelected ? 'primary' : 'textSecondary'}
          >
            {item.name}
          </Text>
        </Layout>
        {isSelected && (
          <Text size="large" color="primary">
            ✓
          </Text>
        )}
      </Pressable>
    );
  };

  if (variant === 'button') {
    return (
      <View style={[styles.container, style]}>
        <Pressable
          style={styles.button}
          onPress={() => setIsModalVisible(true)}
          disabled={isChanging}
        >
          <Text size="small" color="primary" style={styles.buttonText}>
            {buttonText || 
              (showLanguageName 
                ? `${currentLanguageInfo?.flag} ${currentLanguageInfo?.nativeName}`
                : `${currentLanguageInfo?.flag} ${currentLanguageInfo?.code.toUpperCase()}`
              )
            }
          </Text>
        </Pressable>

        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          >
            <Layout
              backgroundColor={colors.surface}
              borderRadius="lg"
              padding="lg"
              style={styles.modalContent}
            >
              <TouchableOpacity activeOpacity={1}>
                <Text size="large" weight="bold" style={styles.modalTitle}>
                  {t('general.selectLanguage')}
                </Text>

                <FlatList
                  data={supportedLanguages}
                  renderItem={renderLanguageItem}
                  keyExtractor={(item) => item.code}
                  style={styles.languageList}
                  showsVerticalScrollIndicator={false}
                />

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text size="body1" weight="medium" color="textSecondary">
                    {t('general.cancel')}
                  </Text>
                </Pressable>
              </TouchableOpacity>
            </Layout>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
        disabled={isChanging}
        activeOpacity={0.7}
      >
        <Text size="large" style={styles.flag}>
          {currentLanguageInfo?.flag}
        </Text>
        {showLanguageName && (
          <Text size="small" color="textSecondary" style={styles.languageName}>
            {currentLanguageInfo?.nativeName}
          </Text>
        )}
        <Text size="small" color="textSecondary">
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <Layout
            backgroundColor="#FFFFFF"
            borderRadius="lg"
            padding="lg"
            style={styles.modalContent}
          >
            <TouchableOpacity activeOpacity={1}>
              <Text size="large" weight="bold" style={styles.modalTitle}>
                {t('general.selectLanguage')}
              </Text>

              <FlatList
                data={supportedLanguages}
                renderItem={renderLanguageItem}
                keyExtractor={(item) => item.code}
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              />

              <Pressable
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text size="body1" weight="medium" color="textSecondary">
                  {t('general.cancel')}
                </Text>
              </Pressable>
            </TouchableOpacity>
          </Layout>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    minWidth: 80,
  },
  flag: {
    marginRight: spacing.xs,
  },
  languageName: {
    flex: 1,
    marginRight: spacing.xs,
  },
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    maxWidth: 320,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.onSurface, // Explicit color for visibility
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    backgroundColor: 'transparent',
  },
  selectedLanguageItem: {
    backgroundColor: colors.primaryVariant,
  },
  languageFlag: {
    marginRight: spacing.md,
  },
  languageTextContainer: {
    marginRight: spacing.sm,
  },
  closeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
});

export default LanguageSelector;
