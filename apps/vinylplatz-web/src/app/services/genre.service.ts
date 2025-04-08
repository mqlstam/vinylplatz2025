import axios from 'axios';

// Interface for genre data
export interface Genre {
  id: string;
  name: string;
  description?: string;
}

export interface CreateGenreDto {
  name: string;
  description?: string;
}

export interface UpdateGenreDto {
  name?: string;
  description?: string;
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

// Genre service
export const genreService = {
  /**
   * Get all genres
   */
  async getAll(search?: string): Promise<Genre[]> {
    const params = search ? { search } : {};
    const response = await apiClient.get('/genres', { params });
    return response.data.results || response.data;
  },

  /**
   * Get a genre by id
   */
  async getById(id: string): Promise<Genre> {
    const response = await apiClient.get(`/genres/${id}`);
    return response.data.results || response.data;
  },

  /**
   * Create a new genre (Admin only)
   */
  async create(genreData: CreateGenreDto): Promise<Genre> {
    const response = await apiClient.post('/genres', genreData);
    return response.data.results || response.data;
  },

  /**
   * Update a genre (Admin only)
   */
  async update(id: string, genreData: UpdateGenreDto): Promise<Genre> {
    const response = await apiClient.patch(`/genres/${id}`, genreData);
    return response.data.results || response.data;
  },

  /**
   * Delete a genre (Admin only)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/genres/${id}`);
  },
};
