import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Header, ScrollView, BottomNavigation } from '../components';
import { colors, spacing } from '../helpers/theme';
import { formatDateTime } from '../helpers/dateUtils';
import { RootStackParamList } from '../navigation/types';

/**
 * EmailScreen - Modern email detail screen
 * Replaces the legacy EmailScreen.js with modern TypeScript implementation
 */

// Type definitions
interface EmailUser {
  first_name: string;
  last_name?: string;
  email?: string;
}

interface EmailTemplateDetails {
  subject: string;
  body: string;
}

interface EmailData {
  id: number;
  user_details: EmailUser;
  template_details: EmailTemplateDetails;
  created_at: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Email'>;

const EmailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { data, title } = route.params;

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({ 
      title: title || 'Email Details',
      headerShown: false // We use our custom header
    });
  }, [navigation, title]);

  const getFullName = (user: EmailUser): string => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <Header
        title=""
        canGoBack
        onBackPress={handleBackPress}
        noShadow
      />

      {/* Email Content */}
      <ScrollView
        style={styles.content}
        contentPadding="md"
        hideScrollIndicator={false}
      >
        {/* Email Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Title style={styles.emailSubject} numberOfLines={2}>
              {data.template_details.subject}
            </Title>
            
            <View style={styles.emailMeta}>
              <Text style={styles.senderName}>
                From: {getFullName(data.user_details)}
              </Text>
              {data.user_details.email && (
                <Text style={styles.senderEmail}>
                  {data.user_details.email}
                </Text>
              )}
              <Text style={styles.emailDate}>
                {formatDateTime(data.created_at)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Email Body Card */}
        <Card style={styles.bodyCard}>
          <Card.Content style={styles.bodyContent}>
            <Text style={styles.emailBody}>
              {data.template_details.body || 'No content available.'}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    marginBottom: 66, // Space for bottom navigation
  },
  headerCard: {
    elevation: 2,
    borderRadius: 8,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  headerContent: {
    padding: spacing.lg,
  },
  emailSubject: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  emailMeta: {
    gap: spacing.xs,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.onSurface,
  },
  senderEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emailDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bodyCard: {
    elevation: 1,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  bodyContent: {
    padding: spacing.lg,
  },
  emailBody: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 22,
    textAlign: 'left',
  },
});

export default EmailScreen;