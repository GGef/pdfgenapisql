import { apiClient } from '../api/client';
import type { SavedTemplate } from '../types';
import type { ApiResponse } from '../api/types';

export const templateService = {
  async getTemplates(): Promise<ApiResponse<SavedTemplate[]>> {
    try {
      console.log('Fetching templates via API');
      
      const response = await apiClient.get<{ data: SavedTemplate[] }>('/api/templates');
      console.log('Raw template fetch response:', response);

      if (response && response.success) {
        const templateData = response.data?.data || [];
        
        const parsedData = Array.isArray(templateData) 
          ? templateData.map(template => ({
              ...template,
              lastUsed: template.lastUsed ? new Date(template.lastUsed) : new Date(),
              createdAt: template.createdAt ? new Date(template.createdAt) : new Date()
            }))
          : [];
        
        console.log('Parsed template data:', parsedData);
        
        return {
          success: true,
          data: parsedData
        };
      } else {
        console.error('Failed to fetch templates:', response);
        return {
          success: false,
          error: (response as any)?.error || 'Failed to fetch templates'
        };
      }
    } catch (error) {
      console.error('Error in templateService.getTemplates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching templates'
      };
    }
  },

  async createTemplate(data: Omit<SavedTemplate, 'id' | 'createdAt' | 'lastUsed'>): Promise<ApiResponse<SavedTemplate>> {
    try {
      console.log('Creating template via API', data);
      const response = await apiClient.post<SavedTemplate>('/api/templates', data);
      console.log('Template creation response:', response);

      if (response && response.success && response.data) {
        return {
          success: true,
          data: {
            ...response.data,
            lastUsed: response.data.lastUsed ? new Date(response.data.lastUsed) : new Date(),
            createdAt: response.data.createdAt ? new Date(response.data.createdAt) : new Date()
          }
        };
      } else {
        console.error('Failed to create template:', response);
        return {
          success: false,
          error: (response as any)?.error || 'Failed to create template'
        };
      }
    } catch (error) {
      console.error('Error in templateService.createTemplate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template'
      };
    }
  },

  async updateTemplate(id: string, data: { content: string }): Promise<ApiResponse<SavedTemplate>> {
    try {
      console.log('Updating template via API', { id, data });
      const response = await apiClient.put<SavedTemplate>(`/api/templates/${id}`, data);
      console.log('Template update response:', response);

      if (response && response.success && response.data) {
        return {
          success: true,
          data: {
            ...response.data,
            lastUsed: new Date(),
            content: data.content
          }
        };
      } else {
        console.error('Failed to update template:', response);
        return {
          success: false,
          error: (response as any)?.error || 'Failed to update template'
        };
      }
    } catch (error) {
      console.error('Error updating template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template'
      };
    }
  },

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    try {
      console.log('Deleting template via API', id);
      const response = await apiClient.delete<void>(`/api/templates/${id}`);
      console.log('Template deletion response:', response);

      if (response && response.success) {
        return { success: true };
      } else {
        console.error('Failed to delete template:', response);
        return {
          success: false,
          error: (response as any)?.error || 'Failed to delete template'
        };
      }
    } catch (error) {
      console.error('Error in templateService.deleteTemplate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      };
    }
  }
};