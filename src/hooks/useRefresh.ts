import { useState, useCallback } from 'react';

/**
 * Utility function to create a promise that resolves after a specified timeout
 */
const wait = (timeout: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

/**
 * Interface for refresh hook options
 */
export interface UseRefreshOptions {
  /** Duration in milliseconds for the refresh operation (default: 2000ms) */
  duration?: number;
  /** Custom async function to execute during refresh */
  onRefresh?: () => Promise<void>;
}

/**
 * A custom hook that provides refresh functionality with loading state
 * Commonly used with React Native's RefreshControl component
 * 
 * @param options - Configuration options for the refresh behavior
 * @returns A tuple containing [refreshing, onRefresh, forceRefresh]
 */
export const useRefresh = (options: UseRefreshOptions = {}): [
  boolean, 
  () => Promise<void>, 
  () => void
] => {
  const { duration = 2000, onRefresh } = options;
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes

    setRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default behavior: just wait for the specified duration
        await wait(duration);
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh, duration]);

  const forceRefresh = useCallback(() => {
    setRefreshing(false);
  }, []);

  return [refreshing, handleRefresh, forceRefresh];
};

/**
 * Hook variant that returns an object instead of tuple (for named destructuring)
 */
export const useRefreshObject = (options: UseRefreshOptions = {}) => {
  const [refreshing, onRefresh, forceRefresh] = useRefresh(options);
  
  return {
    refreshing,
    onRefresh,
    forceRefresh,
    isRefreshing: refreshing,
  };
};

/**
 * Simple refresh hook that just provides the loading state and basic refresh functionality
 * Compatible with the legacy useRefresh hook
 */
export const useSimpleRefresh = (): [boolean, () => void] => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  return [refreshing, onRefresh];
};

export default useRefresh;