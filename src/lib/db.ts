import { prisma } from './prisma';
import type { Template, Import, PDF, User } from '@prisma/client';

// Template operations
export const templateOperations = {
  create: async (data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'lastUsed'>) => {
    return prisma.template.create({ data });
  },

  update: async (id: string, data: Partial<Template>) => {
    return prisma.template.update({
      where: { id },
      data: { ...data, lastUsed: new Date() },
    });
  },

  delete: async (id: string) => {
    return prisma.template.delete({ where: { id } });
  },

  getAll: async () => {
    return prisma.template.findMany({
      orderBy: { lastUsed: 'desc' },
    });
  },
};

// Import operations
export const importOperations = {
  create: async (data: Omit<Import, 'id' | 'createdAt'>) => {
    return prisma.import.create({ data });
  },

  getAll: async () => {
    return prisma.import.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  delete: async (id: string) => {
    return prisma.import.delete({ where: { id } });
  },
};

// PDF operations
export const pdfOperations = {
  create: async (data: Omit<PDF, 'id' | 'createdAt'>) => {
    return prisma.pdf.create({ data });
  },

  getAll: async () => {
    return prisma.pdf.findMany({
      include: {
        template: true,
        import: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  delete: async (id: string) => {
    return prisma.pdf.delete({ where: { id } });
  },
};

// User operations
export const userOperations = {
  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.user.create({ data });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  update: async (id: string, data: Partial<User>) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};