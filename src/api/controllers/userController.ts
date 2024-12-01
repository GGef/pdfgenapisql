import { userService } from '../services/userService';
import { ApiResponse } from '../types';

export const userController = {
  async getUsers(): ApiResponse<any> {
    try {
      const users = await userService.getAllUsers();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: 'Failed to fetch users' };
    }
  },

  async createUser(data: any): ApiResponse<any> {
    try {
      const user = await userService.createUser(data);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Failed to create user' };
    }
  },

  async updateUser(id: string, data: any): ApiResponse<any> {
    try {
      const user = await userService.updateUser(id, data);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Failed to update user' };
    }
  },

  async deleteUser(id: string): ApiResponse<any> {
    try {
      await userService.deleteUser(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  },
};