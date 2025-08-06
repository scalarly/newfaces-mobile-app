// General utility functions migrated from legacy helpers/index.js

/**
 * Type definitions for utility functions
 */
export interface SelectOption {
  label: string;
  value: any;
}

export interface MapFunction<T> {
  (key: string): T;
}

/**
 * Access property of objects by string path optionally containing dots to denote nested paths
 * If the third argument is present, assign it to the key and return the object
 * 
 * @param object - The object to access
 * @param path - The path string (e.g., 'user.name', 'items[0].title')
 * @param value - Optional value to set
 * @param forceUseValue - Force using the value even if path doesn't exist
 * @returns The value at the path or undefined
 */
export const getByPath = <T = any>(
  object: any, 
  path: string, 
  value?: any, 
  forceUseValue: boolean = false
): T | undefined => {
  if (!object || typeof path !== 'string') {
    return undefined;
  }

  try {
    // Convert array indices to property access
    let normalizedPath = path.replace(/\[(\w+)\]/g, '.$1');
    normalizedPath = normalizedPath.replace(/^\./, ''); // strip leading dot

    const nestedKeys = normalizedPath.split('.');
    let current = object;

    for (let i = 0; i < nestedKeys.length; i++) {
      let key = nestedKeys[i].replace(/\%/, '.'); // Allow keys with dots

      // Handle array indices
      if (!isNaN(Number(key))) {
        key = parseInt(key, 10) as any;
      }

      if (current !== null && (key in current || (Array.isArray(current) && Number(key) <= current.length))) {
        if (value !== undefined && i + 1 === nestedKeys.length) {
          current[key] = value;
          return object;
        } else if (forceUseValue && i + 1 === nestedKeys.length) {
          current[key] = value;
          return object;
        } else {
          current = current[key];
        }
      } else if (current != null) {
        if (value !== undefined) {
          current[key] = value;
          return object;
        }
        return undefined;
      } else {
        return undefined;
      }
    }

    return current;
  } catch (error) {
    console.error('Error accessing object path:', error);
    return undefined;
  }
};

/**
 * Check if an object is empty
 * 
 * @param obj - Object to check
 * @returns Boolean indicating if object is empty
 */
export const isEmptyObject = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return true;
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Convert a list into a map (object) with the specified property as the key
 * 
 * @param list - Array of objects
 * @param property - Property name to use as key
 * @param asArray - If true, each property has an array of values
 * @param modifyKey - Function to modify the key
 * @param valueProperty - Property to use as value (instead of whole object)
 * @returns Map object
 */
export const getMap = <T = any>(
  list: T[], 
  property: keyof T, 
  asArray: boolean = false, 
  modifyKey: MapFunction<string> = (key: string) => key,
  valueProperty: keyof T | null = null
): Record<string, T | T[] | any> => {
  const map: Record<string, any> = {};

  list.forEach((item) => {
    const key = modifyKey(String(item[property]));

    if (asArray) {
      if (!map.hasOwnProperty(key)) {
        map[key] = [];
      }

      if (valueProperty !== null) {
        map[key].push(item[valueProperty]);
      } else {
        map[key].push(item);
      }
    } else {
      if (valueProperty !== null) {
        map[key] = item[valueProperty];
      } else {
        map[key] = item;
      }
    }
  });

  return map;
};

/**
 * Convert an object into a query string
 * 
 * @param obj - Object to convert
 * @returns Query string
 */
export const getQueryString = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined) {
      params.append(key, String(obj[key]));
    }
  });
  
  return params.toString();
};

/**
 * Convert string to lowercase safely
 * 
 * @param str - String to convert
 * @returns Lowercase string or original if null/undefined
 */
export const toLower = (str: string | null | undefined): string | null | undefined => {
  return str ? str.toLowerCase() : str;
};

/**
 * Convert string to uppercase safely
 * 
 * @param str - String to convert
 * @returns Uppercase string or original if null/undefined
 */
export const toUpper = (str: string | null | undefined): string | null | undefined => {
  return str ? str.toUpperCase() : str;
};

/**
 * Get object key value by wildcard matching (starts with)
 * 
 * @param object - Object to search
 * @param startsWith - String that key should start with
 * @returns Value of matching key or undefined
 */
export const getByStartsWithKey = <T = any>(
  object: Record<string, T>, 
  startsWith: string
): T | undefined => {
  for (const key in object) {
    if (key.startsWith(startsWith)) {
      return object[key];
    }
  }
  return undefined;
};

/**
 * Convert a list of items into Select-suitable options
 * 
 * @param list - Array of objects
 * @param labelKey - Property to use as label
 * @param valueKey - Property to use as value
 * @returns Array of SelectOption objects
 */
export const getOptions = <T = any>(
  list: T[], 
  labelKey: keyof T = 'name' as keyof T, 
  valueKey: keyof T = 'value' as keyof T
): SelectOption[] => {
  return list.map(item => ({
    label: String(item[labelKey]),
    value: item[valueKey],
  }));
};

