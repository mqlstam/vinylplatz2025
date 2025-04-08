import axios from 'axios';

// Interface for vinyl data
export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  releaseYear?: number;
  condition: string;
  price: number;
  description?: string;
  coverImageUrl?: string;
  sellerId: string;
  seller?: {
    id: string;
    name: string;
    profileImage?: string;
  };
  genreId?: string;
  genre?: {
    id: string;
    name: string;
  };
}

export interface CreateVinylDto {
  title: string;
  artist: string;
  releaseYear?: number;
  condition: string;
  price: number;
  description?: string;
  coverImageUrl?: string;
  genreId?: string;
}

export interface UpdateVinylDto {
  title?: string;
  artist?: string;
  releaseYear?: number;
  condition?: string;
  price?: number;
  description?: string;
  coverImageUrl?: string;
  genreId?: string;
}

export interface VinylFilterParams {
  title?: string;
  artist?: string;
  genreId?: string;
  sellerId?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  releaseYear?: number;
  minReleaseYear?: number;
  maxReleaseYear?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

// Vinyl service
export const vinylService = {
  /**
   * Get all vinyls with optional filtering and pagination
   */
  async getAll(filters?: VinylFilterParams): Promise<PaginatedResponse<Vinyl>> {
    const response = await apiClient.get('/vinyls', { 
      params: filters,
      // Ensure params with undefined/null values are not sent
      paramsSerializer: (params) => {
        const validParams = Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
        return validParams;
      }
    });
    
    return response.data;
  },

  /**
   * Get a vinyl by id
   */
  async getById(id: string): Promise<Vinyl> {
    const response = await apiClient.get(`/vinyls/${id}`);
    return response.data.results || response.data;
  },

  /**
   * Get vinyls listed by the current user
   */
  async getMyVinyls(): Promise<Vinyl[]> {
    const response = await apiClient.get('/vinyls/seller/me');
    return response.data.results || response.data;
  },

  /**
   * Create a new vinyl listing
   */
  async create(vinylData: CreateVinylDto): Promise<Vinyl> {
    const response = await apiClient.post('/vinyls', vinylData);
    return response.data.results || response.data;
  },

  /**
   * Update a vinyl listing
   */
  async update(id: string, vinylData: UpdateVinylDto): Promise<Vinyl> {
    const response = await apiClient.patch(`/vinyls/${id}`, vinylData);
    return response.data.results || response.data;
  },

  /**
   * Delete a vinyl listing
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vinyls/${id}`);
  },
};
