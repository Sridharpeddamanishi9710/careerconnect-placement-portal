import { create } from 'zustand';
import { authApi } from '../api/client';

const initialToken = localStorage.getItem('placement_token');
const initialUser = localStorage.getItem('placement_user') 
  ? JSON.parse(localStorage.getItem('placement_user')) 
  : null;

export const useAuthStore = create((set, get) => ({
  token: initialToken,
  user: initialUser,
  studentProfile: null,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('placement_token', access_token);
      localStorage.setItem('placement_user', JSON.stringify(user));

      set({
        token: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Fetch full details including studentProfile
      await get().fetchCurrentUser();
      return { success: true, role: user.role };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(userData);
      const { access_token, user } = response.data;

      localStorage.setItem('placement_token', access_token);
      localStorage.setItem('placement_user', JSON.stringify(user));

      set({
        token: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      await get().fetchCurrentUser();
      return { success: true, role: user.role };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  fetchCurrentUser: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const response = await authApi.getMe();
      const { user, student_profile } = response.data;

      localStorage.setItem('placement_user', JSON.stringify(user));
      set({
        user,
        studentProfile: student_profile || null,
      });
    } catch (err) {
      console.error('Failed to fetch current user profile:', err);
    }
  },

  setStudentProfile: (profile) => set({ studentProfile: profile }),

  logout: () => {
    localStorage.removeItem('placement_token');
    localStorage.removeItem('placement_user');
    set({
      token: null,
      user: null,
      studentProfile: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
