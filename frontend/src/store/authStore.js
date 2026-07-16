import { create } from 'zustand';
import api from '../services/api';

const AUTH_STORAGE_KEY = 'onlinegarage.auth';

const getStoredAuthSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.user || !parsed?.accessToken) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const saveAuthSession = (user, accessToken) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, accessToken }));
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
};

const clearAuthSession = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  delete api.defaults.headers.common.Authorization;
};

const storedSession = getStoredAuthSession();

if (storedSession?.accessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${storedSession.accessToken}`;
}

const useAuthStore = create((set, get) => ({
  user: storedSession?.user ?? null,
  accessToken: storedSession?.accessToken ?? null,
  isAuthenticated: !!storedSession?.user,
  isLoading: false,
  isCheckingAuth: false,
  error: null,

  setUser: (user) => set((state) => {
    if (!user) {
      clearAuthSession();
      // Also clear the in-memory Authorization header (used during registration steps)
      delete api.defaults.headers.common.Authorization;
      return { user: null, accessToken: null, isAuthenticated: false, error: null };
    }

    const accessToken = state.accessToken;
    if (accessToken) {
      saveAuthSession(user, accessToken);
    }

    return { user, isAuthenticated: true, error: null };
  }),
  setAccessToken: (accessToken) => {
    if (!accessToken) {
      clearAuthSession();
      set({ accessToken: null });
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const user = get().user;
    if (user) {
      saveAuthSession(user, accessToken);
    }
    set({ accessToken });
  },
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, tokens } = response.data.data;
      saveAuthSession(user, tokens.accessToken);
      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to login';
      clearAuthSession();
      set({ error: message, isLoading: false, isAuthenticated: false, user: null, accessToken: null });
      throw new Error(message);
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    clearAuthSession(); // Always clear localStorage before registering
    try {
      const response = await api.post('/auth/register', userData);
      const { user, tokens } = response.data.data;
      // Set the Authorization header for Steps 2 & 3 API calls
      // but do NOT save to localStorage so checkAuth won't restore this session
      api.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;
      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: false, // keep false so ProtectedRoute doesn't redirect /register away
        isLoading: false,
      });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // Called by Register.jsx directly — only updates the loading flag, not isAuthenticated
  setRegistrationLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server', err);
    } finally {
      clearAuthSession();
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    const session = getStoredAuthSession();

    if (session?.user && session?.accessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${session.accessToken}`;
      set({
        user: session.user,
        accessToken: session.accessToken,
        isAuthenticated: true,
        isCheckingAuth: false,
        error: null,
      });
      return session.user;
    }

    set({ isCheckingAuth: true, error: null });
    try {
      const refreshResponse = await api.post('/auth/refresh-token');
      const { tokens } = refreshResponse.data.data;
      
      const profileResponse = await api.get('/user/profile');
      const user = profileResponse.data.data.user;

      saveAuthSession(user, tokens.accessToken);

      set({ 
        user, 
        accessToken: tokens.accessToken, 
        isAuthenticated: true, 
        isCheckingAuth: false
      });
      return user;
    } catch (err) {
      clearAuthSession();
      set({ user: null, accessToken: null, isAuthenticated: false, isCheckingAuth: false });
      return null;
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/user/profile');
      const user = response.data.data.user;
      const accessToken = get().accessToken;
      if (accessToken) {
        saveAuthSession(user, accessToken);
      }
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      clearAuthSession();
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch('/user/profile', profileData);
      const user = response.data.data.user;
      const accessToken = get().accessToken;
      if (accessToken) {
        saveAuthSession(user, accessToken);
      }
      set({ user, isLoading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  uploadAvatar: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/user/profile/avatar', formData);
      const user = response.data.data.user;
      set({ user, isLoading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload avatar';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  uploadIdentityDoc: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/user/identity/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const user = response.data.data?.user;
      set({ user: user || get().user, isLoading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload document';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));

window.authStoreLogout = () => {
  useAuthStore.getState().logout();
};

export default useAuthStore;
