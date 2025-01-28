import axios from 'axios';
import renovarToken from './RenovarToken';

const apiUrl = process.env.REACT_APP_API_URL; // Leer la variable de entorno

const api = axios.create({
  baseURL: apiUrl, // Cambia a la URL base de tu API
  withCredentials: true, // Habilitar cookies
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response, // Devuelve la respuesta si no hay errores
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Intenta renovar el token si se recibe un 401
        const setAccessToken = (newToken) => {
          // Establece el nuevo token en los headers de autorización
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        };
        await renovarToken(setAccessToken);

        // Reintenta la solicitud original con el nuevo token
        error.config.headers['Authorization'] = api.defaults.headers.common['Authorization'];
        return api.request(error.config);
      } catch (refreshError) {
        console.error('Error al renovar el token:', refreshError);
        return Promise.reject(error); // Si no se puede renovar, lanza el error
      }
    }
    return Promise.reject(error); // Lanza otros errores
  }
);

export default api;
