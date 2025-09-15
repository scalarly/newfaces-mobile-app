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
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { simpleLogout } from '../helpers/simpleLogout';
import { safeLogout } from '../helpers/safeLogout';
import { emergencyLogout } from '../helpers/emergencyLogout';

import { apiService } from '../helpers/request';
import { isValidEmail } from '../helpers/applicationUtils';
import { colors, spacing } from '../helpers/theme';
import { View as CustomView } from '../components';
import { useUserToken } from '../hooks/useAsyncStorage';
import { RootStackParamList } from '../navigation/types';

/**
 * SwitchUserScreen - Modern user switching/impersonation screen (Admin/Development tool)
 * Replaces the legacy SwitchUserScreen.js with modern TypeScript implementation
 */

// Type definitions
interface LeadDetails {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  city?: string;
  country?: string;
  created_at: string;
}

interface SwitchUserErrors {
  [key: string]: string;
}

type SwitchUserScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SwitchUser'
>;

interface Props {
  navigation: SwitchUserScreenNavigationProp;
}

const SwitchUserScreen: React.FC<Props> = ({ navigation }) => {
  // State management
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [leadID, setLeadID] = useState<string>('');
  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingLead, setFetchingLead] = useState<boolean>(false);
  const [errors, setErrors] = useState<SwitchUserErrors>({});

  const { token: userToken, setToken: setUserToken } = useUserToken();

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: SwitchUserErrors = {};

    if (!studentEmail.trim()) {
      newErrors.email = 'Student email is required';
    } else if (!isValidEmail(studentEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!leadID.trim()) {
      newErrors.leadID = 'Lead ID is required';
    } else if (!/^\d+$/.test(leadID)) {
      newErrors.leadID = 'Lead ID must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [studentEmail, leadID]);

  // Fetch lead details
  const fetchLeadDetails = useCallback(async (id: string) => {
    if (!id || !/^\d+$/.test(id)) {
      setLeadDetails(null);
      return;
    }

    setFetchingLead(true);
    try {
      const response = await apiService.get<LeadDetails>(`leads/${id}`);
      console.log(`Details of lead ${id}:`, response.data);
      setLeadDetails(response.data);
      setErrors(prev => ({ ...prev, leadID: '' })); // Clear any previous error
    } catch (error: any) {
      console.error(`Error while getting details of lead ${id}:`, error);
      setLeadDetails(null);
      if (error.response?.status === 404) {
        setErrors(prev => ({ ...prev, leadID: `No lead found with ID ${id}` }));
      } else {
        setErrors(prev => ({ ...prev, leadID: 'Failed to fetch lead details' }));
      }
    } finally {
      setFetchingLead(false);
    }
  }, []);

  // Handle lead ID change with debouncing
  const handleLeadIDChange = useCallback((value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    setLeadID(numericValue);
    
    // Clear previous lead details
    setLeadDetails(null);
    
    // Fetch lead details if valid ID
    if (numericValue && numericValue.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchLeadDetails(numericValue);
      }, 500); // 500ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [fetchLeadDetails]);

  // Handle login as lead (this would typically switch context)
  const handleLoginAsLead = useCallback(async () => {
    if (!validateForm() || !leadDetails) {
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would call an admin endpoint to impersonate the user
      // For now, we'll just show a success message
      Alert.alert(
        'Switch User',
        `Would switch to user: ${leadDetails.first_name} ${leadDetails.last_name} (${leadDetails.email})`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: () => {
              // Here you would typically:
              // 1. Call an admin API to get an impersonation token
              // 2. Update the stored user context
              // 3. Navigate to the profile screen
              console.log('Switching to user:', leadDetails);
              navigation.navigate('Main');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Switch user error:', error);
      Alert.alert('Error', 'Failed to switch user. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [leadDetails, studentEmail, leadID, navigation, validateForm]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚨 Starting emergency logout from SwitchUserScreen...');
              
              // Clear token using hook first
              await setUserToken('');
              
              // Use emergency logout to completely avoid bridge issues
              await emergencyLogout(navigation);
              
              console.log('✅ Emergency logout completed');
            } catch (error) {
              console.error('❌ Emergency logout error:', error);
              // Force navigation as last resort
              try {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              } catch (navError) {
                console.error('❌ Force navigation failed:', navError);
              }
            }
          },
        },
      ]
    );
  }, [setUserToken, navigation]);

  const getFullName = (lead: LeadDetails): string => {
    return `${lead.first_name} ${lead.last_name || ''}`.trim();
  };

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
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Title style={styles.title}>Switch User</Title>
              <Text style={styles.subtitle}>
                Development/Admin tool to impersonate a student account
              </Text>
            </View>

            {/* Form Card */}
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                {/* Student Email Input */}
                <TextInput
                  label="Student Email"
                  value={studentEmail}
                  onChangeText={setStudentEmail}
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

                {/* Lead ID Input */}
                <TextInput
                  label="Lead ID"
                  value={leadID}
                  onChangeText={handleLeadIDChange}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="e.g., 12345"
                  error={!!errors.leadID}
                  disabled={loading}
                  right={
                    fetchingLead ? (
                      <TextInput.Icon icon={() => <ActivityIndicator size={16} />} />
                    ) : null
                  }
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.leadID}>
                  {errors.leadID}
                </HelperText>

                {/* Lead Details Display */}
                {leadDetails && (
                  <Card style={styles.leadDetailsCard}>
                    <Card.Content style={styles.leadDetailsContent}>
                      <Text style={styles.leadDetailsTitle}>Lead Details</Text>
                      <View style={styles.leadDetailsRow}>
                        <Text style={styles.leadDetailsLabel}>Name:</Text>
                        <Text style={styles.leadDetailsValue}>
                          {getFullName(leadDetails)}
                        </Text>
                      </View>
                      <View style={styles.leadDetailsRow}>
                        <Text style={styles.leadDetailsLabel}>Email:</Text>
                        <Text style={styles.leadDetailsValue}>
                          {leadDetails.email}
                        </Text>
                      </View>
                      {leadDetails.phone && (
                        <View style={styles.leadDetailsRow}>
                          <Text style={styles.leadDetailsLabel}>Phone:</Text>
                          <Text style={styles.leadDetailsValue}>
                            {leadDetails.phone}
                          </Text>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                )}

                <Divider style={styles.divider} />

                {/* Action Buttons */}
                <View style={styles.buttonGroup}>
                  <Button
                    mode="contained"
                    onPress={handleLoginAsLead}
                    disabled={loading || !leadDetails || !!errors.email || !!errors.leadID}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      'Login as Lead'
                    )}
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={handleLogout}
                    disabled={loading}
                    style={styles.logoutButton}
                    contentStyle={styles.buttonContent}
                  >
                    Logout
                  </Button>
                </View>
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
    width: '100%',
    maxWidth: 400,
  },
  cardContent: {
    padding: spacing.xl,
  },
  input: {
    marginBottom: spacing.xs,
  },
  leadDetailsCard: {
    backgroundColor: colors.grey100,
    marginVertical: spacing.md,
  },
  leadDetailsContent: {
    padding: spacing.md,
  },
  leadDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  leadDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  leadDetailsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  leadDetailsValue: {
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: spacing.lg,
    backgroundColor: colors.grey300,
  },
  buttonGroup: {
    gap: spacing.md,
  },
  loginButton: {
    borderRadius: 8,
  },
  logoutButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});

export default SwitchUserScreen;