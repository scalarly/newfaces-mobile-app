import { 
  format, 
  parseISO, 
  isValid, 
  addDays, 
  addMonths, 
  addYears, 
  startOfDay, 
  endOfDay, 
  differenceInDays,
  isBefore,
  isAfter,
  isSameDay
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { it } from 'date-fns/locale/it';

// Define supported locales
export enum SupportedLocale {
  EN = 'en',
  IT = 'it',
}

// Locale configuration
const localeMap = {
  [SupportedLocale.EN]: enUS,
  [SupportedLocale.IT]: it,
};

let currentLocale: SupportedLocale = SupportedLocale.EN;

/**
 * Set the current locale for date formatting
 */
export const setDateLocale = (locale: SupportedLocale): void => {
  currentLocale = locale;
};

/**
 * Get the current locale
 */
export const getCurrentLocale = (): SupportedLocale => {
  return currentLocale;
};

/**
 * Get the date-fns locale object for the current locale
 */
const getLocaleObject = () => {
  return localeMap[currentLocale] || localeMap[SupportedLocale.EN];
};

/**
 * Format a date string or Date object
 * @param date - Date string (ISO) or Date object
 * @param formatString - Format string (e.g., 'dd MMM yyyy', 'PPP')
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date, 
  formatString: string = 'dd MMM yyyy'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }
    return format(dateObj, formatString, { locale: getLocaleObject() });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date for display (equivalent to legacy moment().format('DD MMM'))
 */
export const formatDateShort = (date: string | Date): string => {
  return formatDate(date, 'dd MMM');
};

/**
 * Format date for display (equivalent to legacy moment().format('DD MMM YYYY'))
 */
export const formatDateLong = (date: string | Date): string => {
  return formatDate(date, 'dd MMM yyyy');
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd MMM yyyy HH:mm');
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

/**
 * Parse a date string to Date object
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Check if a date is valid
 */
export const isValidDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch (error) {
    return false;
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export const getRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    const now = new Date();
    const daysDiff = differenceInDays(now, dateObj);
    
    if (daysDiff === 0) {
      return currentLocale === SupportedLocale.IT ? 'Oggi' : 'Today';
    } else if (daysDiff === 1) {
      return currentLocale === SupportedLocale.IT ? 'Ieri' : 'Yesterday';
    } else if (daysDiff === -1) {
      return currentLocale === SupportedLocale.IT ? 'Domani' : 'Tomorrow';
    } else if (daysDiff > 0) {
      return currentLocale === SupportedLocale.IT 
        ? `${daysDiff} giorni fa` 
        : `${daysDiff} days ago`;
    } else {
      return currentLocale === SupportedLocale.IT 
        ? `tra ${Math.abs(daysDiff)} giorni` 
        : `in ${Math.abs(daysDiff)} days`;
    }
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

/**
 * Add months to a date
 */
export const addMonthsToDate = (date: string | Date, months: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addMonths(dateObj, months);
};

/**
 * Add years to a date
 */
export const addYearsToDate = (date: string | Date, years: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addYears(dateObj, years);
};

/**
 * Get start of day
 */
export const getStartOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
};

/**
 * Check if first date is before second date
 */
export const isDateBefore = (date1: string | Date, date2: string | Date): boolean => {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isBefore(dateObj1, dateObj2);
};

/**
 * Check if first date is after second date
 */
export const isDateAfter = (date1: string | Date, date2: string | Date): boolean => {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(dateObj1, dateObj2);
};

/**
 * Check if two dates are the same day
 */
export const isSameDayAs = (date1: string | Date, date2: string | Date): boolean => {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(dateObj1, dateObj2);
};

/**
 * Parse time string and return formatted time (equivalent to legacy getTime function)
 */
export const parseTimeString = (originalTimeString: string): string => {
  let timeString: string;
  // Default hour and minute values
  const defaultHour = 10;
  let hour = defaultHour;
  const defaultMinute = 0;
  let minute = defaultMinute;
  let prefixUsed = '';    // 'AM' or 'PM' or ''

  // Trim out whitespace
  timeString = originalTimeString.trim();

  // Capitalize string
  timeString = timeString.toUpperCase();

  // Get rid of the am/pm prefixes and determine if a 12 hour offset is required
  let addOffset = false;
  if (timeString.includes('AM')) {
    prefixUsed = 'AM';
    const amPosition = timeString.indexOf('AM');
    timeString = timeString.substring(0, amPosition - 1);
  } else if (timeString.includes('PM')) {
    prefixUsed = 'PM';
    const pmPosition = timeString.indexOf('PM');
    timeString = timeString.substring(0, pmPosition - 1);
    addOffset = true;
  }

  // Get the hour and the minute from the string only if the string format is right
  if (timeString.includes(':')) {
    const hourStr = timeString.split(':')[0].trim();
    const minuteStr = timeString.split(':')[1].trim();

    if (/^\d+$/.test(hourStr) && /^\d+$/.test(minuteStr)) {
      hour = parseInt(hourStr, 10);
      minute = parseInt(minuteStr, 10);
    }
  } else {
    const hourStr = timeString.split(':')[0].trim();

    if (/^\d+$/.test(hourStr)) {
      hour = parseInt(hourStr, 10);
    }
  }

  // Edge cases of 12 AM and 12 PM which translate to 00:00 and 12:00 respectively
  if (prefixUsed === 'AM' && hour === 12) {
    hour = 0;
  } else if (prefixUsed === 'PM' && hour === 12) {
    hour = 12;
  } else if (addOffset) {
    hour += 12;
  }

  if (hour > 24 || hour < 0 || minute > 60 || minute < 0) {
    hour = defaultHour;
    minute = defaultMinute;
  }

  // To prepend with `0` for single digit integers
  const doubleDigitHourString = ('0' + hour).slice(-2);
  const doubleDigitMinuteString = ('0' + minute).slice(-2);

  return `${doubleDigitHourString}:${doubleDigitMinuteString}`;
};

// Default export for backward compatibility with moment-style usage
export default {
  formatDate,
  formatDateShort,
  formatDateLong,
  formatDateTime,
  formatTime,
  parseDate,
  isValidDate,
  getRelativeTime,
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  getStartOfDay,
  getEndOfDay,
  isDateBefore,
  isDateAfter,
  isSameDayAs,
  parseTimeString,
  setDateLocale,
  getCurrentLocale,
  SupportedLocale,
};