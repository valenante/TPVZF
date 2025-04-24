import axios from 'axios';

// Guardar el token después del inicio de sesión
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Recuperar el token para incluirlo en las solicitudes
const getToken = () => localStorage.getItem('token');

// Configurar Axios con la base URL usando variable de entorno
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ✅ Usamos variable de entorno
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
