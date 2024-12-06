import { create } from 'zustand';
import { templateService } from '../services/templateService';
import type { SavedTemplate } from '../types';

interface TemplateStore {
  templates: SavedTemplate[];
  loading: boolean;
  error: string | null;
  createTemplate: (templateData: Omit<SavedTemplate, 'id' | 'createdAt' | 'lastUsed'>) => Promise<void>;
  updateTemplate: (id: string, content: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  loading: false,
  error: null,

  createTemplate: async (templateData) => {
    try {
      const response = await templateService.createTemplate(templateData);
      if (response.success && response.data) {
        set((state) => ({
          templates: [response.data as SavedTemplate, ...state.templates],
          error: null
        }));
      } else {
        throw new Error(response.error || 'Failed to create template');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateTemplate: async (id, content) => {
    try {
      const response = await templateService.updateTemplate(id, { content });
      if (response.success && response.data) {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...response.data } : template
          ),
          error: null
        }));
      } else {
        throw new Error(response.error || 'Failed to update template');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  deleteTemplate: async (id) => {
    try {
      const response = await templateService.deleteTemplate(id);
      if (response.success) {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
          error: null
        }));
      } else {
        throw new Error(response.error || 'Failed to delete template');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const response = await templateService.getTemplates();
      if (response.success && response.data) {
        set({ 
          templates: response.data as SavedTemplate[],
          error: null
        });
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