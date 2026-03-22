import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getAccessTokenFn: (() => Promise<string>) | null = null;

export function setAuthTokenProvider(fn: () => Promise<string>) {
  getAccessTokenFn = fn;
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (getAccessTokenFn) {
      try {
        const token = await getAccessTokenFn();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get access token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.detail || error.message || 'An error occurred',
    });
  }
);

export default apiClient;