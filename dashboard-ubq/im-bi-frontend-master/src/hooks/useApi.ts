import { useCallback } from 'react';

interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

interface ApiMethods {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data: any) => Promise<T>;
  put: <T>(endpoint: string, data: any) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
  timeout: 10000,
  retries: 2
};

export function useApi(config: ApiConfig = {}): ApiMethods {
  const apiConfig = { ...DEFAULT_CONFIG, ...config };

  const createRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${apiConfig.baseUrl}/${endpoint.replace(/^\//, '')}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout (${apiConfig.timeout}ms)`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }, [apiConfig]);

  const retryRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    retries: number = apiConfig.retries || 0
  ): Promise<T> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('All retry attempts failed');
  }, [apiConfig.retries]);

  return {
    get: useCallback(<T>(endpoint: string) => 
      retryRequest(() => createRequest<T>(endpoint, { method: 'GET' })), 
      [createRequest, retryRequest]
    ),
    
    post: useCallback(<T>(endpoint: string, data: any) => 
      retryRequest(() => createRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      })), 
      [createRequest, retryRequest]
    ),
    
    put: useCallback(<T>(endpoint: string, data: any) => 
      retryRequest(() => createRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      })), 
      [createRequest, retryRequest]
    ),
    
    delete: useCallback(<T>(endpoint: string) => 
      retryRequest(() => createRequest<T>(endpoint, { method: 'DELETE' })), 
      [createRequest, retryRequest]
    ),
  };
}

// Hook específico para SMS Analytics
export function useSMSAnalyticsApi() {
  const api = useApi({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/sms-analytics`
  });

  return {
    // Dashboard endpoints
    getDashboard: () => api.get('dashboard'),
    getHealth: () => api.get('health'),
    getCountries: () => api.get('countries'),
    
    // Country specific endpoints
    getCountryAnalysis: (country: string) => api.get(`${country}`),
    getCountryAccounts: (country: string, params?: {
      page?: number;
      limit?: number;
      classification?: string;
      search?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.classification) queryParams.append('classification', params.classification);
      if (params?.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      return api.get(`${country}/accounts${queryString ? `?${queryString}` : ''}`);
    },
    getBusinessMetrics: (country: string) => api.get(`${country}/business-metrics`),
    
    // Regional endpoints
    getRegionalBusinessMetrics: () => api.get('regional/business-metrics'),
  };
}

export default useApi; 