// Define all entity types used across the application to avoid import issues

// User types
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  address?: string;
  role: UserRole;
  registrationDate: Date;
  comparePassword(attempt: string): Promise<boolean>;
}

// Vinyl types
export enum VinylCondition {
  MINT = 'Mint',
  NEAR_MINT = 'Near Mint',
  EXCELLENT = 'Excellent',
  VERY_GOOD_PLUS = 'Very Good Plus',
  VERY_GOOD = 'Very Good',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  releaseYear?: number;
  condition: VinylCondition;
  price: number;
  description?: string;
  coverImageUrl?: string;
  seller: User;
  sellerId: string;
  genre?: Genre;
  genreId?: string;
  orders: Order[];
  favoritedBy: User[];
  createdAt: Date;
  updatedAt: Date;
}

// Genre types
export interface Genre {
  id: string;
  name: string;
  description?: string;
  vinyls: Vinyl[];
}

// Order types
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  price: number;
  status: OrderStatus;
  orderDate: Date;
  buyer: User;
  buyerId: string;
  seller: User;
  sellerId: string;
  vinyl: Vinyl;
  vinylId: string;
}