import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { apiService } from '../helpers/request';
import { isValidEmail } from '../helpers/applicationUtils';
import { colors, spacing } from '../helpers/theme';
import { ImageBackground } from '../components';
import { RootStackParamList } from '../navigation/types';

/**
 * ForgotPasswordScreen - Modern password reset screen
 * Replaces the legacy ForgotPasswordScreen.js with modern TypeScript implementation
 */

// Type definitions
interface ForgotPasswordData {
  data: {
    email: string;
  };
}

interface ForgotPasswordErrors {
  [key: string]: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  // State management
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLinkSent, setIsLinkSent] = useState<boolean>(false);
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: ForgotPasswordErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email]);

  // Send password reset link
  const handleSendResetLink = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const requestData: ForgotPasswordData = {
        data: {
          email: email.trim().toLowerCase(),
        },
      };

      const response = await apiService.post('forgot-password', requestData);
      
      console.log('Password reset link sent successfully:', response.data);
      setIsLinkSent(true);

    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from API
        const apiErrors: ForgotPasswordErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field === 'data.email') {
            apiErrors.email = err.description;
          }
        });
        setErrors(apiErrors);
      } else {
        // Handle general errors
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to send reset link. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [email, validateForm]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ImageBackground
          src="https://via.placeholder.com/400x800/3498db/ffffff?text=Reset+Password"
          style={styles.backgroundImage}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.layoutContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Title style={styles.title}>
                  {isLinkSent ? 'Check Your Email' : 'Forgot Password?'}
                </Title>
                <Text style={styles.subtitle}>
                  {isLinkSent
                    ? 'We have sent a password reset link to your email address.'
                    : 'Enter your email address and we\'ll send you a link to reset your password.'
                  }
                </Text>
              </View>

              {/* Form Card */}
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  {!isLinkSent ? (
                    <>
                      {/* Email Input */}
                      <TextInput
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        placeholder="e.g., johndoe@email.com"
                        error={!!errors.email}
                        disabled={loading}
                        style={styles.input}
                      />
                      <HelperText type="error" visible={!!errors.email}>
                        {errors.email}
                      </HelperText>

                      {/* Send Reset Link Button */}
                      <Button
                        mode="contained"
                        onPress={handleSendResetLink}
                        disabled={loading || !email.trim()}
                        style={styles.sendButton}
                        contentStyle={styles.buttonContent}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Success message */}
                      <View style={styles.successContent}>
                        <Paragraph style={styles.successMessage}>
                          If an account with this email exists, you will receive a password reset link shortly.
                        </Paragraph>
                        
                        <Button
                          mode="contained"
                          onPress={handleBackToLogin}
                          style={styles.backToLoginButton}
                          contentStyle={styles.buttonContent}
                        >
                          Back to Login
                        </Button>
                      </View>
                    </>
                  )}

                  {/* Back Button */}
                  {!isLinkSent && (
                    <Button
                      mode="text"
                      onPress={handleGoBack}
                      disabled={loading}
                      style={styles.backButton}
                    >
                      Back to Login
                    </Button>
                  )}
                </Card.Content>
              </Card>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  layoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  keyboardView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    elevation: 8,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  cardContent: {
    padding: spacing.xl,
  },
  input: {
    marginBottom: spacing.xs,
  },
  sendButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  backButton: {
    marginTop: spacing.sm,
  },
  successContent: {
    alignItems: 'center',
  },
  successMessage: {
    textAlign: 'center',
    color: colors.onSurface,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  backToLoginButton: {
    borderRadius: 8,
  },
});

export default ForgotPasswordScreen;