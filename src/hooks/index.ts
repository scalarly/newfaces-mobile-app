// Modern React hooks - TypeScript implementations
// Replacing legacy hooks with modern patterns and better error handling

// Core migrated hooks
export { useToggle, useToggleObject } from './useToggle';
export { useRefresh, useRefreshObject, useSimpleRefresh } from './useRefresh';
export { useCollection, useLegacyCollection } from './useCollection';

// Modern utility hooks
export { useApi, useApiGet, useApiPost, useApiPut, useApiDelete } from './useApi';
export { useSecureStorage, useUserToken, useUserId, useMultipleSecureStorage } from './useAsyncStorage';
export { useDebounce, useDebouncedCallback, useDebouncedSearch } from './useDebounce';
export { useForm } from './useForm';

// Re-export types for convenience
export type {
  PaginationInfo,
  SummaryInfo,
  CollectionState,
  UseCollectionOptions,
  CollectionUpdateAction,
  UseCollectionReturn,
} from './useCollection';

export type { 
  ApiState,
  UseApiOptions,
  UseApiReturn 
} from './useApi';

export type { 
  ValidationRule,
  FormField,
  FormState,
  FormConfig,
  UseFormReturn 
} from './useForm';

// Legacy-compatible exports (for easier migration)
export { useLegacyCollection as originalUseCollection } from './useCollection';
export { useSimpleRefresh as originalUseRefresh } from './useRefresh';
export { useToggle as originalUseToggle } from './useToggle';

// Default exports for individual imports
export { default as useToggleDefault } from './useToggle';
export { default as useRefreshDefault } from './useRefresh';
export { default as useCollectionDefault } from './useCollection';
export { default as useApiDefault } from './useApi';
export { default as useSecureStorageDefault } from './useAsyncStorage';
export { default as useDebounceDefault } from './useDebounce';
export { default as useFormDefault } from './useForm';