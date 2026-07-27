import { useCallback, useState } from 'react';

import { FieldSchema, runValidation, Validator } from '@/src/utils/form-validation';

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((schema: Record<string, FieldSchema>) => {
    const nextErrors = runValidation(schema);
    setErrors((prev) => {
      const merged = { ...prev };
      for (const field of Object.keys(schema)) {
        if (nextErrors[field]) merged[field] = nextErrors[field];
        else delete merged[field];
      }
      return merged;
    });
    return Object.keys(nextErrors).length === 0;
  }, []);

  const validateField = useCallback((field: string, value: string, rules: Validator[]) => {
    for (const rule of rules) {
      const error = rule(value);
      setErrors((prev) => {
        if (error) return { ...prev, [field]: error };
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return !error;
    }
    return true;
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  return { errors, validate, validateField, clearError, clearAll };
}
