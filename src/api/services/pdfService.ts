import { prisma } from '../../lib/prisma';
import type { PDF } from '@prisma/client';
import { generatePDF } from '../../utils/pdfGenerator';

export const pdfService = {
  async getAllPDFs() {
    return prisma.pDF.findMany({
      include: {
        template: true,
        import: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createPDF(data: {
    name: string;
    templateId: string;
    importId: string;
    mappings: Record<string, string>;
    rowData: Record<string, any>;
  }) {
    const { name, templateId, importId, mappings, rowData } = data;

    // Get template content
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Generate PDF
    const pdfBlob = await generatePDF(template.content, rowData, mappings);

    // Save PDF file and create database record
    const filePath = `/pdfs/${name}`; // In a real app, save the file to storage

    return prisma.pDF.create({
      data: {
        name,
        templateId,
        importId,
        filePath,
      },
      include: {
        template: true,
        import: true,
      },
    });
  },

  async deletePDF(id: string) {
    // In a real app, also delete the file from storage
    return prisma.pDF.delete({
      where: { id },
    });
  },

  async getPDFById(id: string) {
    return prisma.pDF.findUnique({
      where: { id },
      include: {
        template: true,
        import: true,
      },
    });
  },
};