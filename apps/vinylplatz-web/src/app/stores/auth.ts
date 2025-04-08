import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { userService, ProfileUpdateData } from '../services/user.service';

// Define types locally since import from library is causing issues
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  address?: string;
  registrationDate: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  address?: string;
  profileImage?: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

// Create a local auth service
const API_URL = '/api/auth';

// Set up axios instance
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/login', credentials);
    return response.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/register', userData);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await authApi.get<User>('/profile');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
  }
};

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const updateSuccess = ref<boolean>(false);
  
  // Initialize from localStorage if available
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      // Load user profile
      fetchUserProfile();
    }
  }
  
  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  
  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.login(credentials);
      setUserAndToken(response.user, response.access_token);
      return true;
    } catch (err: any) {
      handleError(err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  async function register(registerData: RegisterData) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.register(registerData);
      setUserAndToken(response.user, response.access_token);
      return true;
    } catch (err: any) {
      handleError(err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchUserProfile() {
    loading.value = true;
    error.value = null;
    
    try {
      const userProfile = await authService.getProfile();
      user.value = userProfile;
      return true;
    } catch (err: any) {
      // If unauthorized, clear token and user
      if (err.response?.status === 401) {
        logout();
      } else {
        handleError(err);
      }
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  async function updateProfile(profileData: ProfileUpdateData) {
    loading.value = true;
    error.value = null;
    updateSuccess.value = false;
    
    try {
      const updatedUser = await userService.updateProfile(profileData);
      // Update the user in the store
      if (user.value) {
        user.value = { ...user.value, ...updatedUser };
      }
      updateSuccess.value = true;
      return true;
    } catch (err: any) {
      handleError(err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  function setUserAndToken(newUser: User, newToken: string) {
    user.value = newUser;
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }
  
  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    authService.logout();
    
    // Redirect to login page
    router.push('/login');
  }
  
  function clearUpdateStatus() {
    updateSuccess.value = false;
    error.value = null;
  }
  
  function handleError(err: any) {
    console.error('Auth error:', err);
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'An unexpected error occurred';
    }
  }
  
  return {
    user,
    token,
    loading,
    error,
    updateSuccess,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUserProfile,
    updateProfile,
    clearUpdateStatus
  };
});
