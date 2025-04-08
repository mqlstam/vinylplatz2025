import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@vinylplatz/web-auth';
import type { User, LoginCredentials, RegisterData } from '@vinylplatz/web-auth';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  
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
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUserProfile
  };
});
