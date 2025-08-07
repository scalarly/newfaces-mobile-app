/**
 * Navigation Types
 * Shared type definitions for navigation across the app
 */

export type RootStackParamList = {
  Login: undefined;
  Main: undefined; // Tab Navigator
  ForgotPassword: undefined;
  Loader: {
    message?: string;
  };
  Email: {
    data: {
      id: number;
      user_details: {
        first_name: string;
        last_name?: string;
        email?: string;
      };
      template_details: {
        subject: string;
        body: string;
      };
      created_at: string;
    };
    title: string;
  };
  SMS: {
    data: {
      id: number;
      moderator_details?: {
        first_name: string;
        last_name?: string;
      };
      text: string;
      unread_count: number;
      created_at: string;
      contact?: string;
      lead_details?: {
        phone_1?: string;
        phone_2?: string;
        telephone?: string;
      };
    };
    title: string;
  };
  Notification: undefined;
  Payments: {
    data: {
      id: number;
      package_details: {
        id: number;
        name: string;
        italian_name: string;
      };
      final_amount: number;
      payment_type: 'full' | 'emi';
      upfront_payments_details: Array<{
        id: number;
        amount: number;
        due_date: string;
        payment_status: 'PAID' | 'UNPAID' | 'OVERDUE';
        payment_method?: string;
      }>;
      installments_details: Array<{
        id: number;
        amount: number;
        due_date: string;
        payment_status: 'PAID' | 'UNPAID' | 'OVERDUE';
        payment_method?: string;
      }>;
    };
  };
  EMI: {
    data: Array<{
      id: number;
      amount: number;
      due_date: string;
      payment_status: 'PAID' | 'UNPAID' | 'OVERDUE';
      payment_method?: string;
    }>;
  };
  SwitchUser: undefined;
  // NotificationDebug: undefined; // Removed from UI but kept for future use
};