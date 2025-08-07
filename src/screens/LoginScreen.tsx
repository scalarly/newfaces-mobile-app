import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Modern hooks and helpers
import { useApiPost } from '../hooks/useApi';
import { useTranslation } from '../hooks/useTranslation';
import { useUserToken } from '../hooks/useAsyncStorage';
import { isValidEmail } from '../helpers/applicationUtils';
import { colors, spacing } from '../helpers/theme';
import { apiService } from '../helpers/request';
import { RootStackParamList } from '../navigation/types';

// Type definitions
interface LoginData {
  data: {
    email: string;
    password: string;
  };
}

interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  id: number;
  name: string;
  email: string;
  id_lead?: number;
  ids_role?: number[];
  is_owner?: boolean;
  permissions?: any;
}

interface LoginErrors {
  [key: string]: string;
}

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  // Modern hooks
  const { t } = useTranslation();
  const { login: setUserToken } = useUserToken();
  const { state: loginState, execute: executeLogin } = useApiPost<LoginResponseData>('jwt');

  // State management
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  // Login handler using modern hooks
  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setErrors({});

    const loginData: LoginData = {
      data: {
        email: email.trim().toLowerCase(),
        password: password,
      },
    };

    try {
      // Let's test with direct apiService call first
      console.log('Making direct API call...');
      const directResult = await apiService.post('jwt', loginData);
      console.log('Direct API result:', directResult);
      
      if (directResult?.data?.data) {
        console.log('Direct login successful:', directResult.data);
        console.log('Token to store:', directResult.data.data.access_token);
        await setUserToken(directResult.data.data.access_token);
        console.log('Token stored, navigating to Home...');
                      navigation.navigate('Main');
        return;
      }
      
      // Fallback to the hook method
      const result = await executeLogin(loginData);
      
      console.log('executeLogin returned:', result);
      console.log('loginState after call:', loginState);
      
      if (result) {
        console.log('Login successful:', result);
        console.log('Token to store:', result.access_token);
        
        // Store the token securely using modern hook
        await setUserToken(result.access_token);
        
        console.log('Token stored, navigating to Home...');
        // Navigate to home screen
        try {
                        navigation.navigate('Main');
          console.log('Navigation called successfully');
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      } else {
        console.log('Login failed - no result returned');
        console.log('Current loginState:', loginState);
        if (loginState.error) {
          console.log('Login error:', loginState.error);
        }
      }
    } catch (error) {
      console.error('Login execution error:', error);
    }
  }, [email, password, navigation, validateForm, executeLogin, setUserToken]);

  const toggleSecureEntry = useCallback(() => {
    setSecureTextEntry(!secureTextEntry);
  }, [secureTextEntry]);

  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Title style={styles.title}>Welcome Back</Title>
              <Text style={styles.subtitle}>
                {t('mobile.login.subtitle')}
              </Text>
            </View>

            {/* Login Form */}
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                {/* Email Input */}
                <TextInput
                  label={t('mobile.login.form.email')}
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={!!errors.email}
                  disabled={loginState.loading}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>

                {/* Password Input */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    label={t('mobile.login.form.password')}
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={secureTextEntry}
                    autoComplete="password"
                    textContentType="password"
                    error={!!errors.password}
                    disabled={loginState.loading}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    style={styles.eyeIconContainer}
                    onPress={toggleSecureEntry}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={secureTextEntry ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                <HelperText type="error" visible={!!errors.password}>
                  {errors.password}
                </HelperText>

                {/* Login Button */}
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  disabled={loginState.loading}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                >
                  {loginState.loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    t('mobile.login.form.continue')
                  )}
                </Button>

                {/* Error Display */}
                {loginState.error && (
                  <Text style={styles.errorText}>
                    {loginState.error}
                  </Text>
                )}

                {/* Forgot Password Link */}
                <Button
                  mode="text"
                  onPress={navigateToForgotPassword}
                  disabled={loginState.loading}
                  style={styles.forgotPasswordButton}
                >
                  {t('mobile.login.forgotPassword')}
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 12,
    top: 16,
    padding: 8,
    zIndex: 1,
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotPasswordButton: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default LoginScreen;