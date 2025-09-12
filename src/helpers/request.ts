import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import SecureStorage from './secureStorage';

// API configuration constants
const API_CONFIG = {
  // BASE_URL: 'http://localhost:5000', // Development environment (if backend is local)
  BASE_URL: 'https://crm.nfsacademy.it', // Production environment (working endpoint)
  API_VERSION: 'v1',
} as const;

// Type definitions for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    description: string;
  }>;
}

// HTTP methods enum
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

// Request options interface
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  public readonly baseURL: string;
  private readonly apiURL: string;

  constructor(language: string = 'en') {
    this.baseURL = API_CONFIG.BASE_URL;
    this.apiURL = `${this.baseURL}/api/${API_CONFIG.API_VERSION}`;

    // Set language headers
    const languageHeaders = this.getLanguageHeaders(language);

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.apiURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...languageHeaders,
      },
    });

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Get language-specific headers
   */
  private getLanguageHeaders(language: string): Record<string, string> {
    switch (language) {
      case 'en':
        return { 'Accept-Language': 'en-US' };
      case 'it':
        return { 'Accept-Language': 'it-IT' };
      default:
        return {};
    }
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const userToken = await SecureStorage.getItem('userToken');
          
          if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
          } else {
            console.warn('⚠️ No userToken found in SecureStorage - API call may fail');
          }
        } catch (error) {
          console.warn('❌ Failed to get user token from secure storage:', error);
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Only log HTML detection as warning, don't throw error
        const contentType = response.headers['content-type'] || '';
        const responseData = response.data;
        
        if (contentType.includes('text/html') || (typeof responseData === 'string' && responseData.includes('<!DOCTYPE html>'))) {
          console.warn('⚠️ API returned HTML instead of JSON - possible authentication issue', {
            url: response.config?.url,
            status: response.status,
            contentType
          });
        }
        
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle API errors with proper logging
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as ApiError;

      switch (status) {
        case 400:
          console.error('Bad Request:', data.message || 'Invalid request');
          break;
        case 401:
          console.error('Unauthorized:', data.message || 'Authentication required');
          // Handle logout/redirect logic here if needed
          break;
        case 422:
          console.error('Validation Error:', data.message || 'Validation failed');
          break;
        case 500:
          console.error('Server Error:', data.message || 'Internal server error');
          break;
        default:
          console.error(`API Error ${status}:`, data.message || 'Unknown error');
      }
    } else if (error.request) {
      console.error('Network Error:', 'No response received');
    } else {
      console.error('Request Error:', error.message);
    }
  }

  /**
   * Generic request method
   */
  async request<T = any>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data,
        ...options,
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.GET, endpoint, undefined, options);
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.POST, endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.PUT, endpoint, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.PATCH, endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.DELETE, endpoint, data, options);
  }

  /**
   * Upload files using FormData
   */
  async uploadFiles<T = any>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const uploadOptions: RequestOptions = {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options?.headers,
      },
    };

    return this.request<T>(HttpMethod.POST, endpoint, formData, uploadOptions);
  }

  /**
   * Check if user is authenticated by verifying token exists and is valid
   */
  async checkAuth(): Promise<{ isAuthenticated: boolean; token?: string; error?: string }> {
    try {
      const userToken = await SecureStorage.getItem('userToken');
      
      console.log('🔍 Auth Check:', {
        hasToken: !!userToken,
        tokenPreview: userToken ? `${userToken.substring(0, 20)}...` : 'No token'
      });
      
      if (!userToken) {
        return { isAuthenticated: false, error: 'No token found' };
      }

      // Try a simple API call to verify token is valid
      try {
        const response = await this.get('me');
        console.log('✅ Auth check successful - token is valid');
        return { isAuthenticated: true, token: userToken };
      } catch (error) {
        console.error('❌ Auth check failed - token invalid:', error);
        return { isAuthenticated: false, token: userToken, error: 'Token invalid or expired' };
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      return { isAuthenticated: false, error: `Auth check failed: ${error}` };
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for custom instances if needed
export default ApiService;

// Legacy compatibility helpers for gradual migration
export const request = {
  get: (path: string) => apiService.get(path),
  post: (path: string, data: any) => apiService.post(path, data),
  patch: (path: string, data: any) => apiService.patch(path, data),
  delete: (path: string, data?: any) => apiService.delete(path, data),
};