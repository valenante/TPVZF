import { createContext, useContext, useState, useEffect } from 'react';
import renovarToken from '../utils/RenovarToken';
import api from '../utils/api'; // Instancia de Axios o Fetch
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [sessionActive, setSessionActive] = useState(true); // Controla si la sesión está activa
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const location = useLocation(); // Para obtener la ruta actual
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await renovarToken(setAccessToken);
        if (token) {
          setAccessToken(token);
        } else {
          setSessionActive(false); // Marca como sesión inactiva si no hay token
        }
      } catch (error) {
        console.error("Error al inicializar la autenticación:", error);
      } finally {
        setLoading(false); // Carga completa
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Evitar renovar token si la sesión está inactiva o en la página de login
    if (!sessionActive || location.pathname === "/login") {
      return;
    }

    if (!accessToken) {
      renovarToken(setAccessToken); // Intentar renovar token si no hay uno activo
    }
  }, [accessToken, sessionActive, location.pathname]);

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Llamar al backend para invalidar el refresh token
      await api.post('/auth/logout', {}, { withCredentials: true });

      // Limpiar el token del contexto y del almacenamiento local
      setAccessToken(null);
      setSessionActive(false); // Desactiva la sesión
      
      // Redirigir al usuario al login
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, sessionActive, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
