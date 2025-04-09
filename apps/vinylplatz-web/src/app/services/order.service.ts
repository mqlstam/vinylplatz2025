import axios from 'axios';
import { Vinyl } from './vinyl.service';

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Interface for order data
export interface Order {
  id: string;
  price: number;
  status: OrderStatus;
  orderDate: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  vinyl: {
    id: string;
    title: string;
    artist: string;
    coverImageUrl?: string;
  };
}

export interface CreateOrderDto {
  vinylId: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface OrderFilterParams {
  status?: OrderStatus;
  asBuyer?: boolean;
  asSeller?: boolean;
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

// Order service
export const orderService = {
  /**
   * Get all orders for the current user
   */
  async getOrders(filters?: OrderFilterParams): Promise<Order[]> {
    const response = await apiClient.get('/orders', { params: filters });
    return response.data;
  },

  /**
   * Get an order by id
   */
  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Create a new order (buy a vinyl)
   */
  async createOrder(vinylId: string): Promise<Order> {
    const response = await apiClient.post('/orders', { vinylId });
    return response.data;
  },

  /**
   * Update order status (seller only)
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};
