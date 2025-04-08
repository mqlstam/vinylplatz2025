import axios from 'axios';
import { Vinyl } from './vinyl.service';

interface FavoriteToggleResponse {
  isFavorited: boolean;
  message: string;
}

interface FavoriteStatusResponse {
  isFavorited: boolean;
}

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
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

// Favorites service
export const favoritesService = {
  /**
   * Get all favorites for the current user
   */
  async getFavorites(): Promise<Vinyl[]> {
    const response = await apiClient.get('/favorites');
    return response.data.results || response.data;
  },

  /**
   * Check if a vinyl is favorited by the current user
   */
  async checkFavoriteStatus(vinylId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<FavoriteStatusResponse>(`/favorites/${vinylId}/status`);
      return response.data.isFavorited;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  /**
   * Add a vinyl to favorites
   */
  async addToFavorites(vinylId: string): Promise<FavoriteToggleResponse> {
    const response = await apiClient.post<FavoriteToggleResponse>(`/favorites/${vinylId}`);
    return response.data;
  },

  /**
   * Remove a vinyl from favorites
   */
  async removeFromFavorites(vinylId: string): Promise<FavoriteToggleResponse> {
    const response = await apiClient.delete<FavoriteToggleResponse>(`/favorites/${vinylId}`);
    return response.data;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(vinylId: string, currentStatus: boolean): Promise<FavoriteToggleResponse> {
    if (currentStatus) {
      return this.removeFromFavorites(vinylId);
    } else {
      return this.addToFavorites(vinylId);
    }
  }
};