/**
 * Convert a map (object) to a list
 * 
 * @param object - Object to convert
 * @param keyProperty - Property name for the key
 * @param valueProperty - Property name for the value
 * @returns Array of objects
 */
export const getList = (
  object: Record<string, any>, 
  keyProperty: string, 
  valueProperty: string
): Array<Record<string, any>> => {
  const list: Array<Record<string, any>> = [];
  
  Object.keys(object).forEach(key => {
    list.push({
      [keyProperty]: key,
      [valueProperty]: object[key],
    });
  });
  
  return list;
};

/**
 * Deep equality check for objects (doesn't consider functions)
 * 
 * @param object1 - First object
 * @param object2 - Second object
 * @returns Boolean indicating equality
 */
export const isEqual = (object1: any, object2: any): boolean => {
  try {
    return JSON.stringify(object1) === JSON.stringify(object2);
  } catch (error) {
    console.error('Error comparing objects:', error);
    return false;
  }
};

/**
 * Generate a deep copy of an object (doesn't copy functions)
 * 
 * @param obj - Object to copy
 * @returns Deep copy of the object
 */
export const deepCopy = <T = any>(obj: T): T => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error creating deep copy:', error);
    return obj;
  }
};

/**
 * Format string with placeholders (similar to C# string.Format)
 * 
 * @param template - String template with {} placeholders
 * @param args - Arguments to replace placeholders
 * @returns Formatted string
 */
export const formatString = (template: string, ...args: any[]): string => {
  let i = 0;
  return template.replace(/{}/g, () => {
    return args[i] != null ? String(args[i++]) : '';
  });
};

/**
 * Remove empty keys from an object recursively
 * 
 * @param obj - Object to clean
 * @param emptyValues - Array of values considered empty
 * @returns Cleaned object
 */
export const removeEmptyKeys = <T = any>(
  obj: T, 
  emptyValues: any[] = [null, undefined, '']
): T => {
  const cleaned = deepCopy(obj) as any;

  const cleanObject = (target: any): any => {
    if (Array.isArray(target)) {
      return target
        .map(item => typeof item === 'object' ? cleanObject(item) : item)
        .filter(item => !emptyValues.includes(item));
    }
    
    if (target !== null && typeof target === 'object') {
      const result: any = {};
      
      Object.keys(target).forEach(key => {
        const value = target[key];
        
        if (!emptyValues.includes(value)) {
          if (typeof value === 'object') {
            const cleanedValue = cleanObject(value);
            if (!isEmptyObject(cleanedValue)) {
              result[key] = cleanedValue;
            }
          } else {
            result[key] = value;
          }
        }
      });
      
      return result;
    }
    
    return target;
  };

  return cleanObject(cleaned);
};

/**
 * Generate a random string
 * 
 * @param length - Length of the string (default 6)
 * @returns Random string
 */
export const getRandomString = (length: number = 6): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Generate a UUID v4
 * 
 * @returns UUID string
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Format number with locale and currency support
 * 
 * @param number - Number to format
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale string (e.g., 'en-US', 'it-IT')
 * @returns Formatted number string
 */
export const formatNumber = (
  number: number, 
  currency?: string, 
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: currency ? 'currency' : 'decimal',
      currency: currency,
    }).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(number);
  }
};

/**
 * Debounce function execution
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: any;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function execution
 * 
 * @param func - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Capitalize first letter of string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert camelCase to kebab-case
 * 
 * @param str - String to convert
 * @returns kebab-case string
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 * 
 * @param str - String to convert
 * @returns camelCase string
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Truncate string to specified length
 * 
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add when truncated
 * @returns Truncated string
 */
export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Check if value is null or undefined
 * 
 * @param value - Value to check
 * @returns Boolean indicating if value is null or undefined
 */
export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Check if string is null, undefined, or empty
 * 
 * @param value - String to check
 * @returns Boolean indicating if string is null, undefined, or empty
 */
export const isNullOrEmpty = (value: string | null | undefined): value is null | undefined | '' => {
  return isNullOrUndefined(value) || value === '';
};

/**
 * Check if string is null, undefined, empty, or whitespace
 * 
 * @param value - String to check
 * @returns Boolean indicating if string is null, undefined, empty, or whitespace
 */
export const isNullOrWhitespace = (value: string | null | undefined): boolean => {
  return isNullOrEmpty(value) || (typeof value === 'string' && value.trim() === '');
};

// Default export with all utilities
export default {
  getByPath,
  isEmptyObject,
  getMap,
  getQueryString,
  toLower,
  toUpper,
  getByStartsWithKey,
  getOptions,
  getList,
  isEqual,
  deepCopy,
  formatString,
  removeEmptyKeys,
  getRandomString,
  generateUUID,
  formatNumber,
  debounce,
  throttle,
  capitalize,
  camelToKebab,
  kebabToCamel,
  truncate,
  isNullOrUndefined,
  isNullOrEmpty,
  isNullOrWhitespace,
};