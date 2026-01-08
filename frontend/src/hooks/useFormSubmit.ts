import { useState, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import { formatError } from "../utils/errorHandler";

interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  successMessage?: string;
}

/**
 * Custom hook for handling form submissions with loading states and error handling
 * @param submitFn The async function to call when submitting the form
 * @param options Configuration options
 * @returns Object with submit handler, loading state, and error state
 */
export function useFormSubmit<T = any, P = any>(
  submitFn: (data: P) => Promise<T>,
  options: UseFormSubmitOptions<T> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { showSuccess, showError } = useToast();

  const handleSubmit = useCallback(
    async (data: P) => {
      try {
        setLoading(true);
        setError(null);

        const result = await submitFn(data);

        if (options.successMessage) {
          showSuccess(options.successMessage);
        }

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);

        showError(formattedError);

        if (options.onError) {
          options.onError(formattedError);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [submitFn, options, showSuccess, showError]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleSubmit,
    loading,
    error,
    resetError,
  };
}

export default useFormSubmit;
