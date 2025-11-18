import { create } from "zustand";
import axios from "axios";
export const useActivitiesStore = create((set, get) => ({
  activities: [],
  loading: false,
  error: null,
  filters: {
    difficulty: null,
    region: null,
    activityType: null,
  },
  fetchActivities: async (token) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.region) params.append("region", filters.region);
      if (filters.activityType)
        params.append("activity_type", filters.activityType);

      const config = token
        ? {
            headers: { Authorization: `Bearer ${token}` },
          }
        : {};

      const response = await axios.get(
        `/api/activities?${params.toString()}`,
        config
      );

      set({ activities: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Błąd pobierania aktywności",
        loading: false,
      });
    }
  },
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  clearFilters: () => {
    set({
      filters: {
        difficulty: null,
        region: null,
        activityType: null,
      },
    });
  },
}));
