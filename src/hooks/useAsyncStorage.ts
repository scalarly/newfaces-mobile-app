import { useState, useEffect, useCallback } from 'react';
import SecureStorage from '../helpers/secureStorage';

/**
 * Hook for managing secure storage with React state synchronization
 * 
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue, removeValue, loading]
 */
export const useSecureStorage = <T = string>(
  key: string,
  defaultValue: T | null = null
): [T | null, (value: T) => Promise<void>, () => Promise<void>, boolean] => {
  const [storedValue, setStoredValue] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await SecureStorage.getItem(key);
        if (value !== null) {
          // Try to parse as JSON, fallback to string
          try {
            const parsedValue = JSON.parse(value);
            setStoredValue(parsedValue);
          } catch {
            setStoredValue(value as T);
          }
        } else {
          setStoredValue(defaultValue);
        }
      } catch (error) {
        console.error(`Error loading ${key} from secure storage:`, error);
        setStoredValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  // Set value
  const setValue = useCallback(async (value: T) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStorage.setItem(key, stringValue);
      setStoredValue(value);
    } catch (error) {
      console.error(`Error setting ${key} in secure storage:`, error);
      throw error;
    }
  }, [key]);

  // Remove value
  const removeValue = useCallback(async () => {
    try {
      await SecureStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.error(`Error removing ${key} from secure storage:`, error);
      throw error;
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue, loading];
};

/**
 * Hook for managing user token in secure storage
 */
export const useUserToken = () => {
  const [token, setToken, removeToken, loading] = useSecureStorage<string>('userToken');

  const isAuthenticated = token !== null;

  const login = useCallback(async (newToken: string) => {
    await setToken(newToken);
  }, [setToken]);

  const logout = useCallback(async () => {
    await removeToken();
  }, [removeToken]);

  return {
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    setToken,
    removeToken,
  };
};

/**
 * Hook for managing user ID in secure storage
 */
export const useUserId = () => {
  const [userId, setUserId, removeUserId, loading] = useSecureStorage<string>('leadID');

  return {
    userId,
    setUserId,
    removeUserId,
    loading,
    hasUserId: userId !== null,
  };
};

/**
 * Hook for managing multiple secure storage values at once
 */
export const useMultipleSecureStorage = <T extends Record<string, any>>(
  keys: (keyof T)[]
): {
  values: Partial<T>;
  loading: boolean;
  setValue: (key: keyof T, value: T[keyof T]) => Promise<void>;
  removeValue: (key: keyof T) => Promise<void>;
  clearAll: () => Promise<void>;
} => {
  const [values, setValues] = useState<Partial<T>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load all values
  useEffect(() => {
    const loadAllValues = async () => {
      setLoading(true);
      const loadedValues: Partial<T> = {};

      try {
        await Promise.all(
          keys.map(async (key) => {
            try {
              const value = await SecureStorage.getItem(String(key));
              if (value !== null) {
                try {
                  loadedValues[key] = JSON.parse(value);
                } catch {
                  loadedValues[key] = value as T[keyof T];
                }
              }
            } catch (error) {
              console.error(`Error loading ${String(key)} from secure storage:`, error);
            }
          })
        );

        setValues(loadedValues);
      } catch (error) {
        console.error('Error loading values from secure storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllValues();
  }, [keys]);

  const setValue = useCallback(async (key: keyof T, value: T[keyof T]) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStorage.setItem(String(key), stringValue);
      setValues(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Error setting ${String(key)} in secure storage:`, error);
      throw error;
    }
  }, []);

  const removeValue = useCallback(async (key: keyof T) => {
    try {
      await SecureStorage.removeItem(String(key));
      setValues(prev => {
        const newValues = { ...prev };
        delete newValues[key];
        return newValues;
      });
    } catch (error) {
      console.error(`Error removing ${String(key)} from secure storage:`, error);
      throw error;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await Promise.all(keys.map(key => SecureStorage.removeItem(String(key))));
      setValues({});
    } catch (error) {
      console.error('Error clearing all values from secure storage:', error);
      throw error;
    }
  }, [keys]);

  return {
    values,
    loading,
    setValue,
    removeValue,
    clearAll,
  };
};

export default useSecureStorage;