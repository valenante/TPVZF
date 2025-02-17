import axios from 'axios';
import renovarToken from './RenovarToken';

const apiUrl = process.env.REACT_APP_API_URL;

// Variable para evitar bucles infinitos
let isRefreshing = false;
let failedRequestsQueue = [];

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // Si la solicitud es un 401 y no estamos ya intentando renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api.request(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const setAccessToken = (newToken) => {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        };

        // Intentar renovar el token
        const newToken = await renovarToken(setAccessToken);

        // Aplicar el nuevo token a todas las solicitudes en cola
        failedRequestsQueue.forEach((req) => req.resolve(newToken));
        failedRequestsQueue = [];

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api.request(originalRequest);
      } catch (refreshError) {
        failedRequestsQueue.forEach((req) => req.reject(refreshError));
        failedRequestsQueue = [];

        console.error('🚨 Error al renovar el token:', refreshError);
        
        // Forzar cierre de sesión si la renovación falla
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
