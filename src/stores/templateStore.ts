import { create } from 'zustand';
import type { SavedTemplate } from '../types';
import { templateService } from '../services/templateService';

interface TemplateState {
  templates: SavedTemplate[];
  loading: boolean;
  error: string | null;
  addTemplate: (template: Omit<SavedTemplate, 'id' | 'createdAt' | 'lastUsed'>) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  updateTemplate: (id: string, content: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  loading: false,
  error: null,

  addTemplate: async (templateData) => {
    set({ loading: true, error: null });
    try {
      const response = await templateService.createTemplate(templateData);
      if (response.success && response.data) {
        set((state) => ({
          templates: [response.data, ...state.templates],
        }));
      } else {
        throw new Error(response.error || 'Failed to create template');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await templateService.deleteTemplate(id);
      if (response.success) {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      } else {
        throw new Error(response.error || 'Failed to delete template');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTemplate: async (id, content) => {
    set({ loading: true, error: null });
    try {
      const response = await templateService.updateTemplate(id, { content });
      if (response.success && response.data) {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, content, lastUsed: new Date() } : t
          ),
        }));
      } else {
        throw new Error(response.error || 'Failed to update template');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const response = await templateService.getTemplates();
      if (response.success && response.data) {
        set({ templates: response.data });
      } else {
        throw new Error(response.error || 'Failed to fetch templates');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ loading: false });
    }
  },
}));