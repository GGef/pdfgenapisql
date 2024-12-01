import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { ApiResponse } from '../api/types';
import { toast } from 'react-hot-toast';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();

        if (response.success && response.data) {
          setData(response.data);
          options.onSuccess?.(response.data);
          if (options.showToast) {
            toast.success('Operation completed successfully');
          }
          return response.data;
        } else {
          throw new Error(response.error || 'Operation failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
        if (options.showToast) {
          toast.error(errorMessage);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    loading,
    error,
    data,
    execute,
  };
}