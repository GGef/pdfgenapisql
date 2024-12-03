import { ImportedData } from '../types';
import { apiClient } from '../api/client';
import type { ApiResponse } from '../api/types';

export const importService = {
  async createImport(data: ImportedData): Promise<ApiResponse<ImportedData>> {
    try {
      const response = await apiClient.post<ApiResponse<ImportedData>>('/api/imports', data);

      if (response.success && response.data) {
        // Parse `dateImported` as Date
        const parsedData = {
          ...response.data,
          dateImported: new Date(response.data.dateImported),
        };

        return {
          success: true,
          data: parsedData,
        };
      }

      return {
        success: false,
        error: 'Unexpected response from server',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save import data',
      };
    }
  },

  async getImports(): Promise<ApiResponse<ImportedData[]>> {
    try {
      const response = await apiClient.get<ApiResponse<ImportedData[]>>('/api/imports');
      console.log('Raw response:', response);
  
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
  
      const responseData = response.data;
  
      // Ensure `data` is an array
      if (responseData.success && Array.isArray(responseData.data)) {
        const parsedData = responseData.data.map((imp) => ({
          ...imp,
          dateImported: typeof imp.dateImported === 'string'
            ? new Date(imp.dateImported)
            : imp.dateImported,
        }));
  
        return {
          success: true,
          data: parsedData,
        };
      }
  
      console.error('Unexpected data structure:', responseData);
      return {
        success: false,
        error: 'Unexpected response structure: `data` is not an array',
      };
    } catch (error) {
      console.error('Error in getImports:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch imports',
      };
    }
  },  
  

  async deleteImport(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/imports/${id}`);
      return response.success
        ? { success: true }
        : { success: false, error: 'Unexpected response from server' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete import',
      };
    }
  },

  async getImportById(id: string): Promise<ApiResponse<ImportedData>> {
    try {
      const response = await apiClient.get<ApiResponse<ImportedData>>(`/api/imports/${id}`);

      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch import data',
      };
    }
  },

  
};

