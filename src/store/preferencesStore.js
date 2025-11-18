import { create } from "zustand";
import { persist } from "zustand/middleware";
export const usePreferencesStore = create(
  persist(
    (set) => ({
      preferences: {
        difficultyLevels: [],
        regions: [],
        activityTypes: [],
      },
      setPreferences: (prefs) => set({ preferences: prefs }),

      updatePreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),

      clearPreferences: () =>
        set({
          preferences: {
            difficultyLevels: [],
            regions: [],
            activityTypes: [],
          },
        }),
    }),
    {
      name: "preferences-storage",
    }
  )
);
