import { SavedTemplate } from '../types';
import { apiClient } from '../api/client';
import type { ApiResponse } from '../api/types';

export const templateService = {
  async createTemplate(data: Omit<SavedTemplate, 'id' | 'createdAt' | 'lastUsed'>): Promise<ApiResponse<SavedTemplate>> {
    try {
      const response = await apiClient.post<SavedTemplate>('/api/templates', data);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template'
      };
    }
  },

  async getTemplates(): Promise<ApiResponse<SavedTemplate[]>> {
    try {
      const response = await apiClient.get<SavedTemplate[]>('/api/templates');
      if (response.success && response.data) {
        // Ensure dates are properly parsed
        response.data = response.data.map(template => ({
          ...template,
          lastUsed: new Date(template.lastUsed),
          createdAt: new Date(template.createdAt)
        }));
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates'
      };
    }
  },

  async updateTemplate(id: string, data: Partial<SavedTemplate>): Promise<ApiResponse<SavedTemplate>> {
    try {
      const response = await apiClient.put<SavedTemplate>(`/api/templates/${id}`, data);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template'
      };
    }
  },

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<void>(`/api/templates/${id}`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      };
    }
  }
};