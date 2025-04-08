import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  address?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  
  // Get token from localStorage on initialization
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      // We would typically decode the JWT or fetch the user profile here
    }
  }
  
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  
  function setUser(newUser: User | null) {
    user.value = newUser;
  }
  
  function setToken(newToken: string | null) {
    token.value = newToken;
    
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }
  
  function logout() {
    user.value = null;
    setToken(null);
  }
  
  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setUser,
    setToken,
    logout
  };
});
