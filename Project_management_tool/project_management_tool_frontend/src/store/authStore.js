import { create } from 'zustand';
import { api } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      const decoded = jwtDecode(access);
      
      set({ 
        token: access,
        isAuthenticated: true,
        user: { id: decoded.user_id },
        loading: false 
      });
      
      // Optionally fetch full user profile here
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Login failed',
        loading: false 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/register/', userData);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data || 'Registration failed',
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me/');
      set({ user: res.data });
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  }
}));
