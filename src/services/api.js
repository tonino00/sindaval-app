import axios from 'axios';

// URL base da API - usado para imagens e requisições
export const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

const useVercelProxy = import.meta.env.VITE_USE_VERCEL_PROXY === 'true';

const apiBaseURL = useVercelProxy
  ? '/api/v1'
  : import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
    : '/api/v1';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Envia cookies automaticamente
});

export const initApiInterceptors = ({ getAccessToken, setAccessToken }) => {
  api.interceptors.request.use(
    (config) => {
      const accessToken = getAccessToken?.();

      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

// Flag para controlar se já estamos tentando fazer refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Não tentar refresh em rotas de autenticação
    const isAuthRoute = originalRequest.url?.includes('/auth/');
    
    if (error.response?.status === 401 && !isAuthRoute) {
      if (isRefreshing) {
        // Se já está fazendo refresh, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newAccessToken = refreshResponse.data?.accessToken || null;
        if (newAccessToken) {
          setAccessToken?.(newAccessToken);
        }
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        // Limpar autenticação e redirecionar para login apenas se não estiver já lá
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

  return api;
};

export default api;
