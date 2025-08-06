import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our new migrated components
import { View, Container } from '../components/Layout';
import { Text, Title } from '../components/Typography';
import { Calendar } from '../components/Calendar';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';


interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color?: string;
}

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  // Sample events for demonstration
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      date: '2025-01-15',
      color: '#0052CD',
    },
    {
      id: '2',
      title: 'Client Call',
      date: '2025-01-15',
      color: '#ff6b6b',
    },
    {
      id: '3',
      title: 'Project Review',
      date: '2025-01-20',
      color: '#51cf66',
    },
  ];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventPress = (event: CalendarEvent, date: Date) => {
    console.log('Event pressed:', event.title, 'on', date);
    // TODO: Navigate to event details or show event popup
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Calendar" 
        showNotification 
      />
      
      <Container style={styles.content}>
        <View style={styles.calendarContainer}>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            events={sampleEvents}
            onEventPress={handleEventPress}
          />
        </View>
        
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
});

export default CalendarScreen;