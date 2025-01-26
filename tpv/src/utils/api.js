import axios from 'axios';

// Guardar el token después del inicio de sesión
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Recuperar el token para incluirlo en las solicitudes
const getToken = () => localStorage.getItem('token');

// Configurar Axios con la base URL y el interceptor
const api = axios.create({
  baseURL: `http://172.20.10.7:3000/api`
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
