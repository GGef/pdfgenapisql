import { prisma } from '../../lib/prisma';
import type { User } from '@prisma/client';

export const userService = {
  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async createUser(data: Pick<User, 'email' | 'name' | 'role'>) {
    return prisma.user.create({
      data,
    });
  },

  async updateUser(id: string, data: Partial<Pick<User, 'email' | 'name' | 'role'>>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },
};