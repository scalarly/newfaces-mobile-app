import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our new migrated components
import { View, Container } from '../components/Layout';
import { Text, Title } from '../components/Typography';
import { Calendar } from '../components/Calendar';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { useTranslation } from '../hooks/useTranslation';
import { useCollection } from '../hooks/useCollection';
import { formatDate, formatTime, formatDateTime } from '../helpers/dateUtils';


// Type definitions matching the API response structure
interface AppointmentData {
  id: number;
  title?: string;
  name?: string;
  notes?: string;
  text?: string;
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
  
  // Debug logging
  console.log('Calendar collection state:', {
    loaded: collection.loaded,
    loading: collection.loading,
    error: collection.error,
    itemsCount: collection.items?.length,
    items: collection.items
  });
  
  // Process appointment data into calendar events (matching legacy logic)
  const appointmentEvents: CalendarEvent[] = useMemo(() => {
    if (!collection.items || collection.items.length === 0) {
      console.log('No appointments loaded yet or empty appointments');
      return [];
    }

    console.log('Processing appointments:', collection.items);

    return collection.items.map((appointment) => {
      // Extract title from appointment data (matching legacy logic)
      let title = appointment.title || appointment.name || appointment.notes || appointment.text || 'Appointment';
      
      // If no title, try to create one from user details (like legacy)
      if (!title || title === 'Appointment') {
        if (appointment.user_details) {
          const userName = appointment.user_details.first_name + 
            (appointment.user_details.last_name ? ` ${appointment.user_details.last_name}` : '');
          title = `Meeting with ${userName}`;
        }
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

      // Convert ISO datetime to YYYY-MM-DD format (matching legacy)
      const appointmentDate = new Date(appointment.happening_at);
      const dateString = formatDate(appointmentDate, 'yyyy-MM-dd');

      console.log('Processed appointment:', {
        id: appointment.id,
        title,
        originalDate: appointment.happening_at,
        formattedDate: dateString,
        color
      });

      return {
        id: appointment.id.toString(),
        title,
        date: dateString, // Convert to YYYY-MM-DD format for calendar
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
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            events={appointmentEvents}
            onEventPress={handleEventPress}
          />
        </View>
        
        {/* Loading indicator */}
        {collection.loading && (
          <View style={styles.loadingContainer}>
            <Text>Loading appointments...</Text>
          </View>
        )}
        
        {/* Error indicator */}
        {collection.error && (
          <View style={styles.loadingContainer}>
            <Text style={{ color: 'red' }}>Error loading appointments: {collection.error}</Text>
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
            
            {/* Show appointments for selected date */}
            {(() => {
              const selectedDateString = formatDate(selectedDate, 'yyyy-MM-dd');
              const dayEvents = appointmentEvents.filter(event => event.date === selectedDateString);
              
              console.log('Selected date:', selectedDateString, 'Events:', dayEvents);
              
              if (dayEvents.length > 0) {
                return (
                  <View style={styles.dayEventsContainer}>
                    <Text style={styles.eventsTitle}>Appointments:</Text>
                    {dayEvents.map((event) => {
                      // Find the original appointment data for this event
                      const appointment = collection.items.find(item => item.id.toString() === event.id);
                      
                      return (
                        <View key={event.id} style={styles.eventItem}>
                          <View style={[styles.eventColorDot, { backgroundColor: event.color }]} />
                          <View style={styles.eventDetails}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            {appointment && (
                              <>
                                <Text style={styles.eventTime}>
                                  {formatTime(appointment.happening_at)}
                                </Text>
                                {appointment.location && (
                                  <Text style={styles.eventLocation}>
                                    📍 {appointment.location}
                                  </Text>
                                )}
                                {appointment.description && (
                                  <Text style={styles.eventDescription}>
                                    {appointment.description}
                                  </Text>
                                )}
                                {appointment.status && (
                                  <Text style={[styles.eventStatus, { 
                                    color: appointment.status === 'confirmed' ? '#51cf66' : 
                                           appointment.status === 'cancelled' ? '#ff6b6b' : 
                                           appointment.status === 'pending' ? '#ffd43b' : '#666'
                                  }]}>
                                    Status: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </Text>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              } else {
                return (
                  <Text style={styles.noEventsText}>No appointments for this date</Text>
                );
              }
            })()}
          </View>
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Account for bottom navigation
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
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAppointmentsContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dayEventsContainer: {
    marginTop: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0052CD',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 4,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#0052CD',
    fontWeight: '600',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noEventsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CalendarScreen;