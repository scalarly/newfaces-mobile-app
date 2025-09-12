import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Header, ScrollView, BottomNavigation, Pressable } from '../components';
import { colors, spacing } from '../helpers/theme';
import { formatDate, isDateBefore } from '../helpers/dateUtils';
import { formatNumber } from '../helpers/generalUtils';
import { RootStackParamList } from '../navigation/types';

/**
 * PaymentsScreen - Modern payment details screen
 * Replaces the legacy PaymentsScreen.js with modern TypeScript implementation
 */

// Type definitions
interface PackageDetails {
  id: number;
  name: string;
  italian_name: string;
  description?: string;
}

interface PaymentDetails {
  id: number;
  amount: number;
  due_date: string;
  payment_status: 'PAID' | 'UNPAID' | 'OVERDUE';
  payment_method?: string;
}

interface InstallmentDetails extends PaymentDetails {
  installment_number?: number;
}

interface PaymentData {
  id: number;
  package_details: PackageDetails;
  final_amount: number;
  payment_type: 'full' | 'emi';
  upfront_payments_details: PaymentDetails[];
  installments_details: InstallmentDetails[];
}

type PaymentStatus = 'paid' | 'due' | 'overdue';

type Props = NativeStackScreenProps<RootStackParamList, 'Payments'>;

interface KeyValueItemProps {
  label: string;
  value: string;
  subLabel?: string;
  subLabelStyle?: any;
}

interface PaymentSummary {
  totalUpfront: number;
  upfrontPaid: number;
  upfrontBalance: number;
  totalResidual: number;
  residualPaid: number;
  residualBalance: number;
}

const PaymentsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { data } = route.params;

  // Payment status styles
  const getPaymentStatusStyle = (status: PaymentStatus) => {
    const styles = {
      paid: {
        color: colors.success || '#13CB73',
        fontSize: 12,
        fontWeight: '700' as const,
      },
      due: {
        color: colors.warning || '#ffa113',
        fontSize: 12,
        fontWeight: '700' as const,
      },
      overdue: {
        color: colors.error || '#ff6635',
        fontStyle: 'italic' as const,
        fontSize: 12,
        fontWeight: '700' as const,
      },
    };
    return styles[status];
  };

  // Calculate payment summary
  const paymentSummary: PaymentSummary = useMemo(() => {
    let totalUpfront = 0;
    let upfrontPaid = 0;
    let totalResidual = 0;
    let residualPaid = 0;

    // Calculate upfront payments (handle missing data)
    const upfrontPayments = data.upfront_payments_details || [];
    upfrontPayments.forEach(payment => {
      totalUpfront += payment.amount;
      // Note: upfront payments don't have status in API, assume paid if payment_date exists
      if (payment.payment_date) {
        upfrontPaid += payment.amount;
      }
    });

    // Calculate installments (handle missing data and correct status field)
    const installments = data.installments_details || [];
    installments.forEach(installment => {
      totalResidual += installment.amount;
      // API uses 'status' field, not 'payment_status'
      const status = installment.status || installment.payment_status;
      if (status === 'paid' || status === 'PAID') {
        residualPaid += installment.amount;
      }
    });

    return {
      totalUpfront,
      upfrontPaid,
      upfrontBalance: totalUpfront - upfrontPaid,
      totalResidual,
      residualPaid,
      residualBalance: totalResidual - residualPaid,
    };
  }, [data]);

  // Enhanced upfront payments with status
  const enhancedUpfrontPayments = useMemo(() => {
    const upfrontPayments = data.upfront_payments_details || [];
    return upfrontPayments.map(payment => {
      let subLabel = '';
      let subLabelStyle = {};

      if (payment.payment_status === 'PAID') {
        subLabel = 'Paid';
        subLabelStyle = getPaymentStatusStyle('paid');
      } else {
        const dueDate = new Date(payment.due_date);
        const now = new Date();
        
        if (isDateBefore(dueDate, now)) {
          subLabel = 'Overdue';
          subLabelStyle = getPaymentStatusStyle('overdue');
        } else {
          subLabel = `Deadline: ${formatDate(payment.due_date, 'dd MMM, yyyy')}`;
          subLabelStyle = getPaymentStatusStyle('due');
        }
      }

      return {
        ...payment,
        subLabel,
        subLabelStyle,
      };
    });
  }, [data.upfront_payments_details]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewEMI = () => {
    const installmentsData = data.installments_details || [];
    console.log('💳 PaymentsScreen navigating to EMI with data:', {
      installmentsDetails: installmentsData,
      installmentsLength: installmentsData.length,
      fullPaymentData: JSON.stringify(data, null, 2)
    });
    
    navigation.navigate('EMI', {
      data: installmentsData,
    });
  };

  const KeyValueItem: React.FC<KeyValueItemProps> = ({ 
    label, 
    value, 
    subLabel, 
    subLabelStyle 
  }) => (
    <View style={styles.keyValueRow}>
      <View style={styles.keyWrapper}>
        <Text style={styles.keyText}>{label}</Text>
        {subLabel && (
          <Text style={[styles.subKeyText, subLabelStyle]}>
            {subLabel}
          </Text>
        )}
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <Header
        title="Payment Details"
        canGoBack
        onBackPress={handleBackPress}
        noShadow
      />

      {/* Payment Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {/* Package Information */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.sectionContent}>
            <View style={styles.packageRow}>
              <Text style={styles.packageLabel}>Package:</Text>
              <Text style={styles.packageName}>
                {data.package_details.italian_name}
              </Text>
            </View>

            <View style={styles.overviewSection}>
              <KeyValueItem
                label="Total Amount"
                value={`€${formatNumber(data.final_amount || 0)}`}
              />
              <KeyValueItem
                label="Payment Type"
                value={(data.payment_type || 'emi').toUpperCase()}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Upfront Payment Section */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.sectionContent}>
            <Title style={styles.sectionTitle}>Upfront Payment</Title>

            {/* Summary */}
            <View style={styles.summarySection}>
              <KeyValueItem
                label="Total Upfront"
                value={`€${formatNumber(paymentSummary.totalUpfront)}`}
              />
              <KeyValueItem
                label="Upfront Paid"
                value={`€${formatNumber(paymentSummary.upfrontPaid)}`}
              />
              <KeyValueItem
                label="Upfront Balance"
                value={`€${formatNumber(paymentSummary.upfrontBalance)}`}
              />
            </View>

            <Divider style={styles.divider} />

            {/* Individual payments */}
            <View style={styles.paymentsSection}>
              {enhancedUpfrontPayments.map((payment, index) => (
                <KeyValueItem
                  key={payment.id}
                  label={`Upfront Amount - ${index + 1}`}
                  value={`€${formatNumber(payment.amount)}`}
                  subLabel={payment.subLabel}
                  subLabelStyle={payment.subLabelStyle}
                />
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* EMI Section */}
        {(data.payment_type === 'emi' || data.installments_details?.length > 0) && (
          <Card style={styles.sectionCard}>
            <Card.Content style={styles.sectionContent}>
              <View style={styles.sectionTitleRow}>
                <Title style={styles.sectionTitle}>EMI Payment</Title>
                <Pressable onPress={handleViewEMI}>
                  <Text style={styles.viewEMILink}>View EMI</Text>
                </Pressable>
              </View>

              <View style={styles.emiSection}>
                <KeyValueItem
                  label="Residual Amount"
                  value={`€${formatNumber(paymentSummary.totalResidual)}`}
                />
                <KeyValueItem
                  label="EMI Paid"
                  value={`€${formatNumber(paymentSummary.residualPaid)}`}
                />
                <KeyValueItem
                  label="Balance Residual Amount"
                  value={`€${formatNumber(paymentSummary.residualBalance)}`}
                />
              </View>
            </Card.Content>
          </Card>
        )}
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
  contentPadding: {
    padding: spacing.md,
  },
  sectionCard: {
    elevation: 2,
    borderRadius: 8,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  sectionContent: {
    padding: spacing.lg,
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  packageLabel: {
    fontSize: 16,
    color: colors.onSurface,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginLeft: spacing.xs,
  },
  overviewSection: {
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewEMILink: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  summarySection: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
    backgroundColor: colors.grey300,
  },
  paymentsSection: {
    paddingVertical: spacing.sm,
  },
  emiSection: {
    paddingVertical: spacing.sm,
  },
  keyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  keyWrapper: {
    flex: 1,
    marginRight: spacing.md,
  },
  keyText: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
  subKeyText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  valueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
    textAlign: 'right',
  },
});

export default PaymentsScreen;