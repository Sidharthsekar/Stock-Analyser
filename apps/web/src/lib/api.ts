import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function handleApiError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiResponse<unknown>;
    throw new Error(data.error?.message || 'An error occurred');
  }
  throw error;
}
