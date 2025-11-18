import { create } from 'zustand';
import axios from 'axios';

export const useProgressStore = create((set, get) => ({
  progress: [],
  stats: { total: 0, completed: 0 },
  loading: false,
  error: null,

  fetchProgress: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ 
        progress: response.data.progress,
        stats: response.data.stats,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Błąd pobierania postępu',
        loading: false 
      });
    }
  },

  updateProgress: async (activityId, data, token) => {
    try {
      await axios.post(
        '/api/progress',
        { activityId, ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Odśwież dane
      await get().fetchProgress(token);
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Błąd aktualizacji postępu'
      });
      return false;
    }
  },

  getActivityProgress: (activityId) => {
    const { progress } = get();
    return progress.find(p => p.activity_id === activityId);
  },
}));
