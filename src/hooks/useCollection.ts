import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../helpers/request';
import { isEqual } from '../helpers/generalUtils';

/**
 * Pagination information structure
 */
export interface PaginationInfo {
  current_page: number | null;
  standard_page_size: number | null;
  total_pages: number | null;
  total_items?: number | null;
  per_page?: number | null;
}

/**
 * Summary information structure
 */
export interface SummaryInfo {
  active_count: number | null;
  total_count?: number | null;
  [key: string]: any;
}

/**
 * Collection state structure
 */
export interface CollectionState<T = any> {
  items: T[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  summary: SummaryInfo;
  url: string;
  queryString: string | null;
  postData: any | null;
  version: number;
}

/**
 * Options for useCollection hook
 */
export interface UseCollectionOptions<T = any> {
  /** Default query string parameters */
  defaultQueryString?: string | null;
  /** Function to transform/add fake columns to the data */
  transformData?: (data: T[]) => T[];
  /** POST data for POST requests (if null, uses GET) */
  postData?: any | null;
  /** Callback function called when data is loaded */
  onDataLoaded?: (data: T[]) => void;
  /** Callback function called when an error occurs */
  onError?: (error: any) => void;
  /** Auto-fetch data on mount (default: true) */
  autoFetch?: boolean;
  /** Enable caching of results (default: false) */
  enableCache?: boolean;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
}

/**
 * Actions available for collection updates
 */
export interface CollectionUpdateAction<T = any> {
  items?: T[];
  loaded?: boolean;
  loading?: boolean;
  error?: string | null;
  pagination?: Partial<PaginationInfo>;
  summary?: Partial<SummaryInfo>;
  url?: string;
  queryString?: string | null;
  postData?: any | null;
  reload?: boolean;
}

/**
 * Return type for useCollection hook
 */
export interface UseCollectionReturn<T = any> {
  collection: CollectionState<T>;
  updateCollection: (action: CollectionUpdateAction<T> | ((current: CollectionState<T>) => CollectionUpdateAction<T>)) => void;
  refresh: () => void;
  setUrl: (url: string) => void;
  setQueryString: (queryString: string | null) => void;
  setPostData: (postData: any | null) => void;
  clearError: () => void;
  addItem: (item: T) => void;
  removeItem: (predicate: (item: T) => boolean) => void;
  updateItem: (predicate: (item: T) => boolean, updates: Partial<T>) => void;
}

// Simple in-memory cache
const collectionCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Modern TypeScript hook for managing collections with API requests
 * Replaces the legacy useCollection hook with better error handling, TypeScript support,
 * and modern React patterns
 * 
 * @param url - API endpoint URL
 * @param options - Configuration options
 * @returns Collection state and management functions
 */
export const useCollection = <T = any>(
  url: string,
  options: UseCollectionOptions<T> = {}
): UseCollectionReturn<T> => {
  const {
    defaultQueryString = null,
    transformData,
    postData = null,
    onDataLoaded,
    onError,
    autoFetch = true,
    enableCache = false,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [collection, setCollection] = useState<CollectionState<T>>({
    items: [],
    loaded: false,
    loading: false,
    error: null,
    pagination: {
      current_page: null,
      standard_page_size: null,
      total_pages: null,
    },
    summary: {
      active_count: null,
    },
    url,
    queryString: defaultQueryString,
    postData,
    version: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Generate cache key
  const getCacheKey = useCallback((endpoint: string, data: any) => {
    return `${endpoint}_${JSON.stringify(data)}`;
  }, []);

  // Check cache
  const getFromCache = useCallback((key: string) => {
    if (!enableCache) return null;
    
    const cached = collectionCache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      collectionCache.delete(key);
    }
    
    return null;
  }, [enableCache, cacheDuration]);

  // Set cache
  const setCache = useCallback((key: string, data: any) => {
    if (!enableCache) return;
    collectionCache.set(key, { data, timestamp: Date.now() });
  }, [enableCache]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!collection.url) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Build full URL
    let fullUrl = collection.url;
    if (collection.queryString) {
      fullUrl = `${collection.url}?${collection.queryString}`;
    }

    // Check cache first
    const cacheKey = getCacheKey(fullUrl, collection.postData);
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData && isMountedRef.current) {
      setCollection(prev => ({
        ...prev,
        items: transformData ? transformData(cachedData.data) : cachedData.data,
        loaded: true,
        loading: false,
        error: null,
        pagination: cachedData.pagination || prev.pagination,
        summary: cachedData.summary || prev.summary,
      }));
      
      if (onDataLoaded) {
        onDataLoaded(cachedData.data);
      }
      return;
    }

    // Set loading state
    if (isMountedRef.current) {
      setCollection(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));
    }

    try {
      let response: any;
      
      if (collection.postData === null) {
        // GET request
        response = await apiService.get(fullUrl);
      } else {
        // POST request
        response = await apiService.post(fullUrl, collection.postData);
      }

      if (!isMountedRef.current) return;

      const responseData = response.data.data || response.data;
      const items = transformData ? transformData(responseData) : responseData;

      // Cache the response
      setCache(cacheKey, {
        data: responseData,
        pagination: response.data.pagination,
        summary: response.data.summary,
      });

      setCollection(prev => ({
        ...prev,
        items,
        loaded: true,
        loading: false,
        error: null,
        pagination: response.data.pagination || prev.pagination,
        summary: response.data.summary || prev.summary,
      }));

      if (onDataLoaded) {
        onDataLoaded(responseData);
      }

    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
      
      setCollection(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      if (onError) {
        onError(error);
      }

      console.error('useCollection fetch error:', error);
    }
  }, [
    collection.url,
    collection.queryString,
    collection.postData,
    transformData,
    onDataLoaded,
    onError,
    getCacheKey,
    getFromCache,
    setCache,
  ]);

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && collection.url) {
      fetchData();
    }
  }, [autoFetch, fetchData, collection.url]);

  // Update collection function
  const updateCollection = useCallback((
    actionOrFunction: CollectionUpdateAction<T> | ((current: CollectionState<T>) => CollectionUpdateAction<T>)
  ) => {
    setCollection(prev => {
      let action: CollectionUpdateAction<T>;
      
      if (typeof actionOrFunction === 'function') {
        action = actionOrFunction(prev);
      } else {
        action = actionOrFunction;
      }

      // Determine loading state
      let loading = prev.loading;
      if (typeof action.loading === 'boolean') {
        loading = action.loading;
      } else if (
        (action.url !== undefined && action.url !== prev.url) ||
        (action.queryString !== undefined && action.queryString !== prev.queryString) ||
        (action.postData !== undefined && !isEqual(action.postData, prev.postData)) ||
        action.reload
      ) {
        loading = false; // Will trigger a new fetch
      }

      return {
        url: action.url !== undefined ? action.url : prev.url,
        items: action.items !== undefined ? action.items : prev.items,
        loaded: action.loaded !== undefined ? action.loaded : (loading ? prev.loaded : false),
        loading,
        error: action.error !== undefined ? action.error : prev.error,
        pagination: action.pagination ? { ...prev.pagination, ...action.pagination } : prev.pagination,
        summary: action.summary ? { ...prev.summary, ...action.summary } : prev.summary,
        queryString: action.queryString !== undefined ? action.queryString : prev.queryString,
        postData: action.postData !== undefined ? action.postData : prev.postData,
        version: action.reload ? Math.random() : prev.version,
      };
    });
  }, []);

  // Convenience functions
  const refresh = useCallback(() => {
    updateCollection({ reload: true });
  }, [updateCollection]);

  const setUrl = useCallback((newUrl: string) => {
    updateCollection({ url: newUrl });
  }, [updateCollection]);

  const setQueryString = useCallback((queryString: string | null) => {
    updateCollection({ queryString });
  }, [updateCollection]);

  const setPostData = useCallback((newPostData: any | null) => {
    updateCollection({ postData: newPostData });
  }, [updateCollection]);

  const clearError = useCallback(() => {
    updateCollection({ error: null });
  }, [updateCollection]);

  const addItem = useCallback((item: T) => {
    setCollection(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));
  }, []);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setCollection(prev => ({
      ...prev,
      items: prev.items.filter(item => !predicate(item)),
    }));
  }, []);

  const updateItem = useCallback((predicate: (item: T) => boolean, updates: Partial<T>) => {
    setCollection(prev => ({
      ...prev,
      items: prev.items.map(item => 
        predicate(item) ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  return {
    collection,
    updateCollection,
    refresh,
    setUrl,
    setQueryString,
    setPostData,
    clearError,
    addItem,
    removeItem,
    updateItem,
  };
};

/**
 * Legacy-compatible version of useCollection
 * Maintains the same API as the legacy hook for easy migration
 */
export const useLegacyCollection = <T = any>(
  url: string,
  defaultQueryString: string | null = null,
  addFakeColumns?: (data: T[]) => T[],
  postData: any | null = null,
  callback?: (data: T[]) => void
): [CollectionState<T>, (action: any) => void] => {
  const { collection, updateCollection } = useCollection<T>(url, {
    defaultQueryString,
    transformData: addFakeColumns,
    postData,
    onDataLoaded: callback,
  });

  return [collection, updateCollection];
};

export default useCollection;