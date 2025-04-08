import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth.types';

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

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/register', userData);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await authApi.get<User>('/profile');
    return response.data;
  },

  /**
   * Logout (client-side only)
   */
  logout(): void {
    localStorage.removeItem('token');
  }
};
