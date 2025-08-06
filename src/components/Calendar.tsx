import React, { forwardRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native';
import { View } from './Layout';
import { Text } from './Typography';
import { Pressable } from './Pressable';
import { getTheme, spacing, borderRadius } from '../helpers/theme';
import { formatDate } from '../helpers/dateUtils';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color?: string;
}

interface CalendarProps {
  /** Initial date to display */
  initialDate?: Date;
  /** Selected date */
  selectedDate?: Date;
  /** Date selection callback */
  onDateSelect?: (date: Date) => void;
  /** Events to display */
  events?: CalendarEvent[];
  /** Event click callback */
  onEventPress?: (event: CalendarEvent, date: Date) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Custom styling */
  style?: any;
}

/**
 * Modern Calendar component with event support
 * 
 * @example
 * <Calendar
 *   selectedDate={selectedDate}
 *   onDateSelect={setSelectedDate}
 *   events={calendarEvents}
 *   onEventPress={(event, date) => showEventDetails(event)}
 * />
 */
export type { CalendarEvent };

export const Calendar = forwardRef<RNView, CalendarProps>(({
  initialDate = new Date(),
  selectedDate,
  onDateSelect,
  events = [],
  onEventPress,
  minDate,
  maxDate,
  style,
}, ref) => {
  const theme = getTheme();
  const [, _setCurrentDate] = useState(initialDate);
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateString = formatDate(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateString);
  };

  // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (): number => {
    return new Date(displayYear, displayMonth, 1).getDay();
  };

  // Get number of days in the month
  const getDaysInMonth = (): number => {
    return new Date(displayYear, displayMonth + 1, 0).getDate();
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  // Handle date selection
  const handleDatePress = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    
    // Check date constraints
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;
    
    onDateSelect?.(date);
  };

  // Handle event press
  const handleEventPress = (event: CalendarEvent, day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    onEventPress?.(event, date);
  };

  // Check if date is selected
  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === displayMonth &&
      selectedDate.getFullYear() === displayYear
    );
  };

  // Check if date is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === displayMonth &&
      today.getFullYear() === displayYear
    );
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const firstDay = getFirstDayOfMonth();
    const daysInMonth = getDaysInMonth();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayYear, displayMonth, day);
      const dayEvents = getEventsForDate(date);
      const isSelected = isDateSelected(day);
      const isTodayDate = isToday(day);
      const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);

      days.push(
        <TouchableWithoutFeedback
          key={day}
          onPress={() => !isDisabled && handleDatePress(day)}
        >
          <View style={[
            styles.dayCell,
            isTodayDate && styles.todayCell,
            isSelected && styles.selectedCell,
            isDisabled && styles.disabledCell,
          ]}>
            <Text style={[
              styles.dayText,
              isTodayDate && styles.todayText,
              isSelected && styles.selectedText,
              isDisabled && styles.disabledText,
            ]}>
              {day}
            </Text>
            
            {/* Events */}
            <View style={styles.eventsContainer}>
              {dayEvents.slice(0, 3).map((event) => (
                <Pressable
                  key={event.id}
                  style={[
                    styles.eventDot,
                    { backgroundColor: event.color || theme.colors.primary }
                  ]}
                  onPress={() => handleEventPress(event, day)}
                >
                  <Text style={styles.eventText} numberOfLines={1}>
                    {event.title}
                  </Text>
                </Pressable>
              ))}
              {dayEvents.length > 3 && (
                <Text style={styles.moreEvents}>
                  +{dayEvents.length - 3} more
                </Text>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }

    return days;
  };

  // Generate weeks array
  const generateWeeks = () => {
    const days = generateCalendarDays();
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <View key={`week-${i}`} style={styles.weekRow}>
          {days.slice(i, i + 7)}
        </View>
      );
    }
    
    return weeks;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View ref={ref} style={[styles.calendar, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navText}>←</Text>
        </Pressable>
        
        <View style={styles.headerCenter}>
          <Text size="h3" weight="semibold">
            {monthNames[displayMonth]} {displayYear}
          </Text>
        </View>
        
        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>→</Text>
        </Pressable>
      </View>

      {/* Week days header */}
      <View style={styles.weekHeader}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {generateWeeks()}
      </View>
    </View>
  );
});

Calendar.displayName = 'Calendar';

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navButton: {
    padding: spacing.sm,
  },
  navText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0052CD',
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    // Grid container
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    height: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e4e4e4',
    padding: spacing.xs,
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
  },
  selectedCell: {
    backgroundColor: '#0052CD',
  },
  disabledCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  todayText: {
    color: '#0052CD',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#ccc',
  },
  eventsContainer: {
    flex: 1,
  },
  eventDot: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginBottom: 1,
  },
  eventText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '500',
  },
  moreEvents: {
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic',
  },
});