import { pdfService } from '../services/pdfService';
import { ApiResponse } from '../types';

export const pdfController = {
  async getPDFs(): ApiResponse<any> {
    try {
      const pdfs = await pdfService.getAllPDFs();
      return { success: true, data: pdfs };
    } catch (error) {
      return { success: false, error: 'Failed to fetch PDFs' };
    }
  },

  async createPDF(data: any): ApiResponse<any> {
    try {
      const pdf = await pdfService.createPDF(data);
      return { success: true, data: pdf };
    } catch (error) {
      return { success: false, error: 'Failed to create PDF' };
    }
  },

  async deletePDF(id: string): ApiResponse<any> {
    try {
      await pdfService.deletePDF(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete PDF' };
    }
  },
};