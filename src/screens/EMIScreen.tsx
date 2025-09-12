import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

import { Header, BottomNavigation } from '../components';
import { colors, spacing } from '../helpers/theme';
import { formatDate, isDateBefore } from '../helpers/dateUtils';
import { formatNumber } from '../helpers/generalUtils';
import { RootStackParamList } from '../navigation/types';

/**
 * EMIScreen - Modern EMI installments screen
 * Replaces the legacy EMIScreen.js with modern TypeScript implementation
 */

// Type definitions matching the API response
interface InstallmentData {
  id: number;
  amount: number;
  due_date: string;
  status?: string; // API returns 'status' field ("paid", "pending")
  payment_status?: 'PAID' | 'UNPAID' | 'OVERDUE'; // Fallback for legacy
  payment_date?: string | null;
  payment_method?: string | null;
  installment_number?: number;
  notes?: string;
}

type PaymentStatus = 'PAID' | 'UNPAID' | 'OVERDUE';

type Props = NativeStackScreenProps<RootStackParamList, 'EMI'>;

interface InstallmentItemProps {
  installment: InstallmentData & { calculatedStatus: PaymentStatus };
  index: number;
}

const EMIScreen: React.FC<Props> = ({ navigation, route }) => {
  const { data } = route.params;

  console.log('EMIScreen received data:', data);
  console.log('Data length:', data?.length);
  console.log('Data structure:', JSON.stringify(data, null, 2));

  // Process installments with status calculation
  const processedInstallments = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.log('EMI data is not an array or is empty:', data);
      return [];
    }

    return data.map((installment: InstallmentData) => {
      // API returns 'status' field, not 'payment_status'
      let status = installment.status || installment.payment_status;
      
      // Convert API status to expected format
      if (status === 'paid') status = 'PAID';
      if (status === 'pending') status = 'UNPAID';
      
      // Check if unpaid installment is overdue
      if (status === 'UNPAID') {
        const dueDate = new Date(installment.due_date);
        const now = new Date();
        
        if (isDateBefore(dueDate, now)) {
          status = 'OVERDUE';
        }
      }
      
      return {
        ...installment,
        calculatedStatus: (status || 'UNPAID') as PaymentStatus,
      };
    });
  }, [data]);

  // Create enhanced installment type
  type EnhancedInstallment = InstallmentData & { calculatedStatus: PaymentStatus };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'PAID':
        return colors.success || '#13CB73';
      case 'OVERDUE':
        return colors.error || '#ff6635';
      case 'UNPAID':
      default:
        return colors.textSecondary || '#666666';
    }
  };

  const getStatusIcon = (status: PaymentStatus): string => {
    switch (status) {
      case 'PAID':
        return 'check-circle';
      case 'OVERDUE':
        return 'alert-circle';
      case 'UNPAID':
      default:
        return 'clock';
    }
  };

  const getStatusLabel = (status: PaymentStatus): string => {
    switch (status) {
      case 'PAID':
        return 'Paid';
      case 'OVERDUE':
        return 'Overdue';
      case 'UNPAID':
      default:
        return 'Pending';
    }
  };

  const InstallmentItem: React.FC<InstallmentItemProps> = ({ installment, index }) => {
    const status = installment.calculatedStatus;
    const statusColor = getStatusColor(status);
    const statusIcon = getStatusIcon(status);
    const statusLabel = getStatusLabel(status);

    return (
      <Card style={styles.installmentCard}>
        <Card.Content style={styles.installmentContent}>
          <View style={styles.installmentRow}>
            {/* Status Icon */}
            <View style={styles.statusIconContainer}>
              <Icon
                name={statusIcon}
                color={statusColor}
                size={24}
              />
            </View>

            {/* Installment Details */}
            <View style={styles.installmentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(installment.due_date, 'dd MMM, yyyy')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={[styles.detailValue, styles.amountValue]}>
                  €{formatNumber(installment.amount)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>
                  {installment.payment_method || 'Not specified'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderInstallmentItem: ListRenderItem<InstallmentData & { calculatedStatus: PaymentStatus }> = ({ item, index }) => (
    <InstallmentItem installment={item} index={index} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name="credit-card"
        color={colors.textSecondary}
        size={48}
      />
      <Text style={styles.emptyStateText}>
        No installments found
      </Text>
      <Text style={styles.emptyStateSubtext}>
        There are no EMI installments to display
      </Text>
    </View>
  );

  const renderHeader = () => {
    const totalInstallments = processedInstallments.length;
    const paidInstallments = processedInstallments.filter(i => i.calculatedStatus === 'PAID').length;
    const overdue = processedInstallments.filter(i => i.calculatedStatus === 'OVERDUE').length;

    return (
      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>EMI Overview</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalInstallments}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success || '#13CB73' }]}>
                {paidInstallments}
              </Text>
              <Text style={styles.summaryLabel}>Paid</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.error || '#ff6635' }]}>
                {overdue}
              </Text>
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <Header
        title="EMI Details"
        canGoBack
        onBackPress={handleBackPress}
        noShadow
      />

      {/* EMI List */}
      <FlatList
        data={processedInstallments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderInstallmentItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        style={styles.installmentsList}
        contentContainerStyle={[
          styles.installmentsContent,
          processedInstallments.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
      />

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
  installmentsList: {
    flex: 1,
    marginBottom: 66, // Space for bottom navigation
  },
  installmentsContent: {
    padding: spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  summaryCard: {
    elevation: 3,
    borderRadius: 8,
    marginBottom: spacing.lg,
    backgroundColor: colors.grey50,
  },
  summaryContent: {
    padding: spacing.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  installmentCard: {
    elevation: 2,
    borderRadius: 8,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  installmentContent: {
    padding: spacing.md,
  },
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIconContainer: {
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  installmentDetails: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurface,
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default EMIScreen;