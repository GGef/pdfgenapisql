import { importService } from '../services/importService';
import { ApiResponse } from '../types';

export const importController = {
  /**
   * Fetch all imports
   */
  async getImports(): Promise<ApiResponse<any>> {
    try {
      const imports = await importService.getAllImports();
      return { success: true, data: imports };
    } catch (error: any) {
      console.error('Error fetching imports:', error.message);
      return { success: false, error: 'Failed to fetch imports' };
    }
  },

  /**
   * Fetch an import by ID
   */
  async getImportById(id: string): Promise<ApiResponse<any>> {
    try {
      const importData = await importService.getImportById(id);
      if (!importData) {
        return { success: false, error: 'Import not found' };
      }
      return { success: true, data: importData };
    } catch (error: any) {
      console.error('Error fetching import by ID:', error.message);
      return { success: false, error: 'Failed to fetch import' };
    }
  },

  /**
   * Create a new import
   */
  async createImport(data: any): Promise<ApiResponse<any>> {
    try {
      const newImport = await importService.createImport(data);
      return { success: true, data: newImport };
    } catch (error: any) {
      console.error('Error creating import:', error.message);
      return { success: false, error: 'Failed to create import' };
    }
  },

  /**
   * Delete an import by ID
   */
  async deleteImport(id: string): Promise<ApiResponse<any>> {
    try {
      await importService.deleteImport(id);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting import:', error.message);
      return { success: false, error: 'Failed to delete import' };
    }
  },
};
