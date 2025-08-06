import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService, ApiResponse } from '../helpers/request';

/**
 * State for API requests
 */
export interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Options for useApi hook
 */
export interface UseApiOptions {
  /** Auto-execute the request on mount */
  immediate?: boolean;
  /** Custom error handler */
  onError?: (error: any) => void;
  /** Custom success handler */
  onSuccess?: (data: any) => void;
  /** Transform response data before setting to state */
  transform?: (data: any) => any;
}

/**
 * Return type for useApi hook
 */
export interface UseApiReturn<T = any> {
  state: ApiState<T>;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  clearError: () => void;
}

/**
 * Generic hook for handling API requests with loading states and error handling
 * 
 * @param apiFunction - Function that returns a promise (API call)
 * @param options - Configuration options
 * @returns API state and control functions
 */
export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const { immediate = false, onError, onSuccess, transform } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    if (!isMountedRef.current) return null;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const response = await apiFunction(...args);
      
      if (!isMountedRef.current) return null;

      const responseData = (response.data as any).data || response.data;
      const finalData = transform ? transform(responseData) : responseData;

      setState({
        data: finalData,
        loading: false,
        error: null,
        success: true,
      });

      if (onSuccess) {
        onSuccess(finalData);
      }

      return finalData;
    } catch (error: any) {
      if (!isMountedRef.current) return null;

      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
      }));

      if (onError) {
        onError(error);
      }

      return null;
    }
  }, [apiFunction, transform, onError, onSuccess]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    state,
    execute,
    reset,
    clearError,
  };
};

/**
 * Hook specifically for GET requests
 */
export const useApiGet = <T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const apiFunction = useCallback(() => apiService.get<T>(endpoint), [endpoint]);
  return useApi<T>(apiFunction, options);
};

/**
 * Hook specifically for POST requests
 */
export const useApiPost = <T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & { post: (data: any) => Promise<T | null> } => {
  const apiFunction = useCallback((data: any) => apiService.post<T>(endpoint, data), [endpoint]);
  const result = useApi<T>(apiFunction, options);
  
  return {
    ...result,
    post: result.execute,
  };
};

/**
 * Hook specifically for PUT requests
 */
export const useApiPut = <T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & { put: (data: any) => Promise<T | null> } => {
  const apiFunction = useCallback((data: any) => apiService.put<T>(endpoint, data), [endpoint]);
  const result = useApi<T>(apiFunction, options);
  
  return {
    ...result,
    put: result.execute,
  };
};

/**
 * Hook specifically for DELETE requests
 */
export const useApiDelete = <T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & { deleteItem: (data?: any) => Promise<T | null> } => {
  const apiFunction = useCallback((data?: any) => apiService.delete<T>(endpoint, data), [endpoint]);
  const result = useApi<T>(apiFunction, options);
  
  return {
    ...result,
    deleteItem: result.execute,
  };
};

export default useApi;