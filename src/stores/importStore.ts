import { create } from 'zustand';
import type { ImportedData } from '../types';
import { importService } from '../services/importService';

interface ImportState {
  imports: ImportedData[];
  loading: boolean;
  error: string | null;
  addImport: (data: ImportedData) => void;
  removeImport: (id: string) => void;
  setImports: (imports: ImportedData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchImports: () => Promise<void>;
}

export const useImportStore = create<ImportState>((set, get) => ({
  imports: [],
  loading: false,
  error: null,

  // Add an import while ensuring no duplicates
  addImport: (data) =>
    set((state) => {
      const exists = state.imports.some((imp) => imp.id === data.id);
      if (exists) {
        console.warn(`Duplicate import detected: ${data.id}`);
        return state; // Skip updating if duplicate
      }
      return {
        imports: [data, ...state.imports],
      };
    }),

  // Remove an import by ID
  removeImport: (id) =>
    set((state) => ({
      imports: state.imports.filter((imp) => imp.id !== id),
    })),

  // Replace the entire imports state
  setImports: (imports) => {
    // Deduplicate the imports array
    const uniqueImports = Array.from(new Map(imports.map((imp) => [imp.id, imp])).values());
    set({ imports: uniqueImports });
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // Fetch imports from the API
  fetchImports: async () => {
    set({ loading: true, error: null });
    try {
      const response = await importService.getImports();
      if (response.success && response.data) {
        // Replace imports with deduplicated data
        const uniqueImports = Array.from(
          new Map(response.data.map((imp) => [imp.id, imp])).values()
        );
        set({ imports: uniqueImports });
      } else {
        throw new Error(response.error || 'Failed to fetch imports');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ loading: false });
    }
  },
}));
