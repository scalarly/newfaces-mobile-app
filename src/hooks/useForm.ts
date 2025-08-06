import { useState, useCallback, useMemo } from 'react';

/**
 * Validation rule type
 */
export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
};

/**
 * Form field configuration
 */
export type FormField<T = any> = {
  value: T;
  error?: string;
  touched?: boolean;
  validation?: ValidationRule<T>;
};

/**
 * Form state type
 */
export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

/**
 * Form configuration
 */
export type FormConfig<T extends Record<string, any>> = {
  [K in keyof T]: {
    initialValue: T[K];
    validation?: ValidationRule<T[K]>;
  };
};

/**
 * Return type for useForm hook
 */
export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  setFieldState: <K extends keyof T>(field: K, state: Partial<FormField<T[K]>>) => void;
  validateField: <K extends keyof T>(field: K) => string | null;
  validateForm: () => boolean;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => () => Promise<void>;
  reset: () => void;
  resetField: <K extends keyof T>(field: K) => void;
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChangeText: (value: T[K]) => void;
    onBlur: () => void;
    error: string | undefined;
  };
}

/**
 * Validate a single field value
 */
const validateFieldValue = <T>(value: T, rule?: ValidationRule<T>): string | null => {
  if (!rule) return null;

  // Required validation
  if (rule.required) {
    if (value === null || value === undefined || value === '') {
      return rule.message || 'This field is required';
    }
  }

  // Skip other validations if value is empty and not required
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const stringValue = String(value);

  // Min length validation
  if (rule.minLength && stringValue.length < rule.minLength) {
    return rule.message || `Minimum length is ${rule.minLength} characters`;
  }

  // Max length validation
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return rule.message || `Maximum length is ${rule.maxLength} characters`;
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return rule.message || 'Invalid format';
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

/**
 * Modern form management hook with validation
 * 
 * @param config - Form configuration with initial values and validation rules
 * @returns Form state and management functions
 */
export const useForm = <T extends Record<string, any>>(
  config: FormConfig<T>
): UseFormReturn<T> => {
  const initialState = useMemo(() => {
    const state: Partial<FormState<T>> = {};
    Object.keys(config).forEach((key) => {
      const field = key as keyof T;
      state[field] = {
        value: config[field].initialValue,
        error: undefined,
        touched: false,
        validation: config[field].validation,
      };
    });
    return state as FormState<T>;
  }, [config]);

  const [formState, setFormState] = useState<FormState<T>>(initialState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Extract current values
  const values = useMemo(() => {
    const vals: Partial<T> = {};
    Object.keys(formState).forEach((key) => {
      const field = key as keyof T;
      vals[field] = formState[field].value;
    });
    return vals as T;
  }, [formState]);

  // Extract current errors
  const errors = useMemo(() => {
    const errs: Partial<Record<keyof T, string>> = {};
    Object.keys(formState).forEach((key) => {
      const field = key as keyof T;
      if (formState[field].error) {
        errs[field] = formState[field].error;
      }
    });
    return errs;
  }, [formState]);

  // Extract touched fields
  const touched = useMemo(() => {
    const touchedFields: Partial<Record<keyof T, boolean>> = {};
    Object.keys(formState).forEach((key) => {
      const field = key as keyof T;
      if (formState[field].touched) {
        touchedFields[field] = formState[field].touched;
      }
    });
    return touchedFields;
  }, [formState]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(formState).every((key) => {
      const field = key as keyof T;
      return !formState[field].error;
    });
  }, [formState]);

  // Check if form is dirty (has changes)
  const isDirty = useMemo(() => {
    return Object.keys(formState).some((key) => {
      const field = key as keyof T;
      return formState[field].value !== initialState[field].value;
    });
  }, [formState, initialState]);

  // Set field value
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: validateFieldValue(value, prev[field].validation),
      },
    }));
  }, []);

  // Set field error
  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  }, []);

  // Set field touched state
  const setTouched = useCallback(<K extends keyof T>(field: K, touchedValue: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: touchedValue,
      },
    }));
  }, []);

  // Set entire field state
  const setFieldState = useCallback(<K extends keyof T>(field: K, state: Partial<FormField<T[K]>>) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...state,
      },
    }));
  }, []);

  // Validate a single field
  const validateField = useCallback(<K extends keyof T>(field: K): string | null => {
    const fieldState = formState[field];
    const error = validateFieldValue(fieldState.value, fieldState.validation);
    
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: error || undefined,
      },
    }));

    return error;
  }, [formState]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let hasErrors = false;

    const newFormState = { ...formState };

    Object.keys(formState).forEach((key) => {
      const field = key as keyof T;
      const fieldState = formState[field];
      const error = validateFieldValue(fieldState.value, fieldState.validation);
      
      newFormState[field] = {
        ...fieldState,
        error: error || undefined,
        touched: true,
      };

      if (error) {
        hasErrors = true;
      }
    });

    setFormState(newFormState);
    return !hasErrors;
  }, [formState]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async () => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        const isFormValid = validateForm();
        
        if (isFormValid) {
          await onSubmit(values);
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [isSubmitting, validateForm, values]);

  // Reset form to initial state
  const reset = useCallback(() => {
    setFormState(initialState);
    setIsSubmitting(false);
  }, [initialState]);

  // Reset a single field
  const resetField = useCallback(<K extends keyof T>(field: K) => {
    setFormState(prev => ({
      ...prev,
      [field]: initialState[field],
    }));
  }, [initialState]);

  // Get field props for easy integration with form components
  const getFieldProps = useCallback(<K extends keyof T>(field: K) => {
    return {
      value: formState[field].value,
      onChangeText: (value: T[K]) => setValue(field, value),
      onBlur: () => {
        setTouched(field, true);
        validateField(field);
      },
      error: formState[field].touched ? formState[field].error : undefined,
    };
  }, [formState, setValue, setTouched, validateField]);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setError,
    setTouched,
    setFieldState,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    resetField,
    getFieldProps,
  };
};

export default useForm;