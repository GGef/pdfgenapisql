import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  language: string;
  theme: 'light' | 'dark';
  dateFormat: string;
  notifications: {
    email: boolean;
    browser: boolean;
  };
}

interface SettingsState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        language: 'en',
        theme: 'light',
        dateFormat: 'MM/dd/yyyy',
        notifications: {
          email: true,
          browser: true,
        },
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);