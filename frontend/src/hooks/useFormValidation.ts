import { useState, useCallback, useEffect } from 'react';
import { ValidationResult, FormValidationResult } from '../utils/validators';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

interface FormConfig<T> {
  initialValues: T;
  validators?: Partial<Record<keyof T, (value: any) => ValidationResult>>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validators = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: FormConfig<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
  });

  // Validate single field
  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const validator = validators[name];
      if (!validator) return undefined;

      const result = validator(value);
      return result.isValid ? undefined : result.error;
    },
    [validators]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [field, validator] of Object.entries(validators) as [keyof T, (value: any) => ValidationResult][]) {
      const result = validator(formState.values[field]);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    }

    setFormState((prev) => ({ ...prev, errors, isValid }));
    return isValid;
  }, [validators, formState.values]);

  // Handle field change
  const handleChange = useCallback(
    (name: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value;

      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const newErrors = { ...prev.errors };

        if (validateOnChange && prev.touched[name]) {
          const error = validateField(name, value);
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
        }

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateField, validateOnChange]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setFormState((prev) => {
        const newTouched = { ...prev.touched, [name]: true };
        const newErrors = { ...prev.errors };

        if (validateOnBlur) {
          const error = validateField(name, prev.values[name]);
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
        }

        return {
          ...prev,
          touched: newTouched,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateField, validateOnBlur]
  );

  // Set field value programmatically
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const newErrors = { ...prev.errors };

        if (validateOnChange && prev.touched[name]) {
          const error = validateField(name, value);
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
        }

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateField, validateOnChange]
  );

  // Set multiple values
  const setValues = useCallback((values: Partial<T>) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, ...values },
    }));
  }, []);

  // Set field error
  const setError = useCallback((name: keyof T, error: string) => {
    setFormState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false,
    }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: Object.keys({ ...prev.errors, ...errors }).length === 0,
    }));
  }, []);

  // Clear field error
  const clearError = useCallback((name: keyof T) => {
    setFormState((prev) => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  // Reset form
  const reset = useCallback(
    (values?: T) => {
      setFormState({
        values: values || initialValues,
        errors: {},
        touched: {},
        isValid: true,
        isSubmitting: false,
      });
    },
    [initialValues]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(formState.values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setFormState((prev) => ({ ...prev, touched: allTouched }));

      // Validate form
      const isValid = validateForm();
      if (!isValid) {
        return;
      }

      // Submit form
      setFormState((prev) => ({ ...prev, isSubmitting: true }));
      try {
        await onSubmit(formState.values);
        reset();
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setFormState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [formState.values, validateForm, onSubmit, reset]
  );

  // Get field props
  const getFieldProps = (name: keyof T) => ({
    name: name as string,
    value: formState.values[name],
    onChange: handleChange(name),
    onBlur: handleBlur(name),
    error: formState.touched[name] ? formState.errors[name] : undefined,
  });

  // Check if field has error
  const hasError = (name: keyof T): boolean => {
    return Boolean(formState.touched[name] && formState.errors[name]);
  };

  // Get field error
  const getError = (name: keyof T): string | undefined => {
    return formState.touched[name] ? formState.errors[name] : undefined;
  };

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    reset,
    validateField,
    validateForm,
    getFieldProps,
    hasError,
    getError,
  };
}