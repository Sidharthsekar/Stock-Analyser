import axios, { AxiosInstance } from 'axios';
import type { ApiResponse } from '@stock-analyser/shared';

export type { ApiResponse };

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


export async function handleApiError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiResponse<unknown>;
    throw new Error(data.error?.message ?? 'An error occurred');
  }
  throw error;
}
