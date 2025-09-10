import React, { useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our new migrated components
import { View, Container } from '../components/Layout';
import { Text, Title } from '../components/Typography';
import { Calendar } from '../components/Calendar';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { useTranslation } from '../hooks/useTranslation';
import { useCollection } from '../hooks/useCollection';
import { formatDate } from '../helpers/dateUtils';


// Type definitions matching the API response structure
interface AppointmentData {
  id: number;
  title?: string;
  happening_at: string;
  description?: string;
  status?: string;
  location?: string;
  user_details?: {
    first_name: string;
    last_name?: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color?: string;
}

const CalendarScreen: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  // Fetch appointments from API (exactly like legacy app)
  const { collection } = useCollection<AppointmentData>('me/appointments');
  
  // Process appointment data into calendar events (matching legacy logic)
  const appointmentEvents: CalendarEvent[] = useMemo(() => {
    if (!collection.items || collection.items.length === 0) {
      console.log('No appointments loaded yet or empty appointments');
      return [];
    }

    return collection.items.map((appointment) => {
      // Extract title from appointment data
      let title = appointment.title || 'Appointment';
      
      // If no title, try to create one from user details (like legacy)
      if (!appointment.title && appointment.user_details) {
        const userName = appointment.user_details.first_name + 
          (appointment.user_details.last_name ? ` ${appointment.user_details.last_name}` : '');
        title = `Meeting with ${userName}`;
      }

      // Determine color based on status or use default
      let color = '#0052CD'; // Default blue
      if (appointment.status === 'confirmed') {
        color = '#51cf66'; // Green for confirmed
      } else if (appointment.status === 'cancelled') {
        color = '#ff6b6b'; // Red for cancelled
      } else if (appointment.status === 'pending') {
        color = '#ffd43b'; // Yellow for pending
      }

      return {
        id: appointment.id.toString(),
        title,
        date: appointment.happening_at, // API provides ISO date string
        color,
      };
    });
  }, [collection.items]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventPress = (event: CalendarEvent, date: Date) => {
    console.log('Event pressed:', event.title, 'on', date);
    // TODO: Implement event popup like legacy app
    // Legacy had EventsPopup component that showed appointment details
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={t('mobile.titles.calendar')} 
        showNotification 
      />
      
      <Container style={styles.content}>
        <View style={styles.calendarContainer}>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            events={appointmentEvents}
            onEventPress={handleEventPress}
          />
        </View>
        
        {/* Loading indicator */}
        {!collection.loaded && (
          <View style={styles.loadingContainer}>
            <Text>Loading appointments...</Text>
          </View>
        )}
        
        {/* No appointments message */}
        {collection.loaded && appointmentEvents.length === 0 && (
          <View style={styles.noAppointmentsContainer}>
            <Text>No appointments found.</Text>
          </View>
        )}
        
        {selectedDate && (
          <View style={styles.selectedDateInfo}>
            <Title>Selected Date</Title>
            <Text>{selectedDate.toDateString()}</Text>
          </View>
        )}
      </Container>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    marginBottom: 66, // Account for bottom navigation
  },
  calendarContainer: {
    margin: 16,
  },
  selectedDateInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAppointmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default CalendarScreen;