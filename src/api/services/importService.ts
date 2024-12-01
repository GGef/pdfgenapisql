import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const importService = {
  /**
   * Fetch all imports
   */
  async getAllImports() {
    return prisma.import.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Fetch an import by ID
   */
  async getImportById(id: string) {
    return prisma.import.findUnique({
      where: { id },
    });
  },

  /**
   * Create a new import
   */
  async createImport(data: any) {
    return prisma.import.create({
      data,
    });
  },

  /**
   * Delete an import by ID
   */
  async deleteImport(id: string) {
    return prisma.import.delete({
      where: { id },
    });
  },
};
