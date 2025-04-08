import axios from 'axios';

// Define ProfileData interface
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  password?: string;
  profileImage?: string;
  address?: string;
}

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
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

// Profile update service
export const userService = {
  /**
   * Update the current user's profile
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<any> {
    const response = await apiClient.patch('/users/me/profile', profileData);
    return response.data;
  },
};
