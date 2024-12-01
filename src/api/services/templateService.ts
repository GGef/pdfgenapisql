import { prisma } from '../../lib/prisma';
import type { Template } from '@prisma/client';

export const templateService = {
  async getAllTemplates() {
    return prisma.template.findMany({
      orderBy: { lastUsed: 'desc' },
    });
  },

  async createTemplate(data: Pick<Template, 'name' | 'content'>) {
    return prisma.template.create({
      data: {
        ...data,
        lastUsed: new Date(),
      },
    });
  },

  async updateTemplate(id: string, data: Partial<Pick<Template, 'name' | 'content'>>) {
    return prisma.template.update({
      where: { id },
      data: {
        ...data,
        lastUsed: new Date(),
      },
    });
  },

  async deleteTemplate(id: string) {
    return prisma.template.delete({
      where: { id },
    });
  },

  async getTemplateById(id: string) {
    return prisma.template.findUnique({
      where: { id },
    });
  },
};