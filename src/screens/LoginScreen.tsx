import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image,
  Text,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Modern hooks and helpers
import { useApiPost } from '../hooks/useApi';
import { useTranslation } from '../hooks/useTranslation';
import { useUserToken } from '../hooks/useAsyncStorage';
import { isValidEmail } from '../helpers/applicationUtils';
import { apiService } from '../helpers/request';
import { RootStackParamList } from '../navigation/types';

// Legacy-style components
import { LegacyInput } from '../components/LegacyInput';
import { LegacyButton } from '../components/LegacyButton';

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
  const [hidePassword, setHidePassword] = useState<boolean>(true);
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
  }, [email, password, navigation, validateForm, executeLogin, setUserToken, loginState]);

  const togglePasswordVisibility = useCallback(() => {
    setHidePassword(!hidePassword);
  }, [hidePassword]);

  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={require('../assets/images/login-background.jpg')}
        style={styles.bgImage}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
            />
          </Text>
          {t('mobile.login.subtitle') && (
            <Text style={styles.subTitle}>
              {t('mobile.login.subtitle')}
            </Text>
          )}
        </View>
        
        <View style={styles.loginForm}>
          <LegacyInput
            title={t('mobile.login.form.email')}
            placeholder="Eg: johndoe@email.com"
            value={email}
            onChangeText={setEmail}
            style={styles.fieldInput}
            error={errors['data.email'] || errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          
          <LegacyInput
            title={t('mobile.login.form.password')}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={styles.fieldInput}
            error={errors['data.password'] || errors.password}
            showPasswordToggle={true}
            secureTextEntry={hidePassword}
            onTogglePassword={togglePasswordVisibility}
            autoComplete="password"
            textContentType="password"
          />

          <LegacyButton
            text={loginState.loading ? 'Signing in...' : t('mobile.login.form.continue')}
            onPress={handleLogin}
            disabled={loginState.loading}
            loading={loginState.loading}
            style={styles.btnPrimary}
          />

          {/* Error Display */}
          {loginState.error && (
            <Text style={styles.errorText}>
              {loginState.error}
            </Text>
          )}

          <LegacyButton
            text={t('mobile.login.forgotPassword')}
            onPress={navigateToForgotPassword}
            disabled={loginState.loading}
            variant="text"
            style={styles.forgotPasswordButton}
          />
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0e097',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    textAlign: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    textAlign: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  subTitle: {
    marginTop: 24,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  loginForm: {
    backgroundColor: '#fff',
    marginTop: 64,
    marginLeft: 40,
    marginRight: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 34,
    paddingRight: 34,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '80%',
  },
  fieldInput: {
    width: 'auto',
    color: '#111111',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 10,
  },
  btnPrimary: {
    marginTop: 32,
    backgroundColor: '#0052CD',
    borderRadius: 3,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LoginScreen;