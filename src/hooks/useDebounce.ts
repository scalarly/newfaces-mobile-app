import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook that debounces a value
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook that debounces a callback function
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array
 * @returns Debounced callback function
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<any>(null);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook for debounced search functionality
 * 
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds
 * @returns Search state and handlers
 */
export const useDebouncedSearch = (
  initialValue: string = '',
  delay: number = 300
) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialValue);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  // Reset searching state when debounced value updates
  useEffect(() => {
    if (isSearching) {
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, isSearching]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    updateSearchTerm,
    clearSearch,
    setSearchTerm,
  };
};

export default useDebounce;