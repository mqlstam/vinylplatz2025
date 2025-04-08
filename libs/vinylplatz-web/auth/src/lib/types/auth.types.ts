export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  address?: string;
  registrationDate: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  address?: string;
  profileImage?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
