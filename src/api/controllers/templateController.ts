import { templateService } from '../services/templateService';
import { ApiResponse } from '../types';

export const templateController = {
  async getTemplates(): Promise<ApiResponse<any>> {
    try {
      const templates = await templateService.getAllTemplates();
      return { success: true, data: templates };
    } catch (error) {
      return { success: false, error: 'Failed to fetch templates' };
    }
  },

  async createTemplate(data: any): Promise<ApiResponse<any>> {
    try {
      const template = await templateService.createTemplate(data);
      return { success: true, data: template };
    } catch (error) {
      return { success: false, error: 'Failed to create template' };
    }
  },

  async updateTemplate(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const template = await templateService.updateTemplate(id, data);
      return { success: true, data: template };
    } catch (error) {
      return { success: false, error: 'Failed to update template' };
    }
  },

  async deleteTemplate(id: string): Promise<ApiResponse<any>> {
    try {
      await templateService.deleteTemplate(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete template' };
    }
  },
};